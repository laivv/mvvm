const path = require('path');
const webpack = require('webpack');
const rootPath = path.resolve(__dirname, '../');
const glob = require('glob');
const htmlWebpackPlugin = require('html-webpack-plugin');
function getEntries() {
	var files = glob.sync('../src/*.js');
	var entries = {};
	files.forEach(function(file) {
		var name = /.*\/src\/(.+)\.js$/.exec(file)[1];
		entries[name] = path.join(__dirname, file);
	});
	return entries;
}
const entires = getEntries();
const chunks = Object.keys(entires);
module.exports = {
	entry: entires,
	output: {
		filename: '[name].js',
		path: path.join(rootPath, 'dist'),
	},
	resolve: {
		extensions: ['.ts', '.js', '.json'],
		alias:{
			'@':rootPath
		}
	},
	module: {
		rules: [
			{
				test: /\.ts(x?)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
					},
					{
						loader: 'ts-loader',
					},
					{
						loader: 'eslint-loader'
					}
				],
			},
		],
	},
	plugins: [
		new htmlWebpackPlugin({
			title: 'mvvm',
			chunks: chunks,
			filename: 'index.html',
			template: path.join(rootPath, './index.html'),
			inject: 'head',
			chunksSortMode: 'dependency',
		}),
	],
};
