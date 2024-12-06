import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import  Channel  from 'App/Models/Channel';
import Database from "@ioc:Adonis/Lucid/Database";

export default class UserController {
  public async changeStatus({ request, auth, response }: HttpContextContract) {
      const status = request.input('status');
      console.log('Received status change request:', status); // Add logging

      if (!status) {
        return response.badRequest({ error: 'Status is required' });
      }

      const user = auth.user;
      if (user) {
        user.status = status.toLowerCase();
        await user.save();
        console.log(`User ${user.id} changed status to ${status}`);
        return response.ok({ message: 'Status updated successfully' });
      }

      return response.unauthorized({ error: 'User not authenticated' });
  }


  public async getUsers({ request, response }: HttpContextContract) {
    const channelName = request.input('channel');
    if (!channelName) {
      return response.badRequest({ error: 'Channel name is required' });
    }


    const channel = await Channel.query().where('name', channelName).first();

    if (!channel) {
      return response.notFound({ message: 'Channel not found' });
    }

    const channelId = channel.id;

    const userIds = await Database.from('channel_users').where('channel_id', channelId).select('user_id');

    const userIdList = userIds.map((user: any) => user.user_id);

    const users = await Database.from('users').whereIn('id', userIdList).select('id', 'nickname','status');

    return response.ok(users);
  }
}
