import { BaseCommand } from '@adonisjs/core/build/standalone'
import ChannelCleanupService from 'App/Services/ChannelCleanupService'

export default class CleanupChannels extends BaseCommand {
  public static commandName = 'cleanup:channels'
  public static description = 'Manually cleanup inactive channels'

  public async run() {
    console.log('Running manual channel cleanup...')
    await ChannelCleanupService.cleanupInactiveChannels()
    console.log('Manual channel cleanup complete.')
  }
}
