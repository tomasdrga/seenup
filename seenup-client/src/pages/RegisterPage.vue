<template>
  <!-- Main container for the Register page -->
  <q-page class="q-pa-md text-primary q-pt-xl">
    <!-- Page title -->
    <p class="text-h4 text-weight-bold text-center">Register</p>

    <!-- Registration form -->
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md" ref="form">
      <q-card flat class="row my-card bg-grey justify-center q-pt-xl">
        <!-- First name input -->
        <q-card-section class="col-12 col-sm-5 col-md-4">
          <q-input
            filled
            v-model="first_name"
            label="First name*"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type your first name' ]"
          />
        </q-card-section>

        <!-- Last name input -->
        <q-card-section class="col-12 col-sm-5 col-md-4">
          <q-input
            filled
            v-model="last_name"
            label="Last name*"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type your last name' ]"
          />
        </q-card-section>

        <!-- Username input -->
        <q-card-section class="q-pt-none col-12 col-sm-10 col-md-8">
          <q-input
            filled
            v-model="name"
            label="Username*"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type your username' ]"
          />
        </q-card-section>

        <!-- Email input -->
        <q-card-section class="q-pt-none col-12 col-sm-10 col-md-8">
          <q-input
            filled
            name="email"
            id="email"
            v-model.trim="email"
            type="email"
            label="Email"
            autofocus
          />
        </q-card-section>

        <!-- Password input -->
        <q-card-section class="q-pt-none col-12 col-sm-10 col-md-8">
          <q-input
            filled
            id="password"
            name="password"
            v-model="password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            bottom-slots
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
        </q-card-section>

        <!-- Password confirmation input -->
        <q-card-section class="q-pt-none col-12 col-sm-10 col-md-8">
          <q-input
            filled
            id="password_confirmation"
            name="password_confirmation"
            v-model="passwordConfirmation"
            label="Confirm Password"
            :type="showPassword ? 'text' : 'password'"
            bottom-slots
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
        </q-card-section>

        <!-- Accept terms toggle and form buttons -->
        <q-card-section class="q-pt-none col-12 col-sm-10 col-md-8">
          <q-toggle v-model="accept" label="I accept the license and terms" />

          <div class="row q-pt-xl justify-end">
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
            <q-btn label="Register" color="primary" type="submit" />
          </div>
        </q-card-section>

        <!-- Switch to Login button -->
        <q-card-section class="q-pt-none col-12 col-sm-10 col-md-8">
          <div class="row q-pt-md justify-center">
            <q-btn
              label="Already have an account? Login"
              color="primary"
              flat
              @click="goToLogin"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, toRefs } from 'vue';
import { useRouter, RouteLocationRaw } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/module-auth';

export default defineComponent({
  name: 'RegisterPage',
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const authStore = useAuthStore();

    // Form data
    const form = reactive({
      first_name: '',
      last_name: '',
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      accept: false,
    });

    const showPassword = ref(false);

    // Computed properties
    const redirectTo = computed<RouteLocationRaw>(() => ({ name: 'login' }));
    const loading = computed<boolean>(() => authStore.status === 'pending');

    // Form submission handler
    const onSubmit = async () => {
      if (!form.accept) {
        $q.notify({
          progress: true,
          color: 'grey',
          textColor: 'primary',
          icon: 'warning',
          message: 'You need to accept the license and terms first',
          position: 'top',
          actions: [{ icon: 'close', color: 'primary', round: true }],
        });
      } else {
        try {
          await authStore.register({
            email: form.email,
            password: form.password,
            passwordConfirmation: form.passwordConfirmation,
          });
          router.push(redirectTo.value);
          $q.notify({
            progress: true,
            color: 'grey',
            textColor: 'primary',
            icon: 'done',
            message: 'Registered successfully',
            position: 'top',
          });
        } catch (error) {
          console.error('Registration failed:', error);
          $q.notify({
            progress: true,
            color: 'grey',
            textColor: 'primary',
            icon: 'warning',
            message: 'Registration failed',
            position: 'top',
            actions: [{ icon: 'close', color: 'primary', round: true }],
          });
        }
      }
    };

    // Form reset handler
    const onReset = () => {
      form.first_name = '';
      form.last_name = '';
      form.name = '';
      form.email = '';
      form.password = '';
      form.passwordConfirmation = '';
      form.accept = false;
      showPassword.value = false;
    };

    // Navigate to the login page
    const goToLogin = () => {
      router.push('/login');
    };

    return {
      ...toRefs(form), // Spread the reactive references
      showPassword,
      redirectTo,
      loading,
      onSubmit,
      onReset,
      goToLogin,
    };
  },
});
</script>