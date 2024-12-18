/*
|--------------------------------------------------------------------------
| Websocket events
|--------------------------------------------------------------------------
|
| This file is dedicated for defining websocket namespaces and event handlers.
|
*/

import Ws from "@ioc:Ruby184/Socket.IO/Ws";

Ws.namespace("/")
    .connected("ActivityController.onConnected")
    .on("executeGeneralCommand", "ActivityController.onExecuteGeneralCommand")
    .on("fetchUserChannels", "ActivityController.fetchUserChannels")
    .on("onAdminCheck", "ActivityController.onAdminCheck")
    .on("changeStatus", "ActivityController.changeStatus")
    .disconnected("ActivityController.onDisconnected");

// this is dynamic namespace, in controller methods we can use params.name
Ws.namespace("channels/:name")
    // .middleware('channel') // check if user can join given channel
    .on("loadMessages", "MessageController.loadMessages")
    .on("getUsers", "ChannelsController.getUsersInChannel")
    .on("executeCommand", "ChannelsController.onExecuteCommand")
    .on("addMessage", "MessageController.addMessage")
    .on("typing", "ChannelsController.onTyping")
    .on("draftUpdate", "ChannelsController.onDraftUpdate");