import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import App from '../../App.vue'
import router from '../../router/router.ts'

describe('LiuYao 整应用首开复现（真实定时器）', () => {
  it(
    '从 /liuyao 首开并点击自动成卦，应能出盘',
    async () => {
      const wrapper = mount(App, {
        global: { plugins: [ElementPlus, createPinia(), router] },
      })
      await router.push('/liuyao')
      await router.isReady()
      await new Promise((r) => setTimeout(r, 300)) // 等待懒加载 chunk 与挂载

      expect(wrapper.text()).toContain('六爻卜算')

      const autoBtn = wrapper.findAll('button').find((b) => b.text().includes('自动成卦'))
      expect(autoBtn).toBeTruthy()
      await autoBtn!.trigger('click')

      const t0 = Date.now()
      while (Date.now() - t0 < 10000) {
        await new Promise((r) => setTimeout(r, 200))
        if (wrapper.text().includes('本卦【')) break
      }
      const elapsed = Date.now() - t0
      console.log(`[repro-app] 排盘出现耗时 ${elapsed}ms`)
      expect(wrapper.text()).toContain('本卦【')
    },
    20000,
  )
})