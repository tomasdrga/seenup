<template>
  <div v-if="showUsers && props.users" class="user-suggestions absolute bg-white rounded-border text-primary hide-scrollbar q-ml-sm"
       style="width: 250px; max-height: 10rem; overflow: auto; max-width: 300px; bottom: 95px; left: -1rem">
    <q-list dense class="q-py-sm">
      <q-item v-for="(user, index) in props.users" :key="user.userName" clickable v-ripple @click="selectUser(user.userName)"
              :class="index === props.users.length - 1 ? '' : 'user-item'">
        <div class="content-center">
          <q-avatar size="sm" rounded color="purple" text-color="white">
            <img :src="user.profilePic" alt="Avatar"/>
          </q-avatar>
        </div>
        <q-item-section class="q-ml-sm">{{ user.userName }}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
  import { User } from 'components/models';

  const props = defineProps({
    showUsers: {
      type: Boolean,
      required: true,
    },
    users: {
      type: Array as () => User[],
      required: false,
      default: () => [],
    },
  });

  const emit = defineEmits(['user-selected']);
  const selectUser = (userName: string) => {
    emit('user-selected', userName);
  };
</script>

<style scoped>
  .user-item {
    border-bottom: 1px solid #00000015;
  }
  .user-suggestions {
    z-index: 1;
    background-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
  }
</style>
