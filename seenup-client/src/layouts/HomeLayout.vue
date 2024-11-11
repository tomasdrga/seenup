<template>
  <!-- Main layout container -->
  <q-layout view="lHh lpr lff" class="bg-grey no-scroll">
    <!-- Header section -->
    <q-header class="bg-grey text-primary" height-hint="98">
      <q-toolbar>
        <!-- Logo and title -->
        <q-toolbar-title class="text-weight-bold row items-center auto q-pa-none q-mr-md">
          <q-btn flat to="/" size="lg" class="text-weight-bold q-pa-none">
            <q-avatar size="2rem" class="q-mr-xs">
              <img src="/nowty_face.png" />
            </q-avatar>
            SeenUp
          </q-btn>
        </q-toolbar-title>

        <!-- Hamburger menu button, visible only on small and medium screens -->
        <q-btn flat round dense icon="menu" class="q-mr-sm lt-md" @click="drawer = !drawer" />

        <!-- Navigation links, visible on larger screens -->
        <div class="navbargroup row justify-around flex-grow gt-sm">
          <div class="row">
            <!-- Dropdown menu for Docs -->
            <q-btn-dropdown flat color="primary" label="Docs" class="q-px-sm">
              <q-list>
                <q-item href="https://github.com/tomasdrga/seenup-vpwa" target="_blank" clickable v-close-popup @click="onItemClick">
                  <q-item-section>
                    <q-item-label class="text-primary">Seenup Github</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item href="https://github.com/tomasdrga/vpwa25" target="_blank" clickable v-close-popup @click="onItemClick">
                  <q-item-section>
                    <q-item-label class="text-primary">VPWA Github</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item href="https://quasar.dev/components" target="_blank" clickable v-close-popup @click="onItemClick">
                  <q-item-section>
                    <q-item-label class="text-primary">Quasar Docs</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>

            <!-- Static links -->
            <q-separator dark vertical class="gt-sm" />
            <q-btn to="/about" stretch flat label="About us" class="gt-sm" />
            <q-separator dark vertical class="gt-xs" />
            <q-btn to="/contact" stretch flat label="Contact" class="gt-sm" />
          </div>

          <!-- Space, hidden on small and medium screens -->
          <q-space class="gt-sm" />

          <!-- Login and Register buttons -->
          <div class="row">
            <q-btn to="/login" outline color="primary" label="Login" class="gt-sm q-mr-sm" />
            <q-btn to="/register" unelevated color="primary" label="Register" class="gt-sm" />
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Drawer for small and medium screens -->
    <q-drawer v-model="drawer" side="right" overlay class="text-primary">
      <q-list class="column justify-around items-around" style="min-height: 100vh;">
        <!-- Drawer header -->
        <div>
          <q-item to="/" clickable v-ripple class="row items-center text-weight-bold text-h5">
            <q-avatar size="2rem" class="q-mr-xs">
              <img src="/nowty_face.png" />
            </q-avatar>
            SeenUp
          </q-item>
          <q-item clickable v-ripple>
            <q-item-section>Docs</q-item-section>
            <q-item-section side>
              <q-icon name="keyboard_arrow_right" />
            </q-item-section>

            <q-menu anchor="top end" self="top start">
              <q-list>
                <q-item href="https://github.com/tomasdrga/seenup-vpwa" target="_blank" clickable v-close-popup @click="onItemClick">
                  <q-item-section>
                    <q-item-label class="text-primary">Seenup Github</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item href="https://github.com/tomasdrga/vpwa25" target="_blank" clickable v-close-popup @click="onItemClick">
                  <q-item-section>
                    <q-item-label class="text-primary">VPWA Github</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item href="https://quasar.dev/components" target="_blank" clickable v-close-popup @click="onItemClick">
                  <q-item-section>
                    <q-item-label class="text-primary">Quasar Docs</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-item>

          <!-- Drawer links -->
          <q-item to="/about" clickable v-ripple>
            <q-item-section>
              <q-item-label>About</q-item-label>
            </q-item-section>
          </q-item>
          <q-item to="/contact" clickable v-ripple>
            <q-item-section>
              <q-item-label>Contact</q-item-label>
            </q-item-section>
          </q-item>
        </div>

        <q-space />

        <!-- Drawer footer -->
        <div>
          <q-item to="/login" clickable v-ripple class="text-center">
            <q-item-section>
              <q-item-label>Login</q-item-label>
            </q-item-section>
          </q-item>
          <q-item to="/register" clickable v-ripple class="bg-primary text-white text-center">
            <q-item-section>
              <q-item-label>Register</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </q-list>
    </q-drawer>

    <!-- Main content container -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer section -->
    <q-footer class="bg-primary text-white">
      <q-toolbar class="justify-between footer-bar">
        <!-- Footer links -->
        <div class="footer-links">
          <q-btn flat label="About Us" class="text-white" to="/about" />
          <q-btn flat label="Contact" class="text-white" to="/contact" />
          <q-btn flat label="Privacy" class="text-white" to="/privacy" />
        </div>

        <!-- Social media links -->
        <div class="social-media">
          <q-btn flat label="F" class="text-white" target="_blank" href="https://www.facebook.com" />
          <q-btn flat label="T" class="text-white" target="_blank" href="https://www.twitter.com" />
          <q-btn flat label="L" class="text-white" target="_blank" href="https://www.linkedin.com" />
          <q-btn flat label="I" class="text-white" target="_blank" href="https://www.instagram.com" />
        </div>
      </q-toolbar>

      <!-- Footer bottom text -->
      <div class="footer-bottom text-center text-caption">
        &copy; 2024 SeenUp
      </div>
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';

  export default defineComponent({
    setup() {
      const drawer = ref(false);

      // Item click handler
      const onItemClick = () => {
        drawer.value = false;
      };

      return {
        drawer,
        onItemClick
      };
    }
  });
</script>

<style scoped lang="scss">
  .q-toolbar__title {
    flex: none;
  }
  .navbargroup {
    flex-grow: 1;
  }
  @media (max-width: $breakpoint-md-min) {
    .q-toolbar__title {
      flex-grow: 1;
    }
  }
  @media (max-width: $breakpoint-sm-min) {
    .footer-bar {
      flex-direction: column;
    }
  }
</style>