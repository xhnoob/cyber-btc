/**
 * 全球影响分析页面的JavaScript文件
 * 用于初始化3D世界地图、时间轴交互和各种数据可视化
 */

// 添加全局场景引用
window.currentMapScene = null;

document.addEventListener('DOMContentLoaded', () => {
    // 初始化页面效果
    initWorldMap();
    initMapControls();
    initTimelineControls();
    initCorrelationTable();
    
    // 添加滚动动画
    if (window.CYBER && typeof CYBER.addScrollAnimations === 'function') {
        CYBER.addScrollAnimations();
    } else {
        console.warn('CYBER对象或addScrollAnimations方法不可用');
    }
    
    console.log('全球影响分析页面已初始化');
});

/**
 * 初始化3D世界地图
 */
function initWorldMap() {
    const container = document.getElementById('globeVisualization');
    if (!container) {
        console.error('找不到地图容器 #globeVisualization');
        return;
    }
    
    // 场景设置
    const scene = new THREE.Scene();
    // 存储全局引用
    window.currentMapScene = scene;
    
    // 相机设置
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 200;
    
    // 渲染器设置
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    // 添加点光源
    const pointLight = new THREE.PointLight(0x0088ff, 2, 300);
    pointLight.position.set(100, 50, 100);
    scene.add(pointLight);
    
    // 添加世界地图
    createWorldMap(scene);
    
    // 添加地缘政治热点
    addGeoHotspots(scene, camera);
    
    // 窗口大小调整处理
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        
        // 地球自转
        scene.rotation.y += 0.001;
        
        // 随机闪烁效果
        if (Math.random() > 0.99) {
            pointLight.intensity = 3 + Math.random() * 2;
        } else {
            pointLight.intensity = 2;
        }
        
        renderer.render(scene, camera);
    }
    
    animate();
}

/**
 * 创建3D世界地图
 */
function createWorldMap(scene) {
    // 创建地球几何体
    const earthGeometry = new THREE.SphereGeometry(80, 32, 32);
    
    // 创建材质
    const earthMaterial = new THREE.MeshPhongMaterial({
        color: 0x000814,
        emissive: 0x0a1128,
        specular: 0x004080,
        shininess: 10,
        wireframe: false,
        transparent: true,
        opacity: 0.9
    });
    
    // 创建地球网格
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // 添加经纬线网格
    const gridMaterial = new THREE.LineBasicMaterial({
        color: 0x0088ff,
        transparent: true,
        opacity: 0.3
    });
    
    // 添加经线
    for (let i = 0; i < 24; i++) {
        const lonGeometry = new THREE.BufferGeometry();
        const vertices = [];
        
        for (let j = 0; j <= 180; j++) {
            const lat = (j - 90) * Math.PI / 180;
            const lon = i * 15 * Math.PI / 180;
            
            const x = 81 * Math.cos(lat) * Math.cos(lon);
            const y = 81 * Math.sin(lat);
            const z = 81 * Math.cos(lat) * Math.sin(lon);
            
            vertices.push(x, y, z);
        }
        
        lonGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const line = new THREE.Line(lonGeometry, gridMaterial);
        scene.add(line);
    }
    
    // 添加纬线
    for (let i = 0; i < 12; i++) {
        const latGeometry = new THREE.BufferGeometry();
        const vertices = [];
        
        const lat = (i * 15 - 90) * Math.PI / 180;
        
        for (let j = 0; j <= 360; j++) {
            const lon = j * Math.PI / 180;
            
            const x = 81 * Math.cos(lat) * Math.cos(lon);
            const y = 81 * Math.sin(lat);
            const z = 81 * Math.cos(lat) * Math.sin(lon);
            
            vertices.push(x, y, z);
        }
        
        latGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const line = new THREE.Line(latGeometry, gridMaterial);
        scene.add(line);
    }
    
    // 添加国家轮廓
    // 这里模拟国家边界线，实际项目中可以使用地理JSON数据
    const countryGeometry = new THREE.BufferGeometry();
    const countryVertices = [];
    
    // 模拟一些主要国家边界线
    // 北美洲
    addContinentOutline(countryVertices, 40, -100, 20, 30);
    // 南美洲
    addContinentOutline(countryVertices, -20, -60, 15, 25);
    // 欧洲
    addContinentOutline(countryVertices, 50, 10, 10, 15);
    // 亚洲
    addContinentOutline(countryVertices, 35, 100, 25, 35);
    // 非洲
    addContinentOutline(countryVertices, 0, 20, 20, 25);
    // 大洋洲
    addContinentOutline(countryVertices, -25, 135, 10, 15);
    
    countryGeometry.setAttribute('position', new THREE.Float32BufferAttribute(countryVertices, 3));
    const countryLines = new THREE.Line(countryGeometry, new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.5
    }));
    
    scene.add(countryLines);
}

