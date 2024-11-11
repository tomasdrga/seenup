import { Server, ChannelType, Message } from 'components/models';
import { allChannels} from 'assets/channels';
import { users } from 'assets/users';

export const servers: Server[] = [
  {
    id: 1, 
    uuid: 'c8a023ed',
    name: 'SeenUp Server',
    channels: allChannels,
  },

  {
    id: 2, 
    uuid: '45ab8530',
    name: 'Server 2',
    channels: allChannels,
  }
];

export function addChannelToServer(serverId: number, newChannel: { id: number, uuid: string, type: ChannelType, name: string, users: typeof users.value, messages: Message[] }) {
  const server = servers.find(s => s.id === serverId);
  if (server) {
    server.channels.push(newChannel);
  } else {
    console.error(`Server with id ${serverId} not found`);
  }
};