<template>
  <div v-if="props.showCommands" class="command-suggestions absolute bg-white rounded-border text-primary hide-scrollbar"
       style="bottom: 95px; left: -.5rem; max-width: 300px; max-height: 10rem; overflow: auto; width: 300px;">
    <q-list dense>
      <q-item v-for="(command, index) in props.commands" :key="command.name" clickable v-ripple @click="selectCommand(command.name)"
              :class="index === commands.length - 1 ? '' : 'command-item'">
        <q-item-section class="q-py-sm">
          <q-item-label class="text-bold command-title">{{ command.name }}</q-item-label>
          <q-item-label caption class="text-primary command-text">{{ command.description }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
  import { Command, } from './models';

  const props = defineProps({
    showCommands: {
      type: Boolean,
      required: true,
    },
    commands: {
      type: Array as () => Command[],
      required: true,
    },
  });

  const emit = defineEmits(['command-selected']);
  // Method to handle command select
  const selectCommand = (commandName: string) => {
    emit('command-selected', commandName);
  };
</script>

<style scoped>
  .command-suggestions {
    z-index: 1;
    background-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
  }
  .command-item {
    border-bottom: 1px solid #00000015;
  }

  .command-title {
    font-size: 14px;
  }

  .command-text {
    font-size: 10px;
  }
</style>