/**
 * 添加洲际轮廓线
 */
function addContinentOutline(vertices, centerLat, centerLon, width, height) {
    const steps = 72;
    const latRad = centerLat * Math.PI / 180;
    const lonRad = centerLon * Math.PI / 180;
    
    for (let i = 0; i <= steps; i++) {
        const a = i / steps * Math.PI * 2;
        
        const dx = Math.cos(a) * width;
        const dy = Math.sin(a) * height;
        
        const lat = (centerLat + dy) * Math.PI / 180;
        const lon = (centerLon + dx) * Math.PI / 180;
        
        const x = 82 * Math.cos(lat) * Math.cos(lon);
        const y = 82 * Math.sin(lat);
        const z = 82 * Math.cos(lat) * Math.sin(lon);
        
        vertices.push(x, y, z);
    }
}

/**
 * 添加地缘政治热点
 */
function addGeoHotspots(scene, camera) {
    // 热点数据 [纬度, 经度, 名称, 类型(adoption/regulation/mining/trading), 影响程度(0-1)]
    const hotspots = [
        [40.7, -74, "美国纽约", "adoption", 0.85],
        [37.8, -122.4, "美国旧金山", "adoption", 0.9],
        [51.5, -0.1, "英国伦敦", "regulation", 0.8],
        [52.5, 13.4, "德国柏林", "regulation", 0.7],
        [35.7, 139.8, "日本东京", "adoption", 0.6],
        [22.3, 114.2, "中国香港", "adoption", 0.7],
        [1.3, 103.8, "新加坡", "regulation", 0.8],
        [41.9, 12.5, "意大利罗马", "regulation", 0.5],
        [25.0, 121.5, "台湾台北", "mining", 0.6],
        [39.9, 116.4, "中国北京", "regulation", 0.9],
        [55.8, 37.6, "俄罗斯莫斯科", "mining", 0.7],
        [-33.9, 151.2, "澳大利亚悉尼", "adoption", 0.5],
        [43.7, -79.4, "加拿大多伦多", "mining", 0.6],
        [32.1, 34.8, "以色列特拉维夫", "adoption", 0.7],
        [-23.6, -46.6, "巴西圣保罗", "adoption", 0.4],
        // 添加更多热点以增强全球覆盖
        [19.4, -99.1, "墨西哥城", "adoption", 0.5],
        [-34.6, -58.4, "阿根廷布宜诺斯艾利斯", "adoption", 0.7],
        [14.6, 121.0, "菲律宾马尼拉", "mining", 0.6],
        [31.2, 121.5, "中国上海", "trading", 0.8],
        [37.5, 127.0, "韩国首尔", "trading", 0.7],
        [59.9, 30.3, "俄罗斯圣彼得堡", "mining", 0.6],
        [41.0, 28.9, "土耳其伊斯坦布尔", "adoption", 0.5],
        [18.9, 72.8, "印度孟买", "adoption", 0.6],
        [28.6, 77.2, "印度新德里", "regulation", 0.7]
    ];
    
    // 为每个热点创建材质
    const hotspotMaterials = {
        adoption: new THREE.MeshPhongMaterial({ 
            color: 0x00ffaa, 
            emissive: 0x00aa77,
            transparent: true,
            opacity: 0.8
        }),
        regulation: new THREE.MeshPhongMaterial({ 
            color: 0xff5577, 
            emissive: 0xaa2244,
            transparent: true,
            opacity: 0.8
        }),
        mining: new THREE.MeshPhongMaterial({ 
            color: 0x00aaff, 
            emissive: 0x0077cc,
            transparent: true,
            opacity: 0.8
        }),
        trading: new THREE.MeshPhongMaterial({ 
            color: 0xffaa00, 
            emissive: 0xcc7700,
            transparent: true,
            opacity: 0.8
        })
    };
    
    // 创建热点组
    const hotspotGroup = new THREE.Group();
    scene.add(hotspotGroup);
    
    hotspots.forEach(hotspot => {
        const [lat, lon, name, type, intensity] = hotspot;
        
        // 将经纬度转为3D坐标
        const latRad = lat * Math.PI / 180;
        const lonRad = lon * Math.PI / 180;
        
        // 修正：确保坐标计算正确
        const radius = 82; // 地球半径
        const x = radius * Math.cos(latRad) * Math.cos(lonRad);
        const y = radius * Math.sin(latRad);
        const z = radius * Math.cos(latRad) * Math.sin(lonRad);
        
        // 创建热点球体
        const hotspotSize = 1.5 + intensity * 1.5; // 根据强度调整大小
        const geometry = new THREE.SphereGeometry(hotspotSize, 16, 16);
        const material = hotspotMaterials[type];
        const hotspotMesh = new THREE.Mesh(geometry, material);
        
        // 设置位置
        hotspotMesh.position.set(x, y, z);
        
        // 添加数据属性用于交互
        hotspotMesh.userData = {
            name: name,
            type: type,
            intensity: intensity
        };
        
        // 添加脉冲效果
        const pulseGeometry = new THREE.SphereGeometry(hotspotSize * 1.2, 16, 16);
        const pulseMaterial = new THREE.MeshBasicMaterial({
            color: material.color,
            transparent: true,
            opacity: 0.3
        });
        const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
        pulse.position.copy(hotspotMesh.position);
        
        // 脉冲动画
        function pulsate() {
            let scale = 1;
            let opacity = 0.3;
            const animate = () => {
                scale += 0.015;
                opacity -= 0.005;
                
                if (scale >= 2) {
                    scale = 1;
                    opacity = 0.3;
                }
                
                pulse.scale.set(scale, scale, scale);
                pulseMaterial.opacity = opacity;
                
                requestAnimationFrame(animate);
            };
            
            animate();
        }
        
        pulsate();
        
        // 添加到场景
        hotspotGroup.add(hotspotMesh);
        hotspotGroup.add(pulse);
    });
    
    // 添加事件监听 - 鼠标悬停显示热点信息
    // 这里需要依赖DOM元素，所以在完整的应用中需要进一步实现
    
    // 添加光线投射器用于检测用户交互
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // 获取信息面板
    const infoPanel = document.getElementById('regionInfo');
    
    // 鼠标移动事件处理
    document.addEventListener('mousemove', (event) => {
        // 将鼠标位置归一化为设备坐标
        const container = document.getElementById('globeVisualization');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
        
        // 更新光线投射器
        raycaster.setFromCamera(mouse, camera);
        
        // 检查与热点的交集
        const intersects = raycaster.intersectObjects(hotspotGroup.children, true);
        
        // 处理交集
        if (intersects.length > 0) {
            const intersected = intersects[0].object;
            if (intersected.userData && intersected.userData.name) {
                // 在信息面板显示数据
                document.getElementById('regionName').textContent = intersected.userData.name;
                
                // 设置状态标签
                let status = '';
                switch(intersected.userData.type) {
                    case 'adoption': 
                        status = '高采用率'; 
                        document.getElementById('regionStatus').className = 'region-status high';
                        break;
                    case 'regulation': 
                        status = '监管活跃'; 
                        document.getElementById('regionStatus').className = 'region-status regulation';
                        break;
                    case 'mining': 
                        status = '挖矿中心'; 
                        document.getElementById('regionStatus').className = 'region-status mining';
                        break;
                    case 'trading': 
                        status = '交易活跃'; 
                        document.getElementById('regionStatus').className = 'region-status trading';
                        break;
                }
                document.getElementById('regionStatus').textContent = status;
                
                // 设置各项数值
                document.getElementById('adoptionValue').textContent = 
                    (intersected.userData.type === 'adoption' ? 
                     Math.round(intersected.userData.intensity * 10) : 
                     Math.round(Math.random() * 5)) + '/10';
                     
                document.getElementById('regulationValue').textContent = 
                    (intersected.userData.type === 'regulation' ? 
                     '严格' : ['友好', '中立', '谨慎'][Math.floor(Math.random() * 3)]);
                     
                document.getElementById('miningValue').textContent = 
                    (intersected.userData.type === 'mining' ? 
                     Math.round(intersected.userData.intensity * 20) : 
                     Math.round(Math.random() * 8)) + '%';
                     
                document.getElementById('tradingValue').textContent = 
                    (intersected.userData.type === 'trading' ? 
                     '全球前' + Math.round((1 - intersected.userData.intensity) * 20 + 1) : 
                     '全球前' + (Math.floor(Math.random() * 40) + 10));
                
                // 显示事件面板
                infoPanel.style.opacity = '1';
                infoPanel.style.transform = 'translateY(0)';
            }
        } else {
            // 无交集时重置面板
            document.getElementById('regionName').textContent = '选择一个区域';
            document.getElementById('regionStatus').textContent = '';
            document.getElementById('adoptionValue').textContent = '--';
            document.getElementById('regulationValue').textContent = '--';
            document.getElementById('miningValue').textContent = '--';
            document.getElementById('tradingValue').textContent = '--';
            
            // 隐藏面板
            infoPanel.style.opacity = '0.7';
            infoPanel.style.transform = 'translateY(10px)';
        }
    });
}

