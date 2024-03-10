# 学习 vuex

## vuex 使用

```js
// src/store/index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    a: 1,
    b: 2
  },
  getters: {
    doubleA(state) {
      return state.a * 2
    }
  },
  mutations: {
    changeB(state) {
      state.b ++
    },
    changeA(state, num = 2) {
      state.a += num
    }
  },
  actions: {

  }
})
```

```js
// src/main.js
import Vue from 'vue'
import App from './App'
import store from './store'

new Vue({
  el: '#root',
  store, // 通过 options 传参传入 store 对象
  render: (h) => h(App),
})
```

先简单分析下， vuex 默认导出的是一个对象

`Vue.use(Vuex)` 说明 Vuex 对象里面至少有一个 install 方法

而后面又通过 `new Vuex.Store({ .... })` 实例化出一个 store，

所以 vuex 导出的对象至少是这样的:

```js
class Store {
  constructor(options) {
    // ...
  }
  // ....
}

function install(Vue, options) {
  // ...
}

export default {
  install,
  Store,
}
```

ok, 简单分析之后我们来开始看源码

## 实现 mini-vuex

```js
let Vue

function install(_Vue) {
  Vue = _Vue
  Vue.mixin({
    beforeCreated() {
      if (this.$options?.store) {
        // root
        this.$store = this.$options.store
      } else {
        this.$store = this.$parent?.$store
      }
    },
  })
}

class Store {
  constructor(options) {
    const { 
      state = {}, 
      getters = {}, 
      mutations = {}, 
      actions = {}, 
    } = options

    this.vm = new Vue({
      data: {
        state,
      },
    })

    this.getters = {}
    Object.keys(getters).forEach((getterName) => {
      Object.defineProperty(this.getters, {
        get: () => {
          return this.getters[getterName](this.state)
        },
      })
    })

    this.mutations = {}
    this.actions = {}
    this.initMethods(options)
  }

  static initMethods = (options) => {
    const methods = ['mutations', 'actions']
    methods.forEach(method => {
      const targets = options[method] || {}
      Object.keys(targets).forEach((name) => {
        this[method][name] = (payload) => {
          targets[name](this.state, payload)
        }
      })
    })
  }

  get state() {
    return this.vm.state
  }

  commit(name, payload) {
    this.mutations[name](payload)
  }

  dispatch(name, payload) {
    this.actions[name](payload)
  }
}

export default {
  Store,
  install,
}
```
