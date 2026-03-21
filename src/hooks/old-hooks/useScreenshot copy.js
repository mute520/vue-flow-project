import { toJpeg as ElToJpg, toPng as ElToPng, toSvg as ElToSvg } from 'html-to-image';
import { ref } from 'vue';

export function useScreenshot() {
  const dataUrl = ref('');
  const imgType = ref('png');
  const error = ref();

  // 等待所有图片加载完成
  async function waitForImages(element) {
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
    
    await Promise.all(imagePromises);
  }

  // 将图片转换为 base64
  async function convertImagesToBase64(element) {
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

  async function capture(el, options = {}) {
    let data;

    const fileName = options.fileName ?? `flow-${new Date()}`;

    // 等待图片加载完成
    await waitForImages(el);
    
    // 额外等待确保渲染完成
    await new Promise(resolve => setTimeout(resolve, 300));

    switch (options.type) {
      case 'jpeg':
        data = await toJpeg(el, options);
        break;
      case 'png':
        data = await toPng(el, options);
        break;
      case 'svg':
        data = await toSvg(el, options);
        break;
      default:
        data = await toPng(el, options);
        break;
    }

    // immediately download the image if shouldDownload is true
    if (options.shouldDownload && fileName !== '') {
      download(fileName);
    }

    return data;
  }

  function toJpeg(
    el,
    options = { 
      quality: 1,
      cacheBust: true,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      skipAutoScale: false,
      // 确保样式正确
      style: '',
    }
  ) {
    error.value = null;

    return ElToJpg(el, options)
      .then((data) => {
        dataUrl.value = data;
        imgType.value = 'jpeg';
        return data;
      })
      .catch((err) => {
        error.value = err;
        throw new Error(err);
      });
  }

  function toPng(
    el,
    options = { 
      quality: 1,
      cacheBust: true,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      skipAutoScale: false,
      // 确保样式正确
      style: '',
    }
  ) {
    error.value = null;

    return ElToPng(el, options)
      .then((data) => {
        dataUrl.value = data;
        imgType.value = 'png';
        return data;
      })
      .catch((err) => {
        error.value = err;
        throw new Error(err);
      });
  }

  function toSvg(
    el,
    options = { 
      cacheBust: true,
      backgroundColor: '#ffffff',
    }
  ) {
    error.value = null;

    return ElToSvg(el, options)
      .then((data) => {
        dataUrl.value = data;
        imgType.value = 'svg';
        return data;
      })
      .catch((err) => {
        error.value = err;
        throw new Error(err);
      });
  }

  function download(fileName) {
    const link = document.createElement('a');
    link.download = `${fileName}.${imgType.value}`;
    link.href = dataUrl.value;
    link.click();
  }

  return {
    capture,
    download,
    dataUrl,
    error,
    toSvg,
  };
}
