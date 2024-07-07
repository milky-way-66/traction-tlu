<template>
  <div class="traction-login grid w-screen flex-grow-1 mt-0">
    <div class="col-12 md:col-6 xl:col-4">
      <div class="px-8">
        <div class="pt-6 pb-2" style="font-size: 40px; text-align: center;">
        </div>

        <!-- Logging In -->
        <div v-if="loginMode === LOGIN_MODE.SIGNIN" class="pt-6">
          <LoginForm />
          <div
            v-if="
              stringOrBooleanTruthy(config.frontend.showOIDCReservationLogin)
            "
            class="oidc-login"
          >
            <hr />
            <div v-if="!user" class="oidc-choice">
              <span class="mb-0">{{ $t('admin.orRequestAccessWith') }}</span>
              <LoginOIDC class="mt-0" />
            </div>
          </div>

          <div
            v-if="
              user ||
              !stringOrBooleanTruthy(config.frontend.showOIDCReservationLogin)
            "
            class="mt-6"
          >
            <p>
              {{ $t('login.noAccount') }}
              <a
                href="#"
                class="p-button-link login-mode"
                @click.prevent="loginMode = LOGIN_MODE.RESERVE"
                >{{ $t('login.createRequest') }}</a
              >
            </p>
          </div>
        </div>

        <!-- Making Reservation -->
        <div v-else-if="loginMode === LOGIN_MODE.RESERVE" class="pt-6 pb-4">
          <Button
            :label="$t('login.backToSignIn')"
            icon="pi pi-arrow-left"
            class="p-button-text"
            @click="goBack($event)"
          />
          <Reserve />
        </div>
      </div>
    </div>

    <div class="cover-image hidden md:block col-0 md:col-6 xl:col-8 p-0"></div>
  </div>
  <SessionTimeoutModal />
</template>

<script setup lang="ts">
import LoginOIDC from '@/components/oidc/LoginOIDC.vue';

// Vue
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// PrimeVue
import Button from 'primevue/button';
import { useConfirm } from 'primevue/useconfirm';
// Components
import LoginForm from '@/components/LoginForm.vue';
import Reserve from './reservation/Reserve.vue';
import SessionTimeoutModal from './common/SessionTimeoutModal.vue';
import { stringOrBooleanTruthy } from '@/helpers';
// State
import { storeToRefs } from 'pinia';
import { useConfigStore, useReservationStore, useOidcStore } from '@/store';

import { RESERVATION_STATUSES } from '@/helpers/constants';

const reservationStore = useReservationStore();
const { config } = storeToRefs(useConfigStore());
const { status } = storeToRefs(useReservationStore());
const { user } = storeToRefs(useOidcStore());

const route = useRoute();
const router = useRouter();

const confirm = useConfirm();

// Other login form swtiching
enum LOGIN_MODE {
  SIGNIN,
  RESERVE,
  STATUS,
}
const loginMode = ref(LOGIN_MODE.SIGNIN);
if (route.name === 'TenantUiReservationStatus') {
  loginMode.value = LOGIN_MODE.STATUS;
}

const goBack = (event: any) => {
  if (status.value === RESERVATION_STATUSES.SHOW_WALLET) {
    confirm.require({
      target: event.currentTarget,
      message:
        'Bạn có chắc chắn muốn thoát, Thông tin ví sẽ không thể lấy lại sau khi bạn thoát',
      header: 'Bạn đã lưu thông tin ví chưa?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        doGoBack();
      },
    });
  } else {
    doGoBack();
  }
};
const doGoBack = () => {
  loginMode.value = LOGIN_MODE.SIGNIN;
  reservationStore.resetState();
  router.push('/');
};
</script>

<style scoped lang="scss">
// See layout.scss for generalized common login layout stuff
// Set the image specific to this component here though
.cover-image {
  background-image: url('/img/university/uni.jpg');
}
</style>
