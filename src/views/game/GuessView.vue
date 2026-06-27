<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { get, post, API_URLS, type ApiResponse } from '@/utils/network.ts'

/** 后端 GuessQuestion entity (game/entity/GuessQuestion.java), 前端关注字段。 */
interface GuessQuestion {
  id: number
  content: string
  options: string[]
  answerIndex: number
  category?: string | null
}

const question = ref<GuessQuestion | null>(null)
const selected = ref<number | null>(null)
const revealed = ref(false)
const lastCorrect = ref<boolean | null>(null)
const loading = ref(false)

// 新增题目表单 (GuessQuestionCreateDTO: content/options/answerIndex/category)
const createForm = ref({
  content: '',
  options: ['', ''],
  answerIndex: 0,
  category: '',
})

async function fetchRandom() {
  loading.value = true
  selected.value = null
  revealed.value = false
  lastCorrect.value = null
  try {
    const body = await get<ApiResponse<GuessQuestion>>(API_URLS.game.guessRandom, { userAuth: true })
    question.value = body?.data ?? null
  } catch {
    question.value = null
  } finally {
    loading.value = false
  }
}

async function answer(idx: number) {
  if (!question.value || revealed.value) return
  selected.value = idx
  try {
    const body = await post<ApiResponse<boolean>>(API_URLS.game.guessAnswer, {
      id: question.value.id,
      answerIndex: idx,
    })
    lastCorrect.value = body?.data === true
    revealed.value = true
    if (lastCorrect.value) ElMessage.success('回答正确!')
    else ElMessage.error('回答错误')
  } catch {
    /* 拦截器已提示 */
  }
}

async function submitQuestion() {
  if (!createForm.value.content.trim()) {
    ElMessage.warning('请输入题干')
    return
  }
  const opts = createForm.value.options.map((o) => o.trim()).filter((o) => o.length > 0)
  if (opts.length < 2) {
    ElMessage.warning('至少 2 个选项')
    return
  }
  if (createForm.value.answerIndex < 0 || createForm.value.answerIndex >= opts.length) {
    ElMessage.warning('正确选项下标无效')
    return
  }
  try {
    await post<ApiResponse<GuessQuestion>>(API_URLS.game.guessQuestion, {
      content: createForm.value.content.trim(),
      options: opts,
      answerIndex: createForm.value.answerIndex,
      category: createForm.value.category.trim() || null,
    })
    ElMessage.success('题目已提交 (不审核, 直接发布)')
    createForm.value = { content: '', options: ['', ''], answerIndex: 0, category: '' }
    fetchRandom()
  } catch {
    /* 拦截器已提示 */
  }
}

function addOption() {
  if (createForm.value.options.length < 6) createForm.value.options.push('')
}
function removeOption(i: number) {
  if (createForm.value.options.length > 2) createForm.value.options.splice(i, 1)
}

onMounted(fetchRandom)
</script>

<template>
  <div class="guess-view">
    <h2>单人猜谜</h2>

    <el-card class="question-card" v-loading="loading">
      <template #header>
        <div class="q-header">
          <span>{{ question ? question.category ?? '猜谜' : '加载中…' }}</span>
          <el-button size="small" @click="fetchRandom" :disabled="loading">换一题</el-button>
        </div>
      </template>
      <div v-if="question">
        <p class="content">{{ question.content }}</p>
        <div class="options">
          <el-button
            v-for="(opt, i) in question.options"
            :key="i"
            class="option"
            :type="revealed && i === question.answerIndex ? 'success' : revealed && i === selected ? 'danger' : 'default'"
            :disabled="revealed"
            @click="answer(i)"
          >
            {{ String.fromCharCode(65 + i) }}. {{ opt }}
          </el-button>
        </div>
        <p v-if="revealed" class="result" :class="{ correct: lastCorrect }">
          {{ lastCorrect ? '✓ 正确' : '✗ 错误, 正确答案: ' + String.fromCharCode(65 + question.answerIndex) }}
        </p>
      </div>
      <el-empty v-else description="暂无题目" />
    </el-card>

    <el-card class="create-card">
      <template #header>新增题目 (不审核, 直接发布)</template>
      <el-form label-width="90px" :model="createForm">
        <el-form-item label="题干">
          <el-input v-model="createForm.content" type="textarea" :rows="2" placeholder="题干" />
        </el-form-item>
        <el-form-item
          v-for="(_, i) in createForm.options"
          :key="i"
          :label="'选项 ' + String.fromCharCode(65 + i)"
        >
          <el-input v-model="createForm.options[i]" :placeholder="'选项 ' + String.fromCharCode(65 + i)" />
          <el-button
            v-if="createForm.options.length > 2"
            link
            type="danger"
            @click="removeOption(i)"
          >删除</el-button>
          <el-radio v-model="createForm.answerIndex" :label="i">正确</el-radio>
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="createForm.category" placeholder="自由分类 (可选)" />
        </el-form-item>
        <el-form-item>
          <el-button v-if="createForm.options.length < 6" @click="addOption">+ 选项</el-button>
          <el-button type="primary" @click="submitQuestion">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.guess-view {
  max-width: 640px;
  margin: 0 auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.q-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.content {
  font-size: 16px;
  margin: 8px 0;
}
.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.option {
  justify-content: flex-start;
  white-space: normal;
}
.result {
  margin-top: 8px;
  color: #f56c6c;
}
.result.correct {
  color: #67c23a;
}
</style>
