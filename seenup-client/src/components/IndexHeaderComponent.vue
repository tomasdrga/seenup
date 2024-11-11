<template>
  <q-header class="bg-grey text-primary main-header" height-hint="98">
    <q-toolbar class="row items-center justify-between">
      <q-toolbar-title class="text-weight-bold row items-center">
        <div class="col items-center text-uppercase">
          <q-avatar size="2rem" class="q-mr-xs">
            <img src="/nowty_face.png">
          </q-avatar>
          SeenUp
        </div>
        <div class="row items-center">
          <q-btn v-if="$q.screen.lt.sm" round icon="add" size="sm" class="q-mr-md" id="add-button">
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
          <q-btn v-if="$q.screen.lt.sm" flat class="q-pa-none">
            <q-avatar rounded size="lg">
              <img :src="user.profilePic" alt="Profile Pic" />
            </q-avatar>
            <q-menu anchor="bottom right" self="bottom left" :offset="[10, 0]" class="q-pt-md text-primary">
              <q-list>
                <q-item clickable v-close-popup>
                  <q-item-section class="col-3">
                    <q-avatar rounded size="lg">
                      <img :src="user.profilePic" alt="Profile Pic" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold text-no-wrap">{{ user.userName }}</q-item-label>
                    <q-item-label caption class="text-purple-4">
                      <q-icon :name="userStatus.icon" :color="userStatus.color"></q-icon>{{ user.status }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable class="text-primary">
                  <q-item-section side>
                    <q-icon name="keyboard_arrow_left" />
                  </q-item-section>
                  <q-item-section class="text-right">Status</q-item-section>
                  <q-menu anchor="top end" self="top start" class="text-primary">
                    <q-list>
                      <q-item dense clickable @click="$emit('change-status', 'Active')">
                        <q-item-section>
                          <q-item-label>
                            <q-icon name="radio_button_checked" color="green" class="q-pr-sm"></q-icon>Active
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item dense clickable @click="$emit('change-status', 'Do not disturb')">
                        <q-item-section>
                          <q-item-label>
                            <q-icon name="nightlight" color="primary" class="q-pr-sm"></q-icon>Do not disturb
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item dense clickable @click="$emit('change-status', 'Offline')">
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
                  <q-item-section class="text-right">Settings</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup to="/login">
                  <q-item-section class="text-right">Sign out</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
</template>

<script lang="ts">
    import { defineComponent, computed } from 'vue';
    import { useQuasar } from 'quasar';
    import { users } from 'assets/users';

    export default defineComponent({
        emits: ['open-new-channel-dialog', 'change-status', 'open-settings'],
        setup() {
            const $q = useQuasar();
            const user = users.value[0];

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

            return {
                $q,
                user,
                userStatus,
            };
        },
    });
</script>