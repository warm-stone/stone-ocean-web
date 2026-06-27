<script lang="ts" setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/utils/piniaCache.ts'
import type { BidAction, Card } from '@/game/types.ts'

/**
 * 斗地主牌桌 (设计 §4.2)。
 * - 自己手牌 (可选中 → PlayCardCommand) + 公共出牌区 + 回合指示 + 30s 倒计时。
 * - bid 面板 (v1.1): CALL/NO_CALL/GRAB/NO_GRAB, 仅 canBid (BIDDING 且自己叫手) 时显示。
 * - 观战者模式: 仅渲染公共区, 不渲染手牌组件 (myHand 隐藏)。
 *
 * 动作以 emit 上抛, 由 Room.vue 经 transport.send 发送 (解耦便于测试)。
 */
const props = defineProps<{ spectator?: boolean }>()
const emit = defineEmits<{
  (e: 'bid', action: BidAction): void
  (e: 'play', cards: Card[]): void
  (e: 'pass'): void
}>()

const store = useGameStore()
const { myHand, publicArea, currentTurnPlayerId, roomState, isMyTurn, canBid, isSpectator } =
  storeToRefs(store)

const hideHand = computed(() => props.spectator === true || isSpectator.value)
const selected = ref<Set<number>>(new Set())
const countdown = ref(30)

function toggle(i: number) {
  const s = new Set(selected.value)
  if (s.has(i)) s.delete(i)
  else s.add(i)
  selected.value = s
}

function onPlay() {
  const all = myHand.value ?? []
  const cards = all.filter((_, i) => selected.value.has(i))
  if (cards.length) emit('play', cards)
  selected.value = new Set()
}
function onPass() {
  emit('pass')
  selected.value = new Set()
}
function onBid(action: BidAction) {
  emit('bid', action)
}

function cardLabel(c: Card): string {
  if (c.rank === 16) return '小王'
  if (c.rank === 17) return '大王'
  if (c.rank === 14) return 'A'
  if (c.rank === 15) return '2'
  const labels = ['', '', '', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  return labels[c.rank] ?? String(c.rank)
}
</script>

<template>
  <div class="doudizhu-table">
    <!-- 公共出牌区 (玩家 + 观战者均可见) -->
    <div data-testid="public-area" class="public-area">
      <div class="bottom-cards">
        底牌：
        <span v-for="(c, i) in publicArea?.bottomCards ?? []" :key="i" class="card">{{ cardLabel(c) }}</span>
        <span v-if="!(publicArea?.bottomCards?.length)">未亮</span>
      </div>
      <div class="last-plays">
        <div
          v-for="(r, i) in publicArea?.lastPlays ?? []"
          :key="i"
          class="play-record"
          :class="{ pass: r.isPass }"
        >
          <span>玩家{{ r.playerId }}：</span>
          <span v-if="r.isPass">过</span>
          <span v-else v-for="(c, j) in r.cards" :key="j" class="card">{{ cardLabel(c) }}</span>
        </div>
      </div>
      <div class="turn-indicator">
        回合：玩家 {{ currentTurnPlayerId ?? '-' }}
        <span v-if="isMyTurn" class="my-turn">(你的回合, {{ countdown }}s)</span>
      </div>
    </div>

    <!-- 自己手牌 (观战者隐藏) -->
    <div
      v-if="!hideHand && myHand && myHand.length"
      data-testid="my-hand"
      class="my-hand"
    >
      <span
        v-for="(c, i) in myHand ?? []"
        :key="i"
        class="card selectable"
        :class="{ selected: selected.has(i) }"
        @click="toggle(i)"
      >{{ cardLabel(c) }}</span>
      <div v-if="isMyTurn && roomState === 'PLAYING'" class="actions">
        <button @click="onPlay">出牌</button>
        <button @click="onPass">不出</button>
      </div>
    </div>

    <!-- bid 面板 (v1.1): 仅 canBid (BIDDING 且自己叫手) 时显示 -->
    <div v-if="canBid" data-testid="bid-panel" class="bid-panel">
      <button @click="onBid('CALL')">叫地主</button>
      <button @click="onBid('NO_CALL')">不叫</button>
      <button @click="onBid('GRAB')">抢</button>
      <button @click="onBid('NO_GRAB')">不抢</button>
    </div>
  </div>
</template>

<style scoped>
.doudizhu-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.public-area {
  border: 1px solid var(--el-border-color, #ddd);
  padding: 8px;
  border-radius: 4px;
}
.card {
  margin: 0 2px;
}
.card.selectable {
  cursor: pointer;
  padding: 2px 6px;
  border: 1px solid #ccc;
  border-radius: 3px;
}
.card.selected {
  background: #d4edff;
  border-color: #0960bd;
}
.play-record.pass {
  color: #999;
}
.my-turn {
  color: #e6a23c;
}
.actions,
.bid-panel {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}
</style>
