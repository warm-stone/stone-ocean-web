// 尝试跳转 ipv6
import { ElMessage } from 'element-plus'

import axios from 'axios'

// 检测是否能访问 ipv6.xx.com（通过尝试加载一个小资源）
async function checkIpv6Access(host: string) {
  // 用 ipv6.xx.com 的一个小图标作为检测目标（确保该资源存在）
  const url = `http://${host}/favicon.ico?${Math.random()}` // 加随机数避免缓存
  try {
    await axios.get(url)
    return true
  } catch  {
    return false
  }
}

// 执行检测并跳转
export const tryIpv6 = async () => {
  if (window.location.host.includes('ipv6')) {
    ElMessage.success('接入点： IPV6 网络')
    return
  }
  const ipv6Url = `ipv6.${window.location.host}`
  const canAccessIpv6 = await checkIpv6Access(ipv6Url)
  if (canAccessIpv6) {
    // 优先跳转到 ipv6 域名
    ElMessage.info('跳转到 IPV6 网络')
    window.location.host = ipv6Url
  } else {
    // 否则继续访问原域名（可加载实际内容）
    ElMessage.success('接入点： CLOUDFLARE 代理')
  }
}
