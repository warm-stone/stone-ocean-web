<script setup lang="ts">

import {onMounted, ref,} from 'vue'
import {getToken} from "@/utils/auth.ts";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BASE_URL
const rankList: any = ref({
  page: 1,
  size: 3,
  records: [
    {
      title: '',
      description: '',
      createdTime: '',

    }
  ]
})
const page = ref(1)
const size = ref(3)

async function getRankList() {
  const token = getToken()
  const response = await axios.get(`${backendUrl}/rankList/page?page=${page.value}&size=${size.value}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  console.log(response.data);
  rankList.value = response.data.data
}

onMounted(() => {
  getRankList()
})
</script>

<template>

  <div class="ranklist">
    <el-table :data="rankList.records" stripe
              size="large"
    >
      <el-table-column prop="title" label="标题" width="180"/>
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="createdTime" label="创建时间" width="180"/>
    </el-table>
    <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        hide-on-single-page='hide-on-single-page'
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="rankList.total"
        @size-change="getRankList"
        @current-change="getRankList"
    />
  </div>
</template>

<style scoped>
.ranklist {
  margin-top: 20px;
  margin-left: 20%;
  margin-right: 20%;
}
</style>