/**
 * 赛博启示录 - 机构投资页面JS文件
 * 实现机构投资页面的图表和交互功能
 */

// 页面加载完成事件
document.addEventListener('DOMContentLoaded', () => {
  // 初始化投资流入图表
  initInvestmentFlowChart();
  
  // 初始化时间标签切换
  initFlowTabsEvents();
  
  // 初始化加载更多按钮
  initLoadMoreButton();
  
  // 添加表格行悬停效果
  initTableHoverEffects();
  
  // 添加预测卡片动画
  initPredictionCardEffects();
});

/**
 * 初始化投资流入图表
 */
function initInvestmentFlowChart() {
  const ctx = document.getElementById('flowChartCanvas');
  if (!ctx) return;
  
  // 默认显示1个月数据
  renderFlowChart('1m');
  
  // 为图表标签添加事件监听
  document.querySelectorAll('.flow-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      // 移除所有激活状态
      document.querySelectorAll('.flow-tab').forEach(t => t.classList.remove('active'));
      // 激活当前标签
      this.classList.add('active');
      // 渲染对应时间段的图表
      renderFlowChart(this.getAttribute('data-period'));
      
      // 播放切换音效
      CYBER.playSound('click');
    });
  });
}

/**
 * 渲染投资流入图表
 * @param {string} period - 时间段: 1m, 3m, 6m, 1y, all
 */
function renderFlowChart(period) {
  const ctx = document.getElementById('flowChartCanvas');
  if (!ctx) return;
  
  // 销毁已有图表
  if (window.flowChart instanceof Chart) {
    window.flowChart.destroy();
  }
  
  // 根据时间段获取不同数据
  const chartData = getFlowData(period);
  
  // 创建图表
  window.flowChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: '机构净流入 (BTC)',
          data: chartData.inflows,
          backgroundColor: function(context) {
            const value = context.dataset.data[context.dataIndex];
            return value >= 0 ? 'rgba(0, 255, 100, 0.6)' : 'rgba(255, 42, 109, 0.6)';
          },
          borderColor: function(context) {
            const value = context.dataset.data[context.dataIndex];
            return value >= 0 ? 'rgba(0, 255, 100, 1)' : 'rgba(255, 42, 109, 1)';
          },
          borderWidth: 1
        },
        {
          label: '累计持有量 (BTC)',
          data: chartData.cumulative,
          type: 'line',
          fill: false,
          backgroundColor: 'rgba(0, 255, 255, 0.7)',
          borderColor: 'rgba(0, 255, 255, 0.7)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: 'rgba(0, 255, 255, 0.7)',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          },
          title: {
            display: true,
            text: '净流入 (BTC)',
            color: 'rgba(255, 255, 255, 0.7)'
          }
        },
        y1: {
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: 'rgba(0, 255, 255, 0.7)'
          },
          title: {
            display: true,
            text: '累计持有量 (BTC)',
            color: 'rgba(0, 255, 255, 0.7)'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat().format(context.parsed.y) + ' BTC';
              }
              return label;
            }
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      }
    }
  });
  
  // 添加网格扫描线动画
  addScanLineEffect();
}

/**
 * 获取不同时间段的流入数据
 * @param {string} period - 时间段: 1m, 3m, 6m, 1y, all
 * @returns {Object} 图表数据
 */
function getFlowData(period) {
  let labels = [];
  let inflows = [];
  let cumulative = [];
  let cumulativeValue = 1200000; // 起始累计值
  
  switch(period) {
    case '1m':
      labels = ['4月第1周', '4月第2周', '4月第3周', '4月第4周'];
      inflows = [28560, -12400, 15840, 16920];
      break;
    case '3m':
      labels = ['2月', '3月', '4月'];
      inflows = [52480, 86500, 48920];
      break;
    case '6m':
      labels = ['11月', '12月', '1月', '2月', '3月', '4月'];
      inflows = [34200, 62800, 128400, 52480, 86500, 48920];
      break;
    case '1y':
      labels = ['2023年Q2', '2023年Q3', '2023年Q4', '2024年Q1', '2024年Q2'];
      inflows = [-25800, -14600, 97000, 180880, 48920];
      break;
    case 'all':
      labels = ['2019', '2020', '2021', '2022', '2023', '2024(YTD)'];
      inflows = [85000, 420000, 680000, -180000, 98000, 229800];
      break;
  }
  
  // 计算累计值
  for (let i = 0; i < inflows.length; i++) {
    cumulativeValue += inflows[i];
    cumulative.push(cumulativeValue);
  }
  
  return {
    labels: labels,
    inflows: inflows,
    cumulative: cumulative
  };
}

