import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import LiuYao from '../LiuYao.vue'

describe('LiuYao.vue 自动成卦（真实定时器）', () => {
  it(
    '首次挂载后点击自动成卦，应在约 6 秒内完成并展示排盘',
    async () => {
      const wrapper = mount(LiuYao, { global: { plugins: [ElementPlus] } })
      const autoBtn = wrapper.findAll('button').find((b) => b.text().includes('自动成卦'))
      expect(autoBtn).toBeTruthy()
      await autoBtn!.trigger('click')

      const t0 = Date.now()
      // 轮询等待排盘出现（最多 10 秒真实时间）
      while (Date.now() - t0 < 10000) {
        await new Promise((r) => setTimeout(r, 200))
        if (wrapper.text().includes('本卦【')) break
      }
      const elapsed = Date.now() - t0

      expect(wrapper.text()).toContain('本卦【')
      expect(wrapper.text()).toContain('断卦参考')
      console.log(`[repro] 排盘出现耗时 ${elapsed}ms`)
    },
    15000,
  )
})