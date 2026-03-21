import { nextTick, ref } from 'vue';
import html2canvas from 'html2canvas';

export default function useScreenshot() {

  const exportImg = async (element, options = {}) => {
    try {
      if (!element) {
        return Promise.reject('VueFlow element not found');
      }

      // 等待 DOM 更新
      await nextTick();
      
      // 预加载所有图片
      const images = element.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) {
          return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve; // 即使加载失败也继续
          img.onabort = resolve;
        });
      });
      
      // 等待所有图片加载完成
      await Promise.all(imagePromises);
      
      // 额外等待确保样式和图片完全渲染
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 使用 html2canvas 转换
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff', // 背景色
        scale: 2, // 提高清晰度
        useCORS: true, // 支持跨域图片
        logging: false,
        allowTaint: true,
        // 保持 foreignObjectRendering: true，但通过 onclone 处理图片
        foreignObjectRendering: true,
        imageTimeout: 10000, // 增加图片超时时间
        removeContainer: true,
        // 关键：在 onclone 中将图片转换为 base64
        onclone: async (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.vue-flow');
          if (clonedElement) {
            await convertImagesToBase64(clonedElement);
          }
          
          // 确保图片 URL 是绝对路径
          const clonedImages = clonedDoc.querySelectorAll('img');
          clonedImages.forEach(img => {
            if (img.src.startsWith('/')) {
              img.src = new URL(img.src, window.location.origin).href;
            }
          });
        },
        // 忽略某些不需要的元素
        ignoreElements: (element) => {
          return element.classList?.contains('export-ignore') ||
                element.classList?.contains('vue-flow__minimap') ||
                element.classList?.contains('vue-flow__controls')
        },
        ...options,
      })
      
      // 转换为图片并下载
      const imgUrl = canvas.toDataURL('image/png');
      download(options.imgName || `img-${new Date().getTime()}`, imgUrl);
      
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }
  // 将图片转换为 base64 的辅助函数
  const convertImagesToBase64 = async (element) => {
    const images = element.querySelectorAll('img');
    const promises = Array.from(images).map(async (img) => {
      if (img.src.startsWith('data:')) {
        return; // 已经是 base64，跳过
      }
      
      try {
        const response = await fetch(img.src);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            img.src = reader.result;
            resolve();
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.warn('Failed to convert image to base64:', img.src, error);
      }
    });
    
    await Promise.all(promises);
  }

  function download(fileName, url) {
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = url;
    link.click();
  }

  return {
    exportImg,
    download,
  };
}
