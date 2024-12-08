import type { WsContextContract } from "@ioc:Ruby184/Socket.IO/WsContext";
import User from "App/Models/User";
import Channel from "App/Models/Channel";
import ChannelsController from '../Ws/ChannelsController';

export default class ActivityController {
    private getUserRoom(user: User): string {
        return `user:${user.id}`;
    }

    public async onConnected({ socket, auth, logger }: WsContextContract) {
        // all connections for the same authenticated user will be in the room
        const room = this.getUserRoom(auth.user!);
        const userSockets = await socket.in(room).allSockets();

        // this is first connection for given user
        if (userSockets.size === 0) {
            socket.broadcast.emit("user:online", auth.user);
        }

        // add this socket to user room
        socket.join(room);
        // add userId to data shared between Socket.IO servers
        // https://socket.io/docs/v4/server-api/#namespacefetchsockets
        socket.data.userId = auth.user!.id;

        const allSockets = await socket.nsp.except(room).fetchSockets();
        const onlineIds = new Set<number>();

        for (const remoteSocket of allSockets) {
            onlineIds.add(remoteSocket.data.userId);
        }

        const onlineUsers = await User.findMany([...onlineIds]);

        socket.emit("user:list", onlineUsers);

        logger.info("new websocket connection");


        console.log("fetching user channels");
        const user = auth.user!;
        const channels = await user.related("channels").query().wherePivot('is_banned', false);
        const userChannels = channels.map(channel => ({
            name: channel.name,
            isPrivate: channel.isPrivate
        }));
        socket.emit("user:channels", userChannels as Channel[]);
    }

    // see https://socket.io/get-started/private-messaging-part-2/#disconnection-handler
    public async onDisconnected(
        { socket, auth, logger }: WsContextContract,
        reason: string
    ) {
        const room = this.getUserRoom(auth.user!);
        const userSockets = await socket.in(room).allSockets();

        // user is disconnected
        if (userSockets.size === 0) {
            // notify other users
            socket.broadcast.emit("user:offline", auth.user);
        }

        logger.info("websocket disconnected", reason);
    }

    public async changeStatus({ socket, auth, logger }: WsContextContract, status: "active" | "dnd" | "offline") {
        console.log('Received status change request:', status); // Add logging

        if (!status) {
            socket.emit('error', { error: 'Status is required' });
            return;
        }

        const user = auth.user;
        if (user) {
            user.status = status;
            await user.save();
            console.log(`User ${user.id} changed status to ${status}`);

            if (status === "active") {
                return socket.nsp.emit("user:online", user);
            } else {
                return socket.nsp.emit(`user:${status}`, user);
            }
        }

        socket.emit('error', { error: 'User not authenticated' });
    }

    public async onExecuteGeneralCommand(
        { socket, auth ,logger }: WsContextContract,
        command: string,
        name: string,
        flag: string
    ) {
        logger.info("general command executed", command);
        
        command = command.replace(/\r?\n|\r/g, '').trim();
        if (name) { name = name.replace(/\r?\n|\r/g, '').trim(); }
        if (flag) { flag = flag.replace(/\r?\n|\r/g, '').trim();}

        switch (command) {
            case '/join':
                if (name) {
                    const isPrivate = flag ? flag === "private" : false;
                    console.log(name, isPrivate);
                    return ChannelsController.joinOrCreateChannel(socket, auth, name, isPrivate);
                } else {
                    return socket.emit('error', 'Please specify a channel name for the /join command.');
                }
            case '/cancel':
                if (name) {
                    const channel = await Channel.query().where('name', name).first();
                    if (!channel) {
                        return socket.emit('error', 'Channel not found.');
                    }

                    const user = auth.user;
                    if (!user) {
                        return socket.emit('error', 'You must be logged in');
                    }

                    if (channel.adminId !== user.id) {
                        await channel.related('users').detach([user.id]);
                        console.log("fetching user channels");
                        const channels = await user.related("channels").query().wherePivot('is_banned', false);
                        const userChannels = channels.map(channel => ({
                            name: channel.name,
                            isPrivate: channel.isPrivate
                        }));
                        socket.emit("user:channels", userChannels as Channel[]);
                        return socket.broadcast.emit('channel:cancel', { name });
                    } else {
                        const users = await channel.related('users').query();

                        await channel.delete();
                        console.log("fetching user channels");
                        const channels = await user.related("channels").query().wherePivot('is_banned', false);
                        const userChannels = channels.map(channel => ({
                            name: channel.name,
                            isPrivate: channel.isPrivate
                        }));
                        socket.emit("user:channels", userChannels as Channel[]);

                        const generalNamespace = socket.nsp.server.of('/');
                        users.forEach(async (member) => {
                            const memberChannels = await member.related("channels").query();
                            const memberUserChannels = memberChannels.map(channel => ({
                                name: channel.name,
                                isPrivate: channel.isPrivate
                            }));
                            const room = this.getUserRoom(member);
                            generalNamespace.to(room).emit("user:channels", memberUserChannels as Channel[]);
                        });
                        return socket.emit('channel:quit', { name });
                    }
                } else {
                    return socket.emit('error', 'Channel name not found.');
                }
            case '/quit':
                if (name) {
                    const channel = await Channel.query().where('name', name).first();
                    if (!channel) {
                        return socket.emit('error', 'Channel not found.');
                    }

                    const user = auth.user;
                    if (!user) {
                        return socket.emit('error', 'You must be logged in');
                    }

                    if (channel.adminId == user.id) {
                        const users = await channel.related('users').query();

                        await channel.delete();

                        console.log("fetching user channels");
                        const channels = await user.related("channels").query().wherePivot('is_banned', false);
                        const userChannels = channels.map(channel => ({
                            name: channel.name,
                            isPrivate: channel.isPrivate
                        }));
                        socket.emit("user:channels", userChannels as Channel[]);

                        const generalNamespace = socket.nsp.server.of('/');
                        users.forEach(async (member) => {
                            const memberChannels = await member.related("channels").query();
                            const memberUserChannels = memberChannels.map(channel => ({
                                name: channel.name,
                                isPrivate: channel.isPrivate
                            }));
                            const room = this.getUserRoom(member);
                            generalNamespace.to(room).emit("user:channels", memberUserChannels as Channel[]);
                        });

                        return socket.emit('channel:quit', { name });
                    } else {
                        return socket.emit('error', 'Channel name not found.');
                    }
                }
                break;
            default:
                return socket.emit('error', 'Unknown command.');
        }
        console.log(flag);
        logger.info("general command executed", command);
    }

    public async fetchUserChannels(
        { socket, auth, logger }: WsContextContract
    ) {
        logger.info("fetching user channels");
        const user = auth.user!;
        const channels = await user.related("channels").query().wherePivot('is_banned', false);
        const userChannels = channels.map(channel => ({
            name: channel.name,
            isPrivate: channel.isPrivate
        }));
        socket.emit("user:channels", userChannels as Channel[]);
    }

    public async onAdminCheck(
        { socket, auth, logger }: WsContextContract,
        channelName: string
    ) {
        logger.info("checking if user is admin");
        const user = auth.user!;
        if (!user) {
            return socket.emit('error', 'You must be logged in');
        }

        const channel = await Channel.query().where('name', channelName).first();
        if (!channel) {
            return socket.emit('error', 'Channel not found');
        }

        const isAdmin = channel.adminId === user.id;
        socket.emit('user:isAdmin', isAdmin);
    }
}