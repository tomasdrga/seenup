<template>
  <q-dialog :model-value="settings" @update:model-value="updateSettings">
    <q-card style="min-width: 75vw; max-width: 75vw; max-height: 75vh" class="text-primary">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold text-uppercase">Settings</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section class="q-py-none dialog-tabs">
        <q-tabs align="left" v-model="selectedTab">
          <q-tab name="general">General</q-tab>
          <q-tab name="user">User</q-tab>
          <q-tab name="security">Security</q-tab>
        </q-tabs>
      </q-card-section>
      <q-card-section>
        <q-card-section>
          <div class="text-h6">{{ selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1) }}</div>
        </q-card-section>
        <q-card-section v-if="selectedTab === 'general'" class="q-py-none">
          <q-form @submit="onSubmit" @reset="onReset">
              <q-card-section class="q-px-none q-pt-none">
                <q-card-label>
                  <div class="text-body text-weight-bold text-uppercase q-pb-sm">Notifications</div>
                  <div class="text-caption text-purple-9 q-pb-md">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Labore illum nisi quas explicabo ut porro alias omnis aspernatur cumque sapiente unde, non consequatur facere, odit dolorem impedit quia? Numquam, fugiat.</div>
                </q-card-label>
                <q-select filled v-model="notificationType" :options="options" label="Notification type" />
              </q-card-section>
              <q-card-section class="q-px-none q-pt-none">
                <div class="row q-pt-xl justify-end">
                  <q-btn label="Discard" type="reset" color="primary" flat class="q-ml-sm" />
                  <q-btn label="Save" type="submit" color="primary" />
                </div>
              </q-card-section>
            </q-form>
        </q-card-section>
        <q-card-section v-else-if="selectedTab === 'user'">
          <!-- User settings content here -->
        </q-card-section>
        <q-card-section v-else-if="selectedTab === 'security'">
          <!-- Security settings content here -->
        </q-card-section>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
export const userNotificationSetting = ref(null);
export default defineComponent({
  props: {
    settings: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:settings'],
  setup(props, { emit }) {
    const $q = useQuasar();
    const selectedTab = ref('general');
    const notificationType = ref(null);
    const options = ['Off', 'Only mentions', 'All messages'];


    const onSubmit = () => {
      userNotificationSetting.value = notificationType.value;
      $q.notify({
        progress: true,
        color: 'grey',
        textColor: 'primary',
        icon: 'done',
        message: 'Settings changes saved successfully',
        position: 'top',
      });
    };

    const onReset = () => {
      notificationType.value = null;
    };

    const updateSettings = (value: boolean) => {
      emit('update:settings', value);
    };

    return {
      selectedTab,
      notificationType,
      options,
      onSubmit,
      onReset,
      updateSettings,
    };
  },
});

</script>
