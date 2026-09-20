import { describe, expect, it, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import LiuYao from '../LiuYao.vue'

describe('LiuYao.vue', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('挂载渲染起卦界面', () => {
    const wrapper = mount(LiuYao, { global: { plugins: [ElementPlus] } })
    expect(wrapper.text()).toContain('六爻卜算')
    expect(wrapper.text()).toContain('摇一爻')
    expect(wrapper.text()).toContain('自动成卦')
  })

  it('自动成卦后展示排盘与断卦参考', async () => {
    vi.useFakeTimers()
    const wrapper = mount(LiuYao, { global: { plugins: [ElementPlus] } })
    const buttons = wrapper.findAll('button')
    const autoBtn = buttons.find((b) => b.text().includes('自动成卦'))
    expect(autoBtn).toBeTruthy()

    await autoBtn!.trigger('click')
    // 6 次摇爻：首拍立即开始，随后每 720ms 一拍、每拍动画 620ms，6 秒足够
    vi.advanceTimersByTime(6000)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('本卦【')
    expect(wrapper.text()).toContain('断卦参考')
    expect(wrapper.text()).toContain('旬空')
  })

  it('点击自动成卦后第一爻立即开始摇动（即时反馈，无静默期）', async () => {
    vi.useFakeTimers()
    const wrapper = mount(LiuYao, { global: { plugins: [ElementPlus] } })
    const autoBtn = wrapper.findAll('button').find((b) => b.text().includes('自动成卦'))
    await autoBtn!.trigger('click')

    // 不推进任何定时器：首爻动画应立即处于 flipping 状态
    const coinEl = wrapper.find('.coin.flipping')
    expect(coinEl.exists()).toBe(true)

    // 收尾推进，避免遗留定时器
    vi.advanceTimersByTime(6000)
    await wrapper.vm.$nextTick()
  })

  it('自动成卦进行中重复点击不重启流程，仍能完成', async () => {
    vi.useFakeTimers()
    const wrapper = mount(LiuYao, { global: { plugins: [ElementPlus] } })
    const autoBtn = wrapper.findAll('button').find((b) => b.text().includes('自动成卦'))
    await autoBtn!.trigger('click')
    // 中途再次点击（原实现会重启 interval 导致可能卡死）
    vi.advanceTimersByTime(1500)
    await wrapper.vm.$nextTick()
    const btn = wrapper.findAll('button').find((b) => b.text().includes('自动成卦') || b.text().includes('成卦中…'))
    await btn!.trigger('click')
    vi.advanceTimersByTime(6000)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('本卦【')
  })
})