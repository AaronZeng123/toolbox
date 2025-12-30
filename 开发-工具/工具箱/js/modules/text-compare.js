/**
 * 初始化文本对比工具
 */
function initializeTextCompare() {
    const text1 = document.getElementById('text1');
    const text2 = document.getElementById('text2');
    const compareBtn = document.getElementById('compareBtn');
    const clearBtn = document.getElementById('clearBtn');
    const charCount = document.getElementById('charCount');
    const diffCount = document.getElementById('diffCount');
    const resultContent = document.getElementById('resultContent');

    /**
     * 比较两段文本
     */
    function compareTexts() {
        const str1 = text1.value;
        const str2 = text2.value;

        // 更新字符数统计
        charCount.textContent = `字符数: ${str1.length} vs ${str2.length}`;

        if (!str1 && !str2) {
            resultContent.innerHTML = '<div class="same">两段文本都为空</div>';
            diffCount.textContent = '差异数: 0';
            return;
        }

        if (str1 === str2) {
            resultContent.innerHTML = '<div class="same">两段文本完全一致</div>';
            diffCount.textContent = '差异数: 0';
            return;
        }

        // 计算差异
        const diffs = findDifferences(str1, str2);
        diffCount.textContent = `差异数: ${diffs.length}`;

        // 显示差异
        let html = '';
        let lastPos = 0;

        diffs.forEach(diff => {
            // 添加差异前的相同部分
            if (diff.start > lastPos) {
                html += `<span class="same">${escapeHtml(str1.substring(lastPos, diff.start))}</span>`;
            }
            // 添加差异部分
            html += `<span class="diff">${escapeHtml(diff.text1)} ➔ ${escapeHtml(diff.text2)}</span>`;
            lastPos = diff.end;
        });

        // 添加最后的相同部分
        if (lastPos < str1.length) {
            html += `<span class="same">${escapeHtml(str1.substring(lastPos))}</span>`;
        }

        resultContent.innerHTML = html;
    }

    /**
     * 查找文本差异
     * @param {string} str1 - 第一段文本
     * @param {string} str2 - 第二段文本
     * @returns {Array} 差异数组
     */
    function findDifferences(str1, str2) {
        const diffs = [];
        let i = 0;
        let start = -1;

        while (i < str1.length || i < str2.length) {
            if (str1[i] !== str2[i]) {
                if (start === -1) start = i;
            } else if (start !== -1) {
                diffs.push({
                    start: start,
                    end: i,
                    text1: str1.substring(start, i),
                    text2: str2.substring(start, i)
                });
                start = -1;
            }
            i++;
        }

        if (start !== -1) {
            diffs.push({
                start: start,
                end: i,
                text1: str1.substring(start),
                text2: str2.substring(start)
            });
        }

        return diffs;
    }

    /**
     * HTML转义
     * @param {string} text - 需要转义的文本
     * @returns {string} 转义后的文本
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 事件监听
    compareBtn.addEventListener('click', compareTexts);
    
    clearBtn.addEventListener('click', () => {
        text1.value = '';
        text2.value = '';
        resultContent.innerHTML = '';
        charCount.textContent = '字符数: 0 vs 0';
        diffCount.textContent = '差异数: 0';
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializeTextCompare); 