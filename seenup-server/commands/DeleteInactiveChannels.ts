import { BaseCommand } from '@adonisjs/core/build/standalone'
import Channel from 'App/Models/Channel'
import { DateTime } from 'luxon'

export default class DeleteInactiveChannels extends BaseCommand {
  public static commandName = 'delete:inactive_channels'
  public static description = 'Delete channels inactive for over 30 days'

  public static settings = {
    loadApp: true, // Load the application to access models
    stayAlive: false,
  }

  public async run() {
    const thirtyDaysAgo = DateTime.now().minus({ days: 30 }).toSQL()

    try {
      // Find channels with no messages in the last 30 days
      const channels = await Channel.query()
        .whereDoesntHave('messages', (query) => {
          query.where('created_at', '>', thirtyDaysAgo)
        })

      // Delete each inactive channel
      for (const channel of channels) {
        await channel.delete()
      }

      this.logger.info(`Deleted ${channels.length} inactive channels.`)
    } catch (error) {
      this.logger.error('Error deleting inactive channels.')
    }
  }
}