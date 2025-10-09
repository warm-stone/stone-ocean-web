<script setup lang="ts">
import VoteComponent from '@/components/VoteComponent.vue'
import type { RankList, RankMember } from '@/utils/interfaces.ts'
import axios from 'axios'
import { getToken } from '@/utils/auth.ts'

import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const baseUrl = import.meta.env.VITE_BASE_URL
const token = getToken()

const rankList = ref<RankList>({} as RankList)
const rankMember = ref<RankMember[]>([])
onMounted(async () => {

  const route = useRoute()
  await reqRankList(Number(route.params.rankListId))
  await reqRankMember(Number(route.params.rankListId))
})

async function reqRankList(id: string | number) {
  const response = await axios.get(`${baseUrl}/rankList/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  const data = response.data.data
  rankList.value = data
}

async function reqRankMember(id: string | number) {
  const response = await axios.get(`${baseUrl}/rankMember/member/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  const data = response.data.data
  rankMember.value = data
}

// endregion

// region 添加子项
const dialogFlag = ref(false)
const dialogInfo = ref<RankMember>({} as RankMember)

const newRankMember = ref<RankMember>({
} as RankMember)
console.log(newRankMember)

function showAddDialog() {
  dialogFlag.value = true
}

async function addMember() {
  dialogFlag.value = false
  newRankMember.value.rankListId = rankList.value.id
  newRankMember.value.parentId = dialogInfo.value.id
  await axios.post(`${baseUrl}/rankMember/add`, newRankMember.value, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  await reqRankMember(rankList.value.id)
}

// endregion
</script>

<template>
  <el-card class="main_body" shadow="hover">
    <template #header>
      <h3 style="text-align: center">{{ rankList.title }}</h3>

      {{ rankList.description }}
    </template>
    <vote-component :rank-list="rankList" :rank-members="rankMember" />
    <el-button type="primary" class="!ml-0" plain @click="showAddDialog"> 添加 </el-button>
  </el-card>

  <el-dialog v-model="dialogFlag" :title="`【${rankList.title}】 的子项`" width="500">
    <el-form :model="newRankMember" label-width="auto" style="max-width: 600px">
      <el-form-item label="项目名称">
        <el-input v-model="newRankMember.name" />
      </el-form-item>
      <el-form-item label="项目描述">
        <el-input v-model="newRankMember.description" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFlag = false">取消</el-button>
        <el-button type="primary" @click="addMember"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.main_body {
  margin-top: 1rem;
  margin-left: 20%;
  margin-right: 20%;
  border-radius: 20px;
}
</style>
