<template>
  <div class="liuyao-page">
    <el-card class="hero-card" shadow="never">
      <template #header>
        <div class="hero-header">
          <span class="hero-title">六爻卜算 · 在线排盘</span>
          <span class="hero-sub">铜钱起卦 · 京房纳甲 · 仅供娱乐</span>
        </div>
      </template>

      <!-- 起卦区 -->
      <div class="toss-section">
        <div class="form-row">
          <span class="form-label">所问之事</span>
          <el-input
            v-model="question"
            placeholder="如：近期财运如何？工作能否升迁？（可选，用于辅助推断用神）"
            clearable
            style="max-width: 560px"
          />
        </div>
        <div class="form-row">
          <span class="form-label">起卦时间</span>
          <el-date-picker
            v-model="tossTime"
            type="datetime"
            placeholder="选择日期时间"
            style="max-width: 320px"
          />
          <el-button link type="primary" @click="useNow">用当前时间</el-button>
        </div>

        <el-divider />

        <!-- 摇卦区 -->
        <div class="toss-area">
          <div class="coins-row">
            <div v-for="i in 3" :key="i" class="coin" :class="{ flipping: flipping }">
              <div class="coin-inner">
                <div class="coin-face coin-front">{{ coinFaces[i - 1] }}</div>
                <div class="coin-face coin-back">㊏</div>
              </div>
            </div>
            <div v-if="flipping" class="toss-tip">掷…</div>
          </div>

          <div class="lines-row">
            <div
              v-for="slot in 6"
              :key="slot"
              class="line-slot"
              :class="{ active: lineSlotState(slot - 1) }"
            >
              <div class="line-label">
                {{ ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][slot - 1] }}
              </div>
              <div class="line-symbol">
                <template v-if="tosses[slot - 1]">
                  <span class="moving-mark" v-if="tosses[slot - 1]!.moving">{{
                    tosses[slot - 1]!.name === '老阳' ? '○' : '×'
                  }}</span>
                  <div class="mini-yao">
                    <span v-if="tosses[slot - 1]!.yang" class="mini-bar yang" />
                    <template v-else>
                      <span class="mini-bar yin" /><span class="mini-bar yin" />
                    </template>
                  </div>
                </template>
                <span v-else class="line-placeholder">·</span>
              </div>
              <div class="line-detail" v-if="tosses[slot - 1]">
                {{ tosses[slot - 1]!.value }} {{ tosses[slot - 1]!.name }}
              </div>
            </div>
          </div>

          <div class="toss-buttons">
            <el-button type="primary" :disabled="tosses.length >= 6 || flipping" @click="tossOne">
              摇一爻（第 {{ tosses.length + 1 }} / 6）
            </el-button>
            <el-button :disabled="tosses.length >= 6" @click="autoToss">{{
              autoRunning ? '成卦中…' : '自动成卦'
            }}</el-button>
            <el-button :disabled="tosses.length === 0 && !chart && !autoRunning" @click="resetAll"
              >重新起卦</el-button
            >
          </div>
          <div v-if="tosses.length === 6 && chart" class="toss-done">
            成卦于：{{ chart.time.yearStem }}{{ chart.time.yearBranch }}年 {{ chart.time.monthStem
            }}{{ chart.time.monthBranch }}月 {{ chart.time.dayStem }}{{ chart.time.dayBranch }}日
            {{ chart.time.hourStem }}{{ chart.time.hourBranch }}时
            <span class="muted">（{{ chart.time.lunar }}）</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 排盘结果 -->
    <template v-if="chart">
      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="chart-header">
            <span class="hex-name">
              {{ chart.original.symbol }} 本卦【{{ chart.original.name }}】
              <el-tag size="small" effect="plain"
                >{{ chart.original.palace }} · {{ chart.original.palacePosition }}</el-tag
              >
            </span>
            <template v-if="chart.changed">
              <span class="hex-arrow">→</span>
              <span class="hex-name">
                {{ chart.changed.symbol }} 变卦【{{ chart.changed.name }}】
                <el-tag size="small" effect="plain" type="info"
                  >{{ chart.changed.palace }} · {{ chart.changed.palacePosition }}</el-tag
                >
              </span>
            </template>
            <el-tag v-if="chart.liuChong" size="small" type="danger">六冲</el-tag>
            <el-tag v-else-if="chart.liuHe" size="small" type="success">六合</el-tag>
            <el-tag v-else size="small" type="info">非冲非合</el-tag>
            <el-tag v-if="chart.staticHexagram" size="small" type="warning">静卦</el-tag>
          </div>
        </template>

        <div class="chart-meta">
          <span>本卦五行：{{ chart.original.element }}</span>
          <span>旬空：{{ chart.time.kongWang.join('、') }}</span>
          <span v-if="chart.movingCount > 0">动爻：{{ chart.movingCount }} 个</span>
          <span class="muted">{{ chart.original.theme }}</span>
        </div>

        <div class="chart-table-wrap">
          <table class="chart-table">
            <thead>
              <tr>
                <th>爻位</th>
                <th>六神</th>
                <th>干支</th>
                <th>六亲</th>
                <th>世应</th>
                <th>本卦爻象</th>
                <th>动</th>
                <th>变卦爻象</th>
                <th>变卦六亲</th>
                <th>变卦干支</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="line in chartLines"
                :key="line.index"
                :class="{ 'yongshen-row': isYongShenLine(line.index) }"
              >
                <td>{{ lineName(line.index) }}</td>
                <td class="spirit-cell">{{ line.spirit }}</td>
                <td>{{ line.originalStem }}{{ line.originalBranch }}</td>
                <td class="relatives-cell">{{ line.originalRelatives }}</td>
                <td>
                  <el-tag v-if="line.mark === '世'" size="small" type="danger" effect="dark"
                    >世</el-tag
                  >
                  <el-tag v-else-if="line.mark === '应'" size="small" type="primary" effect="dark"
                    >应</el-tag
                  >
                  <span v-else class="muted">—</span>
                </td>
                <td>
                  <div class="yao inline">
                    <span v-if="line.toss.yang" class="bar yang" />
                    <template v-else> <span class="bar yin" /><span class="bar yin" /> </template>
                  </div>
                </td>
                <td>
                  <span v-if="line.moving" class="moving-mark">{{
                    line.toss.name === '老阳' ? '○' : '×'
                  }}</span>
                  <span v-else class="muted">静</span>
                </td>
                <td>
                  <div class="yao inline">
                    <span v-if="line.changedYang" class="bar yang dim" />
                    <template v-else>
                      <span class="bar yin dim" /><span class="bar yin dim" />
                    </template>
                  </div>
                </td>
                <td class="relatives-cell">{{ line.changedRelatives ?? '—' }}</td>
                <td>{{ line.changedStem ?? '' }}{{ line.changedBranch ?? '' }}</td>
                <td>
                  <el-tag
                    v-for="t in lineTags(line)"
                    :key="t"
                    size="small"
                    :type="tagType(t)"
                    class="line-tag"
                  >
                    {{ t }}
                  </el-tag>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="legend muted">
          旺衰（对月建）：旺=当令 · 相=月生 · 休=生月 · 囚=克月 · 死=月克 ｜ 空=旬空 · 破=月破 ·
          冲=日冲（暗动）· 合=日合 ｜ 高亮行为推算用神所在
        </div>
      </el-card>

      <!-- 断卦参考 -->
      <el-card class="analysis-card" shadow="never">
        <template #header><span class="card-title">断卦参考</span></template>
        <div class="analysis-list">
          <p v-for="(text, i) in analysis" :key="i" class="analysis-line">{{ text }}</p>
        </div>

        <el-collapse class="guide-collapse">
          <el-collapse-item title="用神速查（占问事项 → 所取用神）">
            <el-table :data="YONG_SHEN_GUIDES" size="small" border>
              <el-table-column prop="label" label="占问类型" width="140" />
              <el-table-column prop="relatives" label="用神" width="140">
                <template #default="{ row }">{{ row.relatives.join('、') }}</template>
              </el-table-column>
              <el-table-column prop="desc" label="说明" />
            </el-table>
          </el-collapse-item>
          <el-collapse-item title="起卦规则说明">
            <p class="rule-text">
              三枚铜钱（或硬币），起卦前心中默念所问之事。字面（正）记 2，背面（花）记 3。
              分六次投掷，自下而上记爻：
            </p>
            <div class="rule-grid">
              <div class="rule-item"><b>三背（9）</b>老阳 · 动爻（○）阳极变阴</div>
              <div class="rule-item"><b>二背一正（8）</b>少阴 · 静爻</div>
              <div class="rule-item"><b>一背二正（7）</b>少阳 · 静爻</div>
              <div class="rule-item"><b>三正（6）</b>老阴 · 动爻（×）阴极变阳</div>
            </div>
            <p class="rule-text">
              动爻即变爻：老阳变阴、老阴变阳，由此得变卦。装卦依京房八宫法：
              定卦宫、纳干支（纳甲）、安世应、以卦宫五行为"我"定六亲、以日干起六神。
              年月日时干支为排盘辅助（年柱以立春为界、月柱以节气约界，供参考）。
            </p>
          </el-collapse-item>
        </el-collapse>

        <div class="disclaimer">
          <el-alert
            type="warning"
            :closable="false"
            show-icon
            title="声明：本页卦理仅供参考娱乐，结果不构成任何决策建议；人生际遇终在自身努力与善缘。"
          />
        </div>
      </el-card>
    </template>

    <el-card v-else class="empty-card" shadow="never">
      <el-empty description="摇满六爻后自动排盘" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import {
  ElButton,
  ElDatePicker,
  ElInput,
  ElTag,
  ElAlert,
  ElCollapse,
  ElCollapseItem,
  ElTable,
  ElTableColumn,
} from 'element-plus'
import {
  buildChart,
  generateAnalysis,
  guessYongShen,
  tossOnce,
  YONG_SHEN_GUIDES,
  type LiuYaoChart,
  type TossResult,
} from '@/utils/liuyao.ts'

