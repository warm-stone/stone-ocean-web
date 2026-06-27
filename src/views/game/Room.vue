<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useSelfStore, useGameStore } from '@/utils/piniaCache.ts'
import { post, API_URLS, type ApiResponse, type GameTokenDTO } from '@/utils/network.ts'
import type { BidAction, Card, Role } from '@/game/types.ts'
import { createTransport } from '@/game/transport/TransportFactory.ts'
import type { GameTransport } from '@/game/transport/GameTransport.ts'
import { registerOfflineNotifier } from '@/game/offline.ts'
import DouDizhuTable from '@/views/game/DouDizhuTable.vue'

/**
 * 房间视图 (设计 §4.2)。
 * 成员列表 + 房主操作区 (start/transfer-host/kick/dissolve) + 角色切换 [仅 LOBBY/FINISHED]。
 * onMounted: 签发 gst → 创建 transport → connect(roomId, gst, lastSeq) → onEvent→store.applyEvent;
 *            注册离线 sendBeacon 通知器。onUnmounted: disconnect + 清理。
 */
const route = useRoute()
const router = useRouter()
const selfStore = useSelfStore()
const store = useGameStore()
const { members, hostUserId, roomState, myRole, isHost, isSpectator, canSwitchRole } =
  storeToRefs(store)

const roomId = Number(route.params.id)
const roomIdRef = ref<number | null>(Number.isFinite(roomId) ? roomId : null)
const gstRef = ref<string | null>(null)

let transport: GameTransport | null = null
let offlineCleanup: (() => void) | null = null

// 房主操作目标
const transferTarget = ref<number | null>(null)
const kickTarget = ref<number | null>(null)
const switchTargetRole = ref<Role>('SPECTATOR')

const showTable = computed(() => roomState.value === 'BIDDING' || roomState.value === 'PLAYING')

async function ensureGst(): Promise<string> {
  const body = await post<ApiResponse<GameTokenDTO>>(API_URLS.game.gameToken)
  if (!body?.data?.gst) throw new Error('签发 game token 失败')
  gstRef.value = body.data.gst
  return body.data.gst
}

function buildBase() {
  return { clientRequestId: '', userId: store.myUserId ?? 0 }
}

async function exec(p?: Promise<unknown>): Promise<void> {
  if (!p) return
  try {
    await p
  } catch {
    /* 错误已由 network 拦截器 ElMessage 提示 */
  }
}

function doStart() {
  return exec(transport?.send({ ...buildBase(), type: 'StartGameCommand' }))
}
function doBid(action: BidAction) {
  return exec(transport?.send({ ...buildBase(), type: 'BidCommand', action }))
}
function doPlay(cards: Card[]) {
  return exec(transport?.send({ ...buildBase(), type: 'PlayCardCommand', cards }))
}
function doPass() {
  return exec(transport?.send({ ...buildBase(), type: 'PassCommand' }))
}
function doSwitchRole() {
  if (!canSwitchRole.value) return
  return exec(transport?.send({ ...buildBase(), type: 'SwitchRoleCommand', targetRole: switchTargetRole.value }))
}
function doLeave() {
  exec(transport?.send({ ...buildBase(), type: 'LeaveRoomCommand' })).finally(() => clearAndBack())
}
function doTransferHost() {
  if (transferTarget.value == null) return
  return exec(transport?.send({ ...buildBase(), type: 'TransferHostCommand', targetUserId: transferTarget.value }))
}
function doKick() {
  if (kickTarget.value == null) return
  return exec(transport?.send({ ...buildBase(), type: 'KickCommand', targetUserId: kickTarget.value }))
}
function doDissolve() {
  exec(transport?.send({ ...buildBase(), type: 'DissolveCommand' })).finally(() => clearAndBack())
}

function clearAndBack() {
  transport?.disconnect()
  store.clearRoom()
  router.push('/game/lobby')
}

