# vue2源码学习--生命周期篇
<!-- {{$frontmatter.title}} -->

## 1. new Vue

- [new Vue](https://vue-js.com/learn-vue/lifecycle/newVue.html)

- 过程：  
  - 创建 vue 实例
  - 为创建好的实例初始化一些事件、属性、响应式数据
  - 挂载节点（如果有传入 el）

```javascript
function Vue(options) {
  // ...
  // 最重要的就是执行了这个函数，这个属性（函数）是通过 initMixin 加上的
  this._init(options)
}

// 给 Vue 增加相应属性和能力
initMixin(Vue)
```

```javascript
export function initMixin(Vue) {
	Vue.prototype._init = function(options) {
    const vm = this
    // 合并 vue 默认配置和用户传进来的一些配置
    vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
    )
    vm._self = vm

    // 初始化生命周期
    initLifecycle(vm)
    // 初始化事件
    initEvents(vm)
    // 初始化渲染
    initRender(vm)
    // 上面几个操作进行完之后，用户可以使用 beforeCreate 生命周期
    callHook(vm, 'beforeCreate')

    // 初始化 injections 
    //（注意：要在初始化 data、props、method、computed 之前，
    // 具体原因看 initInjecttion）
    initInjections(vm)
    // 初始化props,methods,data,computed,watch
    initState(vm)
    // 初始化 provide（注意：要在初始化 data、props、method、computed 之后）
    initProvide(vm) 
    // 上面几个操作进行完之后，用户可以使用 created 生命周期
    callHook(vm, 'created')

    // 如果有传进来根节点，进入模板编译与挂载阶段，没有的话需要用户手动调用 $mount
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
```


## 2. initLifecycle 初始化生命周期

- [initLifecycle](https://vue-js.com/learn-vue/lifecycle/initLifecycle.html#_1-%E5%89%8D%E8%A8%80)

> 作用：给Vue实例上挂载了一些属性并设置了默认值

抽象组件：如 `keep-alive、transition、transition-group`，他们实例上的 `abstract` 属性都是 true

```javascript
export function initLifecycle (vm: Component) {
  const options = vm.$options

  // 如果当前组件不是抽象组件并且存在父级，那么就通过while循环来向上循环，
  // 如果当前组件的父级是抽象组件并且也存在父级，那就继续向上查找当前组件父级的父级，
  // 直到找到第一个不是抽象类型的父级时，将其赋值vm.$parent，
  // 同时把该实例自身添加进找到的父级的$children属性中。
  let parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }

  vm.$parent = parent // 父节点
  // 实例的$root属性表示当前实例的根实例，挂载该属性时，
  // 首先会判断如果当前实例存在父级，
  // 那么当前实例的根实例$root属性就是其父级的根实例$root属性，
  // 如果不存在，那么根实例$root属性就是它自己
  vm.$root = parent ? parent.$root : vm // 根节点

  vm.$children = [] // 子节点
  vm.$refs = {}

  vm._watcher = null // 当前组件的 watcher
  vm._inactive = null // 用于 keep-alive 判断当前缓存组件是否处于激活状态
  vm._directInactive = false // 用于 keep-alive 判断是否已缓存改组件
  vm._isMounted = false // 是否已挂载
  vm._isDestroyed = false // 是否已销毁
  vm._isBeingDestroyed = false // 是否开始销毁
}
```

## 3. initEvents 初始化函数

- [initEvents](https://vue-js.com/learn-vue/lifecycle/initEvents.html#_1-%E5%89%8D%E8%A8%80)

> 初始化函数是初始化实例的事件系统
>
> 父组件给子组件的注册事件中，把自定义事件传给子组件，在子组件实例化的时候进行初始化；而浏览器原生事件是在父组件中处理。

换句话说：实例初始化阶段调用的初始化事件函数 initEvents, `实际上初始化的是父组件在模板中使用v-on或@注册的监听子组件内触发的事件`

```javascript
export function initEvents (vm: Component) {
  // 新增_events 属性并将其赋值为空对象，用来存储事件。
  vm._events = Object.create(null)

  // 获取父组件注册的事件赋给listeners，
  const listeners = vm.$options._parentListeners
  // 如果listeners不为空，则调用 updateComponentListeners 函数，
  // 将父组件向子组件注册的事件注册到子组件的实例中
  if (listeners) {
    updateComponentListeners(vm, listeners)
  }
}
```

```javascript
export function updateComponentListeners (
  vm: Component,
  listeners: Object,
  oldListeners: ?Object
) {
  target = vm
  // updateComponentListeners 啥也没干，就是调用了这个方法
  // listeners 更新后父组件使用 @ / v-on 传递进来的方法，属性
  // oldListeners 更新前父组件使用 @ / v-on 传递进来的方法，属性
  updateListeners(
    listeners,  
    oldListeners || {},
    add, 
    remove, 
    vm
  )
  target = undefined
}

function add (event, fn, once) {
  if (once) {
    target.$once(event, fn)
  } else {
    target.$on(event, fn)
  }
}

function remove (event, fn) {
  target.$off(event, fn)
}
```

```javascript
// 该函数的作用是对比listeners和oldListeners的不同，
// 并调用参数中提供的add和remove进行相应的注册事件和卸载事件。
export function updateListeners (
  on: Object,
  oldOn: Object,
  add: Function,
  remove: Function,
  vm: Component
) {
  let name, def, cur, old, event
  for (name in on) {
    def = cur = on[name]
    old = oldOn[name]
    event = normalizeEvent(name)
    // 处理完事件名后， 判断事件名对应的值是否存在，如果不存在则抛出警告
    // 例如 <Child @click="" />、<Child :a="null"  /> 这种情况
    // isUndef --> 判断是否是 undefined
    if (isUndef(cur)) {
      process.env.NODE_ENV !== 'production' && warn(
        `Invalid handler for event "${event.name}": got ` + String(cur),
        vm
      )
    } else if (isUndef(old)) {
      // 判断旧的有没有这个属性，如果没有，那就是此次更新新增的
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur)
      }
      add(
        event.name, 
        cur, 
        event.once, 
        event.capture, 
        event.passive, 
        event.params
      )
    } else if (cur !== old) {
      // 如果老的和新的不一样，将老的赋值为新的
      old.fns = cur
      on[name] = old
    }
  }
  // 遍历老的，如果老的中存在属性为 undefined 的，移除该属性
  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name)
      remove(event.name, oldOn[name], event.capture)
    }
  }
}
```

## 4. initInjections 初始化 inject

- [initInjections](https://vue-js.com/learn-vue/lifecycle/initInjections.html#_1-%E5%89%8D%E8%A8%80)

> 注意： provide 和 inject 选项绑定的数据不是响应式的。

问题： provide 和 inject 总是成对出现的，为什么初始化的时候不一块初始化？

```javascript
// 初始化 injections （注意：要在初始化 data、props、method、computed 之前）
initInjections(vm)
// 初始化props,methods,data,computed,watch
initState(vm)
// 初始化 provide（注意：要在初始化 data、props、method、computed 之后）
initProvide(vm) 
```
原因如下：
```javascript
const Child = {
  inject: ['foo'],
  data () {
    return {
      bar: this.foo
    }
  }
}
```

如上面代码，我们注入的 inject 里的数据是有可能被 data、computed、method 用到的

所以初始化的时候要先初始化 inject，让后在初始化 data 等数据

而 provide 是对外暴露的数据，需要在自身 data 等初始化之后才能对外暴露

所以 inject 和 provide 的初始化时机不一样

ok，开始看源码

```javascript
export function initInjections (vm: Component) {
  // 将 inject 中的数据转化成键值对，并保存在 result 中
  // 因为 inject 可能传的是 字符串，也可能是 对象
  const result = resolveInject(vm.$options.inject, vm)
  
  if (result) {
    // 告诉 defineReactive 不需要将数据变成响应式
    toggleObserving(false)
    // 遍历键值对
    Object.keys(result).forEach(key => {
      // 这里的 defineReactive 只是将键值对给加到当前实例上去
      defineReactive(vm, key, result[key])
    }
    // 恢复 defineReactive 将数据变成响应式的能力                          
    toggleObserving(true)
  }
}

export let shouldObserve: boolean = true
export function toggleObserving (value: boolean) {
  shouldObserve = value
}
```

## 5. initState 初始化数据

- [initState](https://vue-js.com/learn-vue/lifecycle/initState.html)

> 用来初始化 props、data、methods、computed、watch

> 扩展：Vue并 `不是对所有数据都使用属性拦截的方式侦测变化`，这是因为数据越多，数据上所绑定的依赖就会多，从而造成依赖追踪的内存开销就会很大，所以从Vue 2.0版本起，Vue不再对所有数据都进行侦测，而是将侦测粒度提高到了组件层面，`对每个组件进行侦测`，所以在 `每个组件上新增了vm._watchers属性，用来存放这个组件内用到的所有状态的依赖`，当其中一个状态发生变化时，就会通知到组件，然后由组件内部使用虚拟DOM进行数据比对，从而降低内存开销，提高性能。

```javascript
export function initState (vm: Component) {
  // 给实例上新增了一个属性_watchers，用来存储当前实例中所有的watcher实例，
  // 无论是使用vm.$watch注册的watcher实例还是使用watch选项注册的watcher实例，
  // 都会被保存到该属性中
  vm._watchers = []
  const opts = vm.$options
  // 初始化 props
  if (opts.props) initProps(vm, opts.props)
  // 初始化 methods
  if (opts.methods) initMethods(vm, opts.methods)
  // 初始化 data
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  // 初始化 computed
  if (opts.computed) initComputed(vm, opts.computed)
  // 初始化 watch
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```

### initProps

首先 props 的形式有下面几种:

```javascript
props: ['a']
props: { a: String }
props: {
  a: {
    type: String,
    default: ''
  }
}
```

所以首先需要对 props 进行格式化处理（这里掠过）

```javascript
function initProps (vm: Component, propsOptions: Object) {
  // 父组件传入的真实 props 数据
  const propsData = vm.$options.propsData || {}
  // 指向vm._props的指针，所有设置到props变量中的属性都会保存到vm._props中
  const props = vm._props = {}
  // 指向vm.$options._propKeys的指针，缓存props对象中的key，
  // 将来更新props时只需遍历vm.$options._propKeys数组即可得到所有props的key
  const keys = vm.$options._propKeys = []
  // 当前组件是否为根组件
  const isRoot = !vm.$parent
  
  // 判断当前组件是否为根组件，如果不是，那么不需要将props数组转换为响应式的
  if (!isRoot) {
    // 这个函数在 initInjection 中说了
    toggleObserving(false)
  }
  for (const key in propsOptions) {
    keys.push(key)
    // 这一步就是前面说的格式化 props，具体逻辑掠过。。。
    const value = validateProp(key, propsOptions, propsData, vm)

    if (process.env.NODE_ENV !== 'production') {
      // 开发阶段的操作，掠过。。。。。。。。。
    } else {
      defineReactive(props, key, value)
    }

    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }
  toggleObserving(true)
}
```

### initMethods

```javascript
function initMethods (vm, methods) {
  const props = vm.$options.props
  for (const key in methods) {
    if (process.env.NODE_ENV !== 'production') {
    	// method 为 null
     if (methods[key] == null) {
        warn(
          `Method "${key}" has an undefined value in the component definition. ` +
          `Did you reference the function correctly?`,
          vm
        )
      }
      // props 中有同名属性或方法
      if (props && hasOwn(props, key)) {
        warn(
          `Method "${key}" has already been defined as a prop.`,
          vm
        )
      }
      // 方法名不能以 _ 或者 $ 开头
      if ((key in vm) && isReserved(key)) {
        warn(
          `Method "${key}" conflicts with an existing Vue instance method. ` +
          `Avoid defining component methods that start with _ or $.`
        )
      }
    }
    // 绑定到 vm 实例上
    vm[key] = methods[key] == null ? noop : bind(methods[key], vm)
  }
```

### initData

```javascript
function initData (vm) {
    let data = vm.$options.data
    // 用户传进来的 data 可能是 函数也可能是 对象或者不传
    data = vm._data = typeof data === 'function'
        ? getData(data, vm)
    : data || {}

    // 如果 data 不是对象，重置为 {}
    if (!isPlainObject(data)) {
        data = {}
        process.env.NODE_ENV !== 'production' && warn(
            'data functions should return an object:\n' +
            'https://vuejs.org/v2/guide/components.html##data-Must-Be-a-Function',
            vm
        )
    }
    // proxy data on instance
    const keys = Object.keys(data)
    const props = vm.$options.props
    const methods = vm.$options.methods
    let i = keys.length
    while (i--) {
        const key = keys[i]
        if (process.env.NODE_ENV !== 'production') {
          	// 判断 methods 中是否存在同名属性/方法 
            if (methods && hasOwn(methods, key)) {
                warn(
                    `Method "${key}" has already been defined as a data property.`,
                    vm
                )
            }
        }
      // 判断 props 中是否存在同名属性/方法 
        if (props && hasOwn(props, key)) {
            process.env.NODE_ENV !== 'production' && warn(
                `The data property "${key}" is already declared as a prop. ` +
                `Use prop default value instead.`,
                vm
            )
        } else if (!isReserved(key)) {
          	// 属性不能以 _ 或者 $ 开头
            proxy(vm, `_data`, key)
        }
    }
    // 数据转化为响应式
    observe(data, true /* asRootData */)
}
```

### initComputed

```javascript
function initComputed (vm: Component, computed: Object) {
  	// 定义了一个变量watchers并将其赋值为空对象，
    // 同时将其作为指针指向 vm._computedWatchers，后面要用到，记住这个!!!
    const watchers = vm._computedWatchers = Object.create(null)
    // 判断是不是服务段渲染
    const isSSR = isServerRendering()

    for (const key in computed) {
        const userDef = computed[key]
        // computed 使用的时候，每个 computed 可能是一个函数
        // 也可能是一个有 set、get 属性的对象
        const getter = typeof userDef === 'function' ? userDef : userDef.get
        // 如果 getter 为 null，提示异常
        if (process.env.NODE_ENV !== 'production' && getter == null) {
            warn(`Getter is missing for computed property "${key}".`, vm)
        }

        if (!isSSR) {
           // 服务段渲染的掠过。。。
        }

        if (!(key in vm)) {
            // 这个是重点
            defineComputed(vm, key, userDef)
        } else if (process.env.NODE_ENV !== 'production') {
            // 如果 data / props 中存在同名属性，提示异常
            if (key in vm.$data) {
                warn(`The computed property "${key}" is already defined in data.`, vm)
            } else if (vm.$options.props && key in vm.$options.props) {
                warn(`The computed property "${key}" is already defined as a prop.`, vm)
            }
        }
    }
}
```

```javascript
// 我们获取 computed 的值的时候，实际上是拿到 sharedPropertyDefinition.get()
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function defineComputed (
  target,  // vm 实例
  key,  // computed 对应的 key
  userDef // 用户定义的 computed 内容，可能是函数，也可能是包含 get 属性的对象
) {
  // 只有在非服务端渲染环境下计算属性才开启缓存
  const shouldCache = !isServerRendering()
  
  if (typeof userDef === 'function') {
    // 如果是服务端渲染，直接使用用户传进来的函数，没有缓存能力
    // 如果不是，则使用 createComputedGetter 创建有缓存能力的 getter
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : userDef
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : userDef.get
      : noop
    sharedPropertyDefinition.set = userDef.set
      ? userDef.set
      : noop
  }
  if (
    process.env.NODE_ENV !== 'production' 
    && sharedPropertyDefinition.set === noop
  ) {
    // 在非生产环境下如果用户没有设置setter的话，那么就给setter一个默认函数，
    // 这是为了防止用户在没有设置setter的情况下修改计算属性，从而为其抛出警告
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }

  // 将计算属性绑定到实例 vm 上
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

```javascript
// createComputedGetter 是一个高阶函数，其内部返回了一个computedGetter函数
// 所以其实是将computedGetter函数赋给了sharedPropertyDefinition.get。
// 当获取计算属性的值时会执行属性的 getter，
// 而属性的getter就是 sharedPropertyDefinition.get，
// 也就是说最终执行的 computedGetter 函数。
function createComputedGetter (key) {
    return function computedGetter () {
      	// 因为使用computed 是 vm 中使用的，所以这里的 this 实际上就是 vm
        // _computedWatchers 在 initComputed 的最开始就初始化了，忘了可以往前看看 
        const watcher = this._computedWatchers && this._computedWatchers[key]
        
        if (watcher) {
            // 将读取计算属性的那个watcher添加到计算属性的watcher实例的依赖列表中，
          	// 当计算属性中用到的数据发生变化时，计算属性的watcher实例就会
          	// 执行watcher.update()方法
            watcher.depend()
            // watcher.evaluate() 作用：有缓存那缓存，没有执行函数，
            // 并将函数返回值缓存起来
            return watcher.evaluate()
        }
    }
}
```

![image.png](https://cdn.nlark.com/yuque/0/2023/png/2586551/1676950738419-9f4f0c09-fdcb-4648-819b-c8451acdbf51.png#averageHue=%23efefef&clientId=uf4e40839-37c2-4&from=paste&height=266&id=u0821a9ee&name=image.png&originHeight=239&originWidth=731&originalType=binary&ratio=0.8999999761581421&rotation=0&showTitle=false&size=67070&status=done&style=none&taskId=ub60d76b5-8258-4fc5-b219-c43aa2ab663&title=&width=812.2222437387637)

### initWatch

watch 用法

```javascript
watch: {
  a: function (val, oldVal) {
    console.log('new: %s, old: %s', val, oldVal)
  },
  // methods选项中的方法名
  b: 'someMethod',
  // 深度侦听，该回调会在任何被侦听的对象的 property 改变时被调用，不论其被嵌套多深
  c: {
    handler: function (val, oldVal) { /* ... */ },
    deep: true
  },
  // 该回调将会在侦听开始之后被立即调用
  d: {
    handler: 'someMethod',
    immediate: true
  },
  // 调用多个回调
  e: [
    'handle1',
    function handle2 (val, oldVal) { /* ... */ },
    {
      handler: function handle3 (val, oldVal) { /* ... */ },
    }
  ],
  // 侦听表达式
  'e.f': function (val, oldVal) { /* ... */ }
}

```

源码：

```javascript
function initWatch (vm, watch) {
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      // 如果是数组的边，遍历监听
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}
```

```javascript
function createWatcher (
  vm: Component, // 当前实例
  expOrFn: string | Function, // 被侦听的属性表达式
  handler: any, // watch选项中每一项的值
  options?: Object // 用于传递给vm.$watch的选项对象
) {
  // 如果是对象
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  // 如果是字符串
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  // 如果不是对象也不是字符串，那么就是函数，函数不进行特殊处理

  return vm.$watch(expOrFn, handler, options)
}
```

## 6. 模板编译阶段

在前面的 initMixin 方法中，在初始化生命周期、事件、数据之后，会执行 $mount 方法

```javascript
 if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
```

vue 实例创建时的两种写法

- template

```javascript
// 需要编译 template  > runtime + compiler  
new Vue({
  template: '<div>{{ hi }}</div>'
})

var mount = Vue.prototype.$mount;
Vue.prototype.$mount = function (el,hydrating) {
  // 省略获取模板及编译代码
  return mount.call(this, el, hydrating)
}
```

- render

```javascript
// 直接执行 render > 只需要 runtime
new Vue({
  render (h) {
    return h('div', this.hi)
  }
})

Vue.prototype.$mount = function (el,hydrating) {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating)
};
```

针对 template 写法

```javascript
// 先大致看下这两个方法，后面会用到

var idToTemplate = cached(function (id) {
  var el = query(id);
  // innerHTML：用于设置或返回开始和结束标签之间的 HTML。
  return el && el.innerHTML
});

function getOuterHTML (el) {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    var container = document.createElement('div');
    container.appendChild(el.cloneNode(true));
    return container.innerHTML
  }
}
```

```javascript
var mount = Vue.prototype.$mount;

Vue.prototype.$mount = function (el,hydrating) {
  // el: 目标挂载元素
  el = el && query(el);
  // 如果挂载在 body 或 html 报警
  if (el === document.body || el === document.documentElement) {
    warn(
      "Do not mount Vue to <html> or <body> - mount to normal elements instead."
    );
    return this
  }

  var options = this.$options;

  // 用户没有传入 render 函数，即用户传的是 template 形式
  if (!options.render) {
    var template = options.template;
    // 如果用户也有传 template
    if (template) {
      if (typeof template === 'string') { // template 是字符串
          if (template.charAt(0) === '#') {
            // 如果是字符串并且以 # 开头，则认为传进来的 template 是一个 id 选择符
            // 获取对应 id 标签里的 html 赋值给 template
            template = idToTemplate(template);
            // 如果结果为空，异常提示
            if (!template) {
              warn(
                ("Template element not found or is empty: " + (options.template)),
                this
              );
            }
          }
      } else if (template.nodeType) {
        // template 如果是 node 节点的话，template 就赋值为节点的 innerHtml
        template = template.innerHTML;
      } else {
        // template 不是字符串也不是 node 节点，报错
        warn('invalid template option:' + template, this);
        return this
      }
    } else if (el) {
      // 如果用户没传 template 属性，则 template 赋值为 el 对应的 html
      template = getOuterHTML(el);
    }

    // 如果 template 有值，则编译成 render 函数
    // 模板编译不是这一章节的内容，就不细说了
    if (template) {
      if (config.performance && mark) {
        mark('compile');
      }

      var ref = compileToFunctions(template, {
        outputSourceRange: "development" !== 'production',
        shouldDecodeNewlines: shouldDecodeNewlines,
        shouldDecodeNewlinesForHref: shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this);
      var render = ref.render;
      var staticRenderFns = ref.staticRenderFns;
      options.render = render;
      options.staticRenderFns = staticRenderFns;

      if (config.performance && mark) {
        mark('compile end');
        measure(("vue " + (this._name) + " compile"), 'compile', 'compile end');
      }
    }
  }
  return mount.call(this, el, hydrating)
};

```

## 7. 挂载阶段

对于 new Vue 创建的时候使用 template 方式传入的，最后也是被编译成 render 函数，让后再去调用 $mount 方法
所以我们以传入 render 方式的形式来学习 $mount 的源码实现

```javascript
export function mountComponent (vm,el,hydrating) {
    vm.$el = el

    // 如果没有 render 函数， 则创建空节点代替 render 函数
    if (!vm.$options.render) {
        vm.$options.render = createEmptyVNode
    }

    // 执行 beforeMount 生命周期
    callHook(vm, 'beforeMount')

    let updateComponent

    // 更新组件函数
    updateComponent = () => {
        // _update 里面会进行新老虚拟节点的比对更新
        vm._update(vm._render(), hydrating)
    }
  
    new Watcher(vm, updateComponent, noop, {
        before () {
            if (vm._isMounted) {
                callHook(vm, 'beforeUpdate')
            }
        }
    }, true /* isRenderWatcher */)
    hydrating = false

    if (vm.$vnode == null) {
        // 将当前组件实例的挂载标识设置为 true
        vm._isMounted = true
        // 执行 mount 生命周期
        callHook(vm, 'mounted')
    }
    return vm
}
```

## 8. 销毁阶段

```javascript
Vue.prototype.$destroy = function () {
  // 当前组件实例
  const vm: Component = this
  // 是否已经开始销毁，避免同一组件被重复销毁导致的异常
  if (vm._isBeingDestroyed) {
    return
  }
  // 执行 beforeDestroy 生命周期
  callHook(vm, 'beforeDestroy')
  // 设置组件开始销毁标识
  vm._isBeingDestroyed = true
  // 将自身从其父节点中移除
  const parent = vm.$parent
  if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
    remove(parent.$children, vm)
  }

  // 移除响应式依赖
  // 组件可能依赖组件外的响应式数据，还有自身的 computed、watch
  if (vm._watcher) {
    vm._watcher.teardown()
  }
  let i = vm._watchers.length
  while (i--) {
    vm._watchers[i].teardown()
  }
  
  // 移除自身的响应式数据 data
  if (vm._data.__ob__) {
    vm._data.__ob__.vmCount--
  }
  
  // 设置组件标识为以销毁
  vm._isDestroyed = true
  // 设置 vnode 为 null
  vm.__patch__(vm._vnode, null)
  // 执行 destroyed 生命周期
  callHook(vm, 'destroyed')
  // 移除 vm 实例
  vm.$off()
  // remove __vue__ reference
  if (vm.$el) {
    vm.$el.__vue__ = null
  }
  // release circular reference (##6759)
  if (vm.$vnode) {
    vm.$vnode.parent = null
  }
}
```
