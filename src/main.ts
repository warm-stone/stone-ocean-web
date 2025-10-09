// import './assets/main.css'

// import 'element-plus/theme-chalk/dark/css-vars.css'
// import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router.ts'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

app.use(router)
app.use(
  ElementPlus,
  // window.ElementPlus,
  {
    // locale: zhCn,
    size: 'small',
    zIndex: 3000
  }) // 使用中文语言包（可选）
app.mount('#app')
