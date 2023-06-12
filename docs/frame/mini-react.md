# mini-react

:::warning 提示
待完善
:::

## 前置知识点

### 相关资料

- [mini-react 流程解析](https://qcsite.gatsbyjs.io/build-your-own-react/)
- [MDN--requestIdleCallback](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback)

### 基础知识

- requestIdleCallback：

```js
// requestIdleCallback 会在帧结束时并且有空闲时间时执行回调
requestIdleCallback(callback, options)
```
- callback: 回调函数接受一个入参 deadline
    - `(deadline) => {}`
    - `deadline` 上有两个属性
        - `timeRemaining：` 函数，函数的返回值表示当前空闲时间还剩下多少时间
        - `didTimeout：` 布尔值，如果 didTimeout 是 true，那么表示本次 callback 的执行是因为超时的原因

- 双缓存机制：

fiber 双缓存机制：react 会在内存上创建两颗树，显示在当前屏幕上的叫 `current Fiber tree`, 在内存中构建的叫 `workInProgress Fiber tree`

当 `workInProgress Fiber tree` 构建完之后会交给 `renderer（渲染器）`渲染

每次状态更新都会产生新的 workInProgress Fiber 树，通过 current 与 workInProgress 的替换，完成DOM更新。

## 工具函数

```js
/**
 * @param {string} key
 * @returns 判断是不是以 on 开头的，是的话就认为是自定义事件
 */
const isEvent = key => key.startsWith("on")

/**
 * @param {string} key
 * @returns 判断是不是自定义属性
 */
const isProperty = key => key !== "children" && !isEvent(key)

/**
 * @param {fiber} prev 上一次 fiber 节点
 * @param {fiber} next 本次 fiber 节点
 * @returns 更新前后的 fiber 节点属性是否发生变化
 */
const isNew = (prev, next) => key => prev[key] !== next[key]

/**
 * @param {fiber} prev 上一次 fiber 节点
 * @param {fiber} next 本次 fiber 节点
 * @returns 判断指定属性是否被移除
 */
const isGone = (prev, next) => key => !(key in next)
```

## render 阶段

```js
/**
 * @param {string} type 标签类型，div、p、文本、注释等
 * @param {Object} props 元素接受的属性
 * @param  {...any} children 元素的子元素
 * @returns 返回符合 jsx 预发的 AST
 */
function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child =>
                typeof child === "object"
                    ? child
                    : createTextElement(child)
            ),
        },
    }
}

/**
 * @param {string} text 文本
 * @returns 文本节点
 */
function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        },
    }
}

/**
 * @param {fiber} fiber fiber 节点
 * @returns 根据传入的 fiber 创建一个真实 dom 节点，并绑定相关的事件处理逻辑和属性
 */
function createDom(fiber) {
    // 根据 fiber 上的 type 属性创建对应的元素节点或文本节点
    const dom =
        fiber.type == "TEXT_ELEMENT"
            ? document.createTextNode("")
            : document.createElement(fiber.type)

    // 给 dom 节点设置响应的属性和自定义事件
    updateDom(dom, {}, fiber.props)

    return dom
}
```

## commit 阶段

```js
/**
 * @param {dom} dom fiber 上的 dom 属性
 * @param {object} prevProps 上一次 fiber 节点上的属性
 * @param {object} nextProps 本次 fiber 节点上的属性
 */
function updateDom(dom, prevProps, nextProps) {
    // 删除旧的或更改的事件侦听器
    Object.keys(prevProps)
        .filter(isEvent) // 获取自定义事件属性
        .filter(
            // 获取新的 fiber 节点上不存在的自定义事件
            // 或有相同的自定义事件名称但事件内容不一致的属性
            key => !(key in nextProps) || isNew(prevProps, nextProps)(key)
        )
        .forEach(name => {
            // onClick -->  click, onChange --> change
            const eventType = name.toLowerCase().substring(2)
            // 移除 dom 的自定义事件
            dom.removeEventListener(
                eventType,
                prevProps[name]
            )
        })

    // 删除旧属性
    Object.keys(prevProps)
        .filter(isProperty) // 获取 fiber 属性
        .filter(isGone(prevProps, nextProps)) // 获取本次更新要被移除的属性
        .forEach(name => {
            dom[name] = ""
        })

    // 设置新的或更改的属性
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps)) // 获取本次需要更新的属性
        .forEach(name => {
            dom[name] = nextProps[name]
        })

    // 添加事件侦听器
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps)) // 获取新增加/需要更新的自定义事件
        .forEach(name => {
            // onClick -->  click, onChange --> change
            const eventType = name.toLowerCase().substring(2)
            // 给 dom 添加自定义事件
            dom.addEventListener(
                eventType,
                nextProps[name]
            )
        })
}

function commitRoot() {
    deletions.forEach(commitWork)
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    wipRoot = null
}

function commitWork(fiber) {
    if (!fiber) {
        return
    }

    // 获取父节点
    let domParentFiber = fiber.parent
    // 递归获取父节点
    while (!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent
    }
    // domParent 设置为根节点
    const domParent = domParentFiber.dom

    if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
        // 新增节点
        domParent.appendChild(fiber.dom)
    } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
        // 更新节点
        updateDom(
            fiber.dom,
            fiber.alternate.props,
            fiber.props
        )
    } else if (fiber.effectTag === "DELETION") {
        // 移除节点
        commitDeletion(fiber, domParent)
    }

    // 先遍历子节点
    commitWork(fiber.child)
    // 子节点遍历完了之后再遍历兄弟节点
    commitWork(fiber.sibling)
}

function commitDeletion(fiber, domParent) {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom)
    } else {
        commitDeletion(fiber.child, domParent)
    }
}

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot,
    }
    deletions = []
    nextUnitOfWork = wipRoot
}

```

## 协调阶段 （reconcile）

```js
let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null
let deletions = null

function workLoop(deadline) {
    let shouldYield = false
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(
            nextUnitOfWork
        )
        shouldYield = deadline.timeRemaining() < 1
    }

    if (!nextUnitOfWork && wipRoot) {
        commitRoot()
    }

    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
    // 判断是否是函数组件
    const isFunctionComponent =
        fiber.type instanceof Function

    if (isFunctionComponent) {
        updateFunctionComponent(fiber)
    } else {
        updateHostComponent(fiber)
    }
    if (fiber.child) {
        return fiber.child
    }
    let nextFiber = fiber
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
}

// workInProgress Fiber
let wipFiber = null
let hookIndex = null

function updateFunctionComponent(fiber) {
    wipFiber = fiber
    hookIndex = 0
    wipFiber.hooks = []
    const children = [fiber.type(fiber.props)]
    reconcileChildren(fiber, children)
}

function useState(initial) {
    const oldHook =
        wipFiber.alternate &&
        wipFiber.alternate.hooks &&
        wipFiber.alternate.hooks[hookIndex]
    const hook = {
        state: oldHook ? oldHook.state : initial,
        queue: [],
    }

    const actions = oldHook ? oldHook.queue : []
    actions.forEach(action => {
        hook.state = action(hook.state)
    })

    const setState = action => {
        hook.queue.push(action)
        wipRoot = {
            dom: currentRoot.dom,
            props: currentRoot.props,
            alternate: currentRoot,
        }
        nextUnitOfWork = wipRoot
        deletions = []
    }

    wipFiber.hooks.push(hook)
    hookIndex++
    return [hook.state, setState]
}

function updateHostComponent(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }
    reconcileChildren(fiber, fiber.props.children)
}

function reconcileChildren(wipFiber, elements) {
    let index = 0
    let oldFiber =
        wipFiber.alternate && wipFiber.alternate.child
    let prevSibling = null

    while (
        index < elements.length ||
        oldFiber != null
    ) {
        const element = elements[index]
        let newFiber = null

        const sameType =
            oldFiber &&
            element &&
            element.type == oldFiber.type

        if (sameType) {
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE",
            }
        }
        if (element && !sameType) {
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
            }
        }
        if (oldFiber && !sameType) {
            oldFiber.effectTag = "DELETION"
            deletions.push(oldFiber)
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }

        if (index === 0) {
            wipFiber.child = newFiber
        } else if (element) {
            prevSibling.sibling = newFiber
        }

        prevSibling = newFiber
        index++
    }
}

export const MiniReact = {
    createElement,
    render,
    useState,
}
```

## 具体使用

```jsx
function Counter() {
    const [state, setState] = Didact.useState(1)
    return (
        <h1 onClick={() => setState(c => c + 1)}>
            Count: {state}
        </h1>
    )
}
const element = <Counter />
const container = document.getElementById("root")
MiniReact.render(element, container)
```