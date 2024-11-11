<template>
  <!-- Main container for the Register page -->
  <q-page class="q-pa-md text-primary q-pt-xl">
    <!-- Page title -->
    <p class="text-h4 text-weight-bold text-center">Register</p>

    <!-- Registration form -->
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <q-card flat class="row my-card bg-grey justify-center q-pt-xl">
        <!-- First name input -->
        <q-card-section class="col-12 col-sm-5 col-md-4">
          <q-input
            filled
            v-model="first_name"
            label="First name*"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type your first name']"
          />
        </q-card-section>

        <!-- Last name input -->
        <q-card-section class="col-12 col-sm-5 col-md-4">
          <q-input
            filled
            v-model="last_name"
            label="Last name*"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type your last name']"
          />
        </q-card-section>

        <!-- Username input -->
        <q-card-section class="q-pt-none col-12 col-sm-10 col-md-8">
          <q-input
            filled
            v-model="name"
            label="Username*"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type your username']"
          />
        </q-card-section>

        <!-- Email input -->
        <q-card-section class="q-pt-none col-12 col-sm-10 col-md-8">
          <q-input
            filled
            v-model="email"
            label="Email*"
            type="email"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type your email address']"
          />
        </q-card-section>

        <!-- Password input -->
        <q-card-section class="q-pt-none col-12 col-sm-10 col-md-8">
          <q-input
            filled
            v-model="password"
            label="Password*"
            type="password"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type your password']"
          />
        </q-card-section>

        <!-- Accept terms toggle and form buttons -->
        <q-card-section class="q-pt-none col-12 col-sm-10 col-md-8">
          <q-toggle v-model="accept" label="I accept the license and terms" />

          <div class="row q-pt-xl justify-end">
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
            <q-btn label="Submit" type="submit" color="primary" />
          </div>
        </q-card-section>

        <!-- Switch to Login button -->
        <q-card-section class="q-pt-none col-12 col-sm-10 col-md-8">
          <div class="row q-pt-md justify-center">
            <q-btn label="Already have an account? Login" color="primary" flat @click="goToLogin" />
          </div>
        </q-card-section>
      </q-card>
    </q-form>
  </q-page>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { useQuasar } from 'quasar';
  import { useRouter } from 'vue-router';

  export default defineComponent({
    setup() {
      const $q = useQuasar();
      const router = useRouter();

      // Form data
      const first_name = ref<string | null>(null);
      const last_name = ref<string | null>(null);
      const name = ref<string | null>(null);
      const email = ref<string | null>(null);
      const password = ref<string | null>(null);
      const accept = ref<boolean>(false);

      // Form submission handler
      const onSubmit = () => {
        if (!accept.value) {
          $q.notify({
            progress: true,
            color: 'grey',
            textColor: 'primary',
            icon: 'warning',
            message: 'You need to accept the license and terms first',
            position: 'top',
            actions: [ { icon: 'close', color: 'primary', round: true, handler: () => { } } ]
          });
        } else if (name.value !== 'expectedUsername' || password.value !== 'expectedPassword') {
          $q.notify({
            progress: true,
            color: 'grey',
            textColor: 'primary',
            icon: 'warning',
            message: 'Username or password is incorrect',
            position: 'top',
            actions: [ { icon: 'close', color: 'primary', round: true, handler: () => { } } ]
          });
        } else {
          $q.notify({
            progress: true,
            color: 'grey',
            textColor: 'primary',
            icon: 'done',
            message: 'Logged in successfully',
            position: 'top'
          });
        }
      };

      // Form reset handler
      const onReset = () => {
        first_name.value = null;
        last_name.value = null;
        name.value = null;
        email.value = null;
        password.value = null;
        accept.value = false;
      };

      // Navigate to the login page
      const goToLogin = () => {
        router.push('/login');
      };

      return {
        first_name,
        last_name,
        name,
        email,
        password,
        accept,
        onSubmit,
        onReset,
        goToLogin
      };
    }
  });
</script>