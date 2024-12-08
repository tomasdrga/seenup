import { ref } from 'vue';
import { User, Channel } from 'src/contracts';
import { authManager } from '.';
import { useChannelsStore } from 'src/stores/module-channels/useChannelsStore';
import { SocketManager } from './SocketManager';

class ActivitySocketManager extends SocketManager {
    private _isAdmin = ref(false);

    public get isAdmin() {
        return this._isAdmin.value;
    }

    public getUserStatus(userId: number): 'active' | 'dnd' | 'offline' {
        const channelsStore = useChannelsStore();
        return channelsStore.getUserStatus(userId);
    }

    public subscribe(): void {
        this.socket.on('user:list', (onlineUsers: User[]) => {
            console.log('Online users list', onlineUsers);
            const channelsStore = useChannelsStore();
            channelsStore.updateUserStatuses(onlineUsers);
        });

        this.socket.on('user:online', (user: User) => {
            console.log('User is online', user);
            const channelsStore = useChannelsStore();
            channelsStore.updateUserStatus(user, 'active');
        });

        this.socket.on('user:dnd', (user: User) => {
            console.log('User is dnd', user);
            const channelsStore = useChannelsStore();
            channelsStore.updateUserStatus(user, 'dnd');
        });

        this.socket.on('user:offline', (user: User) => {
            console.log('User is offline', user);
            const channelsStore = useChannelsStore();
            channelsStore.updateUserStatus(user, 'offline');
        });

        this.socket.on('user:isAdmin', (isAdmin: boolean) => {
            console.log('User is admin:', isAdmin);
            this._isAdmin.value = isAdmin;
        });

        this.socket.on('channel:quit', (channelName: string ) => {
            console.log('Received channel:deleted event:', channelName);
            const channelsStore = useChannelsStore();
            channelsStore.leave(channelName);
        });

        this.socket.on('channel:cancel', (channelName: string ) => {
            console.log('Received channel:leave event:', channelName);
            const channelsStore = useChannelsStore();
            channelsStore.leave(channelName);
        });

        this.socket.on('join_channel', (channel) => {
            const { channelId, channelName, channelType, userId } = channel;
            console.log('Joined channel:', channelName, channelType, userId);
            console.log('Channel ID:', channelId);
            const channelsStore = useChannelsStore();
            channelsStore.join(channelName, channelType);
            channelsStore.SET_ACTIVE(channelName, channelType);
        });

        this.socket.on('user:channels', (channels: Channel[], channelName?: string) => {
            console.log('User channels:', channels);
            const channelsStore = useChannelsStore();
            channelsStore.updateUserChannels(channels, channelName);
        });
        
        this.socket.on('error', (error: string) => {
            console.error('Error:', error);
        });

        authManager.onChange((token) => {
            if (token) {
                this.socket.connect();
            } else {
                this.socket.disconnect();
            }
        });
    }

    public executeGeneralCommand(command: string, name: string, flag: string): Promise<void> {
        console.log('Executing general command:', command);
        this.emitAsync('executeGeneralCommand', command, name, flag);
        return Promise.resolve();
    }

    public getUserChannels(): Promise<void> {
        return this.emitAsync('fetchUserChannels');
    }

    public checkAdmin(channel: string): Promise<void> {
        console.log('Checking if user is admin in channel:', channel);
        return this.emitAsync('onAdminCheck', channel);
    }

    public changeStatus(status: 'active' | 'dnd' | 'offline'): Promise<void> {
        console.log('Changing status to:', status);
        return this.emitAsync('changeStatus', status);
    }
}
export default new ActivitySocketManager('/');