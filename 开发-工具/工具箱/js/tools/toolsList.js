/**
 * @typedef {Object} Tool
 * @property {string} id - 工具的唯一标识符
 * @property {string} name - 工具名称
 * @property {string} description - 工具描述
 * @property {string} icon - 工具图标（可选）
 * @property {string} modulePath - 工具模块的路径
 */

/**
 * 工具列表配置
 * @type {Tool[]}
 */
const toolsList = [
    // 常用工具
    {
        id: 'text-processor',
        name: '文本工具',
        description: '空格转逗号、json格式、统计策略梳理等',
        icon: '📝',
        modulePath: '工具箱/modules/text-processor.html',
        category: 'common'
    },
    {
        id: 'text-compare',
        name: '文本对比工具',
        description: '对比两段文本是否完全一致',
        icon: '🔍',
        modulePath: '工具箱/modules/text-compare.html',
        category: 'common'
    },
    {
        id: 'markdown-parser',
        name: 'Markdown 解析工具',
        description: '实时 Markdown 解析预览，支持文件上传和 HTML 导出',
        icon: '📄',
        modulePath: 'markdown 解析工具/md_tool.html',
        category: 'common'
    },
    {
        id: 'mermaid-render',
        name: 'Mermaid 渲染工具',
        description: '实时预览 Mermaid 流程图、时序图等，支持导出 SVG/PNG',
        icon: '🗺️',
        modulePath: 'mermaid渲染工具/index.html',
        category: 'common'
    },
    {
        id: 'hash-256',
        name: '哈希 256 加密',
        description: '文本 SHA-256 加密工具，自动提取前 6 位',
        icon: '#️⃣',
        modulePath: '哈希 256 加密/index.html',
        category: 'common'
    },
    {
        id: 'table-converter',
        name: '表格转 JSON/Markdown',
        description: 'Excel/CSV 转 JSON、JSONL 或 Markdown，支持 Token 估算',
        icon: '📋',
        modulePath: '表格转 JSON:JSONL:markdown/index.html',
        category: 'common'
    },

    // 游戏
    {
        id: 'decompression-game',
        name: '减压游戏',
        description: '解压键盘侠：敲击键盘触发特效和音效的网页游戏',
        icon: '🎮',
        modulePath: '减压游戏/game.html',
        category: 'game'
    },

    // 不常用工具
    {
        id: 'image-crop',
        name: '图片裁剪',
        description: '快速裁剪图片为3:4和4:3等固定比例',
        icon: '✂️',
        modulePath: '工具箱/modules/image-crop.html',
        category: 'uncommon'
    },
    {
        id: 'pdf-processor',
        name: 'PDF 工具',
        description: 'PDF转Word、加水印、压缩编辑等',
        icon: '📑',
        modulePath: '工具箱/modules/pdf-processor.html',
        category: 'uncommon'
    },
    {
        id: 'image-editor',
        name: '图片工具',
        description: '图片编辑、格式转换等功能',
        icon: '🎨',
        modulePath: '工具箱/modules/image-editor.html',
        category: 'uncommon'
    }
];
