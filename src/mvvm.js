/*
 * 简易MVVM实现
 * 
 */

import observe from './observe';
import * as DOM from './dom';
import { proxy } from './utils';
import { type, warn } from './utils';

function MVVM(option) {
	initHooks(option, this);
	callHook('beforeCreate', this);
	initElement(option, this);
	initData(option, this);
	initMethod(option, this);
	init.call(this);
	callHook('mounted', this);
	this.render();
}

MVVM.prototype.render = function() {
	const { directiveNodes, textNodes, attrNodes } = this.$options;
	const nodes = {
		directiveNodes,
		textNodes,
		attrNodes
	};
	DOM.renderer(nodes, this.$data);
};

function initElement(option, context) {
	context.$el = option.el ? document.querySelector(option.el) || document : document;
}

function initData(option, context) {
	if (type(option.data) === 'function') {
		context.$data = option.data();
	} else if (type(option.data) === 'object') {
		context.$data = option.data;
		warn('[MVVM] warning: ' + 'data应该是一个function');
	} else {
		throw new Error('data是必须的');
	}
}

function initMethod(option, context) {
	context.$methods = option.methods || {};
}

function initHooks(option, context) {
	context.$options = {};
	context.$options.hooks = {};
	['beforeCreate', 'mounted'].forEach(name => {
		const hook = option[name];
		if (hook) {
			if (type(hook) === 'function') {
				context.$options.hooks[name] = option[name];
			} else {
				warn('[MVVM] warning: ' + name + '接收类型为function');
			}
		}
	});
}

function callHook(hookName, context) {
	const hook = context.$options.hooks[hookName];
	hook && hook.call(context);
}

function init() {
	this.$options.directiveNodes = DOM.getDirectiveNodes(this.$el);
	this.$options.textNodes = DOM.getTextNodes(this.$el);
	this.$options.attrNodes = DOM.getAttributesNodes(this.$el);
	this.$options.eventNodes = DOM.getEventNodes(this.$el);
	observe(this.$data, this.render.bind(this));
	DOM.DOMWatcher(this.$options.directiveNodes, this.$data);
	DOM.EventWatcher(this.$options.eventNodes, this.$methods, this);
	proxy(this.$data, this);
	proxy(this.$methods, this);
}

if (typeof window === 'object') {
	window.MVVM = MVVM;
}
export default MVVM;
