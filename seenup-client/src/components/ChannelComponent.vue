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
import {computed, nextTick, ref, watch} from 'vue';

  import {QInfiniteScroll } from 'quasar';

  import MessageComponent from './MessageComponent.vue';
  import { allMessages } from 'assets/messages';
  import {  Message, MessageType, Channel, Server } from 'components/models';
  import { formatTime ,getDayStringSafe, scrollToBottom } from './channel-helpers';

  import { useChannelsStore } from 'src/stores/module-channels/useChannelsStore';
  import {api} from 'boot/axios';
  import {useAuthStore} from 'stores/module-auth';
  const authStore = useAuthStore();
  const user = computed(() => authStore.user);
  const channelsStore = useChannelsStore();

  const formatListMessage = (messageContent: string, usersList: string[], currentUserNickname: string) => {
    const otherUsers = usersList.filter(username => username !== currentUserNickname);

    const formattedUsers = otherUsers.map(username => `@${username}`);

    formattedUsers.push('You');

    const finalMessage = formattedUsers.length > 1
      ? formattedUsers.slice(0, -1).join(', ') + ' and ' + formattedUsers[formattedUsers.length - 1]
      : formattedUsers[0];

    return `Users here: ${finalMessage}`;
  };


  const messages = computed(() => {
    return channelsStore.currentMessages.map(message => {
      if (message.content.trim() === '/list') {
        if (message.author.id === user.value?.id) {
          const formattedMessage = formatListMessage(message.content.trim(), users.value, user.value?.nickname);
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
  //
  // const $q = useQuasar();
  const infiniteScroll = ref<QInfiniteScroll | null>(null);
  const showInfiniteScroll = ref(false);
  const items = ref<Message[]>([]);


  const users = ref<string[]>([]);

  // Fetch users from the database
  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users', { params: { channel: activeChannel.value } });
      for (let i = 0; i < response.data.length; i++) {
        users.value.push(response.data[i].nickname);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };
  const activeChannel = computed(() => channelsStore.active);
  watch(
    activeChannel,
    async (newChannel, oldChannel) => {
      if (newChannel !== oldChannel) {
        await fetchUsers();
      }
    },
    { immediate: true }
  );


  watch(() => channelsStore.currentMessages, async () => {
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

    // Watch for channel
  watch(() => props.channel, () => {
    resetMessages();
  }, { immediate: true });


  // // Handling the load event in an infinite scroll
  // const onLoad = (index: number, done: () => void) => {
  //   setTimeout(() => {
  //     const currentMessageCount = items.value.length;
  //     const allMessagesInChannel = allMessages.value.filter(message => message.channelUuid === props.channel.uuid);
  //
  //     const newMessages = allMessagesInChannel.slice(Math.max(allMessagesInChannel.length - currentMessageCount - 10, 0), allMessagesInChannel.length - currentMessageCount);
  //
  //     if (newMessages.length > 0) {
  //       items.value.unshift(...newMessages);
  //     }
  //
  //     if (newMessages.length === 0 && infiniteScroll.value) {
  //       infiniteScroll.value.stop();
  //     }
  //
  //     done();
  //   }, 1000);
  // };


  // Fetch older messages for infinite scroll
  const onLoad = async (index: number, done: () => void) => {
    try {
      const currentMessageCount = items.value.length;

      // Fetch older messages based on the current count
      const response = await api.get('/messages', {
        params: {
          channel: activeChannel.value,
          offset: currentMessageCount,
          limit: 10, // Load 10 messages per batch
        },
      });

      if (response.data.length) {
        // Prepend older messages
        items.value.unshift(...response.data);
      } else {
        // Stop infinite scroll if no more messages
        infiniteScroll.value?.stop();
      }

      done();
    } catch (error) {
      console.error('Failed to load messages:', error);
      done();
    }
  };

  // Sync new messages into the list
  watch(() => channelsStore.currentMessages, (newMessages) => {
    // Append new messages at the bottom
    items.value = [...items.value, ...newMessages];
    nextTick(() => {
      scrollToBottom(); // Ensure the view scrolls to the latest message
    });
  }, { deep: true });

  // Reset messages when switching channels
  watch(activeChannel, async (newChannel, oldChannel) => {
    if (newChannel !== oldChannel) {
      // Reset messages for the new channel
      items.value = [];
      showInfiniteScroll.value = true;
      await onLoad(0, () => {});
    }
  }, { immediate: true });


  // Checking the message for commands
  // async function commandsCheck(message: string) {
  //   const messageClean = message.replace(/<[^>]*>/g, '').trim();
  //   console.log('Message:', messageClean);
  //   if (messageClean.startsWith('/leave')) {
  //     console.log('Leave command');
  //     const isAdmin = await api.get(`/channels/${activeChannel.value}/is-admin`);
  //     if (isAdmin.data) {
  //       // Admin leaves and deletes the channel
  //       await api.delete(`/channels/${activeChannel.value}`);
  //       $q.notify({
  //         color: 'grey',
  //         textColor: 'primary',
  //         icon: 'done',
  //         message: 'Channel deleted successfully',
  //         position: 'top',
  //       });
  //     } else {
  //       // User leaves the channel
  //       await api.post(`/channels/${activeChannel.value}/leave`);
  //       $q.notify({
  //         color: 'grey',
  //         textColor: 'primary',
  //         icon: 'done',
  //         message: 'Left the channel successfully',
  //         position: 'top',
  //       });
  //     }
  //     channelsStore.leave(activeChannel.value);
  //     console.log('Channel left');
  //   }
  //   return message
  // };


  // function showNotification(message: string, user: User) {
  //   const cleanMessage = message.replace(/<[^>]*>/g, '').trim();
  //   const processedMessage = cleanMessage.length > 20 ? cleanMessage.substring(0, 25) + '...' : cleanMessage;
  //
  //   // Process the message to highlight the users
  //   const messageToShow = computed(() => {
  //     return processedMessage.replace(/@(\S+\s?\S*)(?=\s|$)/g, function(_: string, matchedUsername: string) {
  //       const username = matchedUsername.trim();
  //
  //       const userExists = users.value.some((user: User) => (user.nickname === username) || username.startsWith(user.nickname + ' '));
  //
  //       return userExists ? `<mark>@${username}</mark>` : `@${username}`;
  //     });
  //   });

  //   // Custom notification
  //   $q.notify({
  //     color: 'white',
  //     textColor: 'primary',
  //     avatar: user.profilePic,
  //     message: `
  //       <div class="col message-alert" style="width: 300px;" role="alert">
  //         <div class="text-bold">${user.nickname}</div>
  //         <div>${messageToShow.value}</div>
  //       </div>
  //     `,
  //     position: 'top-right',
  //     timeout: 1000,
  //     html: true
  //   });
  // };

  // function addMessage(newMessage: string) {
  //   if (commandsCheck(newMessage)) {
  //     nextTick(() => {
  //       scrollToBottom();
  //     });
  //     return;
  //   }
  //
  //   const user = users.value[0];
  //   const message = {
  //     id: allMessages.value.length + 1,
  //     text: newMessage,
  //     userName: user.nickname,
  //     profilePic: user.profilePic,
  //     timestamp: new Date(),
  //     type: MessageType.user,
  //     channelUuid: props.channel.uuid
  //   };
  //
  //   // Add the message to the list
  //   allMessages.value.push(message);
  //   items.value.push(message);
  //   showNotification(newMessage, users.value[0]);
  //
  //   // Scroll to the bottom of the chat
  //   nextTick(() => {
  //     scrollToBottom();
  //   });
  // };

  // Expose the function to the parent component
  // const onMessageSent = (msg: string) => {
  //   addMessage(msg);
  // };
  // defineExpose({
  //   onMessageSent
  // });

</script>

<style scoped>
  .message-alert {
    background-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
  }
</style>