const question = ref('')
const tossTime = ref<Date>(new Date())
const tosses = ref<TossResult[]>([])
const chart = ref<LiuYaoChart | null>(null)
const flipping = ref(false)

const coinFaces = ref<Array<'字' | '背'>>(['字', '字', '字'])

const TOSS_ANIM_MS = 620 // 单爻翻币动画时长
const TOSS_GAP_MS = 720 // 相邻两爻起摇间隔（略大于动画时长，保证顺序推进）

let tossTimer: ReturnType<typeof setTimeout> | null = null
let autoTimer: ReturnType<typeof setTimeout> | null = null
let autoRunning = false

const chartLines = computed(() => (chart.value ? [...chart.value.lines].reverse() : []))

const lineName = (i: number) => ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][i]

function lineSlotState(i: number): boolean {
  return i === tosses.value.length && i < 6
}

function useNow() {
  tossTime.value = new Date()
}

function tossOne(): boolean {
  if (tosses.value.length >= 6 || flipping.value) return false
  const result = tossOnce()
  flipping.value = true
  coinFaces.value = result.coins
  if (tossTimer) clearTimeout(tossTimer)
  tossTimer = setTimeout(() => {
    tosses.value = [...tosses.value, result]
    flipping.value = false
  }, TOSS_ANIM_MS)
  return true
}

