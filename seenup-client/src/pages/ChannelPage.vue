<template>
  <q-page class="row items-center justify-evenly">
    <channel-messages-component :messages="messages" />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import ChannelMessagesComponent from 'src/components/ChannelMessageComponent.vue';
import { useChannelsStore } from 'src/stores/module-channels/useChannelsStore';

export default defineComponent({
  name: 'ChannelPage',
  components: { ChannelMessagesComponent },
  setup() {
    const channelsStore = useChannelsStore();

    const messages = computed(() => channelsStore.currentMessages);

    return {
      messages,
    };
  },
});
</script>
