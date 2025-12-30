// 将这些变量移到全局作用域
let currentPdfDoc = null;
let totalPages = 0;
let currentPdfUrl = null;

/**
 * 显示提示信息
 */
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * 初始化 PDF 处理工具
 */
function initializePdfProcessor() {
    // 获取DOM元素
    const dropZone = document.getElementById('dropZone');
    const pdfInput = document.getElementById('pdfInput');
    const uploadBtn = document.querySelector('.upload-btn');
    const pageRangeInput = document.getElementById('pageRangeInput');
    const splitBtn = document.getElementById('splitBtn');
    const imageFormatSelect = document.getElementById('imageFormatSelect');
    const imageQualitySelect = document.getElementById('imageQualitySelect');
    const convertBtn = document.getElementById('convertBtn');
    const compressLevelSelect = document.getElementById('compressLevelSelect');
    const compressBtn = document.getElementById('compressBtn');

    // 功能切换
    const functionButtons = {
        'convertWordBtn': 'convertWordSection',
        'convertImageBtn': 'convertImageSection',
        'splitPdfBtn': 'splitSection',
        'compressPdfBtn': 'compressSection',
        'watermarkBtn': 'watermarkSection',
        'deletePageBtn': 'deletePageSection'
    };

    // 切换功能区域显示
    function switchFunction(sectionId, clickedBtn) {
        // 移除所有按钮的选中状态
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 添加当前按钮的选中状态
        clickedBtn.classList.add('active');
        
        // 切换功能区域
        document.querySelectorAll('.function-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }

    // 添加功能按钮点击事件
    Object.entries(functionButtons).forEach(([btnId, sectionId]) => {
        const btn = document.getElementById(btnId);
        btn.addEventListener('click', () => {
            switchFunction(sectionId, btn);
        });
    });

    // 默认选中第一个按钮
    const firstBtn = document.getElementById('convertWordBtn');
    firstBtn.classList.add('active');
    switchFunction('convertWordSection', firstBtn);

    // 清除文件
    document.getElementById('clearFileBtn').addEventListener('click', () => {
        // 清除文件相关状态
        currentPdfDoc = null;
        currentPdfUrl = null;
        
        // 重置上传区域
        document.getElementById('uploadContent').style.display = 'block';
        document.getElementById('previewContent').style.display = 'none';
        dropZone.classList.remove('has-file');
        
        // 禁用所有功能按钮
        document.querySelectorAll('.action-btn[disabled]').forEach(btn => {
            btn.disabled = true;
        });
        
        showToast('已清除文件');
    });

    // 文件上传处理
    function handleFileUpload(file) {
        if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    // 存储文件 URL 以供后续使用
                    currentPdfUrl = URL.createObjectURL(file);
                    
                    // 加载PDF文档
                    currentPdfDoc = await pdfjsLib.getDocument(currentPdfUrl).promise;
                    totalPages = currentPdfDoc.numPages;
                    
                    // 更新预览信息
                    document.getElementById('fileName').textContent = file.name;
                    document.getElementById('fileMeta').textContent = 
                        `页数：${totalPages}页 | 大小：${(file.size / (1024 * 1024)).toFixed(2)}MB`;
                    
                    // 切换显示状态
                    document.getElementById('uploadContent').style.display = 'none';
                    document.getElementById('previewContent').style.display = 'block';
                    dropZone.classList.add('has-file');
                    
                    // 启用所有功能按钮，包括转换按钮
                    document.querySelectorAll('.action-btn[disabled]').forEach(btn => {
                        btn.disabled = false;
                    });
                    
                    showToast(`PDF 加载成功，共 ${totalPages} 页`);
                } catch (error) {
                    console.error('PDF加载错误:', error);
                    showToast('PDF加载失败，请重试');
                    // 清理资源
                    if (currentPdfUrl) {
                        URL.revokeObjectURL(currentPdfUrl);
                        currentPdfUrl = null;
                    }
                    currentPdfDoc = null;
                }
            };
            reader.onerror = function() {
                showToast('文件读取失败，请重试');
            };
            reader.readAsArrayBuffer(file);
        } else {
            showToast('请上传PDF文件');
        }
    }

    // PDF转图片
    async function convertPdfToImages() {
        if (!currentPdfDoc) {
            showToast('请先上传PDF文件');
            return;
        }

        try {
            const format = imageFormatSelect.value;
            const quality = getQualityValue(imageQualitySelect.value);
            const scale = 2.0; // 设置较高的缩放比以保证图片质量
            
            // 创建进度提示
            showToast('开始转换，请稍候...');
            
            // 创建一个临时的 canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 创建 zip 文件
            const zip = new JSZip();
            
            // 遍历每一页进行转换
            for (let i = 1; i <= totalPages; i++) {
                // 获取页面
                const page = await currentPdfDoc.getPage(i);
                
                // 设置画布大小
                const viewport = page.getViewport({ scale });
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                // 渲染页面到画布
                await page.render({
                    canvasContext: ctx,
                    viewport: viewport
                }).promise;
                
                // 转换为图片
                let imageData;
                if (format === 'png') {
                    imageData = canvas.toDataURL('image/png');
                } else {
                    imageData = canvas.toDataURL('image/jpeg', quality);
                }
                
                // 将图片添加到 zip
                const imgData = imageData.split(',')[1];
                zip.file(`page-${i}.${format}`, imgData, { base64: true });
                
                // 更新进度提示
                showToast(`正在处理第 ${i} 页，共 ${totalPages} 页`);
            }
            
            // 生成并下载 zip 文件
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `pdf-images.zip`;
            link.click();
            URL.revokeObjectURL(url);
            
            showToast('转换完成！');
        } catch (error) {
            console.error('转换错误:', error);
            showToast('转换失败，请重试');
        }
    }

    // 获取图片质量值
    function getQualityValue(quality) {
        switch (quality) {
            case 'high': return 1.0;
            case 'medium': return 0.8;
            case 'low': return 0.5;
        }
    }

    // PDF 压缩功能
    async function compressPdf() {
        if (!currentPdfDoc) {
            showToast('请先上传PDF文件');
            return;
        }

        try {
            showToast('开始分析PDF文件...');
            
            // 获取目标大小范围（MB）
            const targetSize = parseInt(document.getElementById('targetSizeSelect').value);
            
            // 获取原始 PDF 数据
            const existingPdfBytes = await fetch(currentPdfUrl).then(res => res.arrayBuffer());
            const originalSizeMB = existingPdfBytes.byteLength / (1024 * 1024);
            
            // 分析 PDF 内容
            const analysis = await analyzePdfContent(currentPdfDoc);
            showToast(`分析完成: ${analysis.summary}`);
            
            // 根据分析结果选择压缩策略
            const compressionStrategy = determineCompressionStrategy(analysis, targetSize, originalSizeMB);
            
            // 创建新的 PDF 文档
            const pdfDoc = await PDFLib.PDFDocument.create();
            const sourcePdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes, {
                updateMetadata: false // 防止更新元数据
            });

            // 应用压缩策略
            await applyCompressionStrategy(pdfDoc, sourcePdfDoc, compressionStrategy);
            
            // 保存压缩后的文件
            const compressedBytes = await pdfDoc.save({
                useObjectStreams: true,
                addDefaultPage: false,
                compress: true,
                objectsStack: []
            });
            
            const compressedSizeMB = compressedBytes.byteLength / (1024 * 1024);
            
            if (compressedSizeMB >= originalSizeMB) {
                showToast('压缩失败：无法达到预期压缩效果');
                return;
            }
            
            // 下载压缩后的文件
            const blob = new Blob([compressedBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const compressionPercent = ((originalSizeMB - compressedSizeMB) / originalSizeMB * 100).toFixed(1);
            link.download = `compressed_${compressionPercent}%_reduced.pdf`;
            link.click();
            URL.revokeObjectURL(url);
            
            showToast(`压缩完成！从 ${originalSizeMB.toFixed(1)}MB 压缩到 ${compressedSizeMB.toFixed(1)}MB`);
        } catch (error) {
            console.error('压缩错误:', error);
            showToast('压缩失败，请重试');
        }
    }

    /**
     * 分析 PDF 内容
     */
    async function analyzePdfContent(pdfDoc) {
        const analysis = {
            totalPages: pdfDoc.numPages,
            textPages: 0,
            imagePages: 0,
            mixedPages: 0,
            totalImages: 0,
            largeImages: 0,
            summary: ''
        };

        try {
            // 分析每一页
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                
                // 获取页面内容
                const textContent = await page.getTextContent();
                const operatorList = await page.getOperatorList();
                
                let hasText = textContent.items.length > 0;
                let hasImage = operatorList.fnArray.some(op => 
                    // PDF.js 的操作码，92 是图片操作
                    op === 92
                );
                
                // 判断页面类型
                if (hasText && hasImage) {
                    analysis.mixedPages++;
                } else if (hasText) {
                    analysis.textPages++;
                } else if (hasImage) {
                    analysis.imagePages++;
                }
                
                // 统计图片数量
                if (hasImage) {
                    const imgCount = operatorList.fnArray.filter(op => op === 92).length;
                    analysis.totalImages += imgCount;
                }
            }
            
            // 生成分析摘要
            analysis.summary = `文字页:${analysis.textPages}, 图片页:${analysis.imagePages}, 混合页:${analysis.mixedPages}`;
            
            return analysis;
        } catch (error) {
            console.error('PDF分析错误:', error);
            throw new Error('PDF分析失败');
        }
    }

    /**
     * 确定压缩策略
     */
    function determineCompressionStrategy(analysis, targetSize, originalSize) {
        const strategy = {
            imageQuality: 0.8,
            imageScale: 1.0,
            compressText: false,
            preserveVectors: true
        };
        
        // 计算目标压缩比
        const targetRatio = targetSize / originalSize;
        
        // 根据页面类型和目标大小调整策略
        if (analysis.imagePages > analysis.totalPages * 0.5) {
            // 主要是图片页面，采用更激进的压缩
            strategy.imageQuality = Math.max(0.2, Math.min(0.6, targetRatio));
            strategy.imageScale = Math.max(0.4, Math.min(0.8, targetRatio));
        } else if (analysis.textPages > analysis.totalPages * 0.7) {
            // 主要是文字页面，采用温和的压缩
            strategy.imageQuality = Math.max(0.4, Math.min(0.8, targetRatio));
            strategy.imageScale = Math.max(0.6, Math.min(0.9, targetRatio));
            strategy.compressText = true;
        } else {
            // 混合页面，平衡压缩
            strategy.imageQuality = Math.max(0.3, Math.min(0.7, targetRatio));
            strategy.imageScale = Math.max(0.5, Math.min(0.8, targetRatio));
            strategy.compressText = true;
        }
        
        // 对于小目标大小，进一步降低参数
        if (targetSize <= 2) {
            strategy.imageQuality *= 0.8;
            strategy.imageScale *= 0.8;
        }
        
        return strategy;
    }

    /**
     * 应用压缩策略
     */
    async function applyCompressionStrategy(newPdfDoc, sourcePdfDoc, strategy) {
        const totalPages = sourcePdfDoc.getPageCount();
        
        for (let i = 0; i < totalPages; i++) {
            showToast(`正在处理第 ${i + 1}/${totalPages} 页...`);
            
            const sourcePage = sourcePdfDoc.getPages()[i];
            const [copiedPage] = await newPdfDoc.copyPages(sourcePdfDoc, [i]);
            
            // 处理页面上的图片
            if (strategy.imageScale < 1 || strategy.imageQuality < 1) {
                await processPageImages(copiedPage, strategy);
            }
            
            newPdfDoc.addPage(copiedPage);
        }
    }

    /**
     * 处理页面图片
     */
    async function processPageImages(page, strategy) {
        const images = await extractPageImages(page);
        
        for (const img of images) {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 加载原始图片
                const imgBlob = new Blob([img.data]);
                const originalImage = await createImageBitmap(imgBlob);
                
                // 计算新尺寸
                const newWidth = Math.floor(originalImage.width * strategy.imageScale);
                const newHeight = Math.floor(originalImage.height * strategy.imageScale);
                
                // 压缩图片
                canvas.width = newWidth;
                canvas.height = newHeight;
                ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);
                
                const compressedData = canvas.toDataURL('image/jpeg', strategy.imageQuality);
                
                // 更新图片数据
                const newImage = await page.doc.embedJpg(compressedData);
                Object.assign(img.ref, newImage);
            } catch (error) {
                console.warn('图片处理失败:', error);
            }
        }
    }

    /**
     * 提取页面中的图片
     */
    async function extractPageImages(page) {
        const images = [];
        const resources = await page.node.Resources();
        if (!resources) return images;

        const xObjects = await resources.lookup(PDFLib.PDFName.of('XObject'));
        if (!xObjects) return images;

        for (const [name, xObject] of Object.entries(xObjects.dict)) {
            if (xObject instanceof PDFLib.PDFStream) {
                const subtype = await xObject.lookup(PDFLib.PDFName.of('Subtype'));
                if (subtype === PDFLib.PDFName.of('Image')) {
                    images.push({
                        ref: xObject,
                        data: await xObject.getContents()
                    });
                }
            }
        }
        return images;
    }

    /**
     * 计算需要的压缩比例
     */
    function calculateCompressionRatio(originalSize, targetSize) {
        if (originalSize <= targetSize) return 0.5;
        const ratio = targetSize / originalSize;
        return Math.max(0.1, Math.min(0.5, ratio)); // 压缩比例在 0.1-0.5 之间
    }

    // 获取压缩质量值
    function getCompressionLevel(level) {
        switch (level) {
            case 'high':
                return {
                    imageQuality: 0.3,
                    imageScale: 0.5
                };
            case 'medium':
                return {
                    imageQuality: 0.5,
                    imageScale: 0.75
                };
            case 'low':
                return {
                    imageQuality: 0.7,
                    imageScale: 0.9
                };
            default:
                return {
                    imageQuality: 0.5,
                    imageScale: 0.75
                };
        }
    }

    // PDF 拆分功能
    async function splitPdf() {
        if (!currentPdfDoc) {
            showToast('请先上传PDF文件');
            return;
        }

        const pageRanges = parsePageRanges(pageRangeInput.value);
        if (pageRanges.length === 0) {
            showToast('请输入有效的页面范围');
            return;
        }

        // 验证页面范围是否有效
        for (const range of pageRanges) {
            if (range.start > totalPages || range.end > totalPages) {
                showToast(`页面范围超出范围，PDF共${totalPages}页`);
                return;
            }
            if (range.start > range.end) {
                showToast('页面范围无效，起始页不能大于结束页');
                return;
            }
        }

        try {
            showToast('开始拆分，请稍候...');

            // 获取原始PDF数据
            const existingPdfBytes = await fetch(currentPdfUrl).then(res => res.arrayBuffer());
            
            // 创建zip文件保存拆分后的PDF
            const zip = new JSZip();
            
            // 处理每个页面范围
            for (let i = 0; i < pageRanges.length; i++) {
                const range = pageRanges[i];
                
                // 创建新的PDF文档
                const pdfDoc = await PDFLib.PDFDocument.create();
                const sourcePdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
                
                // 复制指定范围的页面
                const pages = await pdfDoc.copyPages(sourcePdfDoc, 
                    Array.from({length: range.end - range.start + 1}, 
                        (_, i) => range.start - 1 + i)
                );
                
                // 添加页面到新文档
                pages.forEach(page => pdfDoc.addPage(page));
                
                // 保存PDF
                const pdfBytes = await pdfDoc.save();
                
                // 添加到zip
                const fileName = pageRanges.length === 1 ? 
                    `split_pages_${range.start}-${range.end}.pdf` :
                    `split_${i + 1}_pages_${range.start}-${range.end}.pdf`;
                
                zip.file(fileName, pdfBytes);
                
                showToast(`正在处理第 ${i + 1}/${pageRanges.length} 个范围`);
            }
            
            // 生成并下载zip文件
            const content = await zip.generateAsync({type: 'blob'});
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = pageRanges.length === 1 ? 'split.pdf' : 'split_pdfs.zip';
            link.click();
            URL.revokeObjectURL(url);
            
            showToast('拆分完成！');
        } catch (error) {
            console.error('拆分错误:', error);
            showToast('拆分失败，请重试');
        }
    }

    /**
     * 解析页面范围
     * @param {string} input - 输入的页面范围字符串，如 "1-3,5,7-9"
     * @returns {Array<{start: number, end: number}>} 解析后的页面范围数组
     */
    function parsePageRanges(input) {
        if (!input.trim()) return [];
        
        const ranges = [];
        const parts = input.split(',').map(part => part.trim());
        
        for (const part of parts) {
            if (!part) continue;
            
            const range = part.split('-').map(num => parseInt(num.trim()));
            if (range.length === 1 && !isNaN(range[0])) {
                // 单页
                ranges.push({ start: range[0], end: range[0] });
            } else if (range.length === 2 && !isNaN(range[0]) && !isNaN(range[1])) {
                // 页面范围
                ranges.push({ start: range[0], end: range[1] });
            }
        }
        
        return ranges;
    }

    // 事件监听
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
    });

    uploadBtn.addEventListener('click', () => {
        pdfInput.click();
    });

    pdfInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    });

    document.getElementById('startConvertImageBtn').addEventListener('click', convertPdfToImages);
    document.getElementById('startSplitBtn').addEventListener('click', splitPdf);
    document.getElementById('startCompressBtn').addEventListener('click', compressPdf);

    /**
     * PDF 水印功能
     */
    async function addWatermark() {
        if (!currentPdfDoc) {
            showToast('请先上传PDF文件');
            return;
        }

        const watermarkText = document.getElementById('watermarkText').value.trim();
        if (!watermarkText) {
            showToast('请输入水印文字');
            return;
        }

        // 检测是否包含中文字符
        if (/[\u4e00-\u9fa5]/.test(watermarkText)) {
            showToast('暂不支持中文水印，请使用英文字母和数字');
            return;
        }

        try {
            showToast('开始添加水印，请稍候...');

            // 获取水印参数
            const color = document.getElementById('watermarkColor').value;
            const size = getSizeInPt(document.getElementById('watermarkSize').value);
            const rotation = parseInt(document.getElementById('watermarkRotation').value);
            const opacity = parseFloat(document.getElementById('watermarkOpacity').value);
            const density = document.getElementById('watermarkDensity').value;
            const position = document.getElementById('watermarkPosition').value;

            // 获取原始PDF数据
            const existingPdfBytes = await fetch(currentPdfUrl).then(res => res.arrayBuffer());
            const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
            
            // 使用基本字体
            const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
            
            // 处理每一页
            const pages = pdfDoc.getPages();
            for (let i = 0; i < pages.length; i++) {
                showToast(`正在处理第 ${i + 1}/${pages.length} 页...`);
                
                const page = pages[i];
                const { width, height } = page.getSize();
                
                // 根据密度确定水印位置
                const watermarkConfig = getWatermarkConfig(density, position, width, height);
                
                // 在每个位置添加水印
                for (const pos of watermarkConfig) {
                    page.drawText(watermarkText, {
                        x: pos.x,
                        y: pos.y,
                        size: size,
                        font: font,
                        color: PDFLib.rgb(...hexToRgb(color)),
                        opacity: opacity,
                        rotate: PDFLib.degrees(rotation)
                    });
                }
            }
            
            // 保存添加水印后的PDF
            const pdfBytes = await pdfDoc.save();
            
            // 下载文件
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `watermarked.pdf`;
            link.click();
            URL.revokeObjectURL(url);
            
            showToast('水印添加完成！');
        } catch (error) {
            console.error('水印添加错误:', error);
            showToast('水印添加失败，请重试');
        }
    }

    /**
     * 获取水印配置
     */
    function getWatermarkConfig(density, position, pageWidth, pageHeight) {
        const positions = [];
        const margin = 50;
        
        if (position === 'center') {
            // 居中单个水印
            positions.push({
                x: pageWidth / 2,
                y: pageHeight / 2
            });
        } else if (position === 'tile') {
            // 平铺水印
            const spacing = density === 'sparse' ? 400 : 
                           density === 'medium' ? 300 : 200;
            
            for (let y = margin; y < pageHeight - margin; y += spacing) {
                for (let x = margin; x < pageWidth - margin; x += spacing) {
                    positions.push({ x, y });
                }
            }
        } else {
            // 自定义位置（四角和中心）
            positions.push(
                { x: margin, y: margin }, // 左下
                { x: pageWidth - margin, y: margin }, // 右下
                { x: margin, y: pageHeight - margin }, // 左上
                { x: pageWidth - margin, y: pageHeight - margin }, // 右上
                { x: pageWidth / 2, y: pageHeight / 2 } // 中心
            );
        }
        
        return positions;
    }

    /**
     * 将十六进制颜色转换为RGB
     */
    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return [r, g, b];
    }

    /**
     * 获取水印大小（点）
     */
    function getSizeInPt(size) {
        switch (size) {
            case 'small': return 24;
            case 'medium': return 36;
            case 'large': return 48;
            default: return 36;
        }
    }

    // 事件监听
    document.getElementById('startWatermarkBtn').addEventListener('click', addWatermark);

    /**
     * PDF 删除页面功能
     */
    async function deletePdfPages() {
        if (!currentPdfDoc) {
            showToast('请先上传PDF文件');
            return;
        }

        const pageInput = document.getElementById('deletePageInput').value.trim();
        if (!pageInput) {
            showToast('请输入要删除的页码');
            return;
        }

        try {
            // 解析要删除的页码
            const deletePages = parsePageRanges(pageInput);
            if (deletePages.length === 0) {
                showToast('请输入有效的页码范围');
                return;
            }

            // 验证页码范围
            for (const range of deletePages) {
                if (range.start > totalPages || range.end > totalPages) {
                    showToast(`页码范围超出范围，PDF共${totalPages}页`);
                    return;
                }
                if (range.start > range.end) {
                    showToast('页码范围无效，起始页不能大于结束页');
                    return;
                }
            }

            showToast('开始处理，请稍候...');

            // 获取原始PDF数据
            const existingPdfBytes = await fetch(currentPdfUrl).then(res => res.arrayBuffer());
            const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
            
            // 创建新的PDF文档
            const newPdfDoc = await PDFLib.PDFDocument.create();
            
            // 创建要删除的页码集合（用于快速查找）
            const pagesToDelete = new Set();
            deletePages.forEach(range => {
                for (let i = range.start; i <= range.end; i++) {
                    pagesToDelete.add(i);
                }
            });
            
            // 复制不需要删除的页面
            const totalPageCount = pdfDoc.getPageCount();
            for (let i = 1; i <= totalPageCount; i++) {
                if (!pagesToDelete.has(i)) {
                    const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i - 1]);
                    newPdfDoc.addPage(copiedPage);
                }
            }
            
            // 保存新的PDF
            const pdfBytes = await newPdfDoc.save();
            
            // 下载文件
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `deleted_pages.pdf`;
            link.click();
            URL.revokeObjectURL(url);
            
            showToast('页面删除完成！');
        } catch (error) {
            console.error('删除页面错误:', error);
            showToast('删除页面失败，请重试');
        }
    }

    // 绑定删除页面按钮事件
    document.getElementById('startDeleteBtn').addEventListener('click', deletePdfPages);

    /**
     * PDF 编辑功能
     */
    async function initPdfEditor() {
        if (!currentPdfDoc) {
            showToast('请先上传PDF文件');
            return;
        }

        let currentPage = null;
        let scale = 1.5; // 放大一点以便编辑

        try {
            // 初始化页面选择器
            const pageSelector = document.getElementById('pageSelector');
            pageSelector.innerHTML = '<option value="">选择页面...</option>' + 
                Array.from({length: totalPages}, (_, i) => 
                    `<option value="${i + 1}">第 ${i + 1} 页</option>`
                ).join('');

            /**
             * 渲染并解析PDF页面内容
             */
            async function renderAndParsePage(pageNumber) {
                if (!pageNumber) return;
                
                try {
                    // 获取编辑容器
                    const editContainer = document.getElementById('editContainer');
                    editContainer.innerHTML = ''; // 清除现有内容
                    
                    // 获取PDF页面
                    const page = await currentPdfDoc.getPage(pageNumber);
                    const viewport = page.getViewport({ scale });
                    
                    // 设置容器大小
                    editContainer.style.width = `${viewport.width}px`;
                    editContainer.style.height = `${viewport.height}px`;
                    
                    // 1. 提取文本内容
                    const textContent = await page.getTextContent();
                    textContent.items.forEach(item => {
                        // 创建文本元素
                        const textElement = document.createElement('div');
                        textElement.className = 'pdf-text-element';
                        textElement.textContent = item.str;
                        textElement.contentEditable = true;
                        
                        // 计算文本位置
                        const tx = item.transform[4];
                        const ty = viewport.height - item.transform[5]; // 需要翻转 y 坐标
                        
                        // 设置位置和样式
                        textElement.style.left = `${tx * scale}px`;
                        textElement.style.top = `${ty * scale}px`;
                        textElement.style.fontSize = `${Math.abs(item.transform[0] * scale)}px`;
                        textElement.style.fontFamily = item.fontName || 'Arial';
                        
                        // 添加到容器
                        editContainer.appendChild(textElement);
                        
                        // 添加拖拽功能
                        makeElementDraggable(textElement);
                    });
                    
                    // 2. 提取图片内容
                    const operatorList = await page.getOperatorList();
                    const commonObjs = page.commonObjs;
                    const objs = page.objs;
                    
                    for (let i = 0; i < operatorList.fnArray.length; i++) {
                        if (operatorList.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
                            const imgName = operatorList.argsArray[i][0];
                            const img = await objs.get(imgName);
                            
                            if (img && img.src) {
                                // 创建图片元素
                                const imgElement = document.createElement('img');
                                imgElement.className = 'pdf-image-element';
                                imgElement.src = img.src;
                                
                                // 获取图片变换矩阵
                                const matrix = operatorList.argsArray[i][1] || [1, 0, 0, 1, 0, 0];
                                
                                // 计算图片位置
                                const imgX = matrix[4] || 0;
                                const imgY = viewport.height - (matrix[5] || 0);
                                
                                // 设置位置和大小
                                imgElement.style.left = `${imgX * scale}px`;
                                imgElement.style.top = `${imgY * scale}px`;
                                imgElement.style.width = `${img.width * scale}px`;
                                imgElement.style.height = `${img.height * scale}px`;
                                
                                // 添加到容器
                                editContainer.appendChild(imgElement);
                                
                                // 添加拖拽功能
                                makeElementDraggable(imgElement);
                            }
                        }
                    }
                    
                    // 更新当前页面
                    currentPage = pageNumber;
                    
                } catch (error) {
                    console.error('页面渲染错误:', error);
                    showToast('页面渲染失败，请重试');
                }
            }

            /**
             * 使元素可拖拽
             */
            function makeElementDraggable(element) {
                let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
                element.onmousedown = dragMouseDown;

                function dragMouseDown(e) {
                    e.preventDefault();
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;
                }

                function elementDrag(e) {
                    e.preventDefault();
                    pos1 = pos3 - e.clientX;
                    pos2 = pos4 - e.clientY;
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                    element.style.top = (element.offsetTop - pos2) + "px";
                    element.style.left = (element.offsetLeft - pos1) + "px";
                }

                function closeDragElement() {
                    document.onmouseup = null;
                    document.onmousemove = null;
                }
            }

            // 页面选择事件
            pageSelector.addEventListener('change', (e) => {
                const pageNumber = parseInt(e.target.value);
                if (pageNumber) {
                    renderAndParsePage(pageNumber);
                }
            });

            showToast('编辑器初始化完成，请选择要编辑的页面');
            
        } catch (error) {
            console.error('编辑器初始化错误:', error);
            showToast('编辑器初始化失败，请重试');
        }
    }

    // 绑定编辑功能初始化
    document.getElementById('editPdfBtn').addEventListener('click', initPdfEditor);

    // 确保在初始化时就绑定转换按钮事件
    const startConvertWordBtn = document.getElementById('startConvertWordBtn');
    if (startConvertWordBtn) {
        startConvertWordBtn.addEventListener('click', async () => {
            try {
                await convertToWord();
            } catch (error) {
                console.error('转换错误:', error);
                showToast('转换失败，请重试');
            }
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePdfProcessor);

/**
 * PDF 转 Word 功能
 */
async function convertToWord() {
    if (!currentPdfDoc) {
        showToast('请先上传PDF文件');
        return;
    }

    try {
        showToast('开始转换，请稍候...');

        // 创建一个数组存储所有文本内容
        const allContent = [];

        // 处理每一页
        for (let i = 1; i <= totalPages; i++) {
            try {
                showToast(`正在处理第 ${i}/${totalPages} 页...`);
                
                const page = await currentPdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                const viewport = page.getViewport({ scale: 1.0 });

                // 按垂直位置分组文本
                const lineHeight = 12;
                const textLines = {};
                
                textContent.items.forEach(item => {
                    try {
                        // 计算文本在页面中的位置
                        const y = viewport.height - item.transform[5];
                        const lineIndex = Math.round(y / lineHeight);
                        
                        if (!textLines[lineIndex]) {
                            textLines[lineIndex] = {
                                texts: [],
                                x: []
                            };
                        }
                        
                        textLines[lineIndex].texts.push(item.str);
                        textLines[lineIndex].x.push(item.transform[4]);
                    } catch (itemError) {
                        console.warn('处理文本项时出错:', itemError);
                    }
                });

                // 将文本按行组织
                const lines = Object.keys(textLines)
                    .sort((a, b) => a - b)
                    .map(lineIndex => {
                        const line = textLines[lineIndex];
                        // 根据 x 坐标排序每行中的文本
                        const sortedIndices = line.x
                            .map((x, i) => ({ x, i }))
                            .sort((a, b) => a.x - b.x)
                            .map(item => item.i);
                        
                        return line.texts
                            .map((_, i) => line.texts[sortedIndices[i]])
                            .join(' ')
                            .trim();
                    })
                    .filter(line => line.length > 0);

                // 添加页面内容
                allContent.push(...lines, ''); // 添加空行作为段落分隔符
            } catch (pageError) {
                console.error(`处理第 ${i} 页时出错:`, pageError);
                showToast(`处理第 ${i} 页时出错，继续处理下一页`);
            }
        }

        // 创建包含样式的HTML
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    p { margin: 1em 0; }
                </style>
            </head>
            <body>
                ${allContent.map(line => `<p>${line}</p>`).join('\n')}
            </body>
            </html>
        `;

        // 转换为Word文档
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'converted.doc';
        link.click();
        URL.revokeObjectURL(url);

        showToast('转换完成！');
    } catch (error) {
        console.error('转换错误:', error);
        showToast(`转换失败: ${error.message}`);
    }
}

// 移除重复的事件监听器和绑定
document.removeEventListener('click', () => {
    showToast('PDF 转 Word 功能即将上线');
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePdfProcessor);