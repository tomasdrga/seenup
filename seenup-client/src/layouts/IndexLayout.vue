<template>
  <q-layout view="lHh lpr lFf" class="bg-grey no-scroll">
    <!-- Header Component -->
    <IndexHeaderComponent 
      @open-new-channel-dialog="newChannelDialog = true" 
      @change-status="changeStatus" 
      @open-settings="settings = true" 
    />
    
    <!-- Drawer Component -->
    <IndexDrawerComponent 
      :leftDrawerOpen="leftDrawerOpen" 
      @update:leftDrawerOpen="leftDrawerOpen = $event" 
      @open-new-channel-dialog="newChannelDialog = true" 
      @change-status="changeStatus" 
      @open-settings="settings = true" 
    />

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer Component -->
    <IndexFooterComponent :leftDrawerOpen="leftDrawerOpen" />

    <!-- Dialog Components -->
    <NewChannelComponent 
      :newChannelDialog="newChannelDialog" 
      @update:newChannelDialog="newChannelDialog = $event" 
    />
    <SettingsDialog 
      :settings="settings" 
      @update:settings="settings = $event" 
    />
  </q-layout>
</template>

<script lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { users } from 'assets/users';
import IndexHeaderComponent from '../components/IndexHeaderComponent.vue';
import IndexDrawerComponent from '../components/IndexDrawerComponent.vue';
import IndexFooterComponent from '../components/IndexFooterComponent.vue';
import NewChannelComponent from '../components/NewChannelComponent.vue';
import SettingsDialog from '../components/SettingsDialog.vue';

export default {
  components: {
    IndexHeaderComponent,
    IndexDrawerComponent,
    IndexFooterComponent,
    NewChannelComponent,
    SettingsDialog
  },
  setup() {
    const $q = useQuasar();

    // State variables
    const leftDrawerOpen = ref(true);
    const newChannelDialog = ref(false);
    const settings = ref(false);

    // Reactive user data
    const user = reactive(users.value[0]);

    // Computed property for user status
    const userStatus = computed(() => {
      switch (user.status) {
        case 'Active':
          return { icon: 'radio_button_checked', color: 'green' };
        case 'Offline':
          return { icon: 'radio_button_checked', color: 'grey-6' };
        case 'Do not disturb':
          return { icon: 'nightlight', color: 'primary' };
        default:
          return { icon: 'mdi-account-question', color: 'grey' };
      }
    });

    // Method to change user status
    const changeStatus = (status: string) => {
      user.status = status;
    };

    // Method to toggle the left drawer
    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    // Close the drawer by default on mobile devices
    onMounted(() => {
      if ($q.screen.lt.sm) {
        leftDrawerOpen.value = false;
      }
    });

    return {
      leftDrawerOpen,
      user,
      userStatus,
      changeStatus,
      newChannelDialog,
      settings,
      toggleLeftDrawer
    };
  }
};
</script>

<style lang="scss">
  .no-scroll {
    overflow: hidden;
  }

  .q-tabs .q-focus-helper {
    display: none;
  }

  #message-tab:hover, #files-tab:hover, #settings-tab:hover {
    color: $purple-8;
  }

  #add-button {
    background-color: transparent;
    color: $primary;
    border: 1px solid $primary;
  }

  .dialog-tabs {
    border-bottom: 2px solid #00000015;
  }

  #top_actions {
    margin-top: 3rem;
  }

  .smaller {
    font-size: 0.7rem;
  }

  .main-dialog {
    width: 75%;
  }

  @media (max-width: $breakpoint-sm-min) {
    .main-header {
      margin-bottom: 8px;
    }
  }
</style>