<!--<template>-->
<!--  <div class="vote-item">-->
<!--    &lt;!&ndash; 第一行：标题、总票数、去最高最低票数、投票/反对按钮 &ndash;&gt;-->
<!--    <el-row :gutter="16" align="middle" class="vote-header">-->
<!--      <el-col :span="6">-->
<!--        <h3 class="title">{{ title }}</h3>-->
<!--      </el-col>-->
<!--      <el-col :span="3">总票数: {{ totalVotes }}</el-col>-->
<!--      <el-col :span="3">去高低后: {{ votesAfterTrim }}</el-col>-->
<!--      <el-col :span="5">-->
<!--        <el-button type="primary" @click="handleVote">投票</el-button>-->
<!--        <el-button type="danger" style="margin-left: 8px;" @click="handleOppose">反对</el-button>-->
<!--      </el-col>-->
<!--    </el-row>-->

<!--    &lt;!&ndash; 第二行：描述文本 + 图片 &ndash;&gt;-->
<!--    <el-row :gutter="16" class="vote-content" v-if="description || imageUrl">-->
<!--      <el-col :span="18">-->
<!--        <p class="description">{{ description }}</p>-->
<!--      </el-col>-->
<!--      <el-col :span="6" v-if="imageUrl">-->
<!--        <el-image :src="imageUrl" style="width: 120px; height: auto;" fit="contain"></el-image>-->
<!--      </el-col>-->
<!--    </el-row>-->

<!--    &lt;!&ndash; 第三行：Tabs（评论 + 投票记录） &ndash;&gt;-->
<!--    <el-tabs v-model="activeTab" class="vote-tabs" style="margin-top: 16px;">-->
<!--      <el-tab-pane label="评论" name="comments">-->
<!--        <div class="comments-container">-->
<!--          &lt;!&ndash; 递归渲染子评论 &ndash;&gt;-->
<!--          <vote-item-->
<!--            v-for="(comment, index) in comments"-->
<!--            :key="index"-->
<!--            v-bind="comment"-->
<!--            @vote="handleChildVote(index)"-->
<!--            @oppose="handleChildOppose(index)"-->
<!--            @add-comment="addChildComment(index)"-->
<!--          />-->
<!--          <el-button type="primary" size="small" @click="addComment">添加评论</el-button>-->
<!--        </div>-->
<!--      </el-tab-pane>-->
<!--      <el-tab-pane label="投票记录" name="records">-->
<!--        <ul class="records-list">-->
<!--          <li v-for="(record, index) in voteRecords" :key="index">-->
<!--            {{ record.user }} - {{ record.time }} - {{ record.action }}-->
<!--          </li>-->
<!--        </ul>-->
<!--      </el-tab-pane>-->
<!--    </el-tabs>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import { ref, defineProps, defineEmits } from 'vue';-->
<!--import { ElMessage } from 'element-plus';-->

<!--// 定义组件接收的属性-->
<!--const props = defineProps({-->
<!--  title: {-->
<!--    type: String,-->
<!--    default: '项目'-->
<!--  },-->
<!--  totalVotes: {-->
<!--    type: Number,-->
<!--    default: 0-->
<!--  },-->
<!--  votesAfterTrim: {-->
<!--    type: Number,-->
<!--    default: 0-->
<!--  },-->
<!--  description: {-->
<!--    type: String,-->
<!--    default: ''-->
<!--  },-->
<!--  imageUrl: {-->
<!--    type: String,-->
<!--    default: ''-->
<!--  },-->
<!--  comments: {-->
<!--    type: Array,-->
<!--    default: () => []-->
<!--  },-->
<!--  voteRecords: {-->
<!--    type: Array,-->
<!--    default: () => []-->
<!--  }-->
<!--});-->

<!--// 定义组件触发的事件-->
<!--const emit = defineEmits(['vote', 'oppose', 'add-comment', 'child-vote', 'child-oppose', 'add-child-comment']);-->

<!--// 激活的 Tab-->
<!--const activeTab = ref('comments');-->

<!--// 处理“投票”按钮-->
<!--const handleVote = () => {-->
<!--  emit('vote');-->
<!--  ElMessage.success('投票成功');-->
<!--};-->

<!--// 处理“反对”按钮-->
<!--const handleOppose = () => {-->
<!--  emit('oppose');-->
<!--  ElMessage.warning('反对成功');-->
<!--};-->

<!--// 处理“添加评论”按钮-->
<!--const addComment = () => {-->
<!--  emit('add-comment', {-->
<!--    title: '新评论',-->
<!--    totalVotes: 0,-->
<!--    votesAfterTrim: 0,-->
<!--    comments: []-->
<!--  });-->
<!--};-->

<!--// 处理子评论的“投票”事件-->
<!--const handleChildVote = (index) => {-->
<!--  emit('child-vote', index);-->
<!--};-->

<!--// 处理子评论的“反对”事件-->
<!--const handleChildOppose = (index) => {-->
<!--  emit('child-oppose', index);-->
<!--};-->

<!--// 处理子评论的“添加评论”事件-->
<!--const addChildComment = (index) => {-->
<!--  emit('add-child-comment', index);-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--.vote-item {-->
<!--  border: 1px solid #e5e7eb;-->
<!--  border-radius: 6px;-->
<!--  padding: 16px;-->
<!--  margin-bottom: 16px;-->
<!--  background-color: #fff;-->
<!--}-->
<!--.vote-header {-->
<!--  margin-bottom: 12px;-->
<!--}-->
<!--.title {-->
<!--  font-size: 18px;-->
<!--  font-weight: 600;-->
<!--  margin: 0;-->
<!--}-->
<!--.vote-content {-->
<!--  margin-bottom: 12px;-->
<!--}-->
<!--.description {-->
<!--  line-height: 1.6;-->
<!--  margin: 0;-->
<!--}-->
<!--.records-list {-->
<!--  padding-left: 20px;-->
<!--}-->
<!--.comments-container {-->
<!--  margin-top: 8px;-->
<!--}-->
<!--</style>-->
