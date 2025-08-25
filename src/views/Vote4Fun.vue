<script setup lang="ts">

import {getToken} from "@/utils/auth.ts";
import axios from "axios";
import {onMounted} from "vue";

const backendUrl = import.meta.env.VITE_BASE_URL
async function getRanklist() {

  const token = getToken()
  const response = await axios.get(`${backendUrl}/rankList/page?page=0&size=10`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  console.log(response.data);
}

onMounted(() => {
  getRanklist()
})
</script>

<template>

</template>

<style scoped>

</style>