/**
 * 添加图表扫描线动画
 */
function addScanLineEffect() {
  const container = document.getElementById('investmentFlowChart');
  if (!container) return;
  
  // 移除已有扫描线
  const existingScanLines = container.querySelectorAll('.chart-scan-line');
  existingScanLines.forEach(line => line.remove());
  
  // 创建新扫描线
  const scanLine = document.createElement('div');
  scanLine.classList.add('chart-scan-line');
  container.appendChild(scanLine);
  
  // 设置动画
  scanLine.style.animation = 'scan-line 3s infinite linear';
}

/**
 * 初始化时间标签切换事件
 */
function initFlowTabsEvents() {
  document.querySelectorAll('.flow-tab').forEach(tab => {
    tab.addEventListener('mouseenter', () => {
      CYBER.playSound('hover');
    });
  });
}

/**
 * 初始化加载更多按钮
 */
function initLoadMoreButton() {
  const loadMoreButton = document.getElementById('loadMoreInvestors');
  if (!loadMoreButton) return;
  
  loadMoreButton.addEventListener('click', () => {
    CYBER.playSound('click');
    
    // 显示加载动画
    loadMoreButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 加载中...';
    
    // 模拟加载延迟
    setTimeout(() => {
      // 添加更多投资者卡片
      const investorsGrid = document.querySelector('.investors-grid');
      if (investorsGrid) {
        investorsGrid.innerHTML += getMoreInvestors();
        
        // 隐藏加载按钮
        loadMoreButton.style.display = 'none';
      }
    }, 1500);
  });
}

/**
 * 获取更多投资者卡片HTML
 * @returns {string} HTML字符串
 */
function getMoreInvestors() {
  return `
    <!-- Marathon Digital卡片 -->
    <div class="investor-card animate-in">
      <div class="investor-logo">
        <img src="../assets/images/investors/marathon.png" alt="Marathon Digital">
      </div>
      <h3 class="investor-name">Marathon Digital</h3>
      <div class="investor-details">
        <div class="investor-detail">
          <span class="investor-detail-label">持有比特币:</span>
          <span class="investor-detail-value">15,748 BTC</span>
        </div>
        <div class="investor-detail">
          <span class="investor-detail-label">持有价值:</span>
          <span class="investor-detail-value">$1.06B</span>
        </div>
        <div class="investor-detail">
          <span class="investor-detail-label">平均成本:</span>
          <span class="investor-detail-value">$38,200</span>
        </div>
        <div class="investor-detail">
          <span class="investor-detail-label">持仓收益:</span>
          <span class="investor-detail-value">+76%</span>
        </div>
      </div>
      <p class="investor-description">Marathon是北美最大的比特币挖矿公司之一，专注于持币策略，将大部分挖出的比特币留在资产负债表上。</p>
      <a href="https://ir.marathondh.com/" target="_blank" class="card-link">投资者关系 <i class="fas fa-external-link-alt"></i></a>
    </div>
    
    <!-- Block.one卡片 -->
    <div class="investor-card animate-in">
      <div class="investor-logo">
        <img src="../assets/images/investors/blockone.png" alt="Block.one">
      </div>
      <h3 class="investor-name">Block.one</h3>
      <div class="investor-details">
        <div class="investor-detail">
          <span class="investor-detail-label">持有比特币:</span>
          <span class="investor-detail-value">164,000 BTC</span>
        </div>
        <div class="investor-detail">
          <span class="investor-detail-label">持有价值:</span>
          <span class="investor-detail-value">$11.04B</span>
        </div>
        <div class="investor-detail">
          <span class="investor-detail-label">平均成本:</span>
          <span class="investor-detail-value">$16,800</span>
        </div>
        <div class="investor-detail">
          <span class="investor-detail-label">持仓收益:</span>
          <span class="investor-detail-value">+300%</span>
        </div>
      </div>
      <p class="investor-description">EOS区块链背后的公司，在2018-2019年逐步将其40亿美元ICO收入的一部分转换为比特币，成为最大的公司持有者之一。</p>
      <a href="https://block.one/" target="_blank" class="card-link">公司网站 <i class="fas fa-external-link-alt"></i></a>
    </div>
    
    <!-- Coinbase卡片 -->
    <div class="investor-card animate-in">
      <div class="investor-logo">
        <img src="../assets/images/investors/coinbase.png" alt="Coinbase">
      </div>
      <h3 class="investor-name">Coinbase</h3>
      <div class="investor-details">
        <div class="investor-detail">
          <span class="investor-detail-label">持有比特币:</span>
          <span class="investor-detail-value">4,482 BTC</span>
        </div>
        <div class="investor-detail">
          <span class="investor-detail-label">持有价值:</span>
          <span class="investor-detail-value">$302M</span>
        </div>
        <div class="investor-detail">
          <span class="investor-detail-label">托管总量:</span>
          <span class="investor-detail-value">95.8万 BTC</span>
        </div>
        <div class="investor-detail">
          <span class="investor-detail-label">托管价值:</span>
          <span class="investor-detail-value">$64.5B</span>
        </div>
      </div>
      <p class="investor-description">作为最大的美国交易所，Coinbase不仅自持比特币，还为机构客户提供了重要的托管服务，持有大量客户资产。</p>
      <a href="https://ir.coinbase.com/" target="_blank" class="card-link">投资者关系 <i class="fas fa-external-link-alt"></i></a>
    </div>
    
    <!-- Stone Ridge/NYDIG卡片 -->
    <div class="investor-card animate-in">
      <div class="investor-logo">
        <img src="../assets/images/investors/nydig.png" alt="NYDIG">
      </div>
      <h3 class="investor-name">Stone Ridge/NYDIG</h3>
      <div class="investor-details">
        <div class="investor-detail">
          <span class="investor-detail-label">托管总量:</span>
          <span class="investor-detail-value">~79,000 BTC</span>
        </div>
        <div class="investor-detail">
          <span class="investor-detail-label">托管价值:</span>
          <span class="investor-detail-value">$5.3B</span>
        </div>
        <div class="investor-detail">
          <span class="investor-detail-label">客户数量:</span>
          <span class="investor-detail-value">450+</span>
        </div>
        <div class="investor-detail">
          <span class="investor-detail-label">资产类型:</span>
          <span class="investor-detail-value">机构托管</span>
        </div>
      </div>
      <p class="investor-description">为传统金融机构提供比特币投资解决方案的公司，通过其NYDIG部门向银行、保险公司和养老基金提供比特币相关服务。</p>
      <a href="https://nydig.com/" target="_blank" class="card-link">NYDIG网站 <i class="fas fa-external-link-alt"></i></a>
    </div>
  `;
}

/**
 * 初始化表格行悬停效果
 */
function initTableHoverEffects() {
  const tableRows = document.querySelectorAll('.etf-table tbody tr');
  if (!tableRows.length) return;
  
  tableRows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      CYBER.playSound('hover');
      
      // 添加扫描线效果
      const scanLine = document.createElement('div');
      scanLine.classList.add('table-scan-line');
      row.appendChild(scanLine);
      
      // 延时移除扫描线
      setTimeout(() => {
        scanLine.remove();
      }, 800);
    });
  });
}

/**
 * 初始化预测卡片效果
 */
function initPredictionCardEffects() {
  const predictionCards = document.querySelectorAll('.prediction-card');
  if (!predictionCards.length) return;
  
  // 处理卡片动画
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, 100 * Array.from(predictionCards).indexOf(entry.target));
        
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });
  
  // 观察所有卡片
  predictionCards.forEach(card => {
    observer.observe(card);
    
    // 添加悬停效果
    card.addEventListener('mouseenter', () => {
      CYBER.playSound('hover');
    });
  });
} 