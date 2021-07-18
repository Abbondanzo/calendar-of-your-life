import { mount } from '@vue/test-utils'
import BodyRoot from '@/components/BodyRoot.vue'

describe('BodyRoot', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(BodyRoot, { stubs: ['BodyCircles', 'BodyHeader'] })
    expect(wrapper.vm).toBeTruthy()
  })
})
