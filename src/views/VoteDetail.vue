<script setup lang="ts">

import VoteComponent from "@/components/VoteComponent.vue";
import {ref} from "vue";


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
const rankMember = ref({
      id: 1,
      rankListId: 1,
      parentId: 1,
      createUserId: 1,
      scoreSum: 10,
      scoreCalculate: 5,
      name: 'name',
      description: 'descriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescription',
      coverUrl: 'url',
      creator: 1,
      creatorName: 'creatorName',
      created_time: 'time'
    }
)
</script>

<template>
  <vote-component :rank-list="rankList" :rank-member="rankMember" />

</template>

<style scoped>
</style>