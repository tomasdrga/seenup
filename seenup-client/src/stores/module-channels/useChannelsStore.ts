import { defineStore } from 'pinia';
import { SerializedMessage, RawMessage } from 'src/contracts';
import channelService from 'src/services/ChannelService';

export interface Channel {
    name: string;
    isPrivate: boolean;
}

export interface ChannelsStateInterface {
    loading: boolean;
    error: Error | null;
    messages: { [channel: string]: SerializedMessage[] };
    active: string | null;
    channels: Channel[]; // Add channels array
}

export const useChannelsStore = defineStore('channels', {
    state: (): ChannelsStateInterface => ({
        loading: false,
        error: null,
        messages: {},
        active: null,
        channels: [], // Initialize channels array
    }),

    getters: {
        joinedChannels(state): Channel[] {
            return state.channels;
        },
        currentMessages(state): SerializedMessage[] {
            return state.active !== null ? state.messages[state.active] : [];
        },
        lastMessageOf: (state) => (channel: string): SerializedMessage | null => {
            const messages = state.messages[channel];
            return messages && messages.length > 0 ? messages[messages.length - 1] : null;
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
            }
            delete this.messages[channel];
        },
        SET_ACTIVE(channel: string) {
            this.active = channel;
        },
        NEW_MESSAGE(channel: string, message: SerializedMessage) {
            if (!this.messages[channel]) {
                this.messages[channel] = [];
            }
            this.messages[channel].push(message);
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
    },
});