import type { WsContextContract } from "@ioc:Ruby184/Socket.IO/WsContext";
import User from "App/Models/User";
import ChannelsController from '../Ws/ChannelsController';
type Channel = {
    name: string;
    isPrivate: boolean;
};

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
        const channels = await user.related("channels").query();
        console.log(channels);
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

    public async onExecuteGeneralCommand(
        { socket, auth ,logger }: WsContextContract,
        command: string,
        name: string,
        flag: string
    ) {
        console.log(command);
        logger.info("general command executed", command);
        
        command = command.replace(/\r?\n|\r/g, '').trim();
        name = name.replace(/\r?\n|\r/g, '').trim();
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
        const channels = await user.related("channels").query();
        console.log(channels);
        const userChannels = channels.map(channel => ({
            name: channel.name,
            isPrivate: channel.isPrivate
        }));
        socket.emit("user:channels", userChannels as Channel[]);
    }
}