/** @type {import('tailwindcss').Config} */
module.exports = {
  // 关键点：这里必须包含你项目中所有 .vue, .js, .ts 文件的路径
  content: [
    "./index.html", // 不要忘了入口 HTML
    "./src/**/*.{vue,js,ts,jsx,tsx}", // 确保这里包含了 .vue
  ],
  theme: {
    extend: {
      margin: {
        1: "1px",
        2: "2px",
        3: "3px",
        4: "4px",
        5: "5px",
        10: "10px",
        15: "15px",
        20: "20px",
        25: "25px",
        30: "30px",
      },
      padding: {
        1: "1px",
        2: "2px",
        3: "3px",
        4: "4px",
        5: "5px",
        10: "10px",
        15: "15px",
        20: "20px",
        25: "25px",
        30: "30px",
      }
    },
  },
  plugins: [],
}
