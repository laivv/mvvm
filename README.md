# MVVM
一个简单的mvvm实现 
未作任何性能优化，仅实现mvvm双向绑定的原理

## QuickStart
  html
```html
<div>
  姓名{{name}}
  年龄{{age}}
  其它{{other.sex}}
</div>
```
javascript
```javascript
 var vm = MVVM({
      name:"lingluo",
      age:30,
      other:{sex:"男"},
  });
```

### development
```sh
npm run dev
```
### build
```sh
npm run build
```
### 生成文档
```sh
npm run doc
```

