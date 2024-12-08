import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import type { WsContextContract } from "@ioc:Ruby184/Socket.IO/WsContext";
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

import type { MessageRepositoryContract } from "@ioc:Repositories/MessageRepository";
import { inject } from "@adonisjs/core/build/standalone";
@inject(["Repositories/MessageRepository"])

export default class ChannelsController {
    constructor(private messageRepository: MessageRepositoryContract) { }

    private getUserRoom(user: User): string {
        return `user:${user.id}`;
    }

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

        const isBanned = await channel.related('users').pivotQuery().where('user_id', user.id).andWhere('is_banned', true).first();

        if (isBanned) {
            // Update the pivot table to set isBanned to true
            await channel.related('users').pivotQuery().where('user_id', user.id).update({ is_banned: true });
        } else {
            // Detach the user from the channel
            await channel.related('users').detach([user.id]);
        }

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
        socket: WsContextContract['socket'],
        auth: WsContextContract['auth'],
        channelName: string,
        nickName: string
    ) {
        nickName = nickName?.replace(/<br>/g, '').replace(/\r?\n|\r/g, '').trim();
        console.log(nickName);
        const currentUser = auth.user!;
        const channel = await Channel.query().where('name', channelName).first();
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

        // Check if the user is banned
        const isBanned = await channel.related("users").pivotQuery().where("user_id", userToInvite.id).andWhere("is_banned", true).first();
        if (isBanned) {
            // Only the admin can invite a banned user
            if (channel.adminId !== currentUser.id) {
                return socket.emit("error", "Only the channel admin can invite banned users.");
            } else {
                // Unban the user
                await channel.related("users").pivotQuery().where('user_id', userToInvite.id).update({ is_banned: false });
            }
        } else {
            // Check if the user is already a member
            const alreadyMember = await channel.related("users").query().where("users.id", userToInvite.id).first();
            if (alreadyMember) {
                return socket.emit("info", `${nickName} is already a member of the channel.`);
            }

            // Add the user to the channel
            await channel.related("users").attach([userToInvite.id]);
        }

        console.log("fetching user channels");
        const channels = await userToInvite.related("channels").query().wherePivot('is_banned', false);;
        const userChannels = channels.map(channel => ({
            name: channel.name,
            isPrivate: channel.isPrivate
        }));

        const users = await channel.related('users').query();
        const usersList = users.map(user => user.nickname);

        socket.emit('channel:users', { channelName, users: usersList });

        // Emit the updated channels to the invited user's room
        const room = this.getUserRoom(userToInvite);
        console.log("emitting to room", room);

        const generalNamespace = socket.nsp.server.of('/');
        
        generalNamespace.to(room).emit("user:channels", userChannels as Channel[], channelName);

        socket.emit("info", `${nickName} has been invited to the channel.`);
    }

    // Method to revoke a user from the channel (only for private channels)
    public async revokeUser(
        socket: WsContextContract['socket'],
        auth: WsContextContract['auth'],
        channelName: string,
        nickName: string
    ) {
        const currentUser = auth.user!;
        const channel = await Channel.query().where('name', channelName).first();
        if (!channel) {
            return socket.emit('error', 'Channel not found.');
        }

        // Only the admin can remove users from a private channel
        if (!channel.isPrivate) {
            return socket.emit("error", "Users can only be revoked from private channels.");
        }

        if (channel.adminId !== currentUser.id) {
            return socket.emit("error", "Only the channel admin can revoke users from this private channel.");
        }

        const userToRevoke = await User.query().where('nickname', nickName.trim()).first();
        if (!userToRevoke) {
            return socket.emit('error', 'User not found.');
        }

        // Check if the user is a member of the channel
        const isMember = await channel.related("users").query().where("users.id", userToRevoke.id).first();
        if (!isMember) {
            return socket.emit("error", `${nickName} is not a member of the channel.`);
        }

        // Remove the user from the channel
        await channel.related("users").detach([userToRevoke.id]);

        console.log("fetching user channels");
        const channels = await userToRevoke.related("channels").query().wherePivot('is_banned', false);;
        const userChannels = channels.map(channel => ({
            name: channel.name,
            isPrivate: channel.isPrivate
        }));

        const users = await channel.related('users').query();
        const usersList = users.map(user => user.nickname);

        socket.emit('channel:users', { channelName, users: usersList });

        // Emit the updated channels to the revoked user's room
        const room = this.getUserRoom(userToRevoke);
        console.log("emitting to room", room);

        const generalNamespace = socket.nsp.server.of('/');
        generalNamespace.to(room).emit("user:channels", userChannels as Channel[]);
        
        generalNamespace.to(room).emit('channel:cancel', channelName );

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
                const isBanned = await channel.related("users").pivotQuery().where('user_id', currentUser.id).andWhere('is_banned', true).first();
                if (isBanned) {
                    return socket.emit("error", "You are banned from this channel.");
                }

                socket.emit("join_channel", { channelId: channel.id, channelName: channel.name, channelType: channel.isPrivate, userId: currentUser.id });
            } else {
                const isBanned = await channel.related("users").pivotQuery().where('user_id', currentUser.id).andWhere('is_banned', true).first();
                if (isBanned) {
                    return socket.emit("error", "You are banned from this channel.");
                }

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
            const channels = await user.related("channels").query().wherePivot('is_banned', false);
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

    public async getUsersInChannel({ socket, params }: WsContextContract) {
        console.log("getUsersInChannel");
        console.log(params);
        const channelName = params.name;
        const channel = await Channel.query().where('name', channelName).first();

        if (!channel) {
            return socket.emit('error', 'Channel not found.');
        }

        const users = await channel.related('users').query().wherePivot('is_banned', false);
        const usersList = users.map(user => user.nickname);

        return socket.emit('channel:users', { channelName, users: usersList });
    };

    public async onTyping({ socket, auth }: WsContextContract, channelName: string) {
        const user = auth.user;
        if (!user) {
            return socket.emit('error', 'You must be logged in');
        }
        console.log("user typing", user.nickname);
        return socket.broadcast.emit('user:typing', { channelName, user: user.nickname });
    }

    public async onDraftUpdate({ socket, auth }: WsContextContract, channelName: string, draft: string) {
        const user = auth.user;
        if (!user) {
            return socket.emit('error', 'You must be logged in');
        }
        console.log("user draft", user.nickname, draft);
        return socket.broadcast.emit('user:draftUpdate', { channelName, user: user.nickname, draft });
    }

    public async kickUser(
        socket: WsContextContract['socket'],
        auth: WsContextContract['auth'],
        channelName: string,
        nickName: string
    ) {
        const currentUser = auth.user!;
        const channel = await Channel.query().where('name', channelName).first();
        if (!channel) {
            return socket.emit('error', 'Channel not found.');
        }

        const userToKick = await User.query().where('nickname', nickName.trim()).first();
        if (!userToKick) {
            return socket.emit('error', 'User not found.');
        }

        const isMember = await channel.related("users").query().where("users.id", userToKick.id).first();
        if (!isMember) {
            return socket.emit("error", `${nickName} is not a member of the channel.`);
        }

        // Check if the user to be kicked is the admin
        if (channel.adminId === userToKick.id) {
            return socket.emit("error", "You cannot kick the admin of the channel.");
        }

        const room = this.getUserRoom(userToKick);
        console.log("emitting to room", room);

        const generalNamespace = socket.nsp.server.of('/');

        // Check if the current user is the admin
        if (channel.adminId === currentUser.id) {
            // Admin cannot kick themselves
            if (currentUser.id === userToKick.id) {
                return socket.emit("error", "You cannot kick yourself.");
            }

            // Admin can kick the user permanently
            await channel.related("users").pivotQuery().where('user_id', userToKick.id).update({ is_banned: true });
            console.log("fetching user channels");
            const channels = await userToKick.related("channels").query().wherePivot('is_banned', false);
            const userChannels = channels.map(channel => ({
                name: channel.name,
                isPrivate: channel.isPrivate
            }));
            generalNamespace.to(room).emit("user:channels", userChannels as Channel[]);
            generalNamespace.to(room).emit('channel:cancel', channelName);

            return socket.emit("success", `${nickName} has been permanently kicked from the channel.`);
        } else {
            // Regular members can only kick in public channels
            if (channel.isPrivate) {
                return socket.emit("error", "Only the admin can kick users in private channels.");
            }

            // Check if the current user has already voted to kick this user
            const existingVote = await channel.related("kickVotes").query().where("user_id", userToKick.id).andWhere("voter_id", currentUser.id).first();
            if (existingVote) {
                return socket.emit("error", "You have already voted to kick this user.");
            }

            // Regular members need to vote to kick the user
            const kickVotes = await channel.related("kickVotes").query().where("user_id", userToKick.id).countDistinct('voter_id as total');
            console.log("Kick votes", kickVotes);
            const totalVotes = parseInt(kickVotes[0].$extras.total, 10);
            console.log("Total votes", totalVotes);
            
            if (totalVotes >= 2) {
                // If there are already 2 votes, this vote will make it 3
                await channel.related("users").pivotQuery().where('user_id', userToKick.id).update({ is_banned: true });
                console.log("fetching user channels");
                const channels = await userToKick.related("channels").query().wherePivot('is_banned', false);
                const userChannels = channels.map(channel => ({
                    name: channel.name,
                    isPrivate: channel.isPrivate
                }));
                generalNamespace.to(room).emit("user:channels", userChannels as Channel[]);
                generalNamespace.to(room).emit('channel:cancel', channelName);

                await channel.related("kickVotes").pivotQuery().where('user_id', userToKick.id).delete();

                return socket.emit("success", `${nickName} has been permanently kicked from the channel.`);
            } else {
                // Add the vote to kick the user
                await channel.related("kickVotes").attach({
                    [userToKick.id]: {
                        voter_id: currentUser.id
                    }
                });
                return socket.emit("info", `Vote to kick ${nickName} has been added. ${2 - totalVotes} more votes needed.`);
            }
        }
    }

    public async onExecuteCommand(
        { socket, auth, logger }: WsContextContract,
        command: string,
        name: string,
        flag: string
    ) {
        logger.info("command executed", command);

        const channelName = socket.nsp.name.split('/').pop();

        if (command) { command = command.replace(/\r?\n|\r/g, '').trim(); }
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
                        const channels = await user.related("channels").query().wherePivot('is_banned', false);
                        const userChannels = channels.map(channel => ({
                            name: channel.name,
                            isPrivate: channel.isPrivate
                        }));
                        socket.emit("user:channels", userChannels as Channel[]);
                        return socket.emit('channel:cancel', { channelName });
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

                        return socket.emit('channel:quit', { channelName });
                    }
                } else {
                    return socket.emit('error', 'Channel name not found.');
                }
            case '/invite':
                console.log("INVITE");
                if (channelName) {
                    console.log("INVITING");
                    return this.inviteUser(socket, auth, channelName, name);

                } else {
                    return socket.emit('error', 'Channel name not found.');
                }
            case '/revoke':
                console.log("REVOKE");
                if (channelName) {
                    console.log("REVOKING");
                    return this.revokeUser(socket, auth, channelName, name);
                } else {
                    return socket.emit('error', 'Channel name not found.');
                }

            case '/kick':
                console.log("KICK");
                if (channelName) {
                    console.log("KICKING");
                    return this.kickUser(socket, auth, channelName, name);
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

                const users = await channel.related('users').query().wherePivot('is_banned', false);
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