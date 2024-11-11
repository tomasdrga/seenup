<template>
  <q-scroll-area ref="area" style="width: 100%; height: calc(100vh - 150px)">
    <div style="width: 100%; max-width: 400px; margin: 0 auto;">
      <q-chat-message
        v-for="message in messages"
        :key="message.id"
        :name="message.author.email"
        :text="[message.content]"
        :stamp="message.createdAt"
        :sent="isMine(message)"
      />
    </div>
  </q-scroll-area>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch, computed, nextTick, onMounted } from 'vue';
import { QScrollArea } from 'quasar';
import { SerializedMessage } from 'src/contracts';
import { useAuthStore } from 'src/stores/module-auth';

export default defineComponent({
  name: 'ChannelMessagesComponent',
  components: {
    QScrollArea,
  },
  props: {
    messages: {
      type: Array as PropType<SerializedMessage[]>,
      default: () => [],
    },
  },
  setup(props) {
    const area = ref<QScrollArea | null>(null);
    const authStore = useAuthStore();

    const currentUserId = computed(() => authStore.user?.id);

    const scrollMessages = () => {
      if (area.value) {
        area.value.setScrollPercentage('vertical', 1.1);
      }
    };

    const isMine = (message: SerializedMessage): boolean => {
      return message.author.id === currentUserId.value;
    };

    watch(
      () => props.messages,
      () => {
        nextTick(() => {
          scrollMessages();
        });
      },
      { deep: true }
    );

    onMounted(() => {
      scrollMessages();
    });

    return {
      area,
      isMine,
    };
  },
});
</script>
