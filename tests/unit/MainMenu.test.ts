import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import MainMenu from '../../src/experiments/mellings/ui/MainMenu.vue';

describe('MainMenu', () => {
  it('emits start-game when the Start Game button is clicked', async () => {
    const wrapper = mount(MainMenu);
    await wrapper.find('button:nth-of-type(1)').trigger('click');
    expect(wrapper.emitted('start-game')).toHaveLength(1);
  });

  it('emits open-editor when the Level Editor button is clicked', async () => {
    const wrapper = mount(MainMenu);
    await wrapper.find('button:nth-of-type(2)').trigger('click');
    expect(wrapper.emitted('open-editor')).toHaveLength(1);
  });

  it('emits open-options when the Options button is clicked', async () => {
    const wrapper = mount(MainMenu);
    await wrapper.find('button:nth-of-type(3)').trigger('click');
    expect(wrapper.emitted('open-options')).toHaveLength(1);
  });
});
