<template>
  <div v-if="showUsers && props.users" class="user-suggestions absolute bg-white rounded-border text-primary hide-scrollbar q-ml-sm"
       style="width: 250px; max-height: 10rem; overflow: auto; max-width: 300px; bottom: 95px; left: -1rem">
    <q-list dense class="q-py-sm">
      <q-item v-for="(user, index) in props.users" :key="user.nickname" clickable v-ripple @click="selectUser(user.nickname)"
              :class="index === props.users.length - 1 ? '' : 'user-item'">
        <div class="content-center">

        </div>
        <q-item-section class="q-ml-sm">{{ user.nickname }}</q-item-section>
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
  const selectUser = (nickname: string) => {
    emit('user-selected', nickname);
  };
</script>

<style scoped>

  .user-suggestions {
    z-index: 1;
    background-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
  }
</style>
