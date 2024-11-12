/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/
import Ws from "@ioc:Ruby184/Socket.IO/Ws";

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post('register', 'AuthController.register')
  Route.post('login', 'AuthController.login')
  Route.post('logout', 'AuthController.logout').middleware('auth')
  Route.get('me', 'AuthController.me').middleware('auth')
  Route.post('change-status', 'UserController.changeStatus').middleware('auth')
  Route.get('users', 'UserController.getUsers').middleware('auth')
}).prefix('auth')


Ws.namespace("channels/:name")
  // .middleware('channel') // check if user can join given channel
  .on("loadMessages", "MessageController.loadMessages")
  .on("addMessage", "MessageController.addMessage");
