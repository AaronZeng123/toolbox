# 表格转 JSON 工具

这是一个纯 HTML/JS 实现的工具，用于将 Excel (xlsx) 和 CSV 文件转换为 JSON、JSONL 或 Markdown 格式，并提供实时字数和 Token 估算。

## 功能描述

1.  **支持格式**: 支持上传 .xlsx 和 .csv 格式的文件。
2.  **表头映射**: 使用表格的第一行（表头）作为对象的键（Key）或表格列名。
3.  **数据类型**: 表格中的所有值都将被强制转换为字符串（String）格式。
4.  **多格式输出**:
    *   **JSON**: 标准 JSON 数组格式。
    *   **JSONL**: 每行一个 JSON 对象 (JSON Lines)。
    *   **Markdown**: 标准 Markdown 表格格式。
5.  **数据统计**:
    *   **字数统计**: 实时显示输出内容的字符总数。
    *   **Token 估算**: 根据字符类型（中文/英文）估算 GPT-4 模型的 Token 数量。
6.  **多行转换**: 支持多行数据转换。

## 实现方案

- 使用 [SheetJS (xlsx)](https://cdn.sheetjs.com/) 库来解析 Excel 和 CSV 文件。
- 前端直接处理文件，无需后端服务。
- 增加格式选择器（Radio Buttons）允许用户切换输出格式。
- **Token 估算逻辑**:
    - 中文字符 (CJK): 约 1.5 Tokens/字符。
    - 其他字符 (English/Numbers): 约 0.25 Tokens/字符 (即 1 Token ≈ 4 字符)。
- 输出结果将在页面上显示，并提供一键复制功能。
