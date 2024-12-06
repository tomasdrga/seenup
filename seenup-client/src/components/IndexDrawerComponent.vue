<template>
  <q-drawer show-if-above :breakpoint="600" :model-value="leftDrawerOpen" @update:model-value="updateLeftDrawerOpen" side="left" :width="75" class="bg-grey row content-between justify-center">
    <div class="row justify-center items-center" id="top_actions">
      <q-tabs vertical class="text-primary">
        <q-route-tab to="/messages" id="message-tab">
          <div class="column items-center">
            <q-icon name="home"/>
            <span class="text-weight-bold smaller">Home</span>
          </div>
        </q-route-tab>
        <q-route-tab to="/files" id="files-tab">
          <div class="column items-center">
            <q-icon name="notifications"/>
            <span class="text-weight-bold smaller">Activity</span>
          </div>
        </q-route-tab>
        <q-route-tab to="/settings" id="settings-tab">
          <div class="column items-center">
            <q-icon name="more_horiz"/>
            <span class="text-weight-bold smaller">More</span>
          </div>
        </q-route-tab>
      </q-tabs>
    </div>
    <div class="row justify-center items-center q-mb-md">
      <q-btn round icon="add" class="q-mb-md" id="add-button">
        <q-menu anchor="bottom right" self="bottom left" :offset="[10, 0]" class="text-primary">
          <q-list>
            <q-item clickable v-close-popup @click="$emit('open-new-channel-dialog')">
              <q-item-section class="col-1">
                <q-icon name="add"></q-icon>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-no-wrap">Create new channel</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup>
              <q-item-section class="col-1">
                <q-icon name="add"></q-icon>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-no-wrap">Invite people</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-btn flat class="q-pa-none">
        <q-avatar rounded size="lg">
          <img :src="'/avatars/matko.jpg'" alt="Profile Pic" />
        </q-avatar>
        <q-menu anchor="bottom right" self="bottom left" :offset="[10, 0]" class="q-pt-md text-primary">
          <q-list>
            <q-item clickable v-close-popup>
              <q-item-section class="col-3">
                <q-avatar rounded size="lg">
                  <img :src="'/avatars/matko.jpg'" alt="Profile Pic" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-no-wrap">{{ user?.first_name + ' ' + user?.last_name }}</q-item-label>
                <q-item-label caption class="text-purple-4">
                  <q-icon :name="userStatus.icon" :color="userStatus.color"></q-icon>{{ user?.status }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section>Status</q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" />
              </q-item-section>
              <q-menu anchor="top end" self="top start" class="text-primary">
                <q-list>
                  <q-item dense clickable @click="changeStatus('active')">
                    <q-item-section>
                      <q-item-label>
                        <q-icon name="radio_button_checked" color="green" class="q-pr-sm"></q-icon>Active
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item dense clickable @click="changeStatus('dnd')">
                    <q-item-section>
                      <q-item-label>
                        <q-icon name="nightlight" color="primary" class="q-pr-sm"></q-icon>Do not disturb
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item dense clickable @click="changeStatus('offline')">
                    <q-item-section>
                      <q-item-label>
                        <q-icon name="radio_button_unchecked" color="grey-6" class="q-pr-sm"></q-icon>Offline
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="$emit('open-settings')">
              <q-item-section>Settings</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup to="/login" @click="logout">
              <q-item-section>Logout</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </q-drawer>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { api } from 'boot/axios';

import { useAuthStore } from 'stores/module-auth';

export default defineComponent({
  props: {
    leftDrawerOpen: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['open-new-channel-dialog', 'change-status', 'open-settings', 'update:leftDrawerOpen'],
  setup(props, { emit }) {
    const authStore = useAuthStore();
    const user = computed(() => authStore.user);

    const userStatus = computed(() => {
      switch (user.value?.status) {
        case 'active':
          return { icon: 'radio_button_checked', color: 'green' };
        case 'offline':
          return { icon: 'radio_button_checked', color: 'grey-6' };
        case 'dnd':
          return { icon: 'nightlight', color: 'primary' };
        default:
          return { icon: 'mdi-account-question', color: 'grey' };
      }
    });

    const updateLeftDrawerOpen = (value: boolean) => {
      emit('update:leftDrawerOpen', value);
    };
    const logout = async () => {
      await authStore.logout();
    };
    const changeStatus = async (status: 'active' | 'offline' | 'dnd') => {
      try {
        await api.post('/auth/change-status', { status });
        if (user.value) {
          user.value.status = status;
        }
      } catch (error) {
      console.error('Failed to change status:', error);
      }
    };

    return {
      user,
      userStatus,
      updateLeftDrawerOpen,
      changeStatus,
      logout
    };
  },
});
</script>
