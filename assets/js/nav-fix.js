/**
 * 导航栏修复JS
 * 实现导航栏的响应式菜单、滚动效果和价格更新功能
 */

// 当DOM内容加载完毕后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已有CYBER全局对象，如果有，则使用它，否则初始化一个新的
    if (typeof CYBER !== 'undefined' && CYBER.initNavigation) {
        CYBER.initNavigation();
    } else {
        initNavigation();
    }
});

/**
 * 初始化导航栏
 */
function initNavigation() {
    // 菜单切换按钮
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navContainer = document.querySelector('.cyber-nav');
    
    // 如果找到了菜单切换按钮，添加点击事件监听器
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            // 切换导航链接的显示状态
            navLinks.classList.toggle('active');
            
            // 播放点击声音，如果CYBER对象存在并有播放声音的方法
            if (typeof CYBER !== 'undefined' && CYBER.playSound) {
                CYBER.playSound('click');
            }
        });
    }
    
    // 在移动设备上，当用户点击链接后关闭菜单
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', function() {
            // 如果在移动视图中
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                
                // 播放声音，如果有的话
                if (typeof CYBER !== 'undefined' && CYBER.playSound) {
                    CYBER.playSound('click');
                }
            }
        });
    });
    
    // 页面滚动时添加导航栏样式
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navContainer.classList.add('scrolled');
        } else {
            navContainer.classList.remove('scrolled');
        }
    });
    
    // 初始化比特币价格显示
    updateNavPrice();
    
    // 如果全局对象CYBER存在，将这个方法添加到其中
    if (typeof CYBER !== 'undefined') {
        CYBER.initNavigation = initNavigation;
        CYBER.updateNavPrice = updateNavPrice;
    }
}

/**
 * 更新导航栏中的比特币价格
 */
function updateNavPrice() {
    const priceElement = document.getElementById('currentPrice');
    const changeElement = document.getElementById('priceChange');
    
    // 如果价格元素不存在，直接返回
    if (!priceElement) return;
    
    // 如果CYBER对象存在并有价格数据，使用它
    if (typeof CYBER !== 'undefined' && CYBER.bitcoinPrice) {
        priceElement.textContent = CYBER.bitcoinPrice;
        
        if (changeElement && CYBER.priceChangePercent) {
            changeElement.textContent = CYBER.priceChangePercent;
            
            // 根据价格变化添加颜色
            if (CYBER.priceChangePercent.startsWith('+')) {
                changeElement.classList.add('positive');
                changeElement.classList.remove('negative');
            } else if (CYBER.priceChangePercent.startsWith('-')) {
                changeElement.classList.add('negative');
                changeElement.classList.remove('positive');
            } else {
                changeElement.classList.remove('positive');
                changeElement.classList.remove('negative');
            }
        }
    } else {
        // 如果没有CYBER对象或价格数据，使用模拟数据
        const mockPrice = '$' + (Math.floor(Math.random() * 10000) + 60000).toLocaleString();
        priceElement.textContent = mockPrice;
        
        if (changeElement) {
            const isPositive = Math.random() > 0.4;  // 60%概率是正的
            const changePercent = (Math.random() * 5).toFixed(2);
            changeElement.textContent = isPositive ? `+${changePercent}%` : `-${changePercent}%`;
            
            if (isPositive) {
                changeElement.classList.add('positive');
                changeElement.classList.remove('negative');
            } else {
                changeElement.classList.add('negative');
                changeElement.classList.remove('positive');
            }
        }
    }
} 