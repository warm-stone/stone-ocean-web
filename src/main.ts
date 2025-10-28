// import './assets/main.css'

// import 'element-plus/theme-chalk/dark/css-vars.css'
// import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router.ts'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { tryIpv6 } from '@/utils/ipv6.ts' // 导入插件

await tryIpv6()

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia).use(router).use(
  ElementPlus,
  // window.ElementPlus,
  {
    // locale: zhCn,
    size: 'small',
    zIndex: 3000,
  },
) // 使用中文语言包（可选）
app.mount('#app')
