<template>
  <div class="demo-collapse">
    <el-collapse
        @change="handleCollapseChange"
        expand-icon-position="left">
      <el-collapse-item :name="member.id" v-if="rankMembers" v-for="member in rankMembers" :key="member.id">
        <template #title>
          <el-row style="margin-left: 0; margin-right: 0" :gutter="20">
            <el-col :span="8">
              <el-text size="large">{{ member.name }}</el-text>
            </el-col>
            <el-col :span="2">{{ member.scoreSum }}</el-col>
            <el-col :span="2">{{ member.scoreCalculate }}</el-col>
            <el-col :span="8">
              <el-button type="primary" plain @click.stop.once style="max-width: 60px">
                {{ rankList.agreeName }}
              </el-button>
              <el-button type="danger" plain @click.stop.once style="max-width: 60px">
                {{ rankList.disagreeName }}
              </el-button>
            </el-col>

          </el-row>

        </template>
        <el-tabs :model-value="`subMember`" class="left_20" @tab-click="">
          <el-tab-pane label="子项" name="subMember">

            <vote-component :rank-list="rankList"
                            :rank-members="getSubMembers(member.id)"
            />

            <el-button type="primary" class="!ml-0" plain @click="showAddDialog(member)">
              添加
            </el-button>
          </el-tab-pane>
          <el-tab-pane label="投票记录" name="voteRecord">

          </el-tab-pane>
          <el-tab-pane label="描述" name="desc">
            <el-text size="large">

              {{ member.description }}
            </el-text>
          </el-tab-pane>
        </el-tabs>
      </el-collapse-item>
    </el-collapse>
  </div>

  <el-dialog v-model="dialogFlag" :title="`【${dialogInfo.name}】 的子项`" width="500">
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
        <el-button @click="dialogFlag = false">取消</el-button>
        <el-button type="primary" @click="addMember">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import {type PropType, ref} from 'vue'


import axios from "axios";
import {getToken} from "@/utils/auth.ts";
import type {RankMember, RankList} from "@/utils/interfaces.ts";


const baseUrl = import.meta.env.VITE_BASE_URL
const token = getToken()


defineProps({
  rankMembers: {
    type: Object as PropType<RankMember[]>,
    required: true,
  },
  rankList: {
    type: Object as PropType<RankList>,
    required: true,
  }
})



// 请求子项
const subMembers = ref<Record<string, RankMember[]>>({})

const getSubMembers = (id: number | string) => {
  return subMembers.value[String(id)] || []
}
async function handleCollapseChange(ids: string[], refresh= false) {
  for (const id of ids) {
    console.log('当前处理sub' + id)
    if (subMembers.value[id] && !refresh) {
      continue;
    }
    const response = await axios.get(`${baseUrl}/rankMember/subMember/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    const data = response.data.data
    subMembers.value[id] = data
    console.log(data)
  }
}

// 添加子项
const dialogFlag = ref(false)
const dialogInfo = ref<RankMember>({} as RankMember)

const newRankMember = ref<RankMember>(
    {
      // parentId: props.rankMember.id,
      name: '',
      description: '',

    } as RankMember
)
console.log(newRankMember)

function showAddDialog(member: RankMember) {
  dialogFlag.value = true
  dialogInfo.value = member
}

async function addMember() {
  dialogFlag.value = false
  newRankMember.value.parentId = dialogInfo.value.id
  const response = await axios.post(`${baseUrl}/rankMember/add`, newRankMember.value, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  const data = response.data
  console.log(data)
  await handleCollapseChange([dialogInfo.value.id.toString()], true)
}
</script>

<style scoped>
.left_20 {
  margin-left: 20px;
}
</style>
