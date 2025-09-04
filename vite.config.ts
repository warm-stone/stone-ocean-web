import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {fileURLToPath, URL} from 'node:url' // 注意：Vite 3+ 使用 node:url
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
// import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),

    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    // visualizer({
    //   open: true,           // 构建完成后自动打开浏览器
    //   gzipSize: true,       // 显示 Gzip 压缩后的大小
    //   brotliSize: true,     // 显示 Brotli 压缩后的大小
    // })
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0', // 允许所有接口访问（包括 localhost 和 127.0.0.1）
    port: 5173, // 确保端口号与启动脚本一致

    // 开发代理
    proxy: {
      '/api': {
        target: 'http://localhost:8101', // 后端地址
        changeOrigin: true, // 修改 Host 头为 target 的地址
        secure: false,      // 如果 target 是 https，设为 true
        // rewrite: (path) => path.replace(/^\/api/, '') // 可选：重写路径
      }
    }
  },

})
