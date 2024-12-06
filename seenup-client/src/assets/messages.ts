import { ref } from 'vue';
import { Message, MessageType } from 'components/models';
import { users } from 'assets/users';

const getUserDetails = (userId: number) => {
  const user = users.value.find(user => user.id === userId);
  return user ? { userName: user.nickname, profilePic: user.profilePic } : { userName: 'Unknown', profilePic: '' };
};

export const allMessages = ref<Message[]>([
  { id: 1, text: 'Caukoo', ...getUserDetails(1), timestamp: new Date('2024-02-01T10:00:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 2, text: 'Serusky', ...getUserDetails(2), timestamp: new Date('2024-02-01T10:02:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 3, text: '@Tomáš Drga Kedy ideme lietat', ...getUserDetails(1), timestamp: new Date('2024-02-01T10:04:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 4, text: '@Matej Drienovský Neviem musim robit wtech', ...getUserDetails(2), timestamp: new Date('2024-02-01T10:08:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 5, text: 'Tryhardiiiiik', ...getUserDetails(1), timestamp: new Date('2024-02-03T10:10:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 6, text: 'Drz hubu', ...getUserDetails(2), timestamp: new Date('2024-02-03T10:20:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 7, text: 'Nechce sa ti?', ...getUserDetails(1), timestamp: new Date('2024-02-03T10:30:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 8, text: 'Fakt nemám cas', ...getUserDetails(2), timestamp: new Date('2024-02-03T10:31:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 9, text: 'Dobre, nechajme to na budúci týždeň', ...getUserDetails(1), timestamp: new Date('2024-02-03T10:34:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 10, text: 'Ok, uvidíme', ...getUserDetails(2), timestamp: new Date('2024-02-03T10:40:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 11, text: 'Ale ak budes mat cas skôr, daj vediet.', ...getUserDetails(1), timestamp: new Date('2024-02-03T10:45:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 12, text: 'Dobre, ozvem sa ti.', ...getUserDetails(2), timestamp: new Date('2024-02-03T10:47:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 13, text: 'Super, drž sa!', ...getUserDetails(1), timestamp: new Date('2024-02-03T10:50:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 14, text: 'Ty tiež, cauko', ...getUserDetails(2), timestamp: new Date('2024-02-03T11:40:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 15, text: 'Maj sa!', ...getUserDetails(1), timestamp: new Date('2024-02-03T12:00:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 16, text: 'Zatial', ...getUserDetails(2), timestamp: new Date('2024-02-03T12:30:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 17, text: 'Cauko', ...getUserDetails(1), timestamp: new Date('2024-02-03T12:31:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 18, text: 'Caaau, tak čo? Kedy ideme lietať? :D', ...getUserDetails(1), timestamp: new Date('2024-03-01T09:00:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 19, text: 'Zase začínaš... :D', ...getUserDetails(2), timestamp: new Date('2024-03-01T09:05:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 20, text: 'No čo, už by to chcelo.', ...getUserDetails(1), timestamp: new Date('2024-03-01T09:10:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 21, text: 'Musím dokončiť projekt, mám deadline do piatku :(', ...getUserDetails(2), timestamp: new Date('2024-03-01T09:12:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 22, text: 'Okeeej, tak si tryhardík aj naďalej 😆', ...getUserDetails(1), timestamp: new Date('2024-03-01T09:15:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 23, text: 'Po piatku si nájdeme čas, sľubujem', ...getUserDetails(2), timestamp: new Date('2024-03-01T09:18:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 24, text: 'Dobre, držím ťa za slovo.', ...getUserDetails(1), timestamp: new Date('2024-03-01T09:20:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 25, text: 'A čo ty? Čo máš nové?', ...getUserDetails(2), timestamp: new Date('2024-03-01T09:22:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 26, text: 'Nič extra, klasika robota, tréning... a čakám na to lietanie!', ...getUserDetails(1), timestamp: new Date('2024-03-01T09:25:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 27, text: 'Haha, dobre teda, dohodneme sa po piatku.', ...getUserDetails(2), timestamp: new Date('2024-03-01T09:30:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 28, text: 'Platí! Maj sa zatiaľ!', ...getUserDetails(1), timestamp: new Date('2024-03-01T09:32:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 29, text: 'Čaukooo', ...getUserDetails(2), timestamp: new Date('2024-03-01T09:35:00'), type: MessageType.user, channelUuid: '62e0d22a' },
  { id: 30, text: 'Heeej kluci!!!', ...getUserDetails(3), timestamp: new Date('2024-03-01T09:36:00'), type: MessageType.user, channelUuid: '62e0d22a' },

  { id: 31, text: 'Caukoo', ...getUserDetails(1), timestamp: new Date('2024-02-01T10:00:00'), type: MessageType.user, channelUuid: '4a618c6b' },
  { id: 32, text: 'Serusky', ...getUserDetails(2), timestamp: new Date('2024-02-01T10:02:00'), type: MessageType.user, channelUuid: '4a618c6b' },
  { id: 33, text: '@Tomáš Drga Kedy ideme lietat', ...getUserDetails(1), timestamp: new Date('2024-02-01T10:04:00'), type: MessageType.user, channelUuid: '4a618c6b' },
  { id: 34, text: '@Matej Drienovský Neviem musim robit wtech', ...getUserDetails(2), timestamp: new Date('2024-02-01T10:08:00'), type: MessageType.user, channelUuid: '4a618c6b' },
  { id: 35, text: 'Tryhardiiiiik', ...getUserDetails(1), timestamp: new Date('2024-02-03T10:10:00'), type: MessageType.user, channelUuid: '4a618c6b' },
  { id: 36, text: 'No čo, už by to chcelo.', ...getUserDetails(1), timestamp: new Date('2024-03-01T09:10:00'), type: MessageType.user, channelUuid: '4a618c6b' },
  { id: 37, text: 'Musím dokončiť projekt, mám deadline do piatku :(', ...getUserDetails(2), timestamp: new Date('2024-03-01T09:12:00'), type: MessageType.user, channelUuid: '4a618c6b' },
  { id: 38, text: 'Okeeej, tak si tryhardík aj naďalej 😆', ...getUserDetails(1), timestamp: new Date('2024-03-01T09:15:00'), type: MessageType.user, channelUuid: '4a618c6b' },
  { id: 39, text: 'Po piatku si nájdeme čas, sľubujem', ...getUserDetails(2), timestamp: new Date('2024-03-01T09:18:00'), type: MessageType.user, channelUuid: '4a618c6b' },
  { id: 40, text: 'Dobre, držím ťa za slovo.', ...getUserDetails(1), timestamp: new Date('2024-03-01T09:20:00'), type: MessageType.user, channelUuid: '4a618c6b' },

]);
