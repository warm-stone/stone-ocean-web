<script lang="ts" setup>
import { useDark, useToggle } from '@vueuse/core'
import { Moon, Sunny } from '@element-plus/icons-vue'
import Login from '@/components/CommonLogin.vue'
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'

const isDark = useDark()
const toggleDark = useToggle(isDark)

// 晃动检测相关变量
const shakeCount = ref(0)
const lastPosition = ref({ x: 0, y: 0 })
const startTime = ref<number | null>(null)
const shakeThreshold = 3 // 触发提示的晃动次数
const timeWindow = 3000 // 时间窗口(毫秒)

function gotoVOTE() {
  window.location.href = '/vote4fun'
}

function gotoGames() {
  window.location.href = '/games'
}

// 处理鼠标移动事件
function handleMouseMove(e: MouseEvent) {
  // 初始化起始时间和位置
  if (!startTime.value) {
    startTime.value = Date.now()
    lastPosition.value = { x: e.clientX, y: e.clientY }
    return
  }

  // 计算与上一次位置的差值
  const deltaX = Math.abs(e.clientX - lastPosition.value.x)
  const deltaY = Math.abs(e.clientY - lastPosition.value.y)

  // 设定一个最小移动距离作为"晃动"的判断标准
  if (deltaX > 50 || deltaY > 50) {
    shakeCount.value++
    lastPosition.value = { x: e.clientX, y: e.clientY }
  }

  // 检查是否超过时间窗口
  if (Date.now() - startTime.value > timeWindow) {
    resetShakeDetection()
  }

  // 检查是否达到晃动次数阈值
  if (shakeCount.value >= shakeThreshold) {
    if (Math.random() > 0.5) {
      ElMessage.error('好爽好爽')
    } else {
      ElMessage.success('成功摸鱼')
    }
    resetShakeDetection()
  }
}

// 重置晃动检测
function resetShakeDetection() {
  shakeCount.value = 0
  startTime.value = null
  lastPosition.value = { x: 0, y: 0 }
}

// 跳转链接
const blogUrl = computed(() => {
  if (window.location.host.startsWith('ipv6')) {
    return 'https://ipv6.blog.warmstone.top'
  } else {
    return 'https://blog.warmstone.top'
  }
})
</script>

<template>
  <el-menu class="el-menu-demo" mode="horizontal" :ellipsis="false">
    <el-menu-item index="1"><a :href="blogUrl" style="text-decoration: none">博客</a></el-menu-item>
    <el-menu-item index="2" @click="gotoVOTE"> 广场</el-menu-item>
    <!-- 为index="3"的菜单添加鼠标移动事件监听 -->
    <el-sub-menu index="3" @mousemove="handleMouseMove">
      <template #title>🐟🐠🐳</template>
      <el-menu-item index="3-1" @click="gotoGames">游戏</el-menu-item>
      <el-menu-item index="3-2">房间-开发中</el-menu-item>
    </el-sub-menu>
    <el-menu-item index="10">
      <el-switch
        v-model="isDark"
        style="--el-switch-on-color: #0960bd; --el-switch-off-color: #f60"
        inline-prompt
        :active-icon="Moon"
        :inactive-icon="Sunny"
        @change="toggleDark"
      />
    </el-menu-item>
    <el-menu-item index="11">
      <login />
    </el-menu-item>
  </el-menu>
</template>

<style scoped>
.el-menu--horizontal > .el-sub-menu:nth-child(3) {
  margin-right: auto;
}
</style>
