<template>
  <!-- User Message -->
  <div v-if="type === MessageType.user && !isUserMentioned" class="row no-wrap q-pl-md q-py-md" id="message">
    <div class="q-pr-md">
      <q-avatar rounded class="q-mt-xs relative-position">
        <img :src="profilePic" alt="Profile Pic" />
        <q-icon :name="userStatus.icon" :color="userStatus.color" class="custom-badge q-pa-none absolute" size="xs"/>
      </q-avatar>
    </div>
    <div>
      <div class="row items-center">
        <span class="q-mr-md text-weight-bold text-body1 text-primary">{{ userName }}</span>
        <div class="text-primary text-deep-purple-4">{{ time }}</div>
      </div>
      <div v-html="processedMessage" class="text-message text-primary"></div>
    </div>
  </div>

  <!-- System Message -->
  <div v-if="type === MessageType.system" class="col bg-deep-purple-1 q-py-sm">
    <div class="row items-center q-pl-md text-deep-purple-4">
      <q-icon name="visibility" />
      <span class="text-caption q-pl-xs">Only visible to you</span>
    </div>
    <div class="row no-wrap q-pl-md" id="message">
      <div class="q-pr-md">
        <q-avatar rounded class="">
          <img :src="profilePic" alt="Profile Pic" />
        </q-avatar>
      </div>
      <div>
        <div class="row items-center">
          <span class="q-mr-md text-weight-bold text-body1 text-primary">{{ userName }}</span>
          <div class="text-caption text-deep-purple-4">{{ time }}</div>
        </div>
        <div v-html="processedMessage" class="text-message text-primary"></div>
      </div>
    </div>
  </div>

  <div v-if="isUserMentioned" class="row no-wrap q-pl-md q-py-md bg-deep-purple-1" id="message">
    <div class="q-pr-md">
      <q-avatar rounded class="q-mt-xs relative-position">
        <img :src="profilePic" alt="Profile Pic" />
        <q-icon :name="userStatus.icon" :color="userStatus.color" class="custom-badge q-pa-none absolute" size="xs"/>
      </q-avatar>
    </div>
    <div>
      <div class="row items-center">
        <span class="q-mr-md text-weight-bold text-body1 text-primary">{{ userName }}</span>
        <div class="text-primary text-deep-purple-4">{{ time }}</div>
      </div>
      <div v-html="processedMessage" class="text-message text-primary"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, PropType, ref} from 'vue';

  import { MessageType, User } from 'components/models';
  import { useAuthStore } from 'stores/module-auth';
  import { useChannelsStore } from 'src/stores/module-channels/useChannelsStore';
  import {api} from 'boot/axios';

  const channelsStore = useChannelsStore();
  const activeChannel = computed(() => channelsStore.active);

  const nicknames = ref<string[]>([]);
  const usersNew = async () => {
    try {
      const response = await api.get('/auth/users', { params: { channel: activeChannel.value } });
      for (let i = 0; i < response.data.length; i++) {
        nicknames.value.push(response.data[i].nickname);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  onMounted(() => {
    usersNew();
  });

  const authStore = useAuthStore();
  const user = computed(() => authStore.user);

  const props = defineProps({
      userName: {
        type: String,
        required: true
      },
      profilePic: {
        type: String,
        required: true
      },
      message: {
        type: String,
        required: true
      },
      time: {
        type: String,
        required: true
      },
      userStatus:{
        type: String,
        required: true
      },
      type: {
        type: String as PropType<MessageType>,
        required: true
      },
      users: {
        type: Array as PropType<User[]>,
        required: true
      }
  });

  const processedMessage = computed(() => {
    return props.message.replace(/@(\S+)(?=\s|$)/g, function(_: string, matchedUsername: string) {
      const username = matchedUsername.trim();

      const userExists = nicknames.value.some((nickname: string) => nickname.localeCompare(username, undefined, { sensitivity: 'base' }) === 0);
      return userExists ? `<mark>@${username}</mark>` : `@${username}`;
    });
  });

  const isUserMentioned = computed(() => {
    if(user.value) {
      const regex = new RegExp(`@${user.value?.nickname}\\b`, 'i');
      return regex.test(props.message);
    }
    return false;
  });

  const userStatus = computed(() => {
    switch (props.userStatus) {
      case 'active':
        return {icon: 'radio_button_checked', color: 'green'};
      case 'offline':
        return {icon: 'radio_button_checked', color: 'grey-6'};
      case 'dnd':
        return {icon: 'nightlight', color: 'primary'};
      default:
        return {icon: 'warning', color: 'red'};
    }
  });

</script>

<style>
  mark {
    background-color: rgba(38, 0, 101, 0.15);
    color: #260065;
    margin-right: 2px;
  }

  .custom-badge {
    width: 12px;
    height: 10px;
    border-radius: 50%;
    bottom: -3px;
    right: -4px;
  }

  .text-message {
    font-size: small;
  }
</style>
