<template>
  <div class="demo-collapse">
    <el-collapse
        @change.once="handleChange($event)"
        expand-icon-position="left">
      <el-collapse-item name="1">
        <template #title>
          <el-row style="margin-left: 0; margin-right: 0" :gutter="20">
            <el-col :span="8">
              <el-text size="large">{{ rankMember.name }}</el-text>
            </el-col>
            <el-col :span="2">{{ rankMember.scoreSum }}</el-col>
            <el-col :span="2">{{ rankMember.scoreCalculate }}</el-col>
            <el-col :span="8">
              <el-button type="primary" plain @click.stop.once style="max-width: 60px">{{
                  rankList.agreeName
                }}
              </el-button>
              <el-button type="danger" plain @click.stop.once style="max-width: 60px">{{
                  rankList.disagreeName
                }}
              </el-button>
            </el-col>

          </el-row>

        </template>
        <el-tabs class="left_20" v-model="activeName" @tab-click="">
          <el-tab-pane label="子项" name="subMember">
            <template v-if="subMembers" v-for="subMember in subMembers">

              <vote-component :rank-list="rankList" :rank-member="subMember"></vote-component>
            </template>

            <el-button type="primary" class="!ml-0" plain @click="dialogFormVisible = true">
              添加
            </el-button>
          </el-tab-pane>
          <el-tab-pane label="投票记录" name="voteRecord">
            <ul v-infinite-scroll="load" class="infinite-list" style="overflow: auto">
              <li v-for="i in count" :key="i" class="infinite-list-item">{{ i }}</li>
            </ul>
          </el-tab-pane>
          <el-tab-pane label="描述" name="desc">
            <el-text size="large">

              {{ rankMember.description }}
            </el-text>
          </el-tab-pane>
        </el-tabs>
      </el-collapse-item>
    </el-collapse>
  </div>
  <el-dialog v-model="dialogFormVisible" :title="`【${rankMember.name}】 的子项`" width="500">
    <el-form :model="newRankMember" label-width="auto" style="max-width: 600px">
      <el-form-item label="项目名称">
        <el-input v-model="newRankMember.name"/>
      </el-form-item>
      <el-form-item label="项目描述">
        <el-input v-model="newRankMember.description" type="textarea"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="addMember">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import {type PropType, ref} from 'vue'

import type {CollapseModelValue} from 'element-plus'
import axios from "axios";
import {getToken} from "@/utils/auth.ts";


const baseUrl = import.meta.env.VITE_BASE_URL
const token = getToken()
const activeName = ref('subMember')
const handleChange = (val: CollapseModelValue) => {
  console.log(val)
  subMembers.value = [
    {
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
    }, {

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
    }, {

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
    }]
}

interface RankMember {
  id: number,
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

// 添加子项
const dialogFormVisible = ref(false)

const newRankMember = ref<RankMember>(
    {
      parentId: props.rankMember.id,
      name: '',
      description: '',

    } as RankMember
)
console.log(newRankMember)
async function addMember() {
  dialogFormVisible.value = false

  const response = await axios.post(`${baseUrl}/rankMember/add`, newRankMember.value, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  const data = response.data
  console.log(data)
}
</script>

<style scoped>
.left_20 {
  margin-left: 20px;
}
</style>
