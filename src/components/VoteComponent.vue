<template>
  <div>
    <el-collapse @change="handleCollapseChange" expand-icon-position="left">
      <ul>
        <el-collapse-item :name="member.id" v-for="member in sortedRankMembers" :key="member.id">
          <template #title>
            <!-- 容器：Flex布局，横向排列，空间不足自动换行 -->
            <div class="vote-container">
              <!-- 1. 左侧头像：固定左上角，与顶部对齐 -->
              <el-avatar
                v-if="member.coverUrl"
                fit="cover"
                shape="square"
                class="avatar"
                :src="API_BASE_URL + API_URLS.file.lode(member.coverUrl)"
                size="large"
              />

              <!-- 2. 中间大段文本：占据图片到气泡之间的所有空间，允许换行 -->
              <div class="text-content">
                <el-text size="large">{{ member.name }}</el-text>
                <!-- 大段文本 -->
              </div>

              <!-- 3. 票数气泡：紧挨着文本右侧，视觉突出 -->
              <div class="vote-bubble">
                {{ member.scoreSum }}
              </div>

              <!-- 4. 右侧投票按钮组：最右侧，空间不足时换行到下方 -->
              <div class="button-group">
                <el-button
                  type="primary"
                  plain
                  @click.stop.once="voteToMember(member.id, 1, member)"
                  style="max-width: 60px"
                >
                  <template v-if="rankList.agreeName">{{ rankList.agreeName }}</template>
                  <template v-else>赞</template>
                </el-button>
                <el-button
                  type="danger"
                  plain
                  @click.stop.once="voteToMember(member.id, -1, member)"
                  style="max-width: 60px"
                >
                  <template v-if="rankList.disagreeName">{{ rankList.disagreeName }}</template>
                  <template v-else>踩</template>
                </el-button>
              </div>
            </div>
          </template>
          <el-tabs
            :model-value="`subMember`"
            class="left_20"
            @tab-click="(pane: TabsPaneContext) => reqVoteRecordSumInfo(pane, member.id)"
          >
            <el-tab-pane label="评论。。。" name="subMember">
              <vote-component :rank-list="rankList" :rank-members="getSubMembers(member.id)" />

              <el-button type="primary" class="!ml-0" plain @click="showAddDialog(member)">
                回复
              </el-button>
            </el-tab-pane>
            <el-tab-pane label="投票记录" name="voteRecord">
              <el-scrollbar max-height="400px">
                <el-card
                  shadow="hover"
                  v-for="voteRecordSumItem in getVoteRecordSum(member.id)"
                  :key="voteRecordSumItem.creator"
                >
                  {{ voteRecordSumItem }}
                </el-card>
              </el-scrollbar>
            </el-tab-pane>
            <el-tab-pane label="描述" name="desc">
              <el-text size="large">
                {{ member.description }}
              </el-text>
            </el-tab-pane>
          </el-tabs>
        </el-collapse-item>
      </ul>
    </el-collapse>
  </div>

  <el-dialog v-model="dialogFlag" :title="`【${dialogInfo.name}】 的回复`" width="500">
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
        <el-input v-model="newRankMember.description" type="textarea" placeholder="不建议输入" />
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

<script lang="ts" setup>
import { type PropType, ref, computed, reactive } from 'vue'

import type {
  RankMember,
  RankList,
  VoteRecord,
  ApiResult,
  VoteRecordSumDTO,
} from '@/utils/interfaces.ts'
import { ElMessage, ElUpload, type TabsPaneContext } from 'element-plus'
import { API_BASE_URL, API_URLS, get, post } from '@/utils/network.ts'
import { beforeAvatarUpload } from '@/utils/img.ts'
import { Plus } from '@element-plus/icons-vue'
import { useSelfStore } from '@/utils/piniaCache.ts'


const props = defineProps({
  rankMembers: {
    type: Object as PropType<RankMember[]>,
    required: true,
  },
  rankList: {
    type: Object as PropType<RankList>,
    required: true,
  },
})

const sortedRankMembers = computed(() => {
  // 先检查数据是否存在，避免错误
  if (!props.rankMembers || !Array.isArray(props.rankMembers)) {
    return []
  }

  // 使用 .slice() 或扩展运算符创建副本，避免修改原 prop
  return [...props.rankMembers].sort((a, b) => b.scoreSum - a.scoreSum)
})

// region  请求子项
const subMembers = ref<Record<string, RankMember[]>>({})