/**
 * 自动成卦：自愈式串行调度，避免 interval+timeout 竞态导致丢拍/卡死。
 * - 点击立即掷出第一爻（即时反馈）
 * - 重复点击幂等（autoRunning 防护，不重启计时）
 * - 任一拍被浏览器推迟，只顺延下一拍，不会跳过
 */
function autoToss() {
  if (autoRunning || tosses.value.length >= 6) return
  autoRunning = true
  const step = () => {
    if (tosses.value.length >= 6) {
      autoRunning = false
      if (autoTimer) {
        clearTimeout(autoTimer)
        autoTimer = null
      }
      return
    }
    if (flipping.value) {
      // 上一爻动画尚未收尾（异常抖动），稍候重试而不是丢弃这一拍
      autoTimer = setTimeout(step, 80)
      return
    }
    tossOne()
    autoTimer = setTimeout(step, TOSS_GAP_MS)
  }
  step()
}

function resetAll() {
  tosses.value = []
  chart.value = null
  coinFaces.value = ['字', '字', '字']
  autoRunning = false
  if (tossTimer) clearTimeout(tossTimer)
  if (autoTimer) {
    clearTimeout(autoTimer)
    autoTimer = null
  }
}

watch(
  [tosses, tossTime],
  () => {
    if (tosses.value.length === 6 && tossTime.value) {
      chart.value = buildChart(tosses.value, tossTime.value)
    } else {
      chart.value = null
    }
  },
  { deep: true },
)

const analysis = computed(() => (chart.value ? generateAnalysisText() : []))

function generateAnalysisText(): string[] {
  const chartData = chart.value
  if (!chartData) return []
  return generateAnalysis(chartData, question.value)
}

function lineTags(line: {
  wangShuai: string
  kongWang: boolean
  yuePo: boolean
  riChong: boolean
  riHe: boolean
}): string[] {
  const tags: string[] = [line.wangShuai]
  if (line.kongWang) tags.push('空')
  if (line.yuePo) tags.push('破')
  if (line.riChong) tags.push('冲')
  if (line.riHe) tags.push('合')
  return tags
}

