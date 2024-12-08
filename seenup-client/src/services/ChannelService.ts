// src/services/ChannelService.ts

import { RawMessage, SerializedMessage, Channel } from 'src/contracts';
import { SocketManager } from './SocketManager';
import { useChannelsStore } from 'src/stores/module-channels/useChannelsStore';

class ChannelSocketManager extends SocketManager {
  public subscribe(): void {
    console.log(`Subscribing to events for namespace: ${this.namespace}`);
    const channel = this.namespace.split('/').pop() as string;
    const channelsStore = useChannelsStore();

    this.socket.on('message', (message: SerializedMessage) => {
      channelsStore.NEW_MESSAGE(channel, message);
      channelsStore.ADD_NOTIFICATION(message);
    });

    this.socket.on('message:list', (message: SerializedMessage) => {
      channelsStore.NEW_MESSAGE(channel, message);
    });

    this.socket.on('user:channels', (channels: Channel[]) => {
      console.log('User channels:', channels);
      const channelsStore = useChannelsStore();
      channelsStore.updateUserChannels(channels);
    });

    this.socket.on('join_channel', (channel) => {
      const { channelId, channelName, channelType, userId } = channel;
      console.log('Joined channel:', channelName, channelType, userId);
      console.log('Channel ID:', channelId);
      const channelsStore = useChannelsStore();
      channelsStore.join(channelName, channelType);
      channelsStore.SET_ACTIVE(channelName, channelType);
    });

    this.socket.on('channel:quit', (data: { channelName: string }) => {
      console.log('Received channel:deleted event:', channel);
      channelsStore.leave(data.channelName);
    });

    this.socket.on('channel:cancel', (data: { channelName: string }) => {
      console.log('Received channel:leave event:', channel);
      channelsStore.leave(data.channelName);
    });

    this.socket.on('channel:leave', (data: { channelName: string }) => {
      console.log('Received channel:leave event:', data);
      channelsStore.leave(data.channelName);
    });
  }

  public addMessage(message: RawMessage): Promise<SerializedMessage> {
    return this.emitAsync('addMessage', message);
  }

  public loadMessages(): Promise<SerializedMessage[]> {
    return this.emitAsync('loadMessages');
  }

  public executeCommand(command: string, name: string, flag: string): Promise<void> {
    return this.emitAsync('executeCommand', command, name, flag);
  }
}

class ChannelService {
  private channels: Map<string, ChannelSocketManager> = new Map();

  public join(name: string): ChannelSocketManager {
    console.log(`ChannelService.join called with name: ${name}`);
    if (this.channels.has(name)) {
      throw new Error(`User is already joined in channel "${name}"`);
    }

    const channel = new ChannelSocketManager(`/channels/${name}`);
    this.channels.set(name, channel);
    return channel;
  }

  public leave(name: string): boolean {
    const channel = this.channels.get(name);

    if (!channel) {
      return false;
    }

    channel.destroy();
    return this.channels.delete(name);
  }

  public in(name: string): ChannelSocketManager | undefined {
    return this.channels.get(name);
  }
}

export default new ChannelService();
