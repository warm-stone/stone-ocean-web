<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useSelfStore } from '@/utils/piniaCache.ts'
import { get, gameCommand, API_URLS, type ApiResponse } from '@/utils/network.ts'

/** 后端 RoomSummary record (game/room/RoomSummary.java)。 */
interface RoomSummary {
  roomId: number
  name: string
  playerCount: number
  maxPlayers: number
  visibility: string
  hasPassword: boolean
  state: string
}

/** 后端 RoomCreatedDTO (LobbyController): { roomId, inviteCode }。 */
interface RoomCreatedDTO {
  roomId: number
  inviteCode: string
}

const router = useRouter()
const selfStore = useSelfStore()

const rooms = ref<RoomSummary[]>([])
const loading = ref(false)

// 创建表单
const form = ref({
  name: '',
  visibility: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
  password: '',
  maxPlayers: 3,
})
// 加入表单
const joinForm = ref({
  roomId: '' as string | number,
  password: '',
  inviteCode: '',
  role: 'PLAYER' as 'PLAYER' | 'SPECTATOR',
})

function myUserId(): number {
  return selfStore.user?.id ?? 0
}

async function fetchRooms() {
  loading.value = true
  try {
    const body = await get<ApiResponse<RoomSummary[]>>(
      `${API_URLS.game.listRooms}?page=1&size=20`,
      { userAuth: true },
    )
    rooms.value = body?.data ?? []
  } catch {
    /* 拦截器已提示 */
  } finally {
    loading.value = false
  }
}

async function createRoom() {
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入房间名')
    return
  }
  try {
    const body = await gameCommand<RoomCreatedDTO>(API_URLS.game.createRoom, {
      type: 'CreateRoomCommand',
      clientRequestId: '',
      userId: myUserId(),
      name: form.value.name.trim(),
      visibility: form.value.visibility,
      password: form.value.visibility === 'PRIVATE' && form.value.password ? form.value.password : null,
      maxPlayers: form.value.maxPlayers,
    })
    ElMessage.success(`房间已创建, 邀请码: ${body.data?.inviteCode ?? ''}`)
    router.push(`/game/room/${body.data?.roomId}`)
  } catch {
    /* 拦截器已提示 */
  }
}

async function joinRoom() {
  const id = Number(joinForm.value.roomId)
  if (!Number.isFinite(id)) {
    ElMessage.warning('请输入有效的房间号')
    return
  }
  try {
    await gameCommand(API_URLS.game.joinRoom(id), {
      type: 'JoinRoomCommand',
      clientRequestId: '',
      userId: myUserId(),
      role: joinForm.value.role,
      password: joinForm.value.password || null,
      inviteCode: joinForm.value.inviteCode || null,
    })
    router.push(`/game/room/${id}`)
  } catch {
    /* 拦截器已提示 */
  }
}

function enter(id: number) {
  router.push(`/game/room/${id}`)
}

onMounted(fetchRooms)
</script>

<template>
  <div class="lobby">
    <h2>游戏大厅</h2>

    <el-card class="create-card">
      <template #header>创建房间</template>
      <el-form label-width="80px" :model="form">
        <el-form-item label="房间名">
          <el-input v-model="form.name" placeholder="房间名" />
        </el-form-item>
        <el-form-item label="可见性">
          <el-radio-group v-model="form.visibility">
            <el-radio label="PUBLIC">公开</el-radio>
            <el-radio label="PRIVATE">私密</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.visibility === 'PRIVATE'" label="密码">
          <el-input v-model="form.password" type="password" placeholder="房间密码" show-password />
        </el-form-item>
        <el-form-item label="最大人数">
          <el-input-number v-model="form.maxPlayers" :min="2" :max="4" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="createRoom">创建</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="join-card">
      <template #header>加入房间</template>
      <el-form label-width="80px" :model="joinForm">
        <el-form-item label="房间号">
          <el-input v-model="joinForm.roomId" placeholder="房间号" />
        </el-form-item>
        <el-form-item label="角色">
          <el-radio-group v-model="joinForm.role">
            <el-radio label="PLAYER">玩家</el-radio>
            <el-radio label="SPECTATOR">观战</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="joinForm.password" type="password" placeholder="私密房密码 (可选)" show-password />
        </el-form-item>
        <el-form-item label="邀请码">
          <el-input v-model="joinForm.inviteCode" placeholder="邀请码 (可选)" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="joinRoom">加入</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="rooms-card">
      <template #header>
        <div class="rooms-header">
          <span>公开房间</span>
          <el-button size="small" :loading="loading" @click="fetchRooms">刷新</el-button>
        </div>
      </template>
      <ul class="rooms">
        <li v-for="r in rooms" :key="r.roomId" class="room-item">
          <span class="room-id">#{{ r.roomId }}</span>
          <span class="room-name">{{ r.name }}</span>
          <span class="room-count">{{ r.playerCount }}/{{ r.maxPlayers }}</span>
          <el-tag size="small" :type="r.hasPassword ? 'warning' : 'info'">
            {{ r.hasPassword ? '私密' : '公开' }}
          </el-tag>
          <el-tag size="small">{{ r.state }}</el-tag>
          <el-button size="small" type="primary" @click="enter(r.roomId)">进入</el-button>
        </li>
        <li v-if="!rooms.length && !loading" class="empty">暂无公开房间</li>
      </ul>
    </el-card>

    <div class="guess-entry">
      <el-button text type="primary" @click="router.push('/game/guess')">单人猜谜 →</el-button>
    </div>
  </div>
</template>

<style scoped>
.lobby {
  max-width: 720px;
  margin: 0 auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rooms-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.rooms {
  list-style: none;
  padding: 0;
  margin: 0;
}
.room-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid var(--el-border-color-lighter, #eee);
}
.room-item:last-child {
  border-bottom: none;
}
.room-id {
  width: 60px;
  color: #909399;
}
.room-name {
  flex: 1;
}
.room-count {
  width: 60px;
  color: #606266;
}
.empty {
  text-align: center;
  color: #909399;
  padding: 16px 0;
}
</style>
