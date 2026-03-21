// store pinia index file
import { createPinia } from 'pinia'

const store = createPinia()

store.use(({ store }) => {
  // 可以在这里添加全局的 store 配置或插件
  // 例如：持久化存储、日志记录等
  
})

export default store