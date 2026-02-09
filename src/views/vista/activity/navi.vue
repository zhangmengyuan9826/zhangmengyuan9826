<template>
  <div class="stats-dashboard">
    <!-- 顶部导航 -->
    <header class="stats-header">
      <div class="nav-container">
        <h1 class="title">统计图表中心</h1>
        <nav class="nav-menu">
          <router-link 
            v-for="item in menuItems" 
            :key="item.path"
            :to="item.path"
            class="nav-item"
            active-class="active"
          >
            {{ item.name }}
          </router-link>
        </nav>
      </div>
    </header>

    <!-- 内容区域 -->
    <main class="stats-content">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'StatsDashboard',
  data() {
    return {
      menuItems: [
        { name: '库存趋势', path: '/vista/matStock' },
        { name: '物料分布', path: '/vista/matWorkshop' },
        { name: '出入库统计', path: '/vista/matUser' },
        // 添加您的其他图表路由
      ]
    };
  }
};
</script>

<style scoped>
.stats-dashboard {
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
  gap: 20px;
}

.nav-item {
  padding: 16px 20px;
  text-decoration: none;
  color: #606266;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.nav-item:hover {
  color: #409eff;
}

.nav-item.active {
  color: #409eff;
  border-bottom-color: #409eff;
}

.stats-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
}
</style>