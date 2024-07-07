<template>
  <div v-if="qrContent" class="qr-container">
    <!-- QR Code encoded link -->
    <qrcode-vue
      v-if="qrContent"
      class="qr-image"
      :value="qrContent"
      :size="400"
      level="H"
    />
  </div>
  <span v-else>{{ $t('qrCode.noContentFound') }}</span>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import QrcodeVue from 'qrcode.vue';
import { useToast } from 'vue-toastification';
const toast = useToast();

// Props
const props = defineProps({
  qrContent: {
    type: String as PropType<string>,
    required: true,
  },
});

const copy_to_clipboard = () => {
  navigator.clipboard.writeText(props.qrContent);
  toast.info('URL copied to clipboard');
  return;
};
</script>

<style>
.qr-image {
  display: flex;
  margin-bottom: 25px;
}
</style>
