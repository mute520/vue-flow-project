import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
// import autoprefixer from 'autoprefixer'
// import tailwindcss from 'tailwindcss'

export default defineConfig({
  base: './', // 设置项目根目录
  plugins: [
    vue(),

    // 自动导入 Vue 相关函数，如：ref, computed, toRefs 等
    AutoImport({
      dts: 'src/auto-imports.d.ts', // 可以在根目录生成类型声明文件，默认是 './auto-imports.d.ts'
      // imports: ['vue', 'vue-router', 'pinia'], // 自动导入 vue, vue-router, pinia 的相关 API
    }),
    // 自动按需引入组件
    Components({
      dts: 'src/components.d.ts', // 可以在根目录生成类型声明文件，默认是 './components.d.ts'
      // resolvers: ['element-plus'] // 自动按需引入 Element Plus 组件
    })
  ],
  
  // 路径别名配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'components': resolve(__dirname, 'src/components'),
      'assets': resolve(__dirname, 'src/assets')
    }
  },

  // 构建配置
  build: {
    // 输出目录
    outDir: 'docs',
    // 静态资源目录
    assetsDir: 'assets',
    // 压缩配置
    // minify: 'terser', // 使用 terser 进行压缩，默认是 esbuild
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vue-vendor': ['vue', 'vue-router', 'pinia']
        }
      }
    },
    // 构建后是否生成 source map 文件
    sourcemap: false,
    //  chunk 大小警告的限制（以 kbs 为单位）
    chunkSizeWarningLimit: 1500
  },

  // 开发服务器配置
  server: {
    port: 8888,
    // 自动打开浏览器
    // open: true,
    // CORS 配置
    cors: true,
    // 设置为 true 允许通过局域网访问
    host: '0.0.0.0',
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // CSS 配置
  css: {
    // CSS 预处理器配置
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`,
        javascriptEnabled: true, // 如果使用了 Ant Design Vue，可以启用此选项，否则会报错
      }
    },
    // PostCSS 配置
    // postcss: {
    //   plugins: [
    //     // 自动添加浏览器前缀，你还需要在项目根目录创建 postcss.config.js 文件来配置 PostCSS
    //     autoprefixer(),
    //     tailwindcss()
    //   ]
    // }
  },

  // 环境变量配置
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },

  // 依赖优化
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios'],
    exclude: ['some-large-package']
  },
})
