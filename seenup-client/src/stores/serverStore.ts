import { defineStore } from 'pinia';
import { ref } from 'vue';

import { Channel, Server } from 'components/models';
import { allChannels } from 'assets/channels';

// Define the store for managing servers
export const useServerStore = defineStore('server', () => {
  // List of servers
  const servers = ref<Server[]>([
    { id: 1, uuid: 'c8a023ed', name: 'SeenUp Server', channels: allChannels },
    { id: 2, uuid: '45ab8530', name: 'Server 2', channels: allChannels }
  ]);

  // Add a new channel to a server
  const addChannelToServer = (serverId: number, newChannel: Channel) => {
    const server = servers.value.find(s => s.id === serverId);
    if (server) {
      server.channels.push(newChannel);
    } else {
      throw new Error(`Server with id ${serverId} not found`);
    }
  };

  // Return the state and actions
  return {
    servers,
    addChannelToServer,
  };
});