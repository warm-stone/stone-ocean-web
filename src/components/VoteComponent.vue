<template>
  <div class="demo-collapse">
    <el-collapse v-model="activeNames"
                 @change="handleChange($event)"
                 expand-icon-position="left">
      <el-collapse-item name="1">
        <template #title>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-text size="large">{{ rankMember.name }}</el-text>
            </el-col>
            <el-col :span="2">{{ rankMember.scoreSum }}</el-col>
            <el-col :span="2">{{ rankMember.scoreCalculate }}</el-col>
            <el-col :span="8">
              <el-button type="primary" @click.stop style="max-width: 60px">{{ rankList.agreeName }}</el-button>
              <el-button type="primary" @click.stop style="max-width: 60px">{{ rankList.disagreeName }}</el-button>
            </el-col>33

          </el-row>

        </template>
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="">
          <el-tab-pane label="子项" name="first">
            <template v-if="subMembers" v-for="subMember in subMembers">

              <vote-component :rank-list="rankList" :rank-member="subMember"></vote-component>
            </template>
          </el-tab-pane>
          <el-tab-pane label="投票记录" name="second">
            <ul v-infinite-scroll="load" class="infinite-list" style="overflow: auto">
              <li v-for="i in count" :key="i" class="infinite-list-item">{{ i }}</li>
            </ul>
          </el-tab-pane>
          <el-tab-pane label="描述" name="second">
            <el-text size="large">

              {{ rankMember.description }}
            </el-text>
          </el-tab-pane>
        </el-tabs>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script lang="ts" setup>
import {type PropType, ref} from 'vue'

import type {CollapseModelValue} from 'element-plus'


const activeNames = ref(['1'])
const handleChange = (val: CollapseModelValue) => {
  console.log(val)
  subMembers.value = [
    {

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
    }, {

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
    }, {

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
    }]
}

interface RankMember {
  rankListId: number,
  parentId: number,
  createUserId: number,
  scoreSum: number,
  scoreCalculate: number,
  name: string,
  description: string,
  coverUrl: string,
  creator: number,
  creatorName: string,
  created_time: string
}

interface RankList {
  id: number,
  title: String,
  description: String,
  coverUrl: String,
  agreeName: String,
  disagreeName: String,
  creator: number,

}

const props = defineProps({
  rankMember: {
    type: Object as PropType<RankMember>,
    required: true,
  },
  rankList: {
    type: Object as PropType<RankList>,
    required: true,
  }
})

const subMembers = ref<RankMember[]>([])


</script>
