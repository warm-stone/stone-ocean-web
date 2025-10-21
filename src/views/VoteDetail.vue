<script setup lang="ts">
import VoteComponent from '@/components/VoteComponent.vue'
import type { ApiResult, RankList, RankMember } from '@/utils/interfaces.ts'

import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { API_BASE_URL, API_URLS, get, post } from '@/utils/network.ts'
import { ElMessage, ElUpload } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth.ts'
import { beforeAvatarUpload } from '@/utils/img.ts'

const rankList = ref<RankList>({} as RankList)
const rankMember = ref<RankMember[]>([])
onMounted(async () => {
  const route = useRoute()
  await reqRankList(Number(route.params.rankListId))
  await reqRankMember(Number(route.params.rankListId))
})

async function reqRankList(id: string | number) {
  const response = await get<ApiResult<RankList>>(API_URLS.rankList.member(id))
  rankList.value = response.data
}

async function reqRankMember(id: string | number) {
  const response = await get<ApiResult<RankMember[]>>(API_URLS.rankMember.memberById(id))
  rankMember.value = response.data
}

// endregion

// region 表单校验

const registerFormRef = ref()
// 注册表单验证规则
const registerRules = reactive({
  name: [
    { required: true, message: '请输入内容', trigger: 'blur' },
  ],
  coverUrl: [
    { required: false },
  ],
})

// endregion

// region 添加子项
const dialogFlag = ref(false)
const dialogInfo = ref<RankMember>({} as RankMember)

const newRankMember = ref<RankMember>({} as RankMember)
console.log(newRankMember)

function showAddDialog() {
  dialogFlag.value = true
}

async function addMember() {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate()
  dialogFlag.value = false
  newRankMember.value.rankListId = rankList.value.id
  newRankMember.value.parentId = dialogInfo.value.id
  await post<ApiResult<boolean>>(API_URLS.rankMember.add, newRankMember.value)

  await reqRankMember(rankList.value.id)
}

// endregion

// region 图片上传
// 实际图片上传接口地址
const uploadAction = API_BASE_URL + API_URLS.file.upload

// 2. 上传请求头（自动携带Bearer token）
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${getToken()}`, // 核心：添加认证头
}))

// 处理头像上传成功
const handleAvatarSuccess = (response: ApiResult<string>) => {
  if (response.statusCode === 200) {
    newRankMember.value.coverUrl = response.data
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error('头像上传失败：' + (response.message || '未知错误'))
  }
}

// 错误处理
const handleUploadError = () => {
  ElMessage.error('头像上传失败：未知错误')
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
    <el-button type="primary" class="!ml-0" plain @click="showAddDialog"> 添加</el-button>
  </el-card>

  <el-dialog v-model="dialogFlag" :title="`【${rankList.title}】 的项目`" width="500">
    <el-form
      ref="registerFormRef"
      :model="newRankMember"
      :rules="registerRules"
      label-width="auto"
      style="max-width: 600px"
    >
      <!-- 封面图片上传（带Bearer认证） -->
      <el-form-item label="封面图片" prop="coverUrl">
        <el-upload
          list-type="picture-card"
          class="avatar-uploader"
          :limit="1"
          :action="uploadAction"
          :headers="uploadHeaders"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          :on-error="handleUploadError"
        >
          <div class="upload-placeholder">
            <el-icon class="upload-icon">
              <Plus />
            </el-icon>
            <div class="upload-text">点击上传封面图片 <br />支持JPG、PNG、SVG格式</div>
          </div>
        </el-upload>
      </el-form-item>
      <el-form-item label="内容" prop="name">
        <el-input v-model="newRankMember.name" />
      </el-form-item>
      <el-form-item label="项目描述">
        <el-input v-model="newRankMember.description" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFlag = false">取消</el-button>
        <el-button type="primary" @click="addMember"> 确认</el-button>
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

.avatar-uploader {
  display: flex;
  align-items: center;
}

/* 响应式处理：空间不足时（如手机屏幕）自动换行 */
@media (max-width: 960px) {
  /* 换行后按钮组居右，文本占满宽度 */
  .main_body {
    margin-left: 0;
    margin-right: 0;
  }

}
.upload-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: gray;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
}
</style>
