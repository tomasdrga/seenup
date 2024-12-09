<template>
  <div v-if="channelsStore.active">
      <q-infinite-scroll ref="infiniteScroll" @load="onLoad" reverse>
       <!--  <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner color="deep-purple-4" name="dots" size="40px" />
          </div>
        </template> -->

        <!--  Generate the chat messages -->

        <template v-for="(message, index) in messages" :key="index">
          <q-chat-message v-if="index === 0 || getDayStringSafe(message.created_at) !== getDayStringSafe(messages[index-1].created_at)"
                          :label="getDayStringSafe(message.created_at)"
                          style="height: 1rem; padding-top: 0;"
                          class="text-deep-purple-4"/>
          <span v-if="message.author">
          <Message-component
            :time="formatTime(new Date(message.created_at))"
            :photo="message.author.profile_picture"
            :message="message.content"
            :user-name="message.author.nickname"
            :user-status="getUserStatus(message.author.id)"
            :profile-pic="message?.messageType === MessageType.user ? '/avatars/matko.jpg' : 'nowty_face.png'"
            :type="message?.messageType"
          />
        </span>
        </template>
      </q-infinite-scroll>
  </div>
  <div v-else>
    <div class="row justify-center items-center q-ma-md">
      <div class="text-center">
        <h2 class="text-weight-bold text-primary">Welcome to our Server!</h2>
        <p class="text-h6 q-mt-sm text-primary">Here are some commands to get you started:</p>
        <div class="q-mt-lg bg-grey rounded-borders command-guide">
          <!-- Command Guide -->
          <q-list bordered class="q-my-md rounded-borders ">
            <q-item v-for="(command, index) in commands" :key="index" class="q-py-sm command-item">
              <q-item-section avatar>
                <q-icon :name="command.type === 'private' ? 'lock' : 'tag'" size="xs" class="text-primary" />
              </q-item-section>
              <q-item-section class="q-pr-xl">
                <q-item-label class="text-weight-bold text-primary">{{ command.name }}</q-item-label>
                <q-item-label caption class="text-accent">{{ command.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </div>
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
import {commands} from 'assets/commands';

const authStore = useAuthStore();
let user = computed(() => authStore.user);

const channelsStore = useChannelsStore();

let lastKnownMessages = ref([]);

const getUserStatus = (userId: number) => {
  return channelsStore.getUserStatus(userId);
};

const messages = computed(() => {
  if (!user.value) {
    return [];
  }
  const status = user.value ? getUserStatus(user.value.id) : 'offline';
  if (status === 'offline') {
    console.log('User is offline, retaining last known messages.');
    console.log('user status', status);
    return lastKnownMessages.value; // Return the last known messages
  }

  if (!channelsStore.currentMessages || channelsStore.currentMessages.length === 0) {
    return []; // Return an empty array if there are no current messages
  }

  const updatedMessages = channelsStore.currentMessages.map(message => {
    // Handle /list command
    if (message.content.trim().startsWith('/list')) {
      const contentWithoutCommand = message.content.replace('/list', '').trim(); // Remove /list command
      const formattedContent = `${contentWithoutCommand}`;
      return {
        ...message,
        content: formattedContent,
        messageType: MessageType.system
      };
    }

    return { ...message, messageType: MessageType.user };
  }).filter(message => message !== null);

  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  lastKnownMessages.value = updatedMessages; // Save the updated messages
  return updatedMessages;
});

// Handling the load event in an infinite scroll
// const onLoad = (index: number, done: () => void) => {
//   setTimeout(() => {
//     //ChannelService.loadMessages(channelsStore.active!, '5');
//     console.log('loadujeme')
//     done();
//   }, 10000);
// };


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
  if (user.value) { // Ensure user is defined
    const regex = new RegExp(`@${user.value.nickname}\\b`, 'i');
    return regex.test(message);
  }
  return false;
}
watch(() => channelsStore.notifications, async () => {
  await nextTick();
  if (!permissionGranted.value || $q.appVisible) return;
  console.log('Checking notifications', channelsStore.notifications);
  const status = user.value ? getUserStatus(user.value.id) : 'offline';
  for (const notification of channelsStore.notifications) {
    if (
      notification.content.startsWith('/') ||
      userNotificationSetting.value === 'Off' ||
      status === 'dnd' ||
      status === 'offline'
    ) return;
    const cleanMessage = notification.content.replace(/<[^>]*>/g, '').trim();
    const processedMessage = cleanMessage.length > 25
      ? `${cleanMessage.substring(0, 25)}...`
      : cleanMessage;

    if (userNotificationSetting.value === 'Only mentions') {
      if (checkMention(cleanMessage)) {
        sendNotification(`${notification.author}: ${processedMessage}`);
      }
      continue;
    }
    console.log('sending notification')
    sendNotification(`${notification.author.nickname}: ${notification.content}`);
    channelsStore.CLEAR_NOTIFICATIONS();
  }

}, { deep: true });


watch(()=> channelsStore.currentMessages, async () => {
  await nextTick();
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

</script>

<style scoped>
.message-alert {
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
}
.command-guide {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Soft shadow for depth */
}

.command-item {
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.command-item:last-child {
  border-bottom: none; /* Remove bottom border from the last item */
}

</style>
