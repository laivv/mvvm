# MVVM
一个简单的mvvm实现 
未作任何性能优化，仅实现mvvm双向绑定的原理

## QuickStart
  html
```html
    <div>
        <div>
          用户账号<input v-model="form.userName"> 
        </div>
        <div>
          字体大小<input v-model="form.fontSize">
        </div>
        <div style="font-size:{{form.fontSize}}px">
          用户名{{form.userName}}
        </div>
        <div>
          <button @click="clearForm">清空</button>
        </div>
    </div>
```
javascript
```javascript
      new MVVM({
        data(){
          return {
            form:{
              userName:'lingluo',
              fontSize:30
            }
          }
        },
        beforeCreate() {
          console.log('beforeCreated')
        },
        mounted(){
          console.log('mounted')
        },
        methods:{
          clearForm(){
            this.form.userName = ''
          }
        }
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

