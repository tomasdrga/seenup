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
    <div class="q-pl-xs" >
      <span class="typing-text text-deep-purple-4"  @click="showTyping"><strong>Spicy Pája</strong> is typing</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {computed, ref, watch, nextTick} from 'vue';

  import { useQuasar } from 'quasar';

  import { commands as allCommands } from 'assets/commands';
  import {Channel} from 'components/models';
  import CommandSuggestionsBox from 'components/CommandSuggestionBox.vue';
  import UserSuggestionsBox from 'components/UserSuggestionBox.vue';

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

  // Show typing notification
  const showTyping = () => {
    const baseMessage = 'Kamarádi';
    const extraChars = ' mi říkají Pavel, můžeš mi říkat Spicy Pája';
    const user = props.currentChannel?.users[2];
    let charIndex = 0;

    const dialog = $q.dialog({
      title: `<div class="text-primary">${user?.nickname}</div>`,
      message: baseMessage,
      position: 'bottom',
      persistent: false,
      html: true,
      ok: false,
    });

    // Simulate typing effect
    setInterval(() => {
      charIndex++;
      const newMessage = `${baseMessage}${extraChars.substring(0, charIndex) || ''}`;

      dialog.update({
        message: `<div class="text-primary">${newMessage}</div>`,
        html: true
      });
    }, 200);
  };
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
