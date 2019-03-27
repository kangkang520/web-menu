const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')


module.exports = function () {
	//返回配置
	return {
		entry: {
			web: path.join(__dirname, 'src/index.ts')
		},
		mode: 'production',
		output: {
			filename: 'index.js',
			path: path.join(__dirname, 'dist/'),
		},
		module: {
			rules: [
				{
					test: /\.(tsx|ts)?$/,
					use: `ts-loader`,
					exclude: /node_modules/
				}
			]
		},
		resolve: {
			extensions: [
				'.tsx', '.ts', '.js', 'css', 'less'
			]
		},
		plugins: [
			new CleanWebpackPlugin()
		],
		stats: {
			colors: true,
		},
	}
}