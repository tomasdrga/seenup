/*
|--------------------------------------------------------------------------
| Websocket events
|--------------------------------------------------------------------------
|
| This file is dedicated for defining websocket namespaces and event handlers.
|
*/

import Ws from '@ioc:Ruby184/Socket.IO/Ws'

export let globalSocket

Ws.namespace('/')
  .connected(({ socket }) => {
    console.log('new websocket connection: ', socket.id)
    globalSocket = socket; // Store the socket instance in a global variable
  })
  .disconnected(({ socket }, reason) => {
    console.log('websocket disconnecting: ', socket.id, reason)
    if (globalSocket && globalSocket.id === socket.id) {
      globalSocket = null; // Clear the global socket if it is the one disconnecting
    }
  })
  .on('hello', ({ socket }, msg: string) => {
    console.log('websocket greeted: ', socket.id, msg)
    return 'hi'
  })
  .on('channel:deleted', (data) => {
    console.log('Channel deleted notification received:', data);
  });
