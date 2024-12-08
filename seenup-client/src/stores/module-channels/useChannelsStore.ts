import { defineStore } from 'pinia';
import { SerializedMessage, RawMessage } from 'src/contracts';
import { channelService } from 'src/services';
import { activityService } from 'src/services';
import { nextTick } from 'vue';

export interface Channel {
    name: string;
    isPrivate: boolean;
}

export interface ChannelsStateInterface {
    loading: boolean;
    error: Error | null;
    messages: { [channel: string]: SerializedMessage[] };
    active: string | null;
    activeType: string | null;
    channels: Channel[];
    userChannels: Channel[];
    notifications: SerializedMessage[];
}

const ACTIVE_CHANNEL_KEY = 'activeChannel';
const ACTIVE_CHANNEL_TYPE_KEY = 'activeChannelType';

export const useChannelsStore = defineStore('channels', {
    state: (): ChannelsStateInterface => ({
        loading: false,
        error: null,
        messages: {},
        active: localStorage.getItem(ACTIVE_CHANNEL_KEY),
        activeType: localStorage.getItem(ACTIVE_CHANNEL_TYPE_KEY),
        channels: [],
        userChannels: [],
        notifications: [],
    }),

    getters: {
        joinedChannels(state): Channel[] {
            return state.channels;
        },
        getUserChannels(state): Channel[] {
            return state.userChannels;
        },
        currentMessages(state): SerializedMessage[] {
            return state.active !== null ? state.messages[state.active] : [];
        },
        lastMessageOf: (state) => (channel: string): SerializedMessage | null => {
            const messages = state.messages[channel];
            return messages && messages.length > 0 ? messages[messages.length - 1] : null;
        },
        getActiveChannel(state): { name: string | null, type: string | null } {
            const activeChannelName = state.active;
            const activeChannelType = state.activeType;
            console.log('Getting active channel:', state.active, 'with type:', state.activeType);
            return {
                name: activeChannelName,
                type: activeChannelType
            };
        },
        allNotifications(state): SerializedMessage[] {
          return state.notifications;
        },
    },

    actions: {
        LOADING_START() {
            this.loading = true;
            this.error = null;
        },
        LOADING_SUCCESS(channel: string, messages: SerializedMessage[]) {
            this.loading = false;
            this.messages[channel] = messages;
        },
        LOADING_ERROR(error: Error) {
            this.loading = false;
            this.error = error;
        },
        CLEAR_CHANNEL(channel: string) {
            if (this.active === channel) {
                this.active = null;
                localStorage.removeItem(ACTIVE_CHANNEL_KEY); // Remove from local storage
                localStorage.removeItem(ACTIVE_CHANNEL_TYPE_KEY); // Remove from local storage
            }
            delete this.messages[channel];
        },
        SET_ACTIVE(channel: string, isPrivate: boolean) {
            this.active = channel;
            localStorage.setItem(ACTIVE_CHANNEL_KEY, channel); // Save to local storage
            localStorage.setItem(ACTIVE_CHANNEL_TYPE_KEY, isPrivate ? 'private' : 'public');
            console.log('Active channel set to:', channel);
        },
        NEW_MESSAGE(channel: string, message: SerializedMessage) {
            if (!this.messages[channel]) {
                this.messages[channel] = [];
            }
            this.messages[channel].push(message);
          if (this.active !== channel) {
            this.ADD_NOTIFICATION(message);
          }
        },
        ADD_NOTIFICATION(message: SerializedMessage) {
          this.notifications.push(message);
        },
        CLEAR_NOTIFICATIONS() {
          this.notifications = [];
        },


      async join(channel: string, isPrivate: boolean) {
            console.log(`channelsStore.join called with channel: ${channel}`);
            console.log(`channelsStore.join called with isPrivate: ${isPrivate}`);
            try {
                this.LOADING_START();
                const service = channelService.join(channel);
                const messages = await service.loadMessages();
                this.LOADING_SUCCESS(channel, messages);
                // Add the channel to the channels array
                this.channels.push({ name: channel, isPrivate: isPrivate });
            } catch (err) {
                this.LOADING_ERROR(err as Error);
                throw err;
            }
        },
        async leave(channel: string | null) {
            const leaving: string[] = channel !== null ? [channel] : this.joinedChannels.map(c => c.name);

            leaving.forEach((c) => {
                channelService.leave(c);
                this.CLEAR_CHANNEL(c);
                this.channels = this.channels.filter(ch => ch.name !== c);
            });
        },
        async addMessage(channel: string, message: RawMessage) {
            const service = channelService.in(channel);
            if (service) {
                const newMessage = await service.addMessage(message);
                this.NEW_MESSAGE(channel, newMessage);
            } else {
                throw new Error(`Not connected to channel: ${channel}`);
            }
        },
        async executeCommand(channel: string, command: string, name: string, flag: string) {
            const service = channelService.in(channel);
            if (service) {
                return service.executeCommand(command, name, flag);
            } else {
                throw new Error(`Not connected to channel: ${channel}`);
            }
        },
        async executeGeneralCommand(command: string, name: string, flag: string) {
            const service = activityService;
            if (service) {
                return service.executeGeneralCommand(command, name, flag);
            } else {
                throw new Error(`Not connected to general service: ${service}`);
            }
        },
        async fetchUserChannels() {
            const service = activityService;
            try {
                this.LOADING_START();
                if (!service) {
                    throw new Error('Not connected to general service');
                }
                return service.getUserChannels();
            } catch (err) {
                this.LOADING_ERROR(err as Error);
                throw err;
            }
        },
        async updateUserChannels(channels: Channel[]) {
            try {
                this.LOADING_START();
                console.log('Updating user channels:', channels);
                this.$patch({ userChannels: channels });
                await nextTick();
                console.log('User channels updated:', this.userChannels);
                this.loading = false;
                console.log('User channels updated:', this.userChannels);
            } catch (err) {
                this.LOADING_ERROR(err as Error);
                throw err;
            }
        },
        async checkAdmin(channel: string) {
        const service = activityService;
            if (service) {
                return service.checkAdmin(channel);
            } else {
                throw new Error(`Not connected to channel: ${channel}`);
            }
        },
    },
});
