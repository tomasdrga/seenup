<template>
  <q-footer reveal class="bg-grey text-primary" v-if="!leftDrawerOpen" height-hint="20">
    <q-toolbar>
      <q-tabs horizontal class="text-primary row justify-center items-center full-width">
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
    </q-toolbar>
  </q-footer>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';

    export default defineComponent({
        props: {
            leftDrawerOpen: {
                type: Boolean,
                required: true,
            },
        },
    });
</script>