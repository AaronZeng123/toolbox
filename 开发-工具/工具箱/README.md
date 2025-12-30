# 实用工具集合

这是一个集成了多种实用工具的 Web 应用。

## 功能列表

### 1. 文本工具 (Text Processor)
- **描述**: 空格转逗号、json格式、统计策略梳理等。
- **路径**: `./modules/text-processor.html`

### 2. 图片裁剪 (Image Crop)
- **描述**: 快速裁剪图片为3:4和4:3等固定比例。
- **路径**: `./modules/image-crop.html`

### 3. PDF 工具 (PDF Processor)
- **描述**: PDF转Word、加水印、压缩编辑等。
- **路径**: `./modules/pdf-processor.html`

### 4. 图片工具 (Image Editor)
- **描述**: 图片编辑、格式转换等功能。
- **路径**: `./modules/image-editor.html`

### 5. 文本对比工具 (Text Compare)
- **描述**: 对比两段文本是否完全一致。
- **路径**: `./modules/text-compare.html`

## 修改记录

### 2025-12-18
- **移除功能**: 移除了“二维码生成器”工具及其相关代码 (HTML, CSS, JS)。
- **新增功能**: 集成项目根目录下的其他工具到工具箱入口。
  - **实现方案**: 修改 `js/tools/toolsList.js`，添加指向父目录各工具入口文件的配置项。
  - **新增工具列表**:
    - ID 去重工具
    - Markdown 解析工具
    - Mermaid 渲染工具
    - Top 10 活动
    - 两周活动 Top 10
    - 减压游戏
    - 原子规则耗时分析
    - 哈希 256 加密
    - 调用量统计（天/小时）
    - 提取策略 ID
    - 策略脚本描述合并
    - 脚本 ID 次数统计
    - 表格转 JSON/Markdown
- **界面优化**: 对工具列表进行了分类展示（常用、不常用、周报工具、游戏）。
  - **实现方案**:
    - 修改 `toolsList.js` 为每个工具添加 `category` 属性。
    - 修改 `main.js` 中的 `initializeTools` 函数，支持按分类分组渲染。
    - 修改 `index.html` 移除容器的默认 Grid 样式，改为在 JS 中动态生成分类 Section 和 Grid。
  - **调整分类**:
    - 将“提取策略 ID”、“策略脚本描述合并”、“脚本 ID 次数统计”移动到“不常用工具”分类。
    - 调整分类显示顺序为：常用工具 -> 不常用工具 -> 周报工具 -> 游戏。
     - 修复了“PDF 工具”和“图片工具”的图标显示问题。
     - 为所有缺失图标的工具添加了标准 Emoji 图标（如 Markdown 解析工具、Mermaid 渲染工具等）。
- **界面优化**: 移除了页面顶部的“实用工具集合”标题模块。
  - **实现方案**: 修改 `index.html`，删除了 `<header>` 标签及其内容。
