<template>
  <div class="relative-position">

    <!--  Suggestions Boxes -->
    <CommandSuggestionsBox :show-commands="showCommands" :commands="commands" @command-selected="selectCommand" />
    <UserSuggestionsBox :show-users="showUsers" :users="users" @user-selected="selectUser" />

    <!-- Command Line -->
    <div class="command-line rounded-border bg-white text-primary q-pt-sm">
      <div>
        <q-editor
          v-if="!isSmallScreen"
          v-model="editor"
          ref="editorElement"
          min-height="1rem"
          max-height="5rem"
          flat
          @keydown.enter.prevent="send"
          overflow-hidden
          placeholder="Message #social"
          toolbar-bg="grey"
          :toolbar="showToolbar ? [
          ['bold', 'italic', 'strike'],
          ['link'],
          ['unordered', 'ordered'],
          ['quote'],
        ] : []"
        />
        <input
          v-else
          v-model="inputValue"
          ref="editorElement"
          placeholder="MESSAGE #SOCIAL"
          class="full-width input-field text-primary"
        />
      </div>

      <div class="q-pa-none row justify-between" style="height: 100%;">
        <div>
          <q-btn v-if="!isSmallScreen" round dense flat icon="add" size="sm" class="q-ma-xs"/>
          <q-btn v-if="!isSmallScreen" @click="toggleToolbar" round dense flat icon="text_fields" size="sm" class="q-ma-xs"/>
          <q-btn v-if="!isSmallScreen" round dense flat icon="mood" size="sm" class="q-ma-xs"/>
          <q-btn v-if="!isSmallScreen" @click="toggleUser" round dense flat icon="alternate_email" size="sm" class="q-ma-xs"/>
        </div>
        <q-btn @click="send" round dense flat icon="send" size="sm" class="q-ma-xs"/>
      </div>
    </div>

    <!-- Typing Notification -->
    <div class="q-pl-xs">
      <div v-for="([key, value], index) in Object.entries(typingStatus)" :key="index" @click="showTyping">
        <span class="typing-text text-deep-purple-4" v-if="value">
          <strong>{{ key }}</strong> is typing...
        </span>
      </div>
    </div>



    <!-- Draft Messages Dialog -->
    <q-dialog v-model="isDialogVisible" position="bottom" class="text-primary">
      <q-card>
        <div v-for="(draft, user) in draftMessages" :key="user">
          {{  typingStatus.user }}
          <q-card-section>
            <div class="text-h6"><strong>{{ user }}</strong> is typing a message...</div>
          </q-card-section>

          <q-card-section>
              {{ draft }}
          </q-card-section>
        </div>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
  import {computed, ref, watch, nextTick} from 'vue';

  import { useQuasar } from 'quasar';
  import { watchEffect } from 'vue';

  import { commands as allCommands } from 'assets/commands';
  import {Channel} from 'components/models';
  import CommandSuggestionsBox from 'components/CommandSuggestionBox.vue';
  import UserSuggestionsBox from 'components/UserSuggestionBox.vue';
  import ChannelService from 'src/services/ChannelService';

  import { useChannelsStore } from 'src/stores/module-channels/useChannelsStore';

  const props = defineProps({
    currentChannel: {
      type: Object as ()=> Channel,
      required: true
    }
  });

  const $q = useQuasar();

  const editorElement = ref(null);
  const editor = ref('');
  const showToolbar = ref(true);
  const showCommands = ref(false);
  const showUsers = ref(false);

  const loading = ref(false);
  const channelsStore = useChannelsStore();

  const activeChannel = computed(() => channelsStore.active);

  const users = computed(() => {
    const channel = channelsStore.channels.find(channel => channel.name === activeChannel.value);
    return channel && channel.users ? channel.users.map(user => ({ nickname: typeof user === 'string' ? user : user || 'Unknown' })) : [];
  });


  const isDialogVisible = ref(false);

  const showTyping = () => {
    isDialogVisible.value = true;
  };

  // Methods
 const send = async () => {
  const messageContent = editor.value.trim();

  if (!messageContent) {
    return;
  }
  
  editor.value = ''; // Clear the editor before executing the command or message
  loading.value = true;
  if (!activeChannel.value) {
    if (messageContent.startsWith('/')) {
      // Handle command
      const [command, name, flag] = messageContent.replace(/<br>/g, '').replace(/\r?\n|\r/g, '').trim().split(' ');
      try {
        await channelsStore.executeGeneralCommand(command, name, flag);
        loading.value = false;
      } catch (error) {
        console.error('Error executing command:', error);
      }
    } else {
      // Handle regular message
      console.log('No active channel. You can only send commands');
      return;
    }
  }

  if (activeChannel.value) {
    if (messageContent.startsWith('/')) {
      // Handle command
      const [command, name, flag] = messageContent.replace(/<br>/g, '').replace(/\r?\n|\r/g, '').trim().split(' ');
      try {
        await channelsStore.executeCommand(activeChannel.value, command, name, flag);
        loading.value = false;
      } catch (error) {
        console.error('Error executing command:', error);
      }
    } else {
      // Handle regular message
      try {
        await channelsStore.addMessage(activeChannel.value, messageContent);
        loading.value = false;
      } catch (error) {
        console.error('Error adding message:', error);
      }
    }
  }
};

  const isSmallScreen = computed(() => $q.screen.lt.sm);
  const commands = computed(() => allCommands.filter(cmd => cmd.type === props.currentChannel.type));
  const inputValue = computed({
    get() {
      return editor.value.replace(/<[^>]*>?/gm, '');
    },
    set(value) {
      editor.value = value;
    }
  });

  watch(editor, function(newValue) {
    let cleanedValue = newValue.replace(/<[^>]*>?/gm, '');
    showCommands.value = cleanedValue === '/';
  });

  watch(editor, (newValue: string) => {
    const replacedValue: string = newValue.replace(/<br>/g, ' ').replace(/<\/?div>/g, ' ');
    const cleanValue: string = replacedValue.replace(/<[^>]*>?/gm, '');
    const pattern: RegExp = /(^|\s)@(\s|$)/;
    showUsers.value = pattern.test(cleanValue);
  });

  const selectUser = async (user: string) => {
    const parts = editor.value.split('@');
    const lastPart = parts.pop();
    editor.value = `${parts.join('@')}@${user} ${lastPart}`;
    await nextTick();
    showUsers.value = false;
  };

  const selectCommand = async (command: string) => {
    editor.value = command;
    await nextTick();
    showCommands.value = false;
  };

  const toggleUser = async () => {
    showUsers.value = !showUsers.value;
    editor.value = editor.value + '@';
  };

  const toggleToolbar = () => {
    showToolbar.value = !showToolbar.value;
  };

  const typingStatus = computed<Record<string, boolean>>(() => {
    return activeChannel.value
      ? channelsStore.typingStatus[activeChannel.value] || {}
      : {};
  });

  watchEffect(() => {
    console.log("Typing Status Updated:", typingStatus.value);
  });

  const draftMessages = computed(() => activeChannel.value ? channelsStore.draftMessages[activeChannel.value] || {} : {});
    
  const sendTypingEvent = () => {
    if (activeChannel.value) {
      const channelManager = ChannelService.in(activeChannel.value);
      if (channelManager) {
        channelManager.sendTypingEvent(activeChannel.value);
      }
    }
  };

  const sendDraftUpdateEvent = () => {
    if (activeChannel.value) {
      const channelManager = ChannelService.in(activeChannel.value);
      if (channelManager) {
        channelManager.sendDraftUpdateEvent(activeChannel.value, editor.value);
      }
    }
  };

  watch(editor, () => {
    sendTypingEvent();
    sendDraftUpdateEvent();
  });
</script>

<style scoped>
  .rounded-border {
    border: 1px solid #00000015;
    border-radius: 5px;
  }

  .input-field {
    border: none;
    border-radius: 5px;
    outline: none;
    padding: 0.5rem;
    width: 100%;
  }
  .input-field::placeholder {
    color: #260065;
  }

  .typing-text {
    font-size: 10px;
  }
</style>
