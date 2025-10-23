<script setup lang="ts">
import { type PropType } from 'vue'
import type { RankList } from '@/utils/interfaces.ts'
import { useDark } from '@vueuse/core'
import { API_IMG_URL } from '@/utils/network.ts'

// 获取暗色模式状态（响应式）
const isDark = useDark()

const props = defineProps({
  rankList: {
    type: Object as PropType<RankList>,
    required: true,
  },
})


</script>

<template>
  <div class="post-item" :class="{ 'dark-mode': isDark }">
    <!-- 左侧头像 -->
    <el-avatar fit="cover" shape="square" class="post-avatar" :src="API_IMG_URL(props.rankList.coverUrl)" />

    <!-- 中间内容区：标题 + 描述 + 标签/作者/时间 -->
    <div class="post-content">
      <h3 class="post-title">{{ rankList.title }}</h3>
      <!-- 新增：纯文本描述 -->
      <p class="post-description">{{ rankList.description }}</p>
      <div class="post-meta">
        <el-tag type="info" class="post-tag">{{ rankList.createdTime }}</el-tag>
        <span class="post-author">{{ rankList.creator }}</span>
        <!--        <span class="post-time">{{ timeText }} · {{ lastReplyText }}</span>-->
      </div>
    </div>

    <!-- 右侧回复数 -->
    <!--    <el-badge-->
    <!--      class="post-reply-badge"-->
    <!--      :value="replyCount"-->
    <!--      :max="99"-->
    <!--    />-->
  </div>
</template>
<style scoped>
.el-avatar {
  width: 120px;
  height: 120px;
}

.post-item {
  border-radius: 10px;
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid #eee;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.dark-mode {
  border: 1px solid #555;
}

.post-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 8px #c8c8c8;
}

.post-avatar {
  margin-right: 12px;
}

.post-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.post-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px; /* 缩小与描述的间距 */
}

/* 新增：描述样式 */
.post-description {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px; /* 与下方元信息的间距 */
  white-space: pre-line; /* 保留文本换行（若有需要） */
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  flex-wrap: wrap;
}

.post-tag {
  font-size: 12px !important; /* 覆盖 Element Plus Tag 默认字号 */
  padding: 2px 6px;
}

.post-author {
  font-weight: 500;
}

.post-time {
  color: #999;
}

.post-reply-badge {
  margin-left: 12px;
  align-self: center;
}
</style>
