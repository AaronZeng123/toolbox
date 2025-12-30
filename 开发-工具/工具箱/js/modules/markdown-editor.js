/**
 * 初始化 Markdown 编辑器
 */
function initializeMarkdownEditor() {
    const markdownInput = document.getElementById('markdownInput');
    const previewContent = document.getElementById('previewContent');
    
    // 配置 marked
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true
    });

    // 实时预览
    markdownInput.addEventListener('input', () => {
        const markdown = markdownInput.value;
        const html = marked.parse(markdown);
        previewContent.innerHTML = html;
    });

    // 初始化工具栏按钮
    initializeToolbar(markdownInput);
}

/**
 * 初始化工具栏
 * @param {HTMLTextAreaElement} editor - 编辑器元素
 */
function initializeToolbar(editor) {
    // 加粗
    document.getElementById('boldBtn').addEventListener('click', () => {
        insertText(editor, '**', '**', '粗体文本');
    });

    // 斜体
    document.getElementById('italicBtn').addEventListener('click', () => {
        insertText(editor, '*', '*', '斜体文本');
    });

    // 链接
    document.getElementById('linkBtn').addEventListener('click', () => {
        insertText(editor, '[', '](https://example.com)', '链接文本');
    });

    // 图片
    document.getElementById('imageBtn').addEventListener('click', () => {
        insertText(editor, '![', '](https://example.com/image.jpg)', '图片描述');
    });

    // 代码块
    document.getElementById('codeBtn').addEventListener('click', () => {
        insertText(editor, '```\n', '\n```', 'console.log("Hello World!");');
    });

    // 列表
    document.getElementById('listBtn').addEventListener('click', () => {
        insertText(editor, '- ', '', '列表项');
    });

    // 导出 HTML
    document.getElementById('exportHtmlBtn').addEventListener('click', () => {
        const html = marked.parse(editor.value);
        downloadFile('markdown.html', html);
    });

    // 导出 Markdown
    document.getElementById('exportMdBtn').addEventListener('click', () => {
        downloadFile('markdown.md', editor.value);
    });
}

/**
 * 在编辑器中插入文本
 * @param {HTMLTextAreaElement} editor - 编辑器元素
 * @param {string} before - 插入文本前缀
 * @param {string} after - 插入文本后缀
 * @param {string} defaultText - 默认文本
 */
function insertText(editor, before, after, defaultText) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selectedText = text.substring(start, end) || defaultText;
    
    editor.value = text.substring(0, start) + 
                   before + selectedText + after + 
                   text.substring(end);
    
    editor.focus();
    editor.selectionStart = start + before.length;
    editor.selectionEnd = start + before.length + selectedText.length;
    
    editor.dispatchEvent(new Event('input'));
}

/**
 * 下载文件
 * @param {string} filename - 文件名
 * @param {string} content - 文件内容
 */
function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializeMarkdownEditor); 