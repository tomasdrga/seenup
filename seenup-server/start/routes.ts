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

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.post('/channels', 'ChannelsController.create').middleware('auth')
Route.get('/channels/:name/is-admin', 'ChannelsController.isAdmin').middleware('auth')
Route.post('/channels/:name/leave', 'ChannelsController.leave').middleware('auth')
Route.delete('/channels/:name', 'ChannelsController.delete').middleware('auth')

Route.group(() => {
  Route.post('register', 'AuthController.register')
  Route.post('login', 'AuthController.login')
  Route.post('logout', 'AuthController.logout').middleware('auth')
  Route.get('me', 'AuthController.me').middleware('auth')
  Route.post('change-status', 'UserController.changeStatus').middleware('auth')
  Route.get('users', 'UserController.getUsers').middleware('auth')
}).prefix('auth')
