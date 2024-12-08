import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import type { WsContextContract } from "@ioc:Ruby184/Socket.IO/WsContext";
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

import type { MessageRepositoryContract } from "@ioc:Repositories/MessageRepository";
import { inject } from "@adonisjs/core/build/standalone";
@inject(["Repositories/MessageRepository"])

export default class ChannelsController {
    constructor(private messageRepository: MessageRepositoryContract) { }

    public async create({ request, response, auth }: HttpContextContract) {
        const { name, isPrivate } = request.only(['name', 'isPrivate'])

        const user = auth.user

        if (!user) {
            return response.unauthorized('You must be logged in to create a channel')
        }

        const channel = await Channel.create({
            name,
            isPrivate,
            adminId: user.id,
        })

        await channel.related('users').attach([user.id])

        return response.created(channel)
    }

    public async isAdmin({ params, auth, response }: HttpContextContract) {
        const user = auth.user
        if (!user) {
            return response.unauthorized('You must be logged in')
        }

        const channel = await Channel.query().where('name', params.name).first()
        if (!channel) {
            return response.notFound('Channel not found')
        }

        return response.ok(channel.adminId === user.id)
    }

    public async leave({ socket, auth, logger }: WsContextContract, channelName: string) {
        const user = auth.user;
        if (!user) {
            return socket.emit('error', 'You must be logged in');
        }

        const channel = await Channel.query().where('name', channelName).first();
        if (!channel) {
            return socket.emit('error', 'Channel not found');
        }

        await channel.related('users').detach([user.id]);

        return socket.emit('channel:cancel', { channelName });
    }

    public async delete({ socket, auth, logger }: WsContextContract, channelName: string) {
        const user = auth.user;
        if (!user) {
            return socket.emit('error', 'You must be logged in');
        }

        const channel = await Channel.query().where('name', channelName).first();
        if (!channel) {
            return socket.emit('error', 'Channel not found');
        }

        if (channel.adminId !== user.id) {
            return socket.emit('error', 'Only the admin can delete the channel');
        }

        await channel.delete();

        return socket.emit('channel:quit', { channelName });
    }

    public async inviteUser(
        params: Record<string, any>,
        socket: WsContextContract['socket'],
        auth: WsContextContract['auth'],
        nickName: string) {

        console.log(params);
        nickName = nickName.replace(/<br>/g, '').replace(/\r?\n|\r/g, '').trim();
        console.log(nickName);
        const currentUser = auth.user!;
        const channel = await Channel.query().where('name', params.name).first();
        if (!channel) {
            return socket.emit('error', 'Channel not found.');
        }
        const userToInvite = await User.query().where('nickname', nickName.trim()).first();
        if (!userToInvite) {
            return socket.emit('error', 'User not found.');
        }

        // Check if the current user has permission to invite
        if (channel.isPrivate) {
            // Only the admin can invite users to a private channel
            if (channel.adminId !== currentUser.id) {
                return socket.emit("error", "Only the channel admin can invite users to this private channel.");
            }
        } else {
            // For public channels, any member can invite other users
            const isMember = await channel.related("users").query().where("users.id", currentUser.id).first();
            if (!isMember) {
                return socket.emit("error", "Only channel members can invite users to this public channel.");
            }
        }

        // Check if the user is already a member
        const alreadyMember = await channel.related("users").query().where("users.id", userToInvite.id).first();
        if (alreadyMember) {
            return socket.emit("info", `${nickName} is already a member of the channel.`);
        }

        // Add the invited user to the channel
        await channel.related("users").attach([userToInvite.id]);

        socket.broadcast.emit("invited_to_channel", { channelId: channel.id, channelName: channel.name, isPrivate: channel.isPrivate, userId: currentUser.id });

        // Emit an event to notify all users in the channel room that a new user was invited
        socket.to(`channel_${channel.id}`).emit("user:invited", { channelId: channel.id, nickName });

        // Confirm to the inviter that the user was successfully invited
        return socket.emit("success", `${nickName} has been invited to the channel.`);
    }

    // Method to revoke a user from the channel (only for private channels)
    public async revokeUser(
        params: Record<string, any>,
        socket: WsContextContract['socket'],
        auth: WsContextContract['auth'],
        nickName: string) {
        const currentUser = auth.user!;
        const channel = await Channel.findOrFail(params.channelId);
        const userToRevoke = await User.findByOrFail("nickname", nickName);

        // Only the admin can remove users from a private channel
        if (channel.isPrivate && channel.adminId !== currentUser.id) {
            return socket.emit("error", "Only the channel admin can revoke users from this private channel.");
        }

        // Remove the user from the channel
        await channel.related("users").detach([userToRevoke.id]);

        // Emit an event to notify all users in the channel room that a user was revoked
        socket.to(`channel_${channel.id}`).emit("user:revoked", { channelId: channel.id, nickName });

        // Confirm to the admin that the user was successfully removed
        return socket.emit("success", `${nickName} has been removed from the channel.`);
    }

