<template>
  <!-- User Message -->
  <div v-if="type === MessageType.user" class="row no-wrap q-pl-md q-py-md" id="message">
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
</template>

<script setup lang="ts">
  import { computed, PropType } from 'vue';

  import { MessageType, User } from 'components/models';

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
    return props.message.replace(/@(\S+\s?\S*)(?=\s|$)/g, function(_: string, matchedUsername: string) {
      const username = matchedUsername.trim(); // Remove trailing and leading whitespaces

      const userExists = props.users.some((user: User) => user.userName.localeCompare(username, undefined, {sensitivity: 'base'}) === 0);
      return userExists ? `<mark>@${username}</mark>` : `@${username}`;
    });
  });

  const userStatus = computed(() => {
    const user = props.users.find((user: User) => user.userName === props.userName);
    if (!user) return {icon: 'warning', color: 'red'};

    switch (user.status) {
      case 'Active':
        return {icon: 'radio_button_checked', color: 'green'};
      case 'Offline':
        return {icon: 'radio_button_checked', color: 'grey-6'};
      case 'Do not disturb':
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
