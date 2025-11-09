<script setup lang="ts">
import { onMounted, ref } from 'vue'
import RankListComponent from '@/components/RankListComponent.vue'
import type { ApiResult, PageResult, RankList } from '@/utils/interfaces.ts'
import router from '@/router/router.ts'
import { API_URLS, get } from '@/utils/network.ts'

const rankList = ref<PageResult<RankList>>({
  page: 1,
  size: 0,
  total: 0,
  records: [],
})
const page = ref(1)
const size = ref(5)

async function getRankList() {
  const response = await get<ApiResult<PageResult<RankList>>>(
    API_URLS.rankList.page(page.value, size.value)
  )
  rankList.value = response.data
}

onMounted(() => {
  getRankList()
})

function gotoVoteDetail(rankListItem: RankList) {
  router.push(`/vote4fun/vote_detail/${rankListItem.id}`)
}

function postArticles() {
  router.push(`/vote4fun/publish`)
}
</script>

<template>
  <div class="ranklist">
    <div class="ranklist-header">
      <el-button type="primary" size="default" @click="postArticles"> 发布 </el-button>
    </div>
    <div class="ranklist-main">
      <rank-list-component
        class="ranklist-item"
        v-for="rankItem in rankList.records"
        :key="rankItem.id"
        :rank-list="rankItem"
        @click="gotoVoteDetail(rankItem)"
      />
    </div>
    <el-pagination
      v-model:current-page="page"
      v-model:page-size="size"
      hide-on-single-page="hide-on-single-page"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="rankList.total"
      @size-change="getRankList"
      @current-change="getRankList"
    />
  </div>
</template>

<style scoped>
.ranklist-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.ranklist {
  margin-top: 20px;
  margin-left: 20%;
  margin-right: 20%;
}

/* 响应式处理：空间不足时（如手机屏幕）自动换行 */
@media (max-width: 960px) {
  /* 换行后按钮组居右，文本占满宽度 */
  .ranklist {
    margin-left: 0;
    margin-right: 0;
  }
}

.ranklist-item {
  margin: 3px;
}

.ranklist-main {
  margin-bottom: 20px;
}
</style>