    public static async joinOrCreateChannel(
        socket: WsContextContract['socket'],
        auth: WsContextContract['auth'],
        channelName: string, isPrivate: boolean) {

        const currentUser = auth.user!;

        try {
            let channel = await Channel.query().where("name", channelName).first();

            if (!channel) {
                channel = await Channel.create({
                    name: channelName,
                    isPrivate,
                    adminId: currentUser.id,
                });
                socket.emit("join_channel", { channelId: channel.id, channelName: channel.name, isPrivate: channel.isPrivate, userId: currentUser.id });

            } else if (channel.isPrivate && channel.adminId !== currentUser.id) {
                return socket.emit("error", "Only the admin can join or invite others to private channels.");
            } else if (channel.isPrivate && channel.adminId == currentUser.id) {
                socket.emit("join_channel", { channelId: channel.id, channelName: channel.name, channelType: channel.isPrivate, userId: currentUser.id });
            } else {
                if (!channel.isPrivate) {
                    socket.emit("join_channel", { channelId: channel.id, channelName: channel.name, channelType: channel.isPrivate, userId: currentUser.id });
                }
            }

            const isMember = await channel.related("users").query().where("users.id", currentUser.id).first();
            if (!isMember) {
                await channel.related("users").attach([currentUser.id]);
            }

            console.log("fetching user channels");
            const user = auth.user!;
            const channels = await user.related("channels").query();
            const userChannels = channels.map(channel => ({
                name: channel.name,
                isPrivate: channel.isPrivate
            }));
            socket.emit("user:channels", userChannels as Channel[]);

            socket.to(`channel_${channel.id}`).emit("user_joined", { channelId: channel.id, userId: currentUser.id });
            return socket.emit("success", `You have joined ${channelName}`);
        } catch (error) {
            console.error("Error in joinOrCreateChannel:", error);
            return socket.emit("error", "Error joining or creating the channel.");
        }
    }

    private formatListMessage = (usersList: string[], currentUserNickname: string) => {
        const otherUsers = usersList.filter(username => username !== currentUserNickname);

        const formattedUsers = otherUsers.map(username => `@${username}`);

        formattedUsers.push('You');

        const finalMessage = formattedUsers.length > 1
            ? formattedUsers.slice(0, -1).join(' , ') + ' and ' + formattedUsers[formattedUsers.length - 1]
            : formattedUsers[0];

        return `/list Users here: ${finalMessage}`;
    };


    public async onExecuteCommand(
        { socket, auth, logger }: WsContextContract,
        command: string,
        name: string,
        flag: string
    ) {
        logger.info("command executed", command);

        const channelName = socket.nsp.name.split('/').pop();

        command = command.replace(/\r?\n|\r/g, '').trim();
        if (name) { name = name.replace(/\r?\n|\r/g, '').trim(); }
        if (flag) { flag = flag.replace(/\r?\n|\r/g, '').trim(); }

        switch (command) {
            case '/join':
                if (name) {
                    const isPrivate = flag ? flag === "private" : false;
                    console.log(name, isPrivate);
                    return ChannelsController.joinOrCreateChannel(socket, auth, name, isPrivate);
                } else {
                    return socket.emit('error', 'Please specify a channel name for the /join command.');
                }
            case '/leave':
                console.log("LEAVE");
                if (channelName) {
                    console.log("LEAVING");
                    return socket.emit('channel:leave', { channelName });

                } else {
                    return socket.emit('error', 'Channel name not found.');
                }
            case '/cancel':
                if (channelName) {
                    const channel = await Channel.query().where('name', channelName).first();
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
                        const channels = await user.related("channels").query();
                        const userChannels = channels.map(channel => ({
                            name: channel.name,
                            isPrivate: channel.isPrivate
                        }));
                        socket.emit("user:channels", userChannels as Channel[]);
                        return socket.emit('channel:cancel', { channelName });
                    } else {
                        await channel.delete();
                        console.log("fetching user channels");
                        const channels = await user.related("channels").query();
                        const userChannels = channels.map(channel => ({
                            name: channel.name,
                            isPrivate: channel.isPrivate
                        }));
                        socket.emit("user:channels", userChannels as Channel[]);
                        return socket.emit('channel:quit', { channelName });
                    }
                } else {
                    return socket.emit('error', 'Channel name not found.');
                }
            case '/quit':
                if (channelName) {
                    const channel = await Channel.query().where('name', channelName).first();
                    if (!channel) {
                        return socket.emit('error', 'Channel not found.');
                    }

                    const user = auth.user;
                    if (!user) {
                        return socket.emit('error', 'You must be logged in');
                    }

                    if (channel.adminId == user.id) {
                        await channel.delete();

                        console.log("fetching user channels");
                        const channels = await user.related("channels").query();
                        const userChannels = channels.map(channel => ({
                            name: channel.name,
                            isPrivate: channel.isPrivate
                        }));
                        socket.emit("user:channels", userChannels as Channel[]);

                        return socket.emit('channel:quit', { channelName });
                    }
                } else {
                    return socket.emit('error', 'Channel name not found.');
                }
            case '/list':
                if (!channelName) {
                    return socket.emit('error', 'Channel name not found.');
                }
                // Fetch the list of users in the channel
                const channel = await Channel.query().where('name', channelName).first();
                if (!channel) {
                    return socket.emit('error', 'Channel not found.');
                }

                const users = await channel.related('users').query();
                const usersList = users.map(user => user.nickname);
                const currentUserNickname = auth.user!.nickname;

                // Format the message content
                const formattedMessage = this.formatListMessage(usersList, currentUserNickname);

                // Create the message with the formatted content
                const message = await this.messageRepository.create(
                    channelName,
                    auth.user!.id,
                    formattedMessage
                );

                return socket.emit('message:list', message);

            default:
                return socket.emit('error', 'Unknown command.');
        }
    }
}