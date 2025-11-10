<template>
  <div class="main-div">
    <div class="right-button-div">
      <el-button type="primary" size="default" @click="router.push(`/game/publish`)"> 发布 </el-button>
    </div>
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2 :columns="columns" :data="data" :width="width" :height="height" />
      </template>
    </el-auto-resizer>
  </div>
</template>

<script lang="ts" setup>
import { ElAutoResizer } from 'element-plus'
import { onMounted, ref } from 'vue'
import {
  type ApiResult,
  type Game,
  getGameTypeValueByKey,
  type PageResult,
} from '@/utils/interfaces.ts'
import { API_URLS, get } from '@/utils/network.ts'
import { getByUserId } from '@/utils/cacheTool.ts'
import router from '@/router/router.ts'

const columns = [
  {
    key: 'id',
    dataKey: 'id',
    title: 'ID',
    width: 150,
  },
  {
    key: 'name',
    dataKey: 'name',
    title: '名称',
    width: 150,
  },
  {
    key: 'type',
    dataKey: 'type',
    title: '类型',
    width: 150,
  },
  {
    key: 'creatorName',
    dataKey: 'creatorName',
    title: '创建者',
    width: 150,
  },
  {
    key: 'delete',
    dataKey: 'delete',
    title: '删除',
    width: 150,
  },
]
const data = ref<Game[]>([])

const page = ref(1)
const size = ref(5)
const type = ref('')
onMounted(() => loadGameData())

async function loadGameData() {
  const response = await get<ApiResult<PageResult<Game>>>(
    API_URLS.game.page(page.value, size.value, type.value),
  )
  try {
    for (const game of response.data.records) {
        const user = await getByUserId(game.creator)
        game.creatorName = user.nickname
        game.type = getGameTypeValueByKey(game.type)
    }
  } catch (error) {
    console.log(error)
  }
  data.value = response.data.records
}
</script>

<style scoped>
.main-div {
  margin-top: 20px;
  margin-left: 20%;
  margin-right: 20%;
  height: 400px;
}

/* 响应式处理*/
@media (max-width: 960px) {
  .main-div {
    margin-left: 0;
    margin-right: 0;
  }
}
.right-button-div {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
</style>
