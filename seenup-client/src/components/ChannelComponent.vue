<template>
  <div v-if="showInfiniteScroll">
    <q-infinite-scroll ref="infiniteScroll" reverse>
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner color="deep-purple-4" name="dots" size="40px" />
        </div>
      </template>

      <!--  Generate the chat messages -->
      <template v-for="(message, index) in messages" :key="index">
        <q-chat-message v-if="index === 0 || getDayStringSafe(message.created_at) !== getDayStringSafe(messages[index-1].created_at)"
                        :label="getDayStringSafe(message.created_at)"
                        style="height: 1rem; padding-top: 0;"
                        class="text-deep-purple-4"/>
        <span v-if="message.author">
          <Message-component
            :time="formatTime(new Date(message.created_at))"
            :message="message.content"
            :user-name="message.author.nickname"
            :user-status="message.author.status"
            :profile-pic="message?.messageType === MessageType.user ? '/avatars/matko.jpg' : 'nowty_face.png'"
            :type="message?.messageType"
          />
        </span>
      </template>
    </q-infinite-scroll>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, ref, watch} from 'vue';

import {QInfiniteScroll, useQuasar} from 'quasar';

import MessageComponent from './MessageComponent.vue';
import { allMessages } from 'assets/messages';
import {  Message, MessageType, Channel, Server } from 'components/models';
import { formatTime ,getDayStringSafe, scrollToBottom } from './channel-helpers';

import { useChannelsStore } from 'src/stores/module-channels/useChannelsStore';
import {useAuthStore} from 'stores/module-auth';
import { userNotificationSetting } from './SettingsDialog.vue';

const authStore = useAuthStore();
let user = computed(() => authStore.user);

const channelsStore = useChannelsStore();


const messages = computed(() => {
  if (!channelsStore.currentMessages || channelsStore.currentMessages.length === 0) {
    return []; // Return an empty array or handle it as needed
  }
  return channelsStore.currentMessages.map(message => {
    if (message.content.trim().startsWith('/list')) {
      if (message.author.id === user.value?.id) {
        const formattedMessage = message.content.replace('/list', '').trim();
        return { ...message, content: formattedMessage, messageType: MessageType.system};
      }
      return null;
    }
    return {...message, messageType: MessageType.user};
  }).filter(message => message !== null);
});

const props = defineProps({
  currentServer: {
    type: Object as () => Server,
    required: true
  },
  channel: {
    type: Object as () => Channel,
    required: true
  }
});

const infiniteScroll = ref<QInfiniteScroll | null>(null);
const showInfiniteScroll = ref(false);
const items = ref<Message[]>([]);


// Fetch users from the database
// const fetchUsers = async () => {
//   try {
//     const response = await api.get('/auth/users', { params: { channel: activeChannel.value } });
//     for (let i = 0; i < response.data.length; i++) {
//       users.value.push(response.data[i].nickname);
//     }
//   } catch (error) {
//
//     console.error('Failed to load users:', error);
//   }
// };
// const activeChannel = computed(() => channelsStore.active);
// watch(
//   activeChannel,
//   async (newChannel, oldChannel) => {
//     if (newChannel !== oldChannel) {
//       await fetchUsers();
//     }
//   },
//   { immediate: true }
// );

const requestNotificationPermission = async () => {
  console.log('requesting notification')
  try {
    console.log('requesting notification')
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

const $q = useQuasar();

const sendNotification = (message: string) => {
  if (Notification.permission === 'granted' && !$q.appVisible) {
    const notification = new Notification('New message', {
      body: message,
      icon: require('../../public/nowty_face.png')
    });

    notification.onclick = () => {
      window.focus();
    };
  }
};
let permissionGranted = ref(false);
const startNotificationInterval = async () => {
   permissionGranted.value = await requestNotificationPermission();
};

// Initialize notifications when component mounts
onMounted(() => {
  startNotificationInterval();
});

onMounted(async () => {
  try {
    await requestNotificationPermission();
  } catch (error) {
    throw new Error('Error initializing channels');
  }
})

function checkMention (message: string) {
  console.log('checking mention');
  console.log('user', user.value);
  if (user.value) { // Ensure user is defined
    const regex = new RegExp(`@${user.value.nickname}\\b`, 'i');
    console.log(regex.test(message));
    return regex.test(message);
  }
  return false;
}

watch(() => channelsStore.currentMessages, async () => {
  await nextTick();
  if (permissionGranted.value && !$q.appVisible) {
    const latestMessage = channelsStore.currentMessages[channelsStore.currentMessages.length - 1];
    const sender = latestMessage.author.nickname;
    if (latestMessage.content.startsWith('/')
      || !latestMessage
      || userNotificationSetting.value === 'Off'
      || user.value?.status === 'dnd'
      || user.value?.status === 'offline'
    ) return;
    const cleanMessage = latestMessage.content.replace(/<[^>]*>/g, '').trim();
    const processedMessage = cleanMessage.length > 25
      ? cleanMessage.substring(0, 25) + '...'
      : cleanMessage;
    if (userNotificationSetting.value ==='Only mentions') {
      if (checkMention(latestMessage.content)) {
        sendNotification(`${sender}: ${processedMessage}`);
      }
      return;
    }
    sendNotification(`${sender}: ${processedMessage}`);
  }
  scrollToBottom();
}, { deep: true });

// Reset messages, used when switching between channels multiple times
const resetMessages = () => {
  items.value = allMessages.value
    .filter(message => message.channelUuid === props.channel.uuid)
    .slice(-10);

  showInfiniteScroll.value = false;

  nextTick(() => {
    showInfiniteScroll.value = true;
    if (infiniteScroll.value) {
      infiniteScroll.value.reset();
    }
  });
};

// Watch for channel
watch(() => props.channel, () => {
  resetMessages();
}, { immediate: true });

// // Reset messages when switching channels
// watch(activeChannel, async (newChannel, oldChannel) => {
//   if (newChannel !== oldChannel) {
//     // Reset messages for the new channel
//     items.value = [];
//     showInfiniteScroll.value = true;
//     //await onLoad(0, () => {});
//   }
// }, { immediate: true });

</script>

<style scoped>
.message-alert {
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
}
</style>