onMounted(async () => {
  if (!Number.isFinite(roomId)) {
    ElMessage.error('房间号无效')
    router.push('/game/lobby')
    return
  }
  try {
    const gst = await ensureGst()
    transport = createTransport({
      roomId,
      gst,
      lastSeq: store.lastSeq,
      onEvent: (e) => store.applyEvent(e),
    })
    transport.connect(roomId, gst, store.lastSeq)
    offlineCleanup = registerOfflineNotifier(roomIdRef, gstRef)
  } catch {
    ElMessage.error('连接房间失败')
  }
})

onUnmounted(() => {
  transport?.disconnect()
  transport = null
  offlineCleanup?.()
  offlineCleanup = null
})
</script>

<template>
  <div class="room-view">
    <div class="room-header">
      <span>房间 #{{ roomId }}</span>
      <el-tag v-if="roomState">{{ roomState }}</el-tag>
      <el-tag v-if="isHost" type="danger">房主</el-tag>
      <el-tag v-else-if="myRole === 'PLAYER'" type="success">玩家</el-tag>
      <el-tag v-else-if="isSpectator" type="info">观战</el-tag>
    </div>

    <!-- 成员列表 -->
    <el-card class="members-card">
      <template #header>成员 ({{ members.length }})</template>
      <ul class="members">
        <li v-for="m in members" :key="m.userId">
          <span>用户 {{ m.userId }}</span>
          <el-tag size="small" :type="m.role === 'HOST' ? 'danger' : m.role === 'PLAYER' ? 'success' : 'info'">
            {{ m.role }}
          </el-tag>
          <el-tag v-if="m.online" size="small" type="success">在线</el-tag>
          <el-tag v-else size="small" type="info">离线</el-tag>
        </li>
      </ul>
    </el-card>

    <!-- 房主操作区 -->
    <el-card v-if="isHost" class="host-card">
      <template #header>房主操作</template>
      <div class="host-ops">
        <el-button v-if="roomState === 'LOBBY'" type="primary" @click="doStart">开始游戏</el-button>
        <el-button @click="doDissolve">解散房间</el-button>
        <div class="inline">
          <el-select v-model="transferTarget" placeholder="移交房主给" style="width: 160px">
            <el-option
              v-for="m in members.filter((m) => m.userId !== store.myUserId)"
              :key="m.userId"
              :label="`用户 ${m.userId}`"
              :value="m.userId"
            />
          </el-select>
          <el-button :disabled="transferTarget == null" @click="doTransferHost">移交房主</el-button>
        </div>
        <div class="inline">
          <el-select v-model="kickTarget" placeholder="踢出" style="width: 160px">
            <el-option
              v-for="m in members.filter((m) => m.userId !== store.myUserId)"
              :key="m.userId"
              :label="`用户 ${m.userId}`"
              :value="m.userId"
            />
          </el-select>
          <el-button :disabled="kickTarget == null" type="warning" @click="doKick">踢出</el-button>
        </div>
      </div>
    </el-card>

    <!-- 角色切换 (仅 LOBBY/FINISHED) -->
    <el-card v-if="canSwitchRole" class="role-card">
      <template #header>切换角色</template>
      <div class="inline">
        <el-select v-model="switchTargetRole" style="width: 140px">
          <el-option label="玩家" value="PLAYER" />
          <el-option label="观战者" value="SPECTATOR" />
        </el-select>
        <el-button @click="doSwitchRole">切换</el-button>
      </div>
    </el-card>

    <!-- 斗地主牌桌 (BIDDING/PLAYING) -->
    <DouDizhuTable v-if="showTable" @bid="doBid" @play="doPlay" @pass="doPass" />

    <!-- 观战者占位提示 (非游戏中) -->
    <el-empty v-else-if="isSpectator" description="观战中, 等待游戏开始" />

    <div class="leave">
      <el-button @click="doLeave">离开房间</el-button>
    </div>
  </div>
</template>

<style scoped>
.room-view {
  max-width: 960px;
  margin: 0 auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.room-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.members {
  list-style: none;
  padding: 0;
  margin: 0;
}
.members li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}
.host-ops,
.inline {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0;
}
.host-ops {
  flex-direction: column;
  align-items: flex-start;
}
</style>
