import type { WsContextContract } from "@ioc:Ruby184/Socket.IO/WsContext";
import type { MessageRepositoryContract } from "@ioc:Repositories/MessageRepository";
import { inject } from "@adonisjs/core/build/standalone";
import ChannelController from '../Http/ChannelsController';
@inject(["Repositories/MessageRepository"])
export default class MessageController {
    constructor(private messageRepository: MessageRepositoryContract) { }

    public async loadMessages({ params }: WsContextContract) {
        return this.messageRepository.getAll(params.name);
    }

    public async addMessage(
        { params, socket, auth }: WsContextContract,
        content: string
    ) {
        if (content.startsWith('/')) {
            return this.parseAndExecuteCommand(content, params, socket, auth);
        }

        const message = await this.messageRepository.create(
            params.name,
            auth.user!.id,
            content
        );

        socket.broadcast.emit("message", message);

        return message;
    }

  private async parseAndExecuteCommand(
    content: string,
    params: Record<string, any>,
    socket: WsContextContract['socket'],
    auth: WsContextContract['auth']
  ) {
    const [command, ...args] = content.split(' ');
    const channelsController = new ChannelController();

    switch (command) {
      case '/join':
        if (args[0]) {
          return channelsController.joinOrCreateChannel(
            params,
            socket,
            auth,
            args[0],
            args[1]
          );
        } else {
          return socket.emit('error', 'Please specify a channel name for the /join command.');
        }

      case '/invite':
        if (args[0]) {
          return channelsController.inviteUser(params, socket, auth, args[0]);
        } else {
          return socket.emit('error', 'Please specify a nickname for the /invite command.');
        }

      case '/revoke':
        if (args[0]) {
          return channelsController.revokeUser(params, socket, auth, args[0]);
        } else {
          return socket.emit('error', 'Please specify a nickname for the /revoke command.');
        }

      case '/list':
        const message = await this.messageRepository.create(
          params.name,
          auth.user!.id,
          content
        );

        socket.broadcast.emit("message", message);

        return message;

      default:
        return socket.emit('error', 'Unknown command.');
    }
  }


}

