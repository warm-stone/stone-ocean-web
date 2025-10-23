<template>
  <div class="register-container">
    <el-card class="register-card" shadow="hover">
      <template v-slot:header>
        <div class="card-header">
          <h2>用户注册</h2>
          <p>请填写以下信息完成注册</p>
          <p>用户信息修改过阵子才会上线，请谨慎填写</p>
        </div>
      </template>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="100px"
        class="register-form"
      >
        <!-- 头像上传 -->
        <el-form-item label="头像" prop="avatarUrl">
          <el-upload
            class="avatar-uploader"
            :action="API_BASE_URL + API_URLS.file.upload"
            :limit="1"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img
              v-if="registerForm.avatarUrl"
              :src="API_BASE_URL + API_URLS.file.lode(registerForm.avatarUrl)"
              class="avatar"
              alt="头像"
            />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>

        <!-- 登录账号 -->
        <el-form-item label="账号" prop="account">
          <el-input v-model="registerForm.account" placeholder="请输入登录账号" maxlength="20" />
        </el-form-item>
        <!-- 用户显示名 -->
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="registerForm.nickname" placeholder="请输入显示名称" maxlength="20" />
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            maxlength="20"
          />
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
            maxlength="20"
          />
        </el-form-item>

        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input
            disabled
            v-model="registerForm.email"
            type="email"
            placeholder="排期中，域名缺少 A 记录并不容易实现"
          />
        </el-form-item>

        <!-- 电话 -->
        <el-form-item label="电话" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号码" maxlength="11" />
        </el-form-item>

        <!-- 性别 -->
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="registerForm.sex">
            <el-radio label="男" />
            <el-radio label="女" />
            <el-radio label="保密" />
          </el-radio-group>
        </el-form-item>

        <!-- 个人描述 -->
        <el-form-item label="个人描述" prop="des">
          <el-input
            v-model="registerForm.des"
            type="textarea"
            placeholder="请输入个人描述（选填）"
            :rows="3"
            maxlength="200"
          />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item class="form-actions">
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            注册
          </el-button>
          <el-button type="default" @click="handleReset" style="margin-left: 10px">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElUpload } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { API_BASE_URL, API_URLS, post } from '@/utils/network.ts'
import type { ApiResult, AuthorizationDTO } from '@/utils/interfaces.ts'
import { beforeAvatarUpload } from '@/utils/img.ts'
import { useSelfStore } from '@/utils/piniaCache.ts'
// 表单引用
const registerFormRef = ref()

// 提交加载状态
const submitLoading = ref(false)

// 路由实例
const router = useRouter()

// 注册表单数据
const registerForm = reactive({
  account: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  email: '',
  phone: '',
  sex: '',
  des: '',
  avatarUrl: '',
})

// 注册表单验证规则
const registerRules = reactive({
  account: [
    { required: true, message: '请输入登录账号', trigger: 'blur' },
    {
      pattern: /^[a-z1-9_]+$/,
      message: '仅允许小写字母、数字、 _',
      trigger: 'blur',
    },
    { min: 4, max: 20, message: '账号长度在 4 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (
        rule: object,
        value: string,
        callback: any, // eslint-disable-line @typescript-eslint/no-explicit-any
      ) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  nickname: [
    { required: true, message: '请输入显示名称', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z1-9\u4e00-\u9fa5_]+$/,
      message: '仅允许大小写字母、数字、中文字符、 _',
      trigger: 'blur',
    },
    { min: 2, max: 10, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  email: [
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '请输入有效的邮箱地址',
      trigger: 'blur',
    },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入有效的手机号码',
      trigger: 'blur',
    },
  ],
})

// 处理头像上传成功
const handleAvatarSuccess = (response: ApiResult<string>) => {
  if (response.statusCode === 200) {
    registerForm.avatarUrl = response.data
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error('头像上传失败：' + (response.message || '未知错误'))
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!registerFormRef.value) return
  // 表单验证
  await registerFormRef.value.validate()

  try {
    // 准备提交数据（转换为后端需要的格式）
    const submitData = {
      account: registerForm.account,
      passwordHash: registerForm.password, // 注意：实际项目中应该在前端进行加密
      nickname: registerForm.nickname,
      email: registerForm.email,
      phone: registerForm.phone,
      sex: registerForm.sex,
      des: registerForm.des,
      avatarUrl: registerForm.avatarUrl,
    }

    // 显示加载状态
    submitLoading.value = true

    // 发送注册请求
    const response = await post<ApiResult<AuthorizationDTO>>(API_URLS.user.add, submitData)

    const {token, user} = response.data
    const userStore =  useSelfStore()
    userStore.setUserInfo(user, token)

    // 注册成功处理
    ElMessage.success('注册成功，请登录')
    await router.push('/')
  } finally {
    // 隐藏加载状态
    submitLoading.value = false
  }
}

// 重置表单
const handleReset = () => {
  if (registerFormRef.value) {
    registerFormRef.value.resetFields()
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 600px;
  border-radius: 8px;
}

.card-header {
  text-align: center;
  padding: 20px 0;
}

.card-header h2 {
  margin: 0 0 10px 0;
}

.card-header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.register-form {
  padding: 0 30px 30px;
}

.avatar-uploader {
  display: flex;
  align-items: center;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border-color: #9ca3af;
  border-style: solid;
  border-width: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.login-link a {
  color: #4096ff;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