function tagType(t: string): 'danger' | 'warning' | 'success' | 'info' | 'primary' {
  switch (t) {
    case '旺':
      return 'success'
    case '相':
      return 'primary'
    case '休':
    case '囚':
      return 'warning'
    case '死':
      return 'danger'
    case '空':
    case '破':
      return 'danger'
    case '冲':
      return 'warning'
    case '合':
      return 'success'
    default:
      return 'info'
  }
}

function isYongShenLine(index: number): boolean {
  const g = guessYongShen(question.value)
  if (!g || !chart.value) return false
  return g.relatives.some((r) =>
    r === '世爻'
      ? index === chart.value!.original.shi
      : chart.value!.lines[index]!.originalRelatives === r,
  )
}

onUnmounted(() => {
  if (tossTimer) clearTimeout(tossTimer)
  if (autoTimer) clearTimeout(autoTimer)
})
</script>

<style scoped>
.liuyao-page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 20px 16px 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.hero-sub {
  font-size: 0.85rem;
  color: var(--el-text-color-secondary);
}

.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.form-label {
  width: 76px;
  flex-shrink: 0;
  color: var(--el-text-color-regular);
}

.toss-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.coins-row {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 84px;
}

.coin {
  width: 56px;
  height: 56px;
  perspective: 240px;
}

.coin-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s ease-in-out;
}

.coin.flipping .coin-inner {
  transform: rotateY(1260deg);
}

.coin-face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  backface-visibility: hidden;
  border: 2px solid #c9a227;
  background: linear-gradient(145deg, #f5d978, #d4a530);
  color: #6b4b0a;
  font-size: 22px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.coin-back {
  transform: rotateY(180deg);
  color: #7a5a10;
}

.toss-tip {
  color: var(--el-text-color-secondary);
  font-size: 0.9rem;
}

.lines-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.line-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 74px;
  padding: 8px 4px;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
}

.line-slot.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.line-label {
  font-size: 0.78rem;
  color: var(--el-text-color-secondary);
}

.line-placeholder {
  color: var(--el-text-color-placeholder);
}

.line-detail {
  font-size: 0.75rem;
  color: var(--el-text-color-regular);
}

.mini-yao {
  display: flex;
  flex-direction: row;
  gap: 3px;
  align-items: center;
  justify-content: center;
  height: 26px;
  width: 36px;
}

.mini-bar {
  display: block;
  width: 30px;
  height: 8px;
  background: var(--el-text-color-primary);
  border-radius: 2px;
}

.mini-bar.yin {
  width: 13px;
  background: var(--el-text-color-primary);
}

.moving-mark {
  color: #e63b3b;
  font-weight: 700;
  font-size: 1rem;
}

.toss-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.toss-done {
  color: var(--el-text-color-regular);
  font-size: 0.9rem;
}

.muted {
  color: var(--el-text-color-secondary);
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hex-name {
  font-size: 1.1rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.hex-arrow {
  color: var(--el-text-color-secondary);
  font-size: 1.2rem;
}

.chart-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.chart-table-wrap {
  overflow-x: auto;
}

.chart-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
  white-space: nowrap;
}

.chart-table th,
.chart-table td {
  border: 1px solid var(--el-border-color-lighter);
  padding: 6px 10px;
  text-align: center;
}

.chart-table th {
  background: var(--el-fill-color-light);
  font-weight: 600;
}

.chart-table tr.yongshen-row td {
  background: var(--el-color-warning-light-9);
}

.spirit-cell {
  color: var(--el-text-color-regular);
}

.relatives-cell {
  font-weight: 600;
}

.yao.inline {
  display: inline-flex;
  flex-direction: row;
  gap: 3px;
  width: 44px;
  height: 12px;
  align-items: center;
  justify-content: center;
}

.bar {
  display: block;
  width: 40px;
  height: 9px;
  border-radius: 2px;
  background: var(--el-color-primary);
}

.bar.yin {
  width: 17px;
  background: var(--el-color-primary);
}

.bar.dim {
  background: var(--el-color-info);
}

.line-tag {
  margin: 1px 2px;
}

.legend {
  margin-top: 8px;
  font-size: 0.8rem;
}

.card-title {
  font-weight: 600;
}

.analysis-line {
  margin: 0 0 8px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}

.guide-collapse {
  margin: 8px 0 14px;
}

.rule-text {
  margin: 4px 0;
  line-height: 1.7;
}

.rule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px;
  margin: 10px 0;
}

.rule-item {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 0.88rem;
}

.disclaimer {
  margin-top: 6px;
}

@media (max-width: 640px) {
  .form-label {
    width: auto;
  }

  .line-slot {
    width: 60px;
  }
}
</style>
