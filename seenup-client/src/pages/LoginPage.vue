<template>
  <!-- Main container for the Login page -->
  <q-page class="q-pa-md text-primary q-pt-xl">
    <!-- Page title -->
    <p class="text-h4 text-weight-bold text-center">Login</p>

    <!-- Login form -->
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md" ref="form">
      <q-card flat class="row my-card bg-grey justify-center q-pt-xl">
        <!-- Username input -->
        <q-card-section class="col-12 col-sm-10 col-md-8">
            <q-input filled name="email" id="email" v-model.trim="credentials.email" type="email" label="Email"
                        autofocus />
        </q-card-section>

        <!-- Password input -->
        <q-card-section class="q-pt-none col-12 col-sm-10 col-md-8">
            <q-input filled id="password" name="password" v-model="credentials.password" label="Password"
                :type="showPassword ? 'text' : 'password'" bottom-slots>
                <template v-slot:append>
                    <q-icon :name="showPassword ? 'visibility' : 'visibility_off'" class="cursor-pointer"
                        @click="showPassword = !showPassword" />
                </template>
            </q-input>
        </q-card-section>

        <q-card-section class="q-pt-none col-12 col-sm-10 col-md-8">
           <q-checkbox id="rememberMe" v-model="credentials.remember" label="Remember me" />
        </q-card-section>

        <!-- Form buttons -->
        <q-card-section class="q-pt-none col-12 col-sm-10 col-md-8">
          <div class="row q-pt-xl justify-end">
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
            <q-btn label="Login" type="submit" color="primary" @click="onSubmit" />
          </div>
        </q-card-section>

        <!-- Switch to Register button -->
        <q-card-section class="q-pt-none col-12 col-sm-10 col-md-8">
          <div class="row q-pt-md justify-center">
            <q-btn label="Dont have an account yet?" color="primary" flat @click="goToRegister" />
          </div>
        </q-card-section>
      </q-card>
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, computed, ref, reactive } from 'vue'
import { useAuthStore } from '../stores/module-auth';
import { RouteLocationRaw, useRoute, useRouter } from 'vue-router';

export default defineComponent({
    name: 'LoginPage',

    setup() {
        const route = useRoute();
        const router = useRouter();
        const authStore = useAuthStore();

        const redirectTo = computed((): RouteLocationRaw => {
            const redirect = route.query.redirect as string;
            console.log('Redirect to:', redirect);
            return redirect ? { path: redirect } : { name: 'home' };
        });

        const credentials = reactive({ email: '', password: '', remember: false });
        const showPassword = ref(false);

        const loading = computed((): boolean => {
            return authStore.status === 'pending';
        });

        const onSubmit = async () => {
            try {
                await authStore.login(credentials); // Directly call the action
                console.log('Login successful, redirecting to:', redirectTo.value);
                router.replace(redirectTo.value); // Redirect on success
            } catch (error) {
                console.error('Login failed:', error);
            }
        };

        // Navigate to the register page
        const goToRegister = () => {
          router.push('/register');
        };

        return {
            credentials,
            showPassword,
            redirectTo,
            loading,
            onSubmit,
            goToRegister
        };
    }
})
</script>