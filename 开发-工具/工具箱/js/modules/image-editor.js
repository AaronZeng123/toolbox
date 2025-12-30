/**
 * 初始化图片编辑器
 */
function initializeImageEditor() {
    // 获取 DOM 元素
    const imageInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('dropZone');
    const uploadBtn = document.querySelector('.upload-btn');
    const clearBtn = document.getElementById('clearInputBtn');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const keepRatioCheckbox = document.getElementById('keepRatio');
    
    let currentImage = null;
    let aspectRatio = 1;
    let imageFiles = []; // 存储多个图片文件

    // 处理文件上传
    function handleFileUpload(files) {
        imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            showToast('请上传图片文件');
            return;
        }

        // 清空预览网格
        const imagesGrid = document.getElementById('imagesGrid');
        imagesGrid.innerHTML = '';
        
        // 处理每个文件
        imageFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    // 创建预览项
                    const item = document.createElement('div');
                    item.className = 'image-item';
                    item.innerHTML = `
                        <img src="${e.target.result}" alt="${file.name}">
                        <div class="image-name">${file.name}</div>
                        <button class="remove-btn" data-index="${index}">×</button>
                    `;
                    imagesGrid.appendChild(item);

                    // 如果是第一张图片，显示在主预览区
                    if (index === 0) {
                        currentImage = img;
                        document.getElementById('fileName').textContent = file.name;
                        document.getElementById('fileMeta').textContent = 
                            `尺寸：${img.width}x${img.height} | 大小：${(file.size / (1024 * 1024)).toFixed(2)}MB`;
                        document.getElementById('imagePreview').src = e.target.result;
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });

        // 显示预览区域
        document.getElementById('uploadContent').style.display = 'none';
        document.getElementById('previewContent').style.display = 'block';
        document.getElementById('imagesPreview').style.display = 'block';
        dropZone.classList.add('has-file');
        
        // 启用功能按钮
        document.querySelectorAll('.action-btn[disabled]').forEach(btn => {
            btn.disabled = false;
        });

        showToast(`已加载 ${imageFiles.length} 张图片`);
    }

    // 清除文件
    function clearFile() {
        imageInput.value = '';
        currentImage = null;
        document.getElementById('uploadContent').style.display = 'block';
        document.getElementById('previewContent').style.display = 'none';
        dropZone.classList.remove('has-file');
        
        // 禁用功能按钮
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // 重置所有功能区域
        document.querySelectorAll('.function-section').forEach(section => {
            section.classList.remove('active');
        });
        
        showToast('已清除图片');
    }

    // 显示 Toast 提示
    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // 绑定上传按钮点击事件
    uploadBtn.addEventListener('click', () => {
        imageInput.click();
    });

    // 修改文件选择事件
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files);
        }
    });

    clearBtn.addEventListener('click', clearFile);

    // 拖放处理
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    // 修改拖放处理
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    });

    // 功能切换处理
    const functionButtons = {
        'compressBtn': 'compressSection',
        'resizeBtn': 'resizeSection',
        'cropBtn': 'cropSection',
        'scanPdfBtn': 'scanSection'
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
        if (btn) {
            btn.addEventListener('click', () => {
                switchFunction(sectionId, btn);
            });
        }
    });

    // 压缩功能
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const startCompressBtn = document.getElementById('startCompressBtn');

    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = `${qualitySlider.value}%`;
    });

    // 压缩功能 - 支持批量
    startCompressBtn.addEventListener('click', async () => {
        if (imageFiles.length === 0) {
            showToast('请先上传图片');
            return;
        }

        try {
            showToast(`正在压缩 ${imageFiles.length} 张图片...`);
            const quality = qualitySlider.value / 100;
            let processed = 0;

            // 创建 ZIP 文件
            const zip = new JSZip();
            
            // 处理每张图片
            for (const file of imageFiles) {
                const img = document.querySelector(`.image-item img[alt="${file.name}"]`);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0);
                
                // 压缩并添加到 ZIP
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                const base64Data = compressedDataUrl.split(',')[1];
                zip.file(`compressed_${file.name}`, base64Data, {base64: true});
                
                processed++;
                showToast(`已处理 ${processed}/${imageFiles.length} 张图片`);
            }

            // 下载 ZIP 文件
            const content = await zip.generateAsync({type: 'blob'});
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'compressed_images.zip';
            link.click();
            URL.revokeObjectURL(url);

            showToast('压缩完成！');
        } catch (error) {
            console.error('压缩失败:', error);
            showToast('压缩失败，请重试');
        }
    });

    // 调整尺寸功能
    const startResizeBtn = document.getElementById('startResizeBtn');

    // 调整尺寸功能 - 支持批量
    startResizeBtn.addEventListener('click', async () => {
        if (imageFiles.length === 0) {
            showToast('请先上传图片');
            return;
        }

        const newWidth = parseInt(widthInput.value);
        const newHeight = parseInt(heightInput.value);

        if (!newWidth || !newHeight) {
            showToast('请输入有效的宽度和高度');
            return;
        }

        try {
            showToast(`正在调整 ${imageFiles.length} 张图片的尺寸...`);
            let processed = 0;

            const zip = new JSZip();
            
            for (const file of imageFiles) {
                const img = document.querySelector(`.image-item img[alt="${file.name}"]`);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = newWidth;
                canvas.height = newHeight;
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                
                const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
                const base64Data = resizedDataUrl.split(',')[1];
                zip.file(`resized_${file.name}`, base64Data, {base64: true});
                
                processed++;
                showToast(`已处理 ${processed}/${imageFiles.length} 张图片`);
            }

            const content = await zip.generateAsync({type: 'blob'});
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'resized_images.zip';
            link.click();
            URL.revokeObjectURL(url);

            showToast('尺寸调整完成！');
        } catch (error) {
            console.error('调整尺寸失败:', error);
            showToast('调整失败，请重试');
        }
    });

    // 裁剪功能
    let cropper = null;
    const cropPreview = document.getElementById('cropPreview');
    const startCropBtn = document.getElementById('startCropBtn');
    const rotateLeftBtn = document.getElementById('rotateLeftBtn');
    const rotateRightBtn = document.getElementById('rotateRightBtn');
    const resetCropBtn = document.getElementById('resetCropBtn');
    const cropWidth = document.getElementById('cropWidth');
    const cropHeight = document.getElementById('cropHeight');
    const keepCropRatio = document.getElementById('keepCropRatio');
    const ratio34Btn = document.getElementById('ratio34Btn');
    const ratio43Btn = document.getElementById('ratio43Btn');
    const ratioFreeBtn = document.getElementById('ratioFreeBtn');

    // 初始化裁剪器
    function initCropper() {
        if (cropper) {
            cropper.destroy();
        }

        // 创建新的图片元素
        const image = document.createElement('img');
        image.src = currentImage.src;
        cropPreview.innerHTML = '';
        cropPreview.appendChild(image);

        // 初始化 Cropper
        cropper = new Cropper(image, {
            aspectRatio: NaN, // 自由比例
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 0.8,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
            // 添加裁剪框尺寸显示
            crop(event) {
                const width = Math.round(event.detail.width);
                const height = Math.round(event.detail.height);
                // 更新裁剪尺寸输入框
                document.getElementById('cropWidth').value = width;
                document.getElementById('cropHeight').value = height;
                // 更新实时尺寸显示
                document.getElementById('cropSizeDisplay').textContent = `${width} × ${height}`;
            }
        });
    }

    // 在切换到裁剪功能时初始化裁剪器
    document.getElementById('cropBtn').addEventListener('click', () => {
        if (currentImage) {
            setTimeout(initCropper, 100); // 等待 DOM 更新
        }
    });

    // 设置固定比例裁剪
    function setActiveRatioBtn(activeBtn) {
        // 移除所有比例按钮的活跃状态
        document.querySelectorAll('.ratio-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        // 添加当前按钮的活跃状态
        activeBtn.classList.add('active');
    }

    // 3:4 比例裁剪按钮
    ratio34Btn.addEventListener('click', () => {
        if (!cropper) return;
        cropper.setAspectRatio(3/4);
        setActiveRatioBtn(ratio34Btn);
    });

    // 4:3 比例裁剪按钮
    ratio43Btn.addEventListener('click', () => {
        if (!cropper) return;
        cropper.setAspectRatio(4/3);
        setActiveRatioBtn(ratio43Btn);
    });

    // 自由比例裁剪按钮
    ratioFreeBtn.addEventListener('click', () => {
        if (!cropper) return;
        cropper.setAspectRatio(NaN);
        setActiveRatioBtn(ratioFreeBtn);
    });

    // 旋转按钮
    rotateLeftBtn.addEventListener('click', () => {
        cropper && cropper.rotate(-90);
    });

    rotateRightBtn.addEventListener('click', () => {
        cropper && cropper.rotate(90);
    });

    // 重置裁剪
    resetCropBtn.addEventListener('click', () => {
        cropper && cropper.reset();
    });

    // 确认裁剪
    startCropBtn.addEventListener('click', () => {
        if (!cropper) {
            showToast('请先上传图片');
            return;
        }

        try {
            showToast('正在处理...');
            
            // 获取裁剪后的 canvas
            const canvas = cropper.getCroppedCanvas({
                maxWidth: 4096,
                maxHeight: 4096,
                fillColor: '#fff'
            });

            // 转换为图片并下载
            const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
            const link = document.createElement('a');
            link.href = croppedDataUrl;
            link.download = `cropped_${document.getElementById('fileName').textContent}`;
            link.click();

            showToast('裁剪完成！');
        } catch (error) {
            console.error('裁剪失败:', error);
            showToast('裁剪失败，请重试');
        }
    });

    // 更新裁剪器尺寸
    function updateCropperSize() {
        if (!cropper) return;

        const width = parseInt(cropWidth.value);
        const height = parseInt(cropHeight.value);

        if (width && height) {
            if (keepCropRatio.checked) {
                cropper.setAspectRatio(width / height);
            } else {
                cropper.setAspectRatio(NaN);
            }
            cropper.setCropBoxData({
                width: width,
                height: height
            });
        }
    }

    cropWidth.addEventListener('input', updateCropperSize);
    cropHeight.addEventListener('input', updateCropperSize);
    keepCropRatio.addEventListener('change', updateCropperSize);

    // 扫描为 PDF 功能
    const pageSizeSelect = document.getElementById('pageSize');
    const pageOrientationSelect = document.getElementById('pageOrientation');
    const startScanBtn = document.getElementById('startScanBtn');

    // PDF 页面尺寸配置
    const PAGE_SIZES = {
        'A4': { width: 595.28, height: 841.89 },
        'A5': { width: 419.53, height: 595.28 },
        'letter': { width: 612, height: 792 },
    };

    // 扫描为 PDF 功能 - 支持多图片
    startScanBtn.addEventListener('click', async () => {
        if (imageFiles.length === 0) {
            showToast('请先上传图片');
            return;
        }

        try {
            showToast('正在生成PDF...');

            // 创建 PDF 文档
            const pdfDoc = await PDFLib.PDFDocument.create();
            
            // 获取页面尺寸配置
            let pageSize = PAGE_SIZES[pageSizeSelect.value];
            const isLandscape = pageOrientationSelect.value === 'landscape';

            // 处理每张图片
            for (const file of imageFiles) {
                const img = document.querySelector(`.image-item img[alt="${file.name}"]`);
                
                // 如果选择自动尺寸，使用图片尺寸
                if (pageSizeSelect.value === 'auto') {
                    pageSize = {
                        width: img.naturalWidth,
                        height: img.naturalHeight
                    };
                }

                // 考虑页面方向
                const finalWidth = isLandscape ? pageSize.height : pageSize.width;
                const finalHeight = isLandscape ? pageSize.width : pageSize.height;

                // 创建页面
                const page = pdfDoc.addPage([finalWidth, finalHeight]);

                // 将图片转换为 PNG 格式
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0);
                const imageData = canvas.toDataURL('image/png').split(',')[1];

                // 将图片嵌入 PDF
                const pngImage = await pdfDoc.embedPng(imageData);
                
                // 计算图片在页面中的位置和尺寸
                const { width, height } = page.getSize();
                const scale = Math.min(
                    width / pngImage.width,
                    height / pngImage.height
                );
                const scaledWidth = pngImage.width * scale;
                const scaledHeight = pngImage.height * scale;
                const x = (width - scaledWidth) / 2;
                const y = (height - scaledHeight) / 2;

                // 绘制图片
                page.drawImage(pngImage, {
                    x,
                    y,
                    width: scaledWidth,
                    height: scaledHeight
                });
            }

            // 保存 PDF
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'scanned_images.pdf';
            link.click();
            URL.revokeObjectURL(url);

            showToast('PDF生成完成！');
        } catch (error) {
            console.error('PDF生成失败:', error);
            showToast('PDF生成失败，请重试');
        }
    });

    // 添加移除图片功能
    document.getElementById('imagesGrid').addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const index = parseInt(e.target.dataset.index);
            imageFiles.splice(index, 1);
            e.target.closest('.image-item').remove();
            
            // 更新剩余图片的索引
            document.querySelectorAll('.remove-btn').forEach((btn, i) => {
                btn.dataset.index = i;
            });

            if (imageFiles.length === 0) {
                clearFile();
            } else {
                // 更新主预览区为第一张图片
                const firstImage = document.querySelector('.image-item img');
                if (firstImage) {
                    currentImage.src = firstImage.src;
                    document.getElementById('imagePreview').src = firstImage.src;
                }
            }
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializeImageEditor);