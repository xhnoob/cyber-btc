/**
 * Edge浏览器和跨浏览器兼容性修复JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // 检测浏览器类型
    const isEdge = navigator.userAgent.indexOf('Edge') !== -1 || 
                    navigator.userAgent.indexOf('Edg/') !== -1;
    
    // 如果是Edge浏览器，应用特殊修复
    if (isEdge) {
        applyEdgeFixes();
    }
    
    // 应用通用的跨浏览器修复
    applyGeneralFixes();
});

/**
 * 对Edge浏览器应用特殊修复
 */
function applyEdgeFixes() {
    console.log('检测到Edge浏览器，正在应用特殊修复...');
    
    // 修复视频背景问题
    const bgVideos = document.querySelectorAll('.cyber-background video');
    bgVideos.forEach(video => {
        // 确保视频正确加载和定位
        video.style.position = 'fixed';
        
        // 监听视频加载错误并提供回退方案
        video.addEventListener('error', function() {
            const parent = this.parentElement;
            this.style.display = 'none';
            
            // 添加回退背景
            parent.style.backgroundImage = 'url("../assets/images/fallback-bg.jpg")';
            parent.style.backgroundSize = 'cover';
            parent.style.backgroundPosition = 'center center';
        });
        
        // 确保视频播放
        video.play().catch(e => {
            console.log('无法自动播放视频，错误:', e);
        });
    });
    
    // 修复扫描线效果
    fixScanLine();
    
    // 修复全息投影效果
    const hologramContainers = document.querySelectorAll('.hologram-container');
    hologramContainers.forEach(container => {
        container.style.perspective = '1000px';
        container.style.webkitPerspective = '1000px';
    });
    
    // 修复z-index堆叠问题
    document.querySelector('.cyber-nav').style.zIndex = '1000';
    
    // 添加特殊Edge类以便CSS定位
    document.body.classList.add('edge-browser');
}

/**
 * 应用通用的跨浏览器修复
 */
function applyGeneralFixes() {
    // 修复导航菜单在不同浏览器中的行为
    fixNavigation();
    
    // 确保响应式布局正确运行
    fixResponsiveLayout();
    
    // 确保字体加载
    checkFontLoading();
}

/**
 * 修复扫描线效果
 */
function fixScanLine() {
    // 移除现有的扫描线
    const oldScanLines = document.querySelectorAll('.scanline');
    oldScanLines.forEach(line => line.remove());
    
    // 创建优化的扫描线
    const scanLine = document.createElement('div');
    scanLine.className = 'scanline';
    document.body.appendChild(scanLine);
    
    // 使用requestAnimationFrame优化动画而不是CSS动画
    let position = 0;
    const height = document.body.clientHeight;
    
    function animateScanLine() {
        position = (position + 1) % height;
        scanLine.style.top = position + 'px';
        requestAnimationFrame(animateScanLine);
    }
    
    requestAnimationFrame(animateScanLine);
}

/**
 * 修复导航菜单在不同浏览器中的行为
 */
function fixNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        // 确保点击事件在所有浏览器中工作一致
        const originalClickHandler = menuToggle.onclick;
        menuToggle.onclick = null;
        
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.classList.toggle('active');
            
            // 如果定义了原始处理程序，调用它
            if (typeof originalClickHandler === 'function') {
                originalClickHandler.call(this, e);
            }
            
            // 播放声音，如果CYBER对象存在并有声音方法
            if (typeof CYBER !== 'undefined' && CYBER.playSound) {
                CYBER.playSound('click');
            }
        });
    }
}

/**
 * 确保响应式布局正确运行
 */
function fixResponsiveLayout() {
    // 添加窗口调整大小事件监听器
    window.addEventListener('resize', function() {
        // 调整导航栏
        const navLinks = document.querySelector('.nav-links');
        
        if (window.innerWidth > 768 && navLinks) {
            navLinks.classList.remove('active');
            navLinks.style.height = 'auto';
        }
        
        // 调整图表容器大小
        const chartContainers = document.querySelectorAll('.chart-container, .hologram-container');
        chartContainers.forEach(container => {
            // 触发图表调整大小
            if (typeof CYBER !== 'undefined' && CYBER.resizeCharts) {
                CYBER.resizeCharts();
            }
        });
    });
}

/**
 * 检查字体是否正确加载
 */
function checkFontLoading() {
    // 使用Web Font Loader检查字体加载
    if (typeof WebFont !== 'undefined') {
        WebFont.load({
            google: {
                families: [
                    'Orbitron:400,500,700', 
                    'Rajdhani:300,400,500,700', 
                    'Share Tech Mono', 
                    'Source Code Pro:400,700', 
                    'Teko:300,400,500,700'
                ]
            },
            active: function() {
                console.log('所有字体已加载');
                // 触发重排以确保字体正确应用
                document.body.style.opacity = 0.99;
                setTimeout(function() {
                    document.body.style.opacity = 1;
                }, 10);
            }
        });
    } else {
        // 如果WebFont未定义，使用CSS字体显示交换
        const style = document.createElement('style');
        style.textContent = `
            * {
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
    }
} 