<template>
  <q-page class="full-height q-pb-md q-pr-md padding-left-sm">
    <div class="row no-wrap justify-start items-start content-start rounded bg-white" id="main">
      <!-- Side Popup Dialog -->
      <q-dialog v-model="dialog" persistent>
        <div id="side-popup" style="height: 100%;">
          <div class="row items-center justify-center q-py-md q-pb-xl">
            <p class="text-smaller q-pl-md text-weight-bold text-primary col-10 q-mb-none text-uppercase">{{ currentServer.name }}</p>
            <q-btn @click="dialog = false" flat color="primary" icon="close" class="col-2"/>
          </div>
          <div class="text-primary text-body">
            <q-list class="row rounded-borders text-weight-bold">
              <q-expansion-item default-opened label="Channels" style="width: 100%;" class="text-uppercase">
                <q-btn
                flat
                align="left"
                style="width: 100%;"
                v-for="(channel, index) in channels"
                :key="index"
                class="channel-item"
                :class="{ 'text-weight-bold': index === 0 }"
                clickable
                v-ripple
                @click="joinChannel(channel.name, channel.isPrivate)">

                  <q-icon :name="channel.isPrivate ? 'lock' : 'tag'" size="xs" />
                  <span class="text-caption q-pr-sm" :class="{ 'text-weight-bold': index === 0 || index === 2}">{{ channel.name }}</span>
                  <q-icon v-if="index === 0" name="star" size="xs"/>
                  <q-btn flat icon="more_vert" class="edit-icon q-pa-none" size="xs" @click="icon = true" />
                </q-btn>
              </q-expansion-item>
            </q-list>
          </div>
        </div>
      </q-dialog>

      <!-- Left Sidebar -->
      <div class="col-0 col-md-2 full-height gt-sm" id="left-side-bar">
        <p :class="$q.screen.lt.lg ? 'text-smaller q-pa-md text-weight-bold text-primary text-uppercase' : 'text-h6 q-pa-md text-weight-bold text-primary text-uppercase'">{{ currentServer.name }}</p>
        <div class="text-primary text-body">
              <q-scroll-area style="height: calc(100vh - 70px); max-width: 100vw" :visible="false">
          <q-list class="rounded-borders text-weight-bold">
            <q-expansion-item default-opened label="Channels" style="width: 100%;" class="text-uppercase">

              <q-btn
                flat
                align="left"
                style="width: 100%;"
                v-for="(channel, index) in channels"
                :key="index"
                class="channel-item"
                :class="{ 'text-weight-bold': index === 0 }"
                clickable
                v-ripple
                @click="joinChannel(channel.name, channel.isPrivate)">

                <q-icon :name="channel.isPrivate ? 'lock' : 'tag'" size="xs" />
                <span class="text-caption q-pr-sm" :class="{ 'text-weight-bold': index === 0 || index === 2}">{{ channel.name }}</span>
                <q-icon v-if="index === 0" name="star" size="xs"/>
                <q-btn flat icon="more_vert" class="edit-icon q-pa-none" size="xs" @click="icon = true" />
                <q-btn flat icon="close" class="leave-icon q-pa-none" size="xs" @click="leaveChannel(channel)" />
              </q-btn>
            </q-expansion-item>
          </q-list>
          </q-scroll-area>
        </div>
      </div>

      <!-- Main Content -->
      <div class="column col-12 col-md-10" id="channel-container">
        <!-- Top Bar -->
        <div class="col-auto text-primary q-pt-md top-bar max-width">
          <div class="fix-top full-width text-h6 q-pl-md text-weight-bold border-bottom content-center text-uppercase">
            <div class="row items-center no-wrap">
              <!-- Icon -->
              <q-icon v-if="activeChannel" :name="activeChannelType === 'Private' ? 'lock' : 'tag'" size="sm" />

              <!-- Channel Name -->
              <span>{{ activeChannel || 'Welcome' }}</span>

              <!-- Button -->
              <q-btn
                @click="dialog = true"
                color="primary"
                flat
                class="lt-md q-pa-none q-ml-sm"
                icon="menu"
                size="sm"
              />
            </div>
          </div>

          <q-tabs align="left">
            <q-route-tab :to="`/client/${currentServer.uuid}/${currentChannel.uuid}`" id="message-tab">
              <div class="row items-center">
                <q-icon name="question_answer" class="q-mr-xs gt-xs"/>
                <span class="text-weight-bold">Messages</span>
              </div>
            </q-route-tab>
            <q-route-tab :to="`/client/${currentServer.uuid}/${currentChannel.uuid}/files`" id="files-tab">
              <div class="row items-center">
                <q-icon name="layers" class="q-mr-xs gt-xs"/>
                <span class="text-weight-bold">Files</span>
              </div>
            </q-route-tab>
            <q-route-tab :to="`/client/${currentServer.uuid}/${currentChannel.uuid}/settings`" id="settings-tab">
              <div class="row items-center">
                <q-icon name="settings" class="q-mr-xs gt-xs"/>
                <span class="text-weight-bold">Settings</span>
              </div>
            </q-route-tab>
          </q-tabs>
        </div>

        <!-- Channel Content -->
        <div class="col channel-container max-width overflow-auto hide-scrollbar">
          <ChannelComponent :current-server="currentServer" :channel="currentChannel" ref="channelComponent" />
        </div>

        <!-- Command Line -->
        <div class="col-auto justify-center items-center bottom-bar q-px-sm q-mx-md q-py-sm max-width command-line q-my-sm">
          <CommandLineComponent @send-message="handleSendMessage" :current-channel="currentChannel"/>
        </div>
      </div>
    </div>

    <!-- Channel Settings Dialog || Extract in future-->
    <q-dialog v-model="icon">
      <q-card style="min-width: 75vw; max-width: 75vw; max-height: 75vh" class="text-primary">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold text-uppercase">Channel settings</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-py-none dialog-tabs">
          <q-tabs align="left" v-model="selectedTab">
            <q-tab name="general">
              <div class="row items-center"><q-icon name="settings" class="q-mr-xs gt-xs"/><span class="text-weight-bold">General</span></div>
            </q-tab>
            <q-tab name="people">
              <div class="row items-center"><q-icon name="people" class="q-mr-xs gt-xs"/><span class="text-weight-bold">People</span></div>
            </q-tab>
            <q-tab name="danger">
              <div class="row items-center"><q-icon name="dangerous" class="q-mr-xs gt-xs"/><span class="text-weight-bold">Danger zone</span></div>
            </q-tab>
          </q-tabs>
        </q-card-section>
        <q-card-section>
          <q-card-section>
            <div class="text-h6">{{ selectedTab === 'danger' ? 'Danger zone' : selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1) }}</div>
          </q-card-section>
          <q-card-section v-if="selectedTab === 'general'" class="q-py-none">
            <q-form @submit="onSubmit" @reset="onReset">
              <q-card-section class="q-pa-none">
                <q-card-label>
                  <div class="text-body text-weight-bold text-uppercase q-pb-sm">Channel name</div>
                  <div class="text-caption text-purple-9 q-pb-md">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Labore illum nisi quas explicabo ut porro alias omnis aspernatur cumque sapiente unde, non consequatur facere, odit dolorem impedit quia? Numquam, fugiat.</div>
                </q-card-label>
                <q-input
                  filled
                  v-model="name"
                  label="Channel name"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Please type your channel name']"
                />
              </q-card-section>
              <q-card-section class="q-px-none q-pt-none">
                <q-card-label>
                  <div class="text-body text-weight-bold text-uppercase q-pb-sm">Channel type</div>
                  <div class="text-caption text-purple-9 q-pb-md">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Labore illum nisi quas explicabo ut porro alias omnis aspernatur cumque sapiente unde, non consequatur facere, odit dolorem impedit quia? Numquam, fugiat.</div>
                </q-card-label>
                <q-select filled v-model="model" :options="options" label="Channel type" />
              </q-card-section>
              <q-card-section class="q-px-none q-pt-none">
                <div class="row q-pt-xl justify-end">
                  <q-btn label="Discard" type="reset" color="primary" flat class="q-ml-sm" />
                  <q-btn label="Save" type="submit" color="primary" />
                </div>
              </q-card-section>
            </q-form>
          </q-card-section>
          <q-card-section v-else-if="selectedTab === 'people'">
            <q-scroll-area style="height: 400px;">
              <div v-for="n in 10" :key="n" class="q-py-xs">
                <q-item>
                  <q-item-section class="col-1">
                    <q-avatar rounded>
                      <img src="https://cdn.quasar.dev/img/avatar.png">
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">User {{ n }}</q-item-label>
                    <q-item-label caption>user{{ n }}@example.com</q-item-label>
                  </q-item-section>
                  <q-item-section class="col-1">
                    <q-btn flat icon="more_vert" class="q-pa-none" />
                  </q-item-section>
                  <q-item-section class="col-1">
                    <q-btn flat icon="delete" class="q-pa-none" />
                  </q-item-section>
                </q-item>
              </div>
            </q-scroll-area>
          </q-card-section>
          <q-card-section v-else-if="selectedTab === 'danger'">
            <q-scroll-area style="height: 400px;">
              <div class="q-py-sm">
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">Delete this channel</q-item-label>
                    <q-item-label caption>Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium omnis eaque expedita molestiae dignissimos in minus ea officia quisquam dolorum aperiam quia perspiciatis soluta, voluptas dicta. Molestiae cum nam dolorem!</q-item-label>
                  </q-item-section>
                  <q-item-section class="col-2">
                    <q-btn flat icon="delete" class="q-pa-none" label="Delete" />
                  </q-item-section>
                </q-item>
              </div>
              <div class="q-py-sm">
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">Transfer ownership</q-item-label>
                    <q-item-label caption>Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium omnis eaque expedita molestiae dignissimos in minus ea officia quisquam dolorum aperiam quia perspiciatis soluta, voluptas dicta. Molestiae cum nam dolorem!</q-item-label>
                  </q-item-section>
                  <q-item-section class="col-2">
                    <q-btn flat icon="sync_alt" class="q-pa-none" label="Transfer" />
                  </q-item-section>
                </q-item>
              </div>
              <div class="q-py-sm">
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">Disable this channel</q-item-label>
                    <q-item-label caption>Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium omnis eaque expedita molestiae dignissimos in minus ea officia quisquam dolorum aperiam quia perspiciatis soluta, voluptas dicta. Molestiae cum nam dolorem!</q-item-label>
                  </q-item-section>
                  <q-item-section class="col-2">
                    <q-btn flat icon="disabled_by_default" class="q-pa-none" label="Disable" />
                  </q-item-section>
                </q-item>
              </div>
            </q-scroll-area>
          </q-card-section>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, watch, type ComponentPublicInstance, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import CommandLineComponent from 'components/CommandLineComponent.vue';
import ChannelComponent from 'src/components/ChannelComponent.vue';
import { useServerStore } from '../stores/serverStore';
import { useChannelsStore } from 'src/stores/module-channels/useChannelsStore';
import activityService from 'src/services/ActivityService';

// Define the interface for the component instance
interface ChannelComponentInstance extends ComponentPublicInstance {
  onMessageSent(message: string): void;
  // Add other methods and properties if needed
}

export default defineComponent({
  components: { ChannelComponent, CommandLineComponent },
  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();

    // State variables
    const name = ref<string | null>(null);
    const model = ref<string | null>(null);
    const selectedTab = ref('general');
    const icon = ref(false);
    const dialog = ref(false);

    // Access the Pinia stores
    const channelsStore = useChannelsStore();

    // Computed properties
    const channels = computed(() => channelsStore.getUserChannels);
    console.log(channels);
    const lastMessageOf = (channel: string) => channelsStore.lastMessageOf(channel);
    const activeChannel = computed(() => channelsStore.active );
    const activeChannelType = computed(() => {
      const active = channels.value.find(channel => channel.name === activeChannel.value);
      return active?.isPrivate ? 'Private' : 'Public';
    });

    const setActiveChannel = (channel: string, isPrivate: boolean) => {
      channelsStore.SET_ACTIVE(channel, isPrivate);
    };

    const joinChannel = (channel: string, isPrivate: boolean) => {
      setActiveChannel(channel, isPrivate);
      channelsStore.join(channel, isPrivate);
    };

    // Server and channel data
    const serverStore = useServerStore();
    const currentServer = ref(
      serverStore.servers.find(server => server.uuid === route.params.serverId) || serverStore.servers[0]
    );
    const currentChannel = ref(
      currentServer.value.channels.find(channel => channel.uuid === route.params.channelId) ||
        currentServer.value.channels[0]
    );

    // Reference to the ChannelComponent
    const channelComponent = ref<ChannelComponentInstance | null>(null);

    // Handle sending a message
    const handleSendMessage = (message: string) => {
      if (channelComponent.value) {
        channelComponent.value.onMessageSent(message);
      } else {
        console.warn('channelComponent is not available yet.');
      }
    };

    // Navigate to a specific channel
    const navigateToChannel = (channelId: string) => {
      router.push(`/client/${currentServer.value.uuid}/${channelId}`);
    };

    // Watch for route changes to update current server and channel
    watch(route, () => {
      currentServer.value =
        serverStore.servers.find(server => server.uuid === route.params.serverId) ||
        serverStore.servers[0];
      currentChannel.value =
        currentServer.value.channels.find(channel => channel.uuid === route.params.channelId) ||
        currentServer.value.channels[0];
    });

    // Handle form submission
    const onSubmit = () => {
      $q.notify({
        progress: true,
        color: 'grey',
        textColor: 'primary',
        icon: 'done',
        message: 'Channel changes saved successfully',
        position: 'top',
      });
    };

    // Handle form reset
    const onReset = () => {
      name.value = null;
      model.value = null;
    };

    const leaveChannel = async (channel: { name: string, isPrivate: boolean }) => {
      try {

        // Check if the user is an admin
        await channelsStore.checkAdmin(channel.name);
        const isAdmin = activityService.isAdmin;
        const typeChannel = ref(channel.isPrivate ? 'private' : 'public');

        if (isAdmin) {
          await channelsStore.executeGeneralCommand('/quit', channel.name, typeChannel.value);

          $q.notify({
            color: 'grey',
            textColor: 'primary',
            icon: 'done',
            message: 'Channel deleted successfully',
            position: 'top',
          });
        } else {
          // User leaves the channel
          await channelsStore.executeGeneralCommand('/cancel', channel.name, typeChannel.value);

          $q.notify({
            color: 'grey',
            textColor: 'primary',
            icon: 'done',
            message: 'Left the channel successfully',
            position: 'top',
          });
        }
        channelsStore.leave(channel.name);
      } catch (error) {
        $q.notify({
          color: 'red',
          textColor: 'white',
          icon: 'error',
          message: 'Failed to leave the channel',
          position: 'top',
        });
      }
    };

    return {
      handleSendMessage,
      channelComponent,
      currentServer,
      currentChannel,
      selectedTab,
      icon,
      dialog,
      model,
      name,
      options: ['Public', 'Private'],
      onSubmit,
      onReset,
      navigateToChannel,
      channels,
      lastMessageOf,
      activeChannel,
      activeChannelType,
      setActiveChannel,
      joinChannel,
      leaveChannel,
    };
  },
});
</script>


