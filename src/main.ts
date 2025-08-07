import { createApp } from 'vue'
import './style.css'
import App from './App.vue'


// 引入 Element Plus 及其 CSS
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 如果需要国际化（中文）
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)

app.use(ElementPlus, { locale: zhCn }) // 使用中文语言包（可选）
app.mount('#app')


