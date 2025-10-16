// src/utils/requestImg.js
import axios from 'axios';

// 用 axios 发送带 Token 的请求获取图片 blob
export const getAuthImageBlob = async (imgUrl: string) => {
  if (!imgUrl) {
    return null
  }
  try {

    const response = await axios.get(imgUrl, {
      responseType: 'blob', // 关键：指定响应类型为 blob
    });
    return response.data; // 返回 blob 数据
  } catch (error) {
    console.error('图片请求失败：', error);
    return null; // 失败时返回 null，后续显示默认图
  }
};
