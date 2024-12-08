import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import { DateTime } from 'luxon'
import Ws from "@ioc:Ruby184/Socket.IO/Ws";

class ChannelCleanupService {
    public static async cleanupInactiveChannels() {
        const thirtyDaysAgo = DateTime.now().minus({ days: 30 })

        const getUserRoom = (user: User): string => {
            return `user:${user.id}`;
        };

        const channels = await Channel.query()
            .preload('messages', (messageQuery) => {
                messageQuery.orderBy('created_at', 'desc').limit(1)
            })

        let deletedCount = 0

        for (const channel of channels) {
            const lastMessage = channel.messages[0]

            if (
                (!lastMessage && channel.createdAt < thirtyDaysAgo) ||
                (lastMessage && lastMessage.createdAt < thirtyDaysAgo)
            ) {
                const users = await channel.related('users').query();
                for (const user of users) {
                    Ws.io.to(getUserRoom(user)).emit('channel:quit', channel.name)
                    Ws.io.to(getUserRoom(user)).emit(`channel:cancel`, channel.name);
                }
               
                console.log("fetching user channels");
                for (const user of users) {
                    const userChannels = await user.related("channels").query().wherePivot('is_banned', false);
                    const userChannelData = userChannels.map(channel => ({
                        name: channel.name,
                        isPrivate: channel.isPrivate
                    }));
                    Ws.io.to(getUserRoom(user)).emit("user:channels", userChannelData);
                }
                
                await channel.delete()
                deletedCount++
            }
        }

        console.log(`Deleted ${deletedCount} inactive channels.`)
    }
}

export default ChannelCleanupService
