import { createApp } from 'vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
// 引入 Element Plus 及其 CSS
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 如果需要国际化（中文）
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import router from "@/router/router.ts";
import NetHome from "@/NetHome.vue";

// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(NetHome)

app.use(router)
app.use(ElementPlus, { locale: zhCn , size: 'small', zIndex: 3000}) // 使用中文语言包（可选）
app.mount('#app')


for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}


