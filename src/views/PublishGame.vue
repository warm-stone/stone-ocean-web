<script setup lang="ts">
import { ElForm, ElMessage } from 'element-plus'
import { computed, reactive, ref } from 'vue'
import { type Game, GameType } from '@/utils/interfaces.ts'
import router from '@/router/router.ts'
import { API_URLS, post } from '@/utils/network.ts'

const options= Object.entries(GameType).slice(0, -1).map((entry) => {
  return {
    label: entry[1],
    value: entry[0],
  }
})

const hintText = computed(() => {
  if (postForm.type == 'CAIYAN_BAIKE') {
    return '答案为白名单字符，不须要作答'
  }
  else if (postForm.type == 'GUESSING') {
    return '多个答案使用“、”分割，答对一个即为回答正确'
  }
  return ''
})

// 表单数据
const postForm = reactive<Game>({} as Game)
// 表单验证规则
const rules = computed(() => {
  return {
    type: [
      { required: true, message: '请选择题目类型', trigger: 'blur' },
    ],
    name: [
      { required: true, message: '请输入题目标题', trigger: 'blur' },
      { min: 2, max: 24, message: '标题长度在 2 到 24 个字符', trigger: 'blur' },
    ],
    prompt: [
      { required: false, message: '请输入题目提示', trigger: 'blur' },
      { min: 0, max: 100, message: '描述长度在 0 到 64 个字符', trigger: 'blur' },
    ],
    content: [{ required: true, message: '请输入题目', trigger: 'blur' }],
    answer:[{
      required: postForm.type == 'GUESSING',
      message: '请输入答案',
      trigger: 'blur'
    }]
  }
})


// 表单引用
const postFormRef = ref<InstanceType<typeof ElForm>>()
// 提交状态
const isSubmitting = ref(false)
// 提交表单
const handleSubmit = async () => {
  if (!postFormRef.value) return

  try {
    const valid = await postFormRef.value.validate()
    isSubmitting.value = true

    if (valid) {

      // 调用帖子发布接口
      await post(API_URLS.game.add, postForm)

      ElMessage.success('发布成功！')
      router.back()
    }
  } catch (error) {
    console.error('提交失败:', error)
  }
}


</script>

<template>

  <div class="post-create-container">
  <div class="post-create-card">
    <div class="post-create-header">
      <h2>创建游戏</h2>
    </div>
    <el-form
      ref="postFormRef"
      :model="postForm"
      :rules="rules"
      label-width="100px">
      <el-form-item label="类型" prop="type">

        <el-select v-model="postForm.type" placeholder="题目类型" style="width: 120px">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="postForm.name"
          placeholder="请输题目名称"
          maxlength="24"
          show-word-limit
          class="form-input"
        />
      </el-form-item>
      <el-form-item label="提示" prop="prompt">
        <el-input
          v-model="postForm.prompt"
          placeholder="请输题目提示"
          maxlength="64"
          show-word-limit
          class="form-input"
        />
      </el-form-item>

      <el-form-item label="题目" prop="content">
        <el-input
          v-model="postForm.content"
          placeholder="请输题目内容"
          :rows="10"
          type="textarea"
          class="form-input"
        />
      </el-form-item>

      <el-form-item label="答案" prop="answer">
        <el-input
          v-model="postForm.answer"
          :placeholder="hintText"
          maxlength="100"
          show-word-limit
          :rows="3"
          type="textarea"
          class="form-input"
        />
      </el-form-item>

      <!-- 提交按钮区域 -->
      <el-form-item class="form-actions">
        <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
          创建
        </el-button>
        <el-button @click="router.back()">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
  </div>

</template>

<style scoped>

.post-create-header {
  margin-bottom: 2rem;
  text-align: center;
}

.post-create-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: 600;
}

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
</style>
