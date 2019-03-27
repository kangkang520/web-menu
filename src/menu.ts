interface IElemAttrs {
	className?: string
	style?: Partial<CSSStyleDeclaration>
}

function mkelem<K extends keyof HTMLElementTagNameMap>(kind: K, attrs: IElemAttrs, children?: Array<HTMLElement | string>): HTMLElementTagNameMap[K] {
	const elem = document.createElement(kind)
	if (attrs.className) elem.className = attrs.className
	if (attrs.style) Object.keys(attrs.style).forEach(key => (elem.style as any)[key] = (attrs.style as any)[key])
	if (children) children.forEach(child => {
		if (typeof child == 'string') elem.innerHTML = child
		else elem.appendChild(child)
	})
	return elem
}

const SUB_MENU_SVG = '<svg t="1553707009669" class="icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3931"><path d="M735.1 510.8L368.4 144.7l-96.7 96.8 268.6 268.6-268.6 268.8 96.7 96.7 366.7-364.8-11.3-0.7z" p-id="3932"></path></svg>'
const DIV_MENU_ITEM = mkelem('div', { className: 'web-menu-item div' }, [mkelem('div', {})])

abstract class MenuItem {
	/** 菜单项类型 */
	public abstract readonly type: 'text' | 'div'
	/** 菜单项HTML */
	public abstract readonly html: HTMLDivElement
}

export class DivWebMenuItem extends MenuItem {
	public readonly type: 'div' = 'div'
	public readonly html: HTMLDivElement = DIV_MENU_ITEM
}

export class TextWebMenuItem extends MenuItem {
	public readonly type: 'text' = 'text'
	/** 菜单名称 */
	public title!: string
	/** 菜单图标 */
	public icon?: string
	/** 是否禁用 */
	public disabled: boolean = false
	/** 子菜单 */
	public children?: Array<MenuItem>
	/** 点击处理事件 */
	public onclick?: (menu: MenuItem) => any

	/** 生成HTML元素 */
	public get html() {
		//主div
		const div = mkelem('div', { className: `web-menu-item text${this.disabled ? ' disabled' : ''}` }, [
			//图标
			...this.icon ? [mkelem('div', { className: 'menu-icon', style: { backgroundImage: `url(${this.icon})` } })] : [],
			//文本
			mkelem('div', { className: 'menu-text' }, [this.title]),
			//子菜单
			...this.children && this.children.length ? [
				//图标
				mkelem('div', { className: 'submenu-icon' }, [SUB_MENU_SVG]),
				//子菜单
				mkelem('div', { className: 'web-submenu', style: { display: 'none' } }, this.children.map(child => child.html))
			] : []
		])
		//鼠标进入后处理
		div.onmouseenter = handleMouseEnter
		//鼠标点击处理
		div.onclick = (e) => {
			//停止事件冒泡
			e.stopPropagation()
			//有孩子的或被禁用的无效
			if (this.children || this.disabled) return
			//关闭所有菜单
			WebMenu.clearMenu()
			//事件回调
			if (this.onclick) this.onclick(this)
		}
		return div
	}
}

export interface IDivWebMenuItem {
	type: 'div'
}

export interface ITextWebMenuItem {
	type: 'text'
	title: string
	icon?: string
	disabled?: boolean
	children?: Array<IWebMenuItem>
	onclick?: () => any
}

export type IWebMenuItem = IDivWebMenuItem | ITextWebMenuItem

export class WebMenu {
	/** 当前显示的菜单 */
	private static currentMenu: WebMenu

	/** 关闭所有菜单 */
	public static clearMenu() {
		if (!this.currentMenu) return
		this.currentMenu.close()
		delete this.currentMenu
	}

	private static parseMenuItem(menuItem: IWebMenuItem) {
		if (menuItem.type == 'div') return new DivWebMenuItem()
		else {
			const textMenuItem = new TextWebMenuItem()
			textMenuItem.title = menuItem.title
			textMenuItem.icon = menuItem.icon
			textMenuItem.onclick = menuItem.onclick
			textMenuItem.disabled = !!menuItem.disabled
			if (menuItem.children && menuItem.children.length) {
				textMenuItem.children = menuItem.children.map(child => WebMenu.parseMenuItem(child))
			}
			return textMenuItem
		}
	}

	/**
	 * 从菜单描述构建菜单
	 * @param menuItems 菜单描述
	 */
	public static createFormDesc(menuItems: Array<IWebMenuItem>) {
		let menu = new WebMenu()
		menu.menuItems = menuItems.map(item => WebMenu.parseMenuItem(item))
		return menu
	}

	/** 菜单项 */
	public menuItems: Array<MenuItem> = []
	/** 菜单关闭事件 */
	public onclose?: (menu: WebMenu) => any
	/** div */
	private currentDiv?: HTMLDivElement

	/** 关闭菜单 */
	public close() {
		if (!this.currentDiv) return
		document.body.removeChild(this.currentDiv)
		if (this.onclose) this.onclose(this)
	}

	/**
	 * 添加菜单项
	 * @param item 菜单项
	 */
	public addMenuItem(item: MenuItem) {
		this.menuItems.push(item)
	}

	/**
	 * 显示菜单到某个地方
	 * @param e 事件
	 */
	public show(e: { clientX: number, clientY: number }) {
		//清理菜单
		WebMenu.clearMenu()
		//创建并显示
		const div = mkelem('div', { className: 'web-menu', style: { left: e.clientX + 'px', top: e.clientY + 'px' } }, this.menuItems.map(item => item.html))
		document.body.appendChild(div)
		//特别屏蔽鼠标事件
		div.onmousedown = e => e.stopPropagation()
		//存储菜单信息
		this.currentDiv = div
		WebMenu.currentMenu = this
		//位置校验
		validatePosition(div)
	}
}

/**
 * 调整菜单位置
 * @param div 菜单div
 */
function validatePosition(div: HTMLDivElement) {
	let isTop = div.classList.contains('web-menu')		//是不是顶层菜单
	const rect = div.getBoundingClientRect()			//菜单位置
	//超出右边
	if (rect.right > window.innerWidth) {
		if (isTop) div.style.left = rect.left - rect.width + 'px'
		else div.style.left = rect.left - rect.width - div.parentElement!.parentElement!.getBoundingClientRect().width + 2 + 'px'
	}
	//超出下面
	if (rect.bottom > window.innerHeight) {
		if (isTop) div.style.top = rect.top - rect.height + 'px'
		else div.style.top = rect.top - rect.height + div.parentElement!.getBoundingClientRect().height + 6 + 'px'
	}
}

//鼠标进入
function handleMouseEnter(e: MouseEvent) {
	const item = e.srcElement!
	if (item.classList.contains('disabled')) return
	//删除其他菜单项
	const parent = item.parentElement!
	for (let i = 0; i < parent.children.length; i++) {
		const child = parent.children.item(i)!
		if (child == item) continue
		child.classList.remove('hovered')
		const sub: HTMLDivElement | null = child.querySelector('.web-submenu')
		if (sub) sub.style.display = 'none'
	}
	//获取子菜单
	const subMenu: HTMLDivElement | null = item.querySelector('.web-submenu')
	if (!subMenu) return
	//显示出来
	item.classList.add('hovered')
	subMenu.style.display = ''
	const prect = parent.getBoundingClientRect()
	const irect = item.getBoundingClientRect()
	subMenu.style.left = prect.right - 1 + 'px'
	subMenu.style.top = irect.top - 3 + 'px'
	//调整位置
	validatePosition(subMenu)
}

//初始化事件
window.addEventListener('mousedown', () => WebMenu.clearMenu())