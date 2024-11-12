import Channel from 'App/Models/Channel'
import { DateTime } from 'luxon'
import { globalSocket } from '../../start/socket'

class ChannelCleanupService {
    public static async cleanupInactiveChannels() {
        const thirtyDaysAgo = DateTime.now().minus({ days: 30 })

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

                //globalSocket.emit('channel:deleted', { channelId: channel.id })

                await channel.delete()
                deletedCount++
            }
        }

        console.log(`Deleted ${deletedCount} inactive channels.`)
    }
}

export default ChannelCleanupService
