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

        this.socket.on('user:channels', (channels: Channel[], channelName?: string) => {
            console.log('User channels:', channels);
            const channelsStore = useChannelsStore();
            channelsStore.updateUserChannels(channels, channelName);
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

        this.socket.on('channel:users', (data: { channelName: string, users: string[] }) => {
            console.log('Received channel:users event:', data);
            channelsStore.SET_USERS(data.channelName, data.users);
        });

        this.socket.on('user:typing', ({ user }) => {
            console.log(`${user} is typing`);
            channelsStore.updateTypingStatus(channel, user, true);

            setTimeout(() => {
                channelsStore.resetTypingStatus(channel, user);
            }, 5000);
        });

        this.socket.on('user:draftUpdate', ({ user, draft }) => {
            console.log(`${user}'s draft: ${draft}`);
            channelsStore.updateDraftMessage(channel, user, draft);
        });
        
    }

    public addMessage(message: RawMessage): Promise<SerializedMessage> {
        return this.emitAsync('addMessage', message);
    }

    public loadMessages(): Promise<SerializedMessage[]> {
        return this.emitAsync('loadMessages');
    }

    public getUsers(channelName: string): Promise<void> {
        console.log(`ChannelSocketManager.getUsers called with channelName: ${channelName}`);
        return this.emitAsync('getUsers', channelName);
    }

    public executeCommand(command: string, name: string, flag: string): Promise<void> {
        return this.emitAsync('executeCommand', command, name, flag);
    }

    public sendTypingEvent(channelName: string): void {
        console.log(`ChannelSocketManager.sendTypingEvent called with channelName: ${channelName}`);
        this.socket.emit('typing', channelName);
    }

    public sendDraftUpdateEvent(channelName: string, draft: string): void {
        console.log(`ChannelSocketManager.sendDraftUpdateEvent called with channelName: ${channelName} and draft: ${draft}`);
        this.socket.emit('draftUpdate', channelName, draft);
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
