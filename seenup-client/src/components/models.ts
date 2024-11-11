export interface Todo {
  id: number,
  content: string
}

export interface Meta {
  totalCount: number
}

export enum MessageType {
  system = 'system',
  user = 'user'
}
export enum ChannelType {
  public = 'public',
  private = 'private'
}

export interface Message {
  id: number,
  text: string,
  userName: string,
  profilePic: string,
  timestamp: Date,
  type: MessageType,
  channelUuid: string
}

export interface User {
  id: number,
  userName: string,
  profilePic: string,
  status: string
}

export interface Command {
  type: ChannelType,
  name: string,
  description: string
}

export interface Channel {
  id: number,
  uuid: string,
  type: ChannelType,
  name: string,
  users: User[],
  messages: Message[]
}

export interface Server {
  id: number,
  uuid: string,
  name: string,
  channels: Channel[]
}
