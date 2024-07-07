import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import { describe, expect, test } from 'vitest';

import Traction from '@/components/about/Traction.vue';

describe('Traction', async () => {
  test('mount matches snapshot with expected values', () => {
    const wrapper = mount(Traction, {
      global: {
        plugins: [PrimeVue, createTestingPinia()],
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });
});
