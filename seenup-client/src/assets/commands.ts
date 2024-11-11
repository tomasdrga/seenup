import { Command, ChannelType} from 'src/components/models';

export const commands: Command[] = [
  // Commands for private channels
  { type: ChannelType.private ,name: '/invite nickName', description: 'Invite a user to the channel' },
  { type: ChannelType.private ,name: '/revoke nickName', description: 'Remove a user from the channel' },
  { type: ChannelType.private,name: '@nickname', description: 'Address message to specific user '},
  { type: ChannelType.private ,name: '/list', description: 'View a list of channel members'},
  { type: ChannelType.private ,name: '/cancel', description: 'Cancel subscription from the channel'},
  { type: ChannelType.private ,name: '/quit command', description: 'Close the channel'},

  // Commands for public channels
  { type: ChannelType.public ,name: '/invite nickName', description: 'Invite a user to the channel' },
  { type: ChannelType.public ,name: '/join channelName', description: 'Join a channel (if the channel doesn\'t exist, it is automatically created)' },
  { type: ChannelType.public ,name: '/kick nickName', description: 'Remove a user from the channel'},
  { type: ChannelType.public,name: '@nickname', description: 'Address message to specific user '},
  { type: ChannelType.public ,name: '/cancel', description: 'Cancel subscription from the channel'},
  { type: ChannelType.public ,name: '/list', description: 'View a list of channel members'},
  { type: ChannelType.public ,name: '/quit command', description: 'Close the channel'},
];
