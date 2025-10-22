<script setup lang="ts">
import {Calendar, Iphone, Location, School, Tickets, User} from '@element-plus/icons-vue'
import {onMounted, ref} from 'vue'
import {useRoute} from 'vue-router'
import axios from 'axios'
import { useSelfStore } from '@/utils/piniaCache.ts'

const backendUrl = import.meta.env.VITE_BASE_URL
const route = useRoute()


const name = ref('')
const birthday = ref('')
const email = ref('')
const university = ref('')
const graduationDate = ref('')
const skill = ref('')
const personalLocation = ref('')
const experiences = ref([
  {
    id: 0,
    title: '',
    exp: '',
    ord: 0
  }
])

const fetchData = async () => {
  const token = useSelfStore().token
  const response = await axios.get(`${backendUrl}/biographic/get/${route.params.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  if (response.data.code != 200) {
    alert('请求数据失败')
    console.error(response)
    return
  }

  const _data = response.data.data
  name.value = _data.name
  birthday.value = _data.birthday
  email.value = _data.email
  university.value = _data.university
  graduationDate.value = _data.graduationDate
  skill.value = _data.skill
  experiences.value = _data.experiences
}

onMounted(() => {
  fetchData()
  console.log(route.params.id)
})


</script>

<template>
  <el-row justify="center">
    <el-col :span="12">

      <el-descriptions
          class="margin-top"
          title="简历"
          :column="3"
          border
      >
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon>
                <user/>
              </el-icon>
              姓名
            </div>
          </template>
          {{ name }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon>
                <iphone/>
              </el-icon>
              邮箱
            </div>
          </template>
          {{ email }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon>
                <Calendar/>
              </el-icon>
              出生年月
            </div>
          </template>
          {{ birthday }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon>
                <location/>
              </el-icon>
              所在地
            </div>
          </template>
          {{ personalLocation }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon>
                <school/>
              </el-icon>
              毕业院校
            </div>
          </template>
          {{ university }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon>
                <Calendar/>
              </el-icon>
              毕业日期
            </div>
          </template>
          {{ graduationDate }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon>
                <tickets/>
              </el-icon>
              技能
            </div>
          </template>
          {{ skill }}
        </el-descriptions-item>
      </el-descriptions>
      <div style="margin-top: 10px">

        <el-card
            shadow="hover"
            style="border-radius: 0"
            v-for="(_item, index) in experiences" :key="index"
        >
          <template #header>
            <div class="card-header">
              <el-text tag="b">{{ _item.title }}</el-text>
            </div>
          </template>
          <el-text>{{ _item.exp }}</el-text>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<style scoped>

.cell-item {
  display: flex;
  align-items: center;
}

.margin-top {
  margin-top: 20px;
}
</style>
