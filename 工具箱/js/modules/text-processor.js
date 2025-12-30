/**
 * 初始化文本处理工具
 */
function initializeTextProcessor() {
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    
    // 空格转逗号
    document.getElementById('trimSpacesBtn').addEventListener('click', () => {
        const text = inputText.value;
        outputText.value = text.replace(/\s+/g, ',');
    });
    
    // 去除空格
    document.getElementById('removeSpacesBtn').addEventListener('click', () => {
        const text = inputText.value;
        outputText.value = text.replace(/\s+/g, '');
    });
    
    // 中英逗号互转
    document.getElementById('convertToEnglishBtn').addEventListener('click', () => {
        const text = inputText.value;
        if (!text.trim()) {
            showToast('请输入需要转换的文本');
            return;
        }

        // 检查文本中是否包含中文逗号
        if (text.includes('，')) {
            // 如果包含中文逗号，则转换为英文逗号
            outputText.value = text.replace(/，/g, ',');
            showToast('已将中文逗号转换为英文逗号');
        } else if (text.includes(',')) {
            // 如果包含英文逗号，则转换为中文逗号
            outputText.value = text.replace(/,/g, '，');
            showToast('已将英文逗号转换为中文逗号');
        } else {
            showToast('文本中未发现逗号');
        }
    });
    
    // JSON格式化
    document.getElementById('formatJsonBtn').addEventListener('click', () => {
        const text = inputText.value;
        try {
            const obj = JSON.parse(text);
            const formattedJson = JSON.stringify(obj, null, 2);
            // 创建 pre 和 code 元素
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.className = 'language-json';
            code.textContent = formattedJson;
            pre.appendChild(code);
            
            // 清空输出区域并添加高亮代码
            outputText.style.display = 'none'; // 隐藏原始的 textarea
            const container = outputText.parentElement;
            // 移除已存在的 pre 元素（如果有）
            const existingPre = container.querySelector('pre');
            if (existingPre) {
                container.removeChild(existingPre);
            }
            container.appendChild(pre);
            
            // 应用高亮
            hljs.highlightElement(code);
        } catch (error) {
            alert('无效的 JSON 格式');
            console.error('JSON 解析错误:', error);
        }
    });

    // 添加复制结果功能
    document.getElementById('copyResultBtn').addEventListener('click', () => {
        outputText.select();
        document.execCommand('copy');
        showToast('结果已复制到剪贴板！');
    });

    // 时间戳互转
    document.getElementById('timestampConvertBtn').addEventListener('click', () => {
        const input = inputText.value.trim();
        if (!input) {
            showToast('请输入时间戳或时间');
            return;
        }

        try {
            // 判断输入是否为时间戳
            if (/^\d+$/.test(input)) {
                // 输入是时间戳，转换为时间
                const ts = input.length === 10 ? input * 1000 : input;
                const date = new Date(parseInt(ts));
                
                if (isNaN(date.getTime())) {
                    throw new Error('无效的时间戳');
                }

                outputText.value = formatDate(date);
            } else {
                // 输入是时间，转换为时间戳
                let date;
                if (input.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    // 处理 YYYY-MM-DD 格式
                    date = new Date(input);
                } else if (input.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
                    // 处理 YYYY-MM-DD HH:mm:ss 格式
                    date = new Date(input.replace(' ', 'T'));
                } else {
                    // 尝试直接解析
                    date = new Date(input);
                }

                if (isNaN(date.getTime())) {
                    throw new Error('无效的时间格式');
                }

                const timestamp = date.getTime();
                outputText.value = `时间戳(毫秒)：${timestamp}\n时间戳(秒)：${Math.floor(timestamp / 1000)}`;
            }
        } catch (error) {
            console.error('转换错误:', error);
            showToast('请输入有效的时间戳或时间格式（如：2024-01-01 或 2024-01-01 12:00:00）');
        }
    });

    // 添加统计数量功能
    document.getElementById('countItemsBtn').textContent = '统计策略数量';
    document.getElementById('countItemsBtn').addEventListener('click', () => {
        const text = inputText.value.trim();
        if (!text) {
            alert('请输入需要统计的文本');
            return;
        }

        // 按英文逗号分隔并过滤空项
        const items = text.split(',').filter(item => item.trim() !== '');
        const count = items.length;

        outputText.value = `总计：${count} 项\n\n` +
                          `详细信息：\n` +
                          items.map((item, index) => `${index + 1}. ${item.trim()}`).join('\n');
    });

    // 修改清空按钮的处理
    document.getElementById('clearBtn')?.addEventListener('click', () => {
        inputText.value = '';
        outputText.value = '';
        outputText.style.display = 'block';
        const container = outputText.parentElement;
        const pre = container.querySelector('pre');
        if (pre) {
            container.removeChild(pre);
        }
    });

    // 清空输入框
    document.getElementById('clearInputBtn').addEventListener('click', () => {
        inputText.value = '';
        showToast('输入已清空');
    });

    // 去掉项目符号
    document.getElementById('removeBulletsBtn').addEventListener('click', () => {
        const text = inputText.value;
        outputText.value = text.replace(/^[•\-\*\s]+/gm, '').trim();
    });

    // 添加单引号
    document.getElementById('addQuotesBtn').addEventListener('click', () => {
        const text = inputText.value;
        if (!text.trim()) {
            showToast('请输入需要转换的文本');
            return;
        }
        // 将英文逗号分隔的文本转换为带单引号和空格的格式
        const items = text.split(',').map(item => `'${item.trim()}'`);
        outputText.value = items.join(', ');
    });

    // 添加单引号
    document.getElementById('addSingleQuotesBtn').addEventListener('click', () => {
        const text = inputText.value.trim();
        if (!text) {
            showToast('请输入需要处理的文本');
            return;
        }

        // 按逗号分隔，去除空白项
        const items = text.split(',').filter(item => item.trim() !== '');
        // 为每个项添加单引号，并在逗号后添加空格
        outputText.value = items.map(item => `'${item.trim()}'`).join(', ');
        showToast('已添加单引号');
    });
}

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
    const pad = (num) => String(num).padStart(2, '0');
    
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return `格式化时间：${year}-${month}-${day} ${hours}:${minutes}:${seconds}\n` +
           `UTC时间：${date.toUTCString()}\n` +
           `ISO时间：${date.toISOString()}\n` +
           `本地时间：${date.toLocaleString()}`;
}

// 显示 Toast 提示
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000); // 2秒后消失
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializeTextProcessor);