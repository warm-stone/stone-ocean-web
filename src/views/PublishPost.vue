<template>
  <div class="post-create-container">
    <div class="post-create-card">
      <div class="post-create-header">
        <h2>发布新帖子</h2>
        <p class="subtitle">分享你的想法和观点</p>
      </div>

      <el-form
        ref="postFormRef"
        :model="postForm"
        :rules="rules"
        label-width="100px"
        class="post-form"
      >
        <!-- 标题输入 -->
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="postForm.title"
            placeholder="请输入帖子标题"
            maxlength="50"
            show-word-limit
            class="form-input"
          />
        </el-form-item>

        <!-- 描述输入 -->
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="postForm.description"
            type="textarea"
            placeholder="请输入帖子详细内容"
            maxlength="100"
            show-word-limit
            class="form-textarea"
          />
        </el-form-item>

        <!-- 封面图片上传（带Bearer认证） -->
        <el-form-item label="封面图片" prop="coverUrl">
          <el-upload
            list-type="picture-card"
            class="avatar-uploader"
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
              <div class="upload-text">点击上传封面图片 <br />支持JPG、PNG格式</div>
            </div>
          </el-upload>
        </el-form-item>

        <!-- 赞同/反对举动名称 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="赞同举动名称" prop="agreeName">
              <el-input
                v-model="postForm.agreeName"
                placeholder="例如：点赞、支持（可选）"
                maxlength="6"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="反对举动名称" prop="disagreeName">
              <el-input
                v-model="postForm.disagreeName"
                placeholder="例如：踩、反对（可选）"
                maxlength="6"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 提交按钮区域 -->
        <el-form-item class="form-actions">
          <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
            发布帖子
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElForm, ElMessage, ElUpload } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { ApiResult, RankList } from '@/utils/interfaces.ts'
import axios from 'axios'
import { getToken } from '@/utils/auth.ts'
import router from '@/router/router.ts'

const backendUrl = import.meta.env.VITE_BASE_URL
const token = getToken()

// 表单引用
const postFormRef = ref<InstanceType<typeof ElForm>>()

// 提交状态
const isSubmitting = ref(false)

// 实际图片上传接口地址（替换为你的后端接口）
const uploadAction = `${backendUrl}/file/upload`

// 2. 上传请求头（自动携带Bearer token）
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${token}`, // 核心：添加认证头
}))

// 表单数据
const postForm = reactive<RankList>({
  title: '',
  description: '',
  coverUrl: '',
  agreeName: '',
  disagreeName: '',
} as RankList)

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入帖子标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  description: [
    { required: false, message: '请输入帖子描述', trigger: 'blur' },
    { min: 0, max: 100, message: '描述长度在 0 到 100 个字符', trigger: 'blur' },
  ],
  coverUrl: [{ required: true, message: '请上传封面图片', trigger: 'change' }],
}

// 图片上传成功处理（根据后端实际返回结构调整）
const handleAvatarSuccess = (response: ApiResult<string>) => {
  // 示例：假设后端返回 { code: 200, data: { url: 'https://xxx.com/image.jpg' } }
  if (response.statusCode === 200 && response.data) {
    postForm.coverUrl = response.data // 保存后端返回的图片URL
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败：' + (response.message || '未知错误'))
  }
}

// 图片上传错误处理
const handleUploadError = (err: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  // 常见错误：token过期/无效
  if (err.response?.status === 401) {
    ElMessage.error('认证失败，请重新登录')
    // 可在此处添加跳转登录页逻辑
  } else {
    ElMessage.error('上传失败，请稍后重试')
  }
}

// 图片上传前验证
const beforeAvatarUpload = (rawFile: File) => {
  const isJpgOrPng = rawFile.type === 'image/jpeg' || rawFile.type === 'image/png'
  if (!isJpgOrPng) {
    ElMessage.error('只能上传JPG/PNG格式的图片')
    return false
  }

  const isLt = rawFile.size / 1024 / 1024 < 1
  if (!isLt) {
    ElMessage.error('图片大小不能超过 1 MB')
    return false
  }

  // 检查token是否存在
  if (!token) {
    ElMessage.error('请先登录')
    return false
  }

  return true
}

// 提交表单
const handleSubmit = async () => {
  if (!postFormRef.value) return

  try {
    isSubmitting.value = true
    const valid = await postFormRef.value.validate()

    if (valid) {
      // 构建完整的帖子数据
      const postData: RankList = {
        ...postForm,
      }

      // 调用帖子发布接口（同样需要携带token）
      await axios.post(`${backendUrl}/rankList/add`, postData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      ElMessage.success('帖子发布成功！')
      handleReset()
    }
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  router.push('/vote4fun')
}
</script>

<style scoped>
.post-create-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 2rem 1rem;
}

.post-create-card {
  width: 100%;
  max-width: 800px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.post-create-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px #c8c8c8;
}

.post-create-header {
  margin-bottom: 2rem;
  text-align: center;
}

.post-create-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.subtitle {
  color: #86909c;
  margin: 0;
  font-size: 1rem;
}

.post-form {
  width: 100%;
}

.form-input,
.form-textarea {
  width: 100%;
  transition: border-color 0.3s ease;
}

.form-input:focus-within,
.form-textarea:focus-within {
  border-color: #4096ff;
  box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.2);
}

.avatar-uploader {
  display: flex;
  align-items: center;
}



.upload-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}


.upload-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
}


.form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}




</style>
