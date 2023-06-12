# 中断 http 请求

## xhr

```js
const xhr = new XMLHttpRequest(),
  method = 'GET',
  url = "'https://xxxxxxxxxxxxxxxxxxxxxxxxx'"
xhr.open(method, url, true)

xhr.send({ age: 90 })
xhr.onreadystatechange = (state) => {
  if (xhr.readyState === 4 && xhr.status === 200) {
    // do something
    console.log(xhr.responseText)
  }
}

// 中断操作
xhr.abort()
```

## axios

```js
const CancelToken = axios.CancelToken
const source = CancelToken.source()

axios
  .get('https://xxxxxxxxxxxxxxxxxxxxxxxxx', {
    cancelToken: source.token,
  })
  .catch(function (thrown) {
    // 判断请求是否已中止
    if (axios.isCancel(thrown)) {
      // 参数 thrown 是自定义的信息
      console.log('Request canceled', thrown.message)
    } else {
      // 处理错误
    }
  })

// 取消请求（message 参数是可选的）
source.cancel('Operation canceled by the user.')
```

## fetch

```js
// 中断。。。
const controller = new AbortController()
let signal = controller.signal
console.log('signal 的初始状态: ', signal)

function fetchVideo() {
  //...
  fetch('https://xxxxxxxxxxxxxxxxxxxxxxxxx', { signal })
    .then((res) => {
      //...
    })
    .catch((e) => {
      console.log(e.message)
    })
}

// 中断操作
controller.abort()
```
