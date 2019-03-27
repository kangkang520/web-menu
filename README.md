# WEB-MENU
浏览器自定义菜单

![预览](https://github.com/kangkang520/web-menu/blob/master/doc/preview.png?raw=true)

## 安装
```
npm install --save web-menu
```
如果你是想在页面中直接使用，可以导入js文件和css文件
```html
<link rel="stylesheet" href="dist/style.css">
<script src="dist/index.js"></script>
```

## 创建菜单
使用WebMenu.createFromDesc可以创建一个菜单，示例如下：
```js
import { WebMenu } from 'web-menu'
const menu = webMenu.Menu.createFormDesc([
	//普通文本菜单
	{ type: 'text', title: '打开', onclick: () => console.log('点击了打开') },
	//子菜单
	{ type: 'text', title: '最近打开', children: [
			{ type: 'text', title: "hello.ts" },
			{ type: 'text', title: "user.ts" },
			{ type: 'text', title: "index.ts" },
	]},
	//禁用项
	{ type: 'text', title: '保存', disabled: true },
	//分割线
	{ type: 'div' },
	//菜单项带图标
	{ type: 'text', title: '系统设置', icon: '/images/icon/setting.png' },
	//分割线
	{ type: 'div' },
	//退出
	{ type: 'text', title: '退出' },
])
```

## 显示菜单
当菜单创建好后使用show方法即可显示出菜单，如下：
```js
//直接显示
menu.show({clientX:300, clientY:100})
//鼠标右键显示
document.body.oncontextmenu = menu.show
```

## 菜单事件
当菜单被关闭时通过onclose事件进行通知，示例：
```js
menu.onclose = ()=>console.log('菜单关闭了')
```

## 主动关闭菜单
可以使用close方法将菜单关闭
```js
menu.close()
```