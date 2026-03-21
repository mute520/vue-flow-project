<template>
  <div class="home">
    <h1>Welcome to the Home Page</h1>
    <ul>
      <li v-for="item in demoList" :key="item.path">
        <router-link :to="item.path">{{ item.title }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>

const demoList = [
  { title: '基础使用', path: '/page1' },
  { title: '自定义节点', path: '/page2' },
  { title: '自定义文本溢出隐藏', path: '/page3' },
]
</script>

<style scoped lang="scss">
.home {
  text-align: center;
  margin-top: 100px;
  ul {
    list-style: none;
    padding: 0;
    li {
      margin: 10px 0;
      transition: all 0.3s ease;
      border-radius: 10px;
      a {
        text-decoration: none;
        color: #42b983;
        color: $primary-color;
        font-size: 18px;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>