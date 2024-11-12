<template>
  <div v-if="showInfiniteScroll">
    <q-infinite-scroll ref="infiniteScroll" @load="onLoad" reverse>
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner color="deep-purple-4" name="dots" size="40px" />
        </div>
      </template>

      <!--  Generate the chat messages -->
      <template v-for="(message, index) in messages" :key="index">
        <q-chat-message v-if="index === 0 || getDayStringSafe(message.createdAt) !== getDayStringSafe(messages[index-1].createdAt)"
                        :label="getDayStringSafe(message.createdAt)"
                        style="height: 1rem; padding-top: 0;"
                        class="text-deep-purple-4"/>
        <message-component
          :time="formatTime(new Date(message.createdAt))"
          :message="message.content"
          :user-name="message.author.nickname"
          :user-status="message.author.status"
          :profile-pic="'/avatars/matko.jpg'"
          :type="MessageType.user"
          :users="users"
        />
      </template>
    </q-infinite-scroll>
    </div>
</template>

<script setup lang="ts">
import {computed, nextTick, ref, watch} from 'vue';

  import { useQuasar, QInfiniteScroll } from 'quasar';



  import MessageComponent from 'components/MessageComponent.vue';
  import { allMessages } from 'assets/messages';
  import { users, system } from 'assets/users';
  import {  Message, MessageType, User, Channel, Server } from 'components/models';
  import { formatTime ,getDayStringSafe, scrollToBottom } from './channel-helpers';

  import { useChannelsStore } from 'src/stores/module-channels/useChannelsStore';

  const channelsStore = useChannelsStore();
  const messages = computed(() => channelsStore.currentMessages);

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

  const $q = useQuasar();
  const infiniteScroll = ref<QInfiniteScroll | null>(null);
  const showInfiniteScroll = ref(false);
  const items = ref<Message[]>([]);
  const userLoggedIn = 'Matej';

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

    // Watch for channel
  watch(() => props.channel, () => {
    resetMessages();
  }, { immediate: true });




  // Handling the load event in an infinite scroll
  const onLoad = (index: number, done: () => void) => {
    setTimeout(() => {
      const currentMessageCount = items.value.length;
      const allMessagesInChannel = allMessages.value.filter(message => message.channelUuid === props.channel.uuid);

      const newMessages = allMessagesInChannel.slice(Math.max(allMessagesInChannel.length - currentMessageCount - 10, 0), allMessagesInChannel.length - currentMessageCount);

      if (newMessages.length > 0) {
        items.value.unshift(...newMessages);
      }

      if (newMessages.length === 0 && infiniteScroll.value) {
        infiniteScroll.value.stop();
      }

      done();
    }, 1000);
  };

  // Checking the message for commands
  function commandsCheck(message: string) {
    const messageClean = message.replace(/<[^>]*>/g, '').trim();
    if (messageClean === '/list') {
      const otherUsers = users.value.filter(user => user.userName !== userLoggedIn).map(user => '@' + user.userName).join(' , ');
      const listMessage = `Users here: ${otherUsers} ... and you!`;
      // Create a system message with the list of users
      const systemMessage = {
        id: allMessages.value.length + 1,
        text: listMessage,
        userName: system.userName,
        profilePic: system.profilePic,
        timestamp: new Date(),
        type: MessageType.system,
        channelUuid: props.channel.uuid
      };

      allMessages.value.push(systemMessage);
      items.value.push(systemMessage);
      showSystemNotification('New message from SeenUpBot');
      return true
    } else if (messageClean.startsWith('/join')) {
      //const messageParts = messageClean.split(' ');
      // Create a new channel
      // rCurrentServer.channels.push({
      //   id: rCurrentServer.channels.length + 1,
      //   uuid: uuidv4(),
      //   name: messageParts[1],
      //   type: ChannelType.public,
      //   users: [users.value[0]],
      //   messages: allMessages.value,
      // });
      showSystemNotification('New channel created');
      return true
    }
    return false
  };

  function showSystemNotification(message: string) {
    $q.notify({
      color: 'primary',
      textColor: 'deep-purple-1',
      avatar: '/nowty_face.png',
      message: message,
      position: 'top-right',
      timeout: 1000
    });
  };

  function showNotification(message: string, user: User) {
    const cleanMessage = message.replace(/<[^>]*>/g, '').trim();
    const processedMessage = cleanMessage.length > 20 ? cleanMessage.substring(0, 25) + '...' : cleanMessage;

    // Process the message to highlight the users
    const messageToShow = computed(() => {
      return processedMessage.replace(/@(\S+\s?\S*)(?=\s|$)/g, function(_: string, matchedUsername: string) {
        const username = matchedUsername.trim();

        const userExists = users.value.some((user: User) => (user.userName === username) || username.startsWith(user.userName + ' '));

        return userExists ? `<mark>@${username}</mark>` : `@${username}`;
      });
    });

    // Custom notification
    $q.notify({
      color: 'white',
      textColor: 'primary',
      avatar: user.profilePic,
      message: `
        <div class="col message-alert" style="width: 300px;" role="alert">
          <div class="text-bold">${user.userName}</div>
          <div>${messageToShow.value}</div>
        </div>
      `,
      position: 'top-right',
      timeout: 1000,
      html: true
    });
  };

  function addMessage(newMessage: string) {
    if (commandsCheck(newMessage)) {
      nextTick(() => {
        scrollToBottom();
      });
      return;
    }

    const user = users.value[0];
    const message = {
      id: allMessages.value.length + 1,
      text: newMessage,
      userName: user.userName,
      profilePic: user.profilePic,
      timestamp: new Date(),
      type: MessageType.user,
      channelUuid: props.channel.uuid
    };

    // Add the message to the list
    allMessages.value.push(message);
    items.value.push(message);
    showNotification(newMessage, users.value[0]);

    // Scroll to the bottom of the chat
    nextTick(() => {
      scrollToBottom();
    });
  };

  // Expose the function to the parent component
  const onMessageSent = (msg: string) => {
    addMessage(msg);
  };
  defineExpose({
    onMessageSent
  });
</script>

<style scoped>
  .message-alert {
    background-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
  }
</style>
