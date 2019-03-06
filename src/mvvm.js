/*
 * 简易MVVM实现
 * 
 */

var observe = (function() {
	function define(obj, key, watcher, keyPath) {
		var value = obj[key];
		Object.defineProperty(obj, key, {
			get: function() {
				return value;
			},
			set: function(val) {
				if (value === val) {
					return;
				}
				var oldValue = value;
				value = val;
				watcher && watcher(keyPath, val, oldValue);
			}
		});
	}

	function observeable(obj, watcher, keyPath) {
		var isRoot = !keyPath;
		var rootPath = keyPath;
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (isRoot) {
					keyPath = key;
				} else {
					keyPath = rootPath + '.' + key;
				}
				define(obj, key, watcher, keyPath);
				if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
					observeable(obj[key], watcher, keyPath);
				}
			}
		}
		return obj;
	}
	return function(obj, watcher) {
		return observeable(obj, watcher, false);
	};
})();

function modelWatcher(data) {
	model2View(data);
}

function viewWatcher(data) {
	document.addEventListener('input', function(e) {
		var node = e.target;
		var keyPath = node.getAttribute('v-model');
		if (['input', 'textarea'].indexOf(node.nodeName.toLowerCase()) > -1 && keyPath) {
			view2Model(data);
		}
	});
	document.addEventListener('change', function(e) {
		var node = e.target;
		var keyPath = node.getAttribute('v-model');
		if (['select'].indexOf(node.nodeName.toLowerCase()) > -1 && keyPath) {
			view2Model(data);
		}
	});
}

function view2Model(data) {
	document.querySelectorAll('input[v-model],textarea[v-model],select[v-model]').forEach(function(node) {
		var propNames = node.getAttribute('v-model').split('.');
		var obj = data;
		for (var i = 0, len = propNames.length - 1; i < len; i++) {
			obj = obj[propNames[i]];
		}
		obj[propNames.pop()] = node.value;
	});
}

function model2View(data) {
	var nodes = document.querySelectorAll('select[v-model],input[v-model],textarea[v-model]');
	nodes.forEach(function(node) {
		var keyPath = node.getAttribute('v-model');
		if (keyPath) {
			var value = data;
			keyPath = keyPath.split('.');
			keyPath.forEach(function(key) {
				value = value[key];
			});
			node.value = value;
		}
	});
}

function getTextNodes(nodes) {
	var textNodes = [];
	nodes = nodes ? nodes : document.querySelectorAll('*');
	nodes.forEach(function(node) {
		var nodes = node.childNodes;
		nodes.forEach(function(node) {
			if (node.nodeType === 3) {
				textNodes.push(node);
			} else if (node.childNodes.length) {
				textNodes = textNodes.concat(getTextNodes(node.childNodes));
			}
		});
	});
	return textNodes;
}

function render(data) {
	var regExp = /\{\{[^\}]+\}\}/g;
	var textNodes = getTextNodes();
	textNodes.forEach(function(textNode) {
		var text = textNode._originalTextContent || textNode.textContent;
		if (regExp.test(text)) {
			if (!textNode._originalTextContent) {
				textNode._originalTextContent = text;
			}
			text.match(regExp).forEach(function(item) {
				var expression = item.replace(/^(\{\{)|(\}\}$)/g, '');
				var fun = new Function('data', 'with(data){' + 'return ' + expression + '}');
				text = text.replace(item, fun(data));
			});
			textNode.textContent = text;
		}
	});
	document.querySelectorAll('*').forEach(function(node) {
		var attributes = node.attributes;
		Object.keys(attributes).forEach(function(key) {
			var attrubite = attributes[key];
			var value = attrubite._originalValue || attrubite.value;
			if (regExp.test(value)) {
				if (!attrubite._originalValue) {
					attrubite._originalValue = value;
				}
				value.match(regExp).forEach(function(item) {
					var expression = item.replace(/^(\{\{)|(\}\}$)/g, '');
					var fun = new Function('data', 'with(data){' + 'return ' + expression + '}');
					value = value.replace(item, fun(data));
				});
				attrubite.value = value;
			}
		});
	});
}

var MVVM = function(data) {
	observe(data, function() {
		modelWatcher(data);
		render(data);
	});

	viewWatcher(data);
	model2View(data);
	render(data);
	return data;
};
window.MVVM = MVVM;