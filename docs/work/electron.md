# electron 学习

## electron 进程通信

Electron 中有两种进程：主进程和渲染进程。

它们之间可以通过 `IPC（Inter-Process Communication）`机制进行通信。

> 主进程和渲染进程之间可以通过 ipcMain 和 ipcRenderer 模块来发送和接收消息。

主进程和渲染进程之间的通信是通过 webContents 对象来实现的。具体来说，主进程可以通过 webContents 对象的 send 方法向渲染进程发送消息，渲染进程可以通过 ipcRenderer 模块的 send 方法向主进程发送消息。在发送消息时，可以指定一个事件名称和一些参数，接收方可以根据事件名称和参数来处理消息。

需要注意的是，IPC 通信是异步的，因此需要使用回调函数来处理异步操作。

以下是一个示例代码块，展示了如何在主进程和渲染进程之间进行 IPC 通信：

```js
// 在主进程中
const { ipcMain } = require('electron')

ipcMain.on('message-from-renderer', (event, arg) => {
  console.log(arg) // 打印从渲染进程接收到的消息
  event.reply('message-to-renderer', 'Hello from main process!') // 向渲染进程发送消息
})

// 在渲染进程中
const { ipcRenderer } = require('electron')

ipcRenderer.send('message-from-renderer', 'Hello from renderer process!') // 向主进程发送消息

ipcRenderer.on('message-to-renderer', (event, arg) => {
  console.log(arg) // 打印从主进程接收到的消息
})
```