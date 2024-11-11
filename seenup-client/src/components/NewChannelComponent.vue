<template>
  <q-dialog :model-value="newChannelDialog" @update:model-value="updateNewChannelDialog">
    <q-card style="min-width: 75vw; max-width: 75vw; max-height: 75vh" class="text-primary">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold text-uppercase">Create a new channel</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <q-card-section class="q-py-none">
          <q-form @submit="onSubmitChannel" @reset="onResetChannel">
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
              <q-select
                v-model="typeChannel"
                label="Channel Type"
                :options="channel_options"
                option-value="value"
                option-label="label"
              />
            </q-card-section>
            <q-card-section class="q-px-none q-pt-none">
              <div class="row q-pt-xl justify-end">
                <q-btn label="Discard" type="reset" color="primary" flat class="q-ml-sm" />
                <q-btn label="Save" type="submit" color="primary" />
              </div>
            </q-card-section>
          </q-form>
        </q-card-section>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useServerStore } from 'src/stores/serverStore';
import { ChannelType } from 'components/models';
import { v4 as uuidv4 } from 'uuid';

export default defineComponent({
  props: {
    newChannelDialog: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:newChannelDialog'],
  setup(props, { emit }) {
    const $q = useQuasar();
    const name = ref<string | null>(null);
    const typeChannel = ref<string | null>(null);

    const serverStore = useServerStore();

    const onSubmitChannel = () => {
      let type = ChannelType.public;
      if (typeChannel.value === 'Public') {
        type = ChannelType.public;
      } else {
        type = ChannelType.private;
      }
      if (typeChannel.value && name.value) {
        const newChannel = {
          id: Date.now(),
          uuid: uuidv4(),
          type: type,
          name: name.value,
          users: [],
          messages: []
        };

        serverStore.addChannelToServer(1, newChannel);
        emit('update:newChannelDialog', false);

        $q.notify({
          progress: true,
          color: 'grey',
          textColor: 'primary',
          icon: 'done',
          message: 'New channel created successfully',
          position: 'top'
        });
      } else {
        $q.notify({
          color: 'red',
          textColor: 'white',
          icon: 'error',
          message: 'Please fill in all required fields',
          position: 'top'
        });
      }
    };
    
    const onResetChannel = () => {
      name.value = null;
      typeChannel.value = null;
    };

    const updateNewChannelDialog = (value: boolean) => {
      emit('update:newChannelDialog', value);
    };

    return {
      name,
      typeChannel,
      channel_options: ['Public', 'Private'],
      onSubmitChannel,
      onResetChannel,
      updateNewChannelDialog
    };
  }
});
</script>
