import { ref } from 'vue';
import { User } from 'components/models';

export const system :User= { id: 690420, nickname: 'SeenUpBot', profilePic: '/nowty_face.png', status: 'Active' };

export const users = ref([
  { id: 1, nickname: 'matino', profilePic: '/avatars/matko.jpg', status: 'Active' },
  { id: 2, nickname: 'Tomáš Drga', profilePic: '/avatars/tomko.jpg', status: 'Offline' },
  { id: 3, nickname: 'Spicy Pája', profilePic: '/avatars/pajko.jpg', status: 'Do not disturb' },
]);
