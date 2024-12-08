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

    public subscribe(): void {
        this.socket.on('user:list', (onlineUsers: User[]) => {
            console.log('Online users list', onlineUsers);
        });

        this.socket.on('user:online', (user: User) => {
            console.log('User is online', user);
        });

        this.socket.on('user:offline', (user: User) => {
            console.log('User is offline', user);
        });

        this.socket.on('user:isAdmin', (isAdmin: boolean) => {
            console.log('User is admin:', isAdmin);
            this._isAdmin.value = isAdmin;
        });

        this.socket.on('channel:quit', (channel: string ) => {
            console.log('Received channel:deleted event:', channel);
        });

        this.socket.on('channel:cancel', (channel: string) => {
            console.log('Received channel:leave event:', channel);
        });

        this.socket.on('join_channel', (channel) => {
            const { channelId, channelName, channelType, userId } = channel;
            console.log('Joined channel:', channelName, channelType, userId);
            console.log('Channel ID:', channelId);
            const channelsStore = useChannelsStore();
            channelsStore.join(channelName, channelType);
            channelsStore.SET_ACTIVE(channelName, channelType);
        });

        this.socket.on('user:channels', (channels: Channel[]) => {
            console.log('User channels:', channels);
            const channelsStore = useChannelsStore();
            channelsStore.updateUserChannels(channels);
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
}
export default new ActivitySocketManager('/');