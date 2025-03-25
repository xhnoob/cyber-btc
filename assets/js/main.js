/**
 * 赛博启示录 - 主JS文件
 * 包含网站全局公共功能
 */

// 全局变量
const CYBER = {
  // 当前比特币价格
  bitcoinPrice: 0,
  // 价格变化百分比
  priceChange: 0,
  // 动画状态
  animations: {
    isPageTransitioning: false
  },
  // API配置
  api: {
    coinGeckoBaseUrl: 'https://api.coingecko.com/api/v3'
  },
  
  // 初始化组件
  initComponents: function() {
    // 添加扫描线效果
    this.addScanLines();
    
    // 初始化页面切换动画
    this.initPageTransition();
    
    // 检查Three.js库可用性
    this.checkThreeJsLibrary();
    
    // 添加滚动动画
    this.addScrollAnimations();
  },
  
  // 检查Three.js库是否可用
  checkThreeJsLibrary: function() {
    if (typeof THREE === 'undefined') {
      console.error('警告: THREE未定义，Three.js库未正确加载！');
      // 尝试重新加载Three.js
      this.loadThreeJsLibrary();
    } else {
      console.log('Three.js库已成功加载');
    }
  },
  
  // 动态加载Three.js库
  loadThreeJsLibrary: function() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = function() {
      console.log('Three.js库已动态加载');
      // 重新初始化3D图表
      if (window.initPriceChart && document.getElementById('priceChart3D')) {
        window.initPriceChart();
      }
      
      // 更新：使用正确的地球可视化容器ID
      if (window.initWorldMap && document.getElementById('globeVisualization')) {
        window.initWorldMap();
      }
    };
    script.onerror = function() {
      console.error('无法加载Three.js库');
      CYBER.showFallbackCharts();
    };
    document.head.appendChild(script);
  },
  
  // 显示后备图表
  showFallbackCharts: function() {
    // 找到所有3D图表容器
    const containers = document.querySelectorAll('#priceChart3D, #globeVisualization');
    
    containers.forEach(container => {
      if (!container) return;
      
      // 显示错误信息
      container.innerHTML = `
        <div class="webgl-error">
          <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <h3>无法加载3D图表</h3>
          <p>无法加载Three.js库或您的浏览器不支持WebGL。</p>
          <p>我们将尝试显示简化版图表。</p>
        </div>
      `;
    });
    
    // 如果是价格图表，显示一个简单的2D版本
    this.createSimplePriceChart();
  },
  
  // 创建简单的价格图表
  createSimplePriceChart: function() {
    const container = document.getElementById('priceChart3D');
    if (!container) return;
    
    // 数据模拟
    const priceData = [
      67245, 66890, 68120, 69560, 70345, 69780, 
      71245, 73150, 72560, 74120, 75340, 76890
    ];
    const labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    
    // 创建简单的Canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 绘制背景
    ctx.fillStyle = 'rgba(10, 20, 30, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const y = i * (canvas.height / 10);
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    for (let i = 0; i < 12; i++) {
      const x = i * (canvas.width / 12);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    ctx.stroke();
    
    // 绘制价格线
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const maxPrice = Math.max(...priceData);
    const minPrice = Math.min(...priceData);
    const range = maxPrice - minPrice;
    
    priceData.forEach((price, i) => {
      const x = i * (canvas.width / (priceData.length - 1));
      const y = canvas.height - ((price - minPrice) / range) * (canvas.height * 0.8) - (canvas.height * 0.1);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // 填充下方区域
    ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // 添加标签
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    
    labels.forEach((label, i) => {
      const x = i * (canvas.width / (labels.length - 1));
      ctx.fillText(label, x, canvas.height - 10);
    });
    
    // 添加价格标签
    ctx.textAlign = 'left';
    ctx.fillText(`$${minPrice.toLocaleString()}`, 10, canvas.height - 30);
    ctx.fillText(`$${maxPrice.toLocaleString()}`, 10, 30);
  },
  
  // 添加扫描线效果到特定元素
  addScanLines: function() {
    const scanLineElements = document.querySelectorAll('.cyber-card, .hologram-container');
    scanLineElements.forEach(element => {
      const scanLine = document.createElement('div');
      scanLine.className = 'scan-line';
      element.appendChild(scanLine);
    });
  },
  
  // 初始化页面切换动画
  initPageTransition: function() {
    const transitionElement = document.querySelector('.page-transition');
    if (!transitionElement) return;
    
    // 为所有内部链接添加过渡动画
    document.querySelectorAll('a[href^="./"], a[href^="/"], a[href^="pages/"]').forEach(link => {
      link.addEventListener('click', e => {
        const target = e.currentTarget.getAttribute('href');
        if (target) {
          e.preventDefault();
          
          // 触发页面过渡动画
          CYBER.triggerPageTransition(target);
        }
      });
    });
  },
  
  // 触发页面过渡动画
  triggerPageTransition: function(targetUrl) {
    if (this.animations.isPageTransitioning) return;
    
    this.animations.isPageTransitioning = true;
    const transitionElement = document.querySelector('.page-transition');
    
    // 添加过渡动画类
    transitionElement.classList.add('active');
    
    // 播放电子音效
    this.playSound('transition');
    
    // 延迟导航到目标页面
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 600);
  },
  
  // 更新比特币价格
  updateBitcoinPrice: async function(priceElementId = 'currentPrice', changeElementId = 'priceChange') {
    try {
      const response = await fetch(`${this.api.coinGeckoBaseUrl}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`);
      const data = await response.json();
      
      if (data && data.bitcoin) {
        const newPrice = data.bitcoin.usd;
        const priceChange = data.bitcoin.usd_24h_change;
        
        // 保存到全局变量
        this.bitcoinPrice = newPrice;
        this.priceChange = priceChange;
        
        // 更新显示的价格元素
        this.updatePriceDisplay(newPrice, priceChange, priceElementId, changeElementId);
        
        return { price: newPrice, change: priceChange };
      }
    } catch (error) {
      console.error('获取比特币价格失败:', error);
      return null;
    }
  },
  
  // 更新价格显示
  updatePriceDisplay: function(price, change, priceElementId = 'currentPrice', changeElementId = 'priceChange') {
    const priceElement = document.getElementById(priceElementId);
    const changeElement = document.getElementById(changeElementId);
    
    if (priceElement) {
      // 格式化价格
      const formattedPrice = `$${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
      
      // 判断是否需要动画
      const currentText = priceElement.innerText;
      if (currentText && currentText !== '$--,---' && !isNaN(parseFloat(currentText.replace('$', '').replace(',', '')))) {
        // 添加价格变化动画
        const currentPrice = parseFloat(currentText.replace('$', '').replace(/,/g, ''));
        this.animateValue(priceElement, currentPrice, price, 500);
      } else {
        // 直接设置值
        priceElement.innerText = formattedPrice;
      }
      
      // 添加闪烁效果
      priceElement.classList.add('price-update');
      setTimeout(() => {
        priceElement.classList.remove('price-update');
      }, 500);
    }
    
    if (changeElement) {
      // 更新价格变化
      const formattedChange = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
      changeElement.innerText = formattedChange;
      
      // 设置颜色类名
      changeElement.classList.remove('positive', 'negative');
      changeElement.classList.add(change >= 0 ? 'positive' : 'negative');
    }
  },
  
  // 数字变化动画
  animateValue: function(element, start, end, duration) {
    let startTimestamp = null;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue = progress * (end - start) + start;
      
      element.innerText = `$${currentValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  },
  
  // 播放音效
  playSound: function(type) {
    // 检查声音是否启用
    if (localStorage.getItem('cybersoundEnabled') === 'false') {
      return;
    }
    
    let soundFile;
    
    switch (type) {
      case 'click':
        soundFile = 'click.mp3';
        break;
      case 'hover':
        soundFile = 'hover.mp3';
        break;
      case 'transition':
        soundFile = 'transition.mp3';
        break;
      case 'alert':
        soundFile = 'alert.mp3';
        break;
      default:
        soundFile = 'click.mp3';
    }
    
    try {
      const sound = new Audio(`../assets/sounds/${soundFile}`);
      sound.volume = 0.3; // 设置音量
      sound.play().catch(e => {
        // 忽略静默失败 - 有些浏览器需要用户交互才能播放声音
        console.log("声音播放被浏览器策略阻止，需要用户交互");
      });
    } catch (error) {
      console.error('播放声音失败:', error);
    }
  },
  
  // 初始化导航事件
  initNavigation: function() {
    // 初始化移动导航开关
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        this.playSound('click');
      });
    }
    
    // 为所有导航链接添加事件
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        this.playSound('click');
      });
      
      link.addEventListener('mouseenter', () => {
        this.playSound('hover');
      });
    });
    
    // 为所有按钮添加音效
    document.querySelectorAll('.cyber-button, button').forEach(button => {
      button.addEventListener('click', () => {
        this.playSound('click');
      });
      
      button.addEventListener('mouseenter', () => {
        this.playSound('hover');
      });
    });
  },
  
  // 添加霓虹文字效果
  addNeonTextEffect: function(element) {
    if (!element) return;
    
    const text = element.textContent;
    element.textContent = '';
    
    [...text].forEach(char => {
      const span = document.createElement('span');
      span.textContent = char;
      span.className = 'neon-char';
      
      // 随机延迟闪烁
      span.style.animationDelay = `${Math.random() * 2}s`;
      
      element.appendChild(span);
    });
  },
  
  // 终端样式打印效果
  terminalPrint: function(element, text, speed = 50, callback) {
    if (!element) return;
    
    let i = 0;
    element.textContent = '';
    
    const typeNextChar = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typeNextChar, speed);
      } else if (callback && typeof callback === 'function') {
        callback();
      }
    };
    
    typeNextChar();
  },
  
  // 添加滚动动画
  addScrollAnimations: function() {
    // 获取所有需要动画的元素
    const animatedElements = document.querySelectorAll('.fade-in-section, .slide-in-left, .slide-in-right, .cyber-card, .region-info-panel');
    
    if (!animatedElements.length) return;
    
    // 观察者选项
    const options = {
      root: null, // 使用视口作为根
      threshold: 0.1, // 当10%的元素可见时触发
      rootMargin: '0px' // 无边距
    };
    
    // 创建IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 元素进入视口，添加动画类
          entry.target.classList.add('visible');
          
          // 如果元素有delay-动画属性，应用延迟
          const delay = entry.target.getAttribute('data-delay');
          if (delay) {
            entry.target.style.animationDelay = `${delay}ms`;
          }
          
          // 应用后不再观察此元素
          observer.unobserve(entry.target);
        }
      });
    }, options);
    
    // 开始观察所有元素
    animatedElements.forEach(element => {
      observer.observe(element);
    });
    
    // 滚动指示器淡出
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
          scrollIndicator.classList.add('fade-out');
        } else {
          scrollIndicator.classList.remove('fade-out');
        }
      });
    }
  }
};

// 页面加载完成事件
document.addEventListener('DOMContentLoaded', () => {
  console.log('%c赛博启示录 - 比特币数据矩阵已激活', 'color: #00FFFF; font-size: 16px; font-weight: bold;');
  
  // 初始化组件
  CYBER.initComponents();
  
  // 获取比特币价格
  CYBER.updateBitcoinPrice();
  
  // 初始化导航事件
  CYBER.initNavigation();
}); 