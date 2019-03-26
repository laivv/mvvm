import { type } from './utils'

const BIND_REGULAR = /\{\{[^\}]+\}\}/g
const SYNC_DIRECTIVE = 'v-model'
const FORM_WIDGET = ['input','textarea','select'].join(`[${SYNC_DIRECTIVE}],`)
const EVENT_REGULAR = /^@(\w+)$/

function textNodeWalk(node) {
  const text = node._originalTextContent || node.textContent
  if (BIND_REGULAR.test(text)) {
    if (!node._originalTextContent) {
      node._originalTextContent = text
    }
    return true
  } else {
    return false
  }
}

export function attrRenderer(attributes, data) {
  attributes.forEach(attribute => {
    let value = attribute._originalValue
    value.match(BIND_REGULAR).forEach(item => {
      const expression = item.replace(/^(\{\{)|(\}\}$)/g, '')
      const fun = new Function('data', 'with(data){' + 'return ' + expression + '}')
      value = value.replace(item, fun(data))
    })
    attribute.value = value
  })
}

export function textRenderer(textNodes, data) {
  textNodes.forEach(textNode => {
    let text = textNode._originalTextContent
    text.match(BIND_REGULAR).forEach(item => {
      const expression = item.replace(/^(\{\{)|(\}\}$)/g, '')
      const fun = new Function('data', 'with(data){' + 'return ' + expression + '}')
      text = text.replace(item, fun(data))
    })
    textNode.textContent = text
  })
}

export function directiveRenderer(directiveNodes, data) {
  directiveNodes.forEach(node => {
    let directives = node._originalDirective.split('.')
    let value = data
    for (let i = 0, len = directives.length; i < len; i++) {
      value = value[directives[i]]
    }
    node.value = value
  })
}

export function DOMWatcher(directiveNodes, data, callback) {
  directiveNodes.forEach(node => {
    const event = node.nodeName.toLowerCase() === 'select' ? 'change' : 'input'
    node.addEventListener(event, e => {
      const directives = node._originalDirective.split('.')
      let model = data
      for (let i = 0, len = directives.length - 1; i < len; i++) {
        model = model[directives[i]]
      }
      model[directives.pop()] = node.value
      callback && callback()
    })
  })
}

export function EventWatcher(eventNodes,methods,context){
  eventNodes.forEach(node => {
		const events = node.__events
		for (let ev in events) {
			if (events.hasOwnProperty(ev)) {
				const invoke = events[ev]
				if (type(methods[invoke]) === 'function') {
					node.addEventListener(ev, e => {
						methods[invoke].call(context, e)
					})
				} else {
					throw new ReferenceError(`[MVVM warning]: ${invoke} is not defined.`)
				}
			}
		}
	})
}

export function getTextNodes(root) {
  const textNodes = []
  root = root || document
  const nodes = [...root.querySelectorAll('*')]
  nodes.forEach(element => {
    const { childNodes } = element
    childNodes.forEach(node => {
      if (node.nodeType === 3) {
        const push = textNodeWalk(node)
        push && textNodes.push(node)
      } else if (node.childNodes.length) {
        nodes.push(...node.childNodes)
      }
    })
  })
  return textNodes
}

export function getAttributesNodes(root) {
  const attributeNodes = []
  root = root || document
  root.querySelectorAll('*').forEach(node => {
    const { attributes } = node
    Object.keys(attributes).forEach(key => {
      const attrubite = attributes[key]
      const value = attrubite._originalValue || attrubite.value
      if (BIND_REGULAR.test(value)) {
        if (!attrubite._originalValue) {
          attrubite._originalValue = value
        }
        attributeNodes.push(attrubite)
      }
    })
  })
  return attributeNodes
}

export function getDirectiveNodes(root) {
  const directiveNodes = []
  root = root || document
  root.querySelectorAll(FORM_WIDGET).forEach(node => {
    if (!node._originalDirective) {
      node._originalDirective = node.getAttribute(SYNC_DIRECTIVE)
      node.removeAttribute(SYNC_DIRECTIVE)
    }
    directiveNodes.push(node)
  })
  return directiveNodes
}

export function renderer(nodesOption, data) {
  const { directiveNodes, textNodes, attrNodes } = nodesOption
  textRenderer(textNodes, data)
  directiveRenderer(directiveNodes, data)
  attrRenderer(attrNodes, data)
}

export function getEventNodes(root) {
  const eventNodes = []
  root = root || document
  root.querySelectorAll('*').forEach(node => {
    if (node.__events) {
      eventNodes.push(node)
    } else {
      const events = {}
      const { attributes } = node
      Object.keys(attributes).forEach(key => {
        const attribute = attributes[key]
        if (!attribute) {
          return
        }
        const { name } = attribute
        const { value } = attribute
        const match = name.match(EVENT_REGULAR)
        if (match && /^[\w_$]+[\w_\d$]*$/.test(value)) {
          const eventName = match[1]
          events[eventName] = value
          node.removeAttribute(name)
        }
      })
      if (Object.keys(events).length) {
        node.__events = events
        eventNodes.push(node)
      }
    }
  })
  return eventNodes
}