<style lang="scss">
  #main {
    border: 2px solid #00000015;
    min-height: calc(100vh - 67px);
    max-height: calc(100vh - 67px);
  }

  .channel-item {
    position: relative;
  }

  .edit-icon {
    position: absolute;
    right: 10px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .leave-icon {
    position: absolute;
    right: 25px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .channel-item:hover .edit-icon {
    opacity: 1;
  }

  .channel-item:hover .leave-icon {
    opacity: 1;
  }

  .top-bar {
    border-bottom: 2px solid #00000015;
  }

  #left-side-bar {
    border-right: 2px solid #00000015;
    min-height: calc(100vh - 70px);
    max-height: calc(100vh - 70px);
  }

  #channel-container {
    height: calc(100vh - 70px);
    min-height: calc(100vh - 70px);
    max-height: calc(100vh - 70px);
  }

  .q-chat-message .q-chat-message--received {
    width: 250px;
  }

  .channel-container {
    overflow: auto;
  }

  .rounded {
    border-radius: 10px;
  }

  .max-width {
    max-width: 100%;
  }

  .command-line {
    padding: 0;
  }

  .full-height {
    min-height: 100%;
  }

  .text-smaller {
    font-size: 1rem;
  }

  #side-popup {
    width: 300px;
    min-height: 100vh;
    background-color: white;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
  }

  body.platform-ios .q-dialog__inner--minimized > div,
  body.platform-android:not(.native-mobile) .q-dialog__inner--minimized > div {
    min-height: 100vh;
  }

  .channel-button {
    width: 100%;
  }

  @media (max-width: $breakpoint-sm-min) {
    .padding-left-sm {
      padding-left: 16px;
    }

    #main {
      min-height: calc(100vh - 124px);
    }

    #channel-container {
      height: calc(100vh - 120px);
      min-height: calc(100vh - 120px);
      max-height: calc(100vh - 120px);
    }
  }
</style>
