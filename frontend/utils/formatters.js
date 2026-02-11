// 格式化工具函数

/**
 * 格式化日期
 * @param {string|Date} date - 日期对象或字符串
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * 格式化时间
 * @param {string|Date} date - 日期对象或字符串
 * @returns {string} 格式化后的时间字符串
 */
export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 格式化日期时间
 * @param {string|Date} date - 日期对象或字符串
 * @returns {string} 格式化后的日期时间字符串
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 计算训练时长
 * @param {string} startTime - 开始时间
 * @param {string} endTime - 结束时间
 * @returns {string} 时长字符串
 */
export const calculateDuration = (startTime, endTime) => {
  if (!startTime) return '';
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const duration = Math.floor((end - start) / 1000 / 60); // 转换为分钟
  
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else {
    return `${minutes}分钟`;
  }
};

/**
 * 格式化数字
 * @param {number} num - 数字
 * @returns {string} 格式化后的数字字符串
 */
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * 截断文本
 * @param {string} text - 文本
 * @param {number} maxLength - 最大长度
 * @returns {string} 截断后的文本
 */
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};