const getSubMembers = (id: number | string) => {
  return subMembers.value[String(id)] || []
}

async function handleCollapseChange(ids: string[], refresh = false) {
  for (const id of ids) {
    if (subMembers.value[id] && !refresh) {
      continue
    }
    const response = await get<ApiResult<RankMember[]>>(API_URLS.rankMember.subMemberById(id))
    subMembers.value[id] = response.data
  }
}

// endregion

// region 投票

async function voteToMember(id: number | string, voteCount: number, member: RankMember) {
  member.scoreSum += voteCount
  dialogFlag.value = false
  const voteData = {
    rankMemberId: id,
    voteCount: voteCount,
  } as VoteRecord
  await post<ApiResult<object>>(API_URLS.vote.vote, voteData)
}

// endregion

// region 请求投票记录

const voteRecordSumInfo = ref<Record<string, VoteRecordSumDTO[]>>({})

const getVoteRecordSum = (id: number | string) => {
  return voteRecordSumInfo.value[String(id)] || []
}

async function reqVoteRecordSumInfo(pane: TabsPaneContext, id: number | string, refresh = false) {
  if (pane.paneName != 'voteRecord') {
    return
  }
  if (voteRecordSumInfo.value[id] && !refresh) {
    return
  }
  const response = await get<ApiResult<VoteRecordSumDTO[]>>(API_URLS.vote.statistics(id))
  voteRecordSumInfo.value[id] = response.data
}

// endregion

// region 添加子项
const dialogFlag = ref(false)
const dialogInfo = ref<RankMember>({} as RankMember)

const newRankMember = ref<RankMember>({
  // parentId: props.rankMember.id,
  name: '',
  description: '',
} as RankMember)

function showAddDialog(member: RankMember) {
  dialogFlag.value = true
  dialogInfo.value = member
}

async function addMember() {
  dialogFlag.value = false
  newRankMember.value.parentId = dialogInfo.value.id
  await post(API_URLS.rankMember.add, newRankMember.value)
  await handleCollapseChange([dialogInfo.value.id.toString()], true)
}

// endregion


const userStore = useSelfStore()
// region 图片上传
// 实际图片上传接口地址
const uploadAction = API_BASE_URL + API_URLS.file.upload

// 2. 上传请求头（自动携带Bearer token）
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`, // 核心：添加认证头
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
</script>

<style scoped>
.left_20 {
  margin-left: 20px;
}

/* 容器核心样式：横向排列，元素顶部对齐，预留内边距 */
.vote-container {
  display: flex;
  align-items: flex-start; /* 所有元素顶部对齐（头像保持左上角） */
  gap: 16px; /* 元素间间距 */
  padding: 12px;
  border-radius: 8px;
  flex-wrap: wrap; /* 空间不足时自动换行 */
  --el-box-shadow: 'hover';
}

/* 头像样式：固定尺寸，确保左上角位置 */
.avatar {
  width: 56px;
  height: 56px;
  flex-shrink: 0; /* 不被挤压变形 */
}

/* 中间大段文本：占据剩余空间，允许换行 */
.text-content {
  flex: 1; /* 填充图片到气泡之间的所有空间 */
  min-width: 120px; /* 最小宽度，避免文本被压太窄 */
  line-height: 1.6; /* 大段文本行高更易读 */
  padding: 4px 0; /* 与头像顶部对齐 */
}

/* 票数气泡：视觉突出，紧挨着文本右侧 */
.vote-bubble {
  margin-top: 20px;
  background-color: #409eff;
  color: white;
  border-radius: 50%;
  width: 16px; /* 调整为合适尺寸，比如32px */
  height: 16px; /* 与宽度保持一致 */
  flex-shrink: 0; /* 关键：禁止Flex布局压缩该元素 */
  display: flex; /* 可选：让内部文字居中 */
  align-items: center;
  justify-content: center;
  text-size-adjust: auto;
}

/* 按钮组：最右侧，紧凑排列 */
.button-group {
  display: flex;
  gap: 8px;
  margin-top: 15px; /* 与头像/文本顶部对齐 */
}

/* 响应式处理：空间不足时（如手机屏幕）自动换行 */
@media (max-width: 960px) {
  /* 换行后按钮组居右，文本占满宽度 */
  .button-group {
    width: 100%;
    justify-content: flex-end; /* 保持按钮在右侧 */
    margin-top: 12px; /* 与上方元素拉开距离 */
  }

  /* 文本区域占满剩余宽度 */
  .text-content {
    min-width: 0;
  }
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
