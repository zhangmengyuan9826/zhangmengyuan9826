<template>
  <div class="stats-single-page">
    <!-- 顶部导航 -->
    <header class="stats-header">
      <div class="nav-container">
        <h1 class="title">统计图表中心</h1>
        <nav class="nav-menu">
          <button 
            v-for="item in menuItems" 
            :key="item.id"
            @click="switchTab(item.id)"
            :class="['nav-item', { active: activeTab === item.id }]"
          >
            {{ item.name }}
          </button>
        </nav>
      </div>
    </header>

    <!-- 图表内容区域 - 只显示当前激活的组件 -->
    <main class="stats-content">
      <div class="chart-container">
        <keep-alive>
        <component :is="currentComponent" />
      </keep-alive>
      </div>
    </main>
  </div>
</template>

<script>

import VistaMatUser from './activity/user/index.vue'
import VistaMatStock from './activity/stock/index.vue'
import VistaMatWorkshop from './activity/workshop/index.vue'

export default {
  name: 'StatsSinglePage',
  components: {
    VistaMatUser,
    VistaMatStock,
    VistaMatWorkshop
  },
  data() {
    return {
      activeTab: 'trend', // 默认激活的标签
      menuItems: [
        { id: 'trend', name: '人员使用', component: 'VistaMatUser' },
        { id: 'distribution', name: '操作趋势', component: 'VistaMatStock' },
        { id: 'workshop', name: '实验室对比', component: 'VistaMatWorkshop' }
      ]
    };
  },
  computed: {
    currentComponent() {
      const currentItem = this.menuItems.find(item => item.id === this.activeTab);
      return currentItem ? currentItem.component : 'StatsTrend';
    }
  },
  methods: {
    switchTab(tabId) {
      this.activeTab = tabId;
    }
  }
};
</script>

<style scoped>
.stats-single-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.stats-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.nav-menu {
  display: flex;
  gap: 8px;
}

.nav-item {
  padding: 12px 20px;
  border: none;
  background: none;
  color: #606266;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.nav-item:hover {
  background: #f5f7fa;
  color: #409eff;
}

.nav-item.active {
  background: #409eff;
  color: #fff;
}

.stats-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
}

.chart-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  min-height: 500px;
}
</style>