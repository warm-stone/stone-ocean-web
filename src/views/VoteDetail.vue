<script setup lang="ts">
import VoteComponent from "@/components/VoteComponent.vue";
import {onMounted, ref} from "vue";
import type {RankMember} from "@/utils/interfaces.ts";
import axios from "axios";
import {getToken} from "@/utils/auth.ts";

const baseUrl = import.meta.env.VITE_BASE_URL
const token = getToken()


const rankList = ref({
      id: 1,
      title: 'bt',
      description: 'description',
      coverUrl: 'coverUrl',
      agreeName: '升级',
      disagreeName: '守护',
      creator: 1,
    }
)
const rankMember = ref<RankMember[]>([])
onMounted(async () => {

  const response = await axios.get(`${baseUrl}/rankMember/member/${rankList.value.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  const data = response.data.data
  rankMember.value = data
  console.log(data)
})

</script>

<template>
  <el-card class="main_body" shadow="hover">
    <vote-component :rank-list="rankList" :rank-members="rankMember"/>
  </el-card>

</template>


<style scoped>
.main_body {
  margin-top: 1rem;
  margin-left: 20%;
  margin-right: 20%;
  border-radius: 20px;
}
</style>