/**
 * 初始化地图控制按钮
 */
function initMapControls() {
    const mapFilters = document.querySelectorAll('.map-filter');
    if (!mapFilters.length) {
        console.warn('找不到地图过滤器按钮');
        return;
    }
    
    // 当前活跃的过滤器
    let activeFilter = 'adoption';
    
    mapFilters.forEach(button => {
        button.addEventListener('click', function() {
            // 已经是活跃的按钮则跳过
            if (this.classList.contains('active')) return;
            
            // 移除所有按钮的活跃状态
            mapFilters.forEach(btn => btn.classList.remove('active'));
            
            // 为当前按钮添加活跃状态
            this.classList.add('active');
            
            // 获取过滤类型
            const filterType = this.getAttribute('data-filter');
            
            // 记录当前活跃的过滤器
            activeFilter = filterType;
            
            // 更新地图显示
            updateMapDisplay(filterType);
            
            // 播放点击音效
            if (window.CYBER && CYBER.playSound) {
                CYBER.playSound('click');
            }
        });
    });
    
    // 更新地图显示
    function updateMapDisplay(filterType) {
        // 获取地球容器中的所有热点
        const container = document.getElementById('globeVisualization');
        if (!container) return;
        
        // 为容器添加数据过滤器属性
        container.setAttribute('data-filter', filterType);
        
        // 找到热点组
        const scene = window.currentMapScene;
        if (!scene) return;
        
        // 遍历热点组的子元素，更新可见性
        scene.traverse(object => {
            if (object.userData && object.userData.type) {
                if (filterType === 'all' || object.userData.type === filterType) {
                    // 属于当前过滤器类型的热点，提高亮度
                    if (object.material) {
                        object.material.opacity = 0.9;
                        object.material.emissiveIntensity = 0.8;
                        object.visible = true;
                        
                        // 根据强度进行缩放
                        const intensity = object.userData.intensity || 0.5;
                        object.scale.set(1.2, 1.2, 1.2);
                    }
                } else {
                    // 不属于当前过滤器类型的热点，降低亮度
                    if (object.material) {
                        object.material.opacity = 0.3;
                        object.material.emissiveIntensity = 0.2;
                        
                        // 恢复正常缩放
                        object.scale.set(1, 1, 1);
                    }
                }
            }
        });
        
        // 更新区域信息面板标题
        const statusTitle = document.getElementById('regionStatus');
        if (statusTitle) {
            switch(filterType) {
                case 'adoption':
                    statusTitle.textContent = '采用率';
                    statusTitle.className = 'region-status high';
                    break;
                case 'regulation':
                    statusTitle.textContent = '监管状态';
                    statusTitle.className = 'region-status regulation';
                    break;
                case 'mining':
                    statusTitle.textContent = '挖矿分布';
                    statusTitle.className = 'region-status mining';
                    break;
                case 'trading':
                    statusTitle.textContent = '交易活跃度';
                    statusTitle.className = 'region-status trading';
                    break;
                default:
                    statusTitle.textContent = '';
                    statusTitle.className = 'region-status';
            }
        }
        
        // 更新图例
        updateLegend(filterType);
    }
    
    // 更新图例显示
    function updateLegend(filterType) {
        const legendItems = document.querySelectorAll('.legend-item');
        if (!legendItems.length) return;
        
        // 隐藏所有图例项
        legendItems.forEach(item => {
            item.style.opacity = '0.5';
        });
        
        // 显示相关图例项
        switch(filterType) {
            case 'adoption':
                document.querySelector('.legend-item:nth-child(1)').style.opacity = '1';
                break;
            case 'mining':
                document.querySelector('.legend-item:nth-child(2)').style.opacity = '1';
                break;
            case 'trading':
                document.querySelector('.legend-item:nth-child(3)').style.opacity = '1';
                break;
            case 'regulation':
                document.querySelector('.legend-item:nth-child(4)').style.opacity = '1';
                break;
        }
    }
    
    // 触发默认过滤器的点击
    const defaultFilter = document.querySelector('.map-filter.active') || document.querySelector('.map-filter');
    if (defaultFilter) {
        defaultFilter.click();
    }
}

/**
 * 初始化时间控制按钮
 */
function initTimelineControls() {
    const timeButtons = document.querySelectorAll('.time-button');
    
    timeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有激活状态
            timeButtons.forEach(b => b.classList.remove('active'));
            
            // 添加当前激活状态
            this.classList.add('active');
            
            // 获取选择的时间段
            const period = this.getAttribute('data-period');
            
            // 播放点击声音
            CYBER.playSound('click');
            
            // 这里可以根据时间段切换地图数据
            console.log(`正在切换到${period}时间段`);
            
            // 为时间段切换添加视觉反馈
            const mapContainer = document.getElementById('worldMapContainer');
            mapContainer.classList.add('time-switching');
            
            setTimeout(() => {
                mapContainer.classList.remove('time-switching');
            }, 500);
        });
    });
}

/**
 * 初始化相关性表格动画
 */
function initCorrelationTable() {
    // 为相关性表格添加动画效果
    const correlationFills = document.querySelectorAll('.correlation-fill');
    
    correlationFills.forEach(fill => {
        // 先将宽度设为0
        fill.style.width = '0';
        
        // 延迟显示以产生动画效果
        setTimeout(() => {
            // 获取父元素的宽度百分比
            const width = fill.getAttribute('style').match(/width: (\d+)%/)[1];
            fill.style.width = `${width}%`;
        }, 500);
    });
    
    // 为表格行添加悬停高亮效果
    const tableRows = document.querySelectorAll('.correlation-table tbody tr');
    
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            // 播放悬停声音
            CYBER.playSound('hover');
        });
    });
}

// 为页面添加一些随机的闪烁效果
setInterval(() => {
    if (Math.random() > 0.7) {
        const randomElement = document.querySelector([
            '.region-card',
            '.event-title',
            '.map-control',
            '.correlation-number'
        ][Math.floor(Math.random() * 4)]);
        
        if (randomElement) {
            randomElement.classList.add('cyber-glitch');
            setTimeout(() => {
                randomElement.classList.remove('cyber-glitch');
            }, 200);
        }
    }
}, 3000); 