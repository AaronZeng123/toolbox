/**
 * 初始化工具列表
 */
function initializeTools() {
    const container = document.getElementById('tools-container');
    
    // 定义分类及其顺序
    const categories = [
        { id: 'common', title: '常用工具' },
        { id: 'uncommon', title: '不常用工具' },
        { id: 'game', title: '游戏' }
    ];

    // 按分类分组工具
    const groupedTools = {};
    toolsList.forEach(tool => {
        const cat = tool.category || 'uncommon'; // 默认为不常用
        if (!groupedTools[cat]) {
            groupedTools[cat] = [];
        }
        groupedTools[cat].push(tool);
    });

    // 渲染分类
    categories.forEach(category => {
        const tools = groupedTools[category.id];
        if (tools && tools.length > 0) {
            // 创建分类部分
            const section = document.createElement('section');
            section.className = 'category-section';
            
            // 添加分类标题
            const title = document.createElement('h2');
            title.className = 'category-title';
            title.textContent = category.title;
            // 添加一点样式让标题好看些
            title.style.margin = '30px 0 20px 20px';
            title.style.color = '#333';
            title.style.borderLeft = '5px solid #007bff';
            title.style.paddingLeft = '10px';
            section.appendChild(title);

            // 创建网格容器
            const grid = document.createElement('div');
            grid.className = 'tools-grid';
            
            // 添加工具卡片
            tools.forEach(tool => {
                const toolCard = createToolCard(tool);
                grid.appendChild(toolCard);
            });

            section.appendChild(grid);
            container.appendChild(section);
        }
    });
}

/**
 * 创建工具卡片元素
 * @param {Tool} tool - 工具配置对象
 * @returns {HTMLElement} 工具卡片DOM元素
 */
function createToolCard(tool) {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.innerHTML = `
        <div class="tool-icon">${tool.icon || '🔧'}</div>
        <h3>${tool.name}</h3>
        <p>${tool.description}</p>
    `;
    
    // 判断是否为开发中的工具
    const devTools = ['ai-tools', 'video-editor', 'ip-lookup'];
    if (devTools.includes(tool.id)) {
        card.addEventListener('click', () => {
            showToast('功能开发中，敬请期待！');
        });
    } else {
        card.addEventListener('click', () => loadTool(tool));
    }
    
    return card;
}

/**
 * 加载工具模块
 * @param {Tool} tool - 要加载的工具配置对象
 */
function loadTool(tool) {
    window.location.href = tool.modulePath;
}

/**
 * 显示提示信息
 * @param {string} message - 提示信息
 */
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 显示提示
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 3秒后移除
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// 页面加载完成后初始化工具列表
document.addEventListener('DOMContentLoaded', initializeTools); 