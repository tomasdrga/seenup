import { Channel } from 'components/models';
import { users} from 'assets/users';
import { ChannelType } from 'components/models';
import { allMessages } from 'assets/messages';

export const allChannels: Channel[] = [
  { id: 1, uuid: '62e0d22a', type: ChannelType.public, name: 'General', users: users.value, messages: allMessages.value },
  { id: 2, uuid: '4a618c6b', type: ChannelType.public, name: 'StandUp', users: users.value, messages: allMessages.value },
  { id: 3, uuid: '00bc77c9', type: ChannelType.private, name: 'Projects', users: users.value, messages: allMessages.value }
];

