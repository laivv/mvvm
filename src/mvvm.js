/*
 * 简易MVVM实现
 * 
 */

import observe from './observe';
import * as DOM from './dom';
import { type } from './utils';
import { define } from './utils';

function MVVM(option) {
	this.$el = option.el ? document.querySelector(option.el) || document : document;
	this.$data = option.data;
	this.$methods = option.methods || {};
	this.$options = {};
	this.$init();
	this.render();
}

MVVM.prototype.$init = function() {
	if (this.$options._init) return;
	this.$options._init = true;
	this.$options.directiveNodes = DOM.getDirectiveNodes(this.$el);
	this.$options.textNodes = DOM.getTextNodes(this.$el);
	this.$options.attrNodes = DOM.getAttributesNodes(this.$el);
	observe(this.$data, this.render.bind(this));
	DOM.DOMWatcher(this.$options.directiveNodes, this.$data, () => {
		this.render();
	});
	this.$resolveEvent();
	this.$proxy();
};

MVVM.prototype.render = function() {
	const { directiveNodes, textNodes, attrNodes } = this.$options;
	const nodes = {
		directiveNodes,
		textNodes,
		attrNodes
	};
	DOM.renderer(nodes, this.$data);
};

MVVM.prototype.$resolveEvent = function() {
	DOM.getEventNodes(this.$el).forEach(node => {
		const events = node.__events;
		for (let ev in events) {
			if (events.hasOwnProperty(ev)) {
				const invoke = events[ev];
				if (type(this.$methods[invoke]) === 'function') {
					node.addEventListener(ev, e => {
						this.$methods[invoke].call(this, e);
					});
				} else {
					throw ReferenceError(`[MVVM warning]: ${invoke} is not defined.`);
				}
			}
		}
	});
};

MVVM.prototype.$proxy = function() {
	for (let key in this.$data) {
		if (this.$data.hasOwnProperty(key)) {
			define(this, this.$data, key);
		}
	}
	for (let key in this.$methods) {
		if (this.$methods.hasOwnProperty(key)) {
			define(this, this.$methods, key);
		}
	}
};

if (typeof window === 'object') {
	window.MVVM = MVVM;
}
export default MVVM;
