/**
 * 初始化图片裁剪工具
 */
function initializeImageCropTool() {
    // DOM 元素获取
    const imageInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('dropZone');
    const uploadBtn = document.querySelector('.upload-btn');
    const clearBtn = document.getElementById('clearInputBtn');
    const cropPreview = document.getElementById('cropPreview');
    const ratio34Btn = document.getElementById('ratio34Btn');
    const ratio43Btn = document.getElementById('ratio43Btn');
    const ratioFreeBtn = document.getElementById('ratioFreeBtn');
    const rotateLeftBtn = document.getElementById('rotateLeftBtn');
    const rotateRightBtn = document.getElementById('rotateRightBtn');
    const resetCropBtn = document.getElementById('resetCropBtn');
    const startCropBtn = document.getElementById('startCropBtn');
    
    let currentImage = null;
    let cropper = null;

    /**
     * 显示提示信息
     * @param {string} message - 提示信息内容
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
     * 处理文件上传
     * @param {FileList} files - 上传的文件列表
     */
    function handleFileUpload(files) {
        if (files.length === 0) return;
        
        const file = files[0]; // 只处理第一个文件
        
        if (!file.type.startsWith('image/')) {
            showToast('请上传图片文件');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                currentImage = img;
                document.getElementById('fileName').textContent = file.name;
                document.getElementById('fileMeta').textContent = 
                    `尺寸：${img.width}x${img.height} | 大小：${(file.size / (1024 * 1024)).toFixed(2)}MB`;
                document.getElementById('imagePreview').src = e.target.result;
                
                // 显示预览
                document.getElementById('uploadContent').style.display = 'none';
                document.getElementById('previewContent').style.display = 'block';
                dropZone.classList.add('has-file');
                
                // 初始化裁剪器
                initCropper();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * 清除文件
     */
    function clearFile() {
        imageInput.value = '';
        currentImage = null;
        
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        
        document.getElementById('uploadContent').style.display = 'block';
        document.getElementById('previewContent').style.display = 'none';
        dropZone.classList.remove('has-file');
        
        showToast('已清除图片');
    }

    /**
     * 初始化裁剪器
     */
    function initCropper() {
        if (cropper) {
            cropper.destroy();
        }

        const image = document.createElement('img');
        image.src = currentImage.src;
        cropPreview.innerHTML = '';
        cropPreview.appendChild(image);

        // 初始化 Cropper.js
        cropper = new Cropper(image, {
            aspectRatio: NaN, // 默认自由比例
            viewMode: 1, // 限制裁剪框不超出图片的范围
            dragMode: 'move', // 拖动模式为移动图片
            autoCropArea: 0.8, // 自动裁剪区域大小
            restore: false,
            guides: true, // 显示裁剪框的虚线
            center: true, // 显示裁剪框的中心标记
            highlight: false,
            cropBoxMovable: true, // 可移动裁剪框
            cropBoxResizable: true, // 可调整裁剪框大小
            toggleDragModeOnDblclick: false, // 禁用双击切换拖动模式
            // 裁剪框尺寸显示
            crop(event) {
                const width = Math.round(event.detail.width);
                const height = Math.round(event.detail.height);
                // 更新实时尺寸显示
                document.getElementById('cropSizeDisplay').textContent = `${width} × ${height}`;
            }
        });
    }

    /**
     * 设置活跃比例按钮
     * @param {HTMLElement} activeBtn - 要设置为活跃的按钮元素
     */
    function setActiveRatioBtn(activeBtn) {
        document.querySelectorAll('.ratio-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    // 事件绑定 - 上传按钮
    uploadBtn.addEventListener('click', () => {
        imageInput.click();
    });

    // 事件绑定 - 文件选择
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files);
        }
    });

    // 事件绑定 - 清除按钮
    clearBtn.addEventListener('click', clearFile);

    // 事件绑定 - 拖放区域
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
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    });

    // 事件绑定 - 比例按钮
    ratio34Btn.addEventListener('click', () => {
        if (!cropper) return;
        cropper.setAspectRatio(3/4);
        setActiveRatioBtn(ratio34Btn);
    });

    ratio43Btn.addEventListener('click', () => {
        if (!cropper) return;
        cropper.setAspectRatio(4/3);
        setActiveRatioBtn(ratio43Btn);
    });

    ratioFreeBtn.addEventListener('click', () => {
        if (!cropper) return;
        cropper.setAspectRatio(NaN);
        setActiveRatioBtn(ratioFreeBtn);
    });

    // 事件绑定 - 旋转按钮
    rotateLeftBtn.addEventListener('click', () => {
        if (!cropper) return;
        cropper.rotate(-90);
    });

    rotateRightBtn.addEventListener('click', () => {
        if (!cropper) return;
        cropper.rotate(90);
    });

    // 事件绑定 - 重置按钮
    resetCropBtn.addEventListener('click', () => {
        if (!cropper) return;
        cropper.reset();
    });

    // 事件绑定 - 裁剪按钮
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

            if (!canvas) {
                showToast('裁剪失败，请重试');
                return;
            }

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
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializeImageCropTool); 