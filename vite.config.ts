import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import {visualizer} from 'rollup-plugin-visualizer';
import externalGlobals from 'rollup-plugin-external-globals'

// https://vite.dev/config/
export default defineConfig({
  build:{
    rollupOptions:{
      external: [
        'vue',
        'element-plus',
        'axios',
        'vue-router',
        '@element-plus/icons-vue',
      ],
      plugins: [
        externalGlobals({
          'vue': 'Vue',
          'element-plus': 'ElementPlus',
          'axios': 'axios',
          'vue-router': 'VueRouter',
          '@element-plus/icons-vue': 'ElementPlusIconsVue',
        }),
      ],
    }
  },
  plugins: [
    vue(),
    vueDevTools(),
    visualizer({
      open: true,           // 构建完成后自动打开浏览器
      gzipSize: true,       // 显示 Gzip 压缩后的大小
      brotliSize: true,     // 显示 Brotli 压缩后的大小
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0', // 允许所有接口访问（包括 localhost 和 127.0.0.1）
    port: 5173, // 确保端口号与启动脚本一致

    // 开发代理
    proxy: {
      '/api': {
        target: 'http://localhost:8101', // 后端地址
        // target: 'http://debian-n5105.home:8101', // 后端地址
        changeOrigin: true, // 修改 Host 头为 target 的地址
        secure: false,      // 如果 target 是 https，设为 true
        // rewrite: (path) => path.replace(/^\/api/, '') // 可选：重写路径
      }
    }
  },
})
