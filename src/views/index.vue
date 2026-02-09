<template>
  <div class="app-root-view">
    <main class="main-content">
      <header class="header">
        <h2>
          <img src="../assets/logo/logo-min.png" alt="火眼 logo" class="site-logo" />
          火眼工程研发管理平台
        </h2>
        <div class="right-menu">

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/user/profile">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <el-dropdown-item @click.native="setting = true">
            <span>布局设置</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
      </header>

      <section v-if="showModules" class="modules-grid">
        <div
          v-for="(mod, idx) in modules"
          :key="mod.title"
          class="module-card"
          @click="openModule(mod)"
          v-hasPermi=mod.permissions
        >
          <div class="module-icon">
            <svg-icon :icon-class="mod.icon" />
            <!-- <font-awesome-icon icon="fa-solid fa-warehouse" /> -->
          </div>
          <h3><b>{{ mod.code }}</b></h3>
          <h3><b>{{ mod.title }}</b></h3>
          <p>{{ mod.desc }}</p>

          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">{{ mod.metrics[0].value }}</div>
              <div class="stat-label">{{ mod.metrics[0].label }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ mod.metrics[1].value }}</div>
              <div class="stat-label">{{ mod.metrics[1].label }}</div>
            </div>
            <div v-if="mod.code=='PMS'" class="stat-item">
              <div class="stat-value">{{ mod.metrics[2].value }}</div>
              <div class="stat-label">{{ mod.metrics[2].label }}</div>
            </div>
          </div>
        </div>
      </section>

      <section v-else class="placeholder">
        <p>已选择：<strong>{{ menuItems[activeIndex].label }}</strong></p>
        <p>此处可加载对应模块内容或路由视图。</p>
      </section>
    </main>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { statsIndexUpper } from "@/api/stats/index";
import { statExperimentData } from "@/api/plasmid/experiment";
import { statLabEquipmentData } from "@/api/lab/equipment";
import { listUserAll } from "@/api/system/user";
import { list } from "@/api/monitor/online";
export default {
  name: 'IndexView',
  data() {
    return {
      activeIndex: 0,
      user: {
        name: '张三',
        role: '管理员',
        initial: '张'
      },
      menuItems: [
        { icon: 'user', label: '主界面' },
        { icon: 'user', label: '仓库管理' },
        { icon: 'user', label: '项目管理' },
        { icon: 'user', label: '仪器设备' },
        { icon: 'user', label: '系统管理' },
        { icon: 'fas fa-chart-bar', label: '数据统计' },
        { icon: 'fas fa-users', label: '用户管理' },
        { icon: 'fas fa-file-alt', label: '报告中心' },
        { icon: 'fas fa-question-circle', label: '帮助中心' }
      ],
      modules: [
        {
          icon: 'warehouse',
          code: 'WMS',
          key: 'wms',
          title: '仓库管理',
          desc: '管理库存、入库出库、库存盘点、货位管理等仓库相关功能',
          permissions: ['base:mat:list'],
          metrics: [
            { label: '物料种类', value: '1000' },
            { label: '过期物料', value: '0' }
          ]
        },
        {
          icon: 'diagram-project',
          code: 'PMS',
          key: 'pms',
          title: '项目管理',
          desc: '创建和管理项目、分配资源、跟踪进度、生成项目报告',
          permissions: ['plasmid:experiment:list'],
          metrics: [
            { label: '未开始', value: '0' },
            { label: '进行中', value: '0' },
            { label: '已完结', value: '0' }
          ]
        },
        {
          icon: 'microscope',
          code: 'EMS',
          key: 'ems',
          title: '仪器设备',
          desc: '设备台账、使用记录、维护保养、校准管理和设备状态监控',
          permissions: ['lab:equipment:list'],
          metrics: [
            { label: '设备总数', value: '0' },
            { label: '待维护', value: '0' }
          ]
        },
        {
          icon: 'gears',
          code: 'SYSTEM',
          key: 'system',
          title: '系统后台',
          desc: '用户权限、系统配置、数据备份、日志管理和系统监控',
          permissions: ['system:user:list'],
          metrics: [
            { label: '系统用户', value: '0' },
            { label: '', value: '' }
          ]
        }
      ]
    }
  },
  computed: {
    getIconComponent(iconName) {
      return () => import(`@/assets/icons/svg/${iconName}`);
    },
    showModules() {
      return this.activeIndex === 0
    },
    ...mapGetters([
      'avatar',
      'device'
    ]),
    setting: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    },
    topNav: {
      get() {
        return this.$store.state.settings.topNav
      }
    }
  },
  created() {
    this.getWmsData();
    this.getPmsData();
    this.getEmsData();
    this.getSystemData();
  },

  methods: {
    getWmsData() {
      // 获取初始数据
      statsIndexUpper().then(response => {
        var panelGroupData = response.data;
        this.modules[0].metrics[0].value = panelGroupData.matTotal;
        this.modules[0].metrics[1].value = panelGroupData.matExpired;
      });
    },
    getPmsData() {
      statExperimentData().then(response => {
        var  experimentData = response.data;
        this.modules[1].metrics[0].value = experimentData.unstart;
        this.modules[1].metrics[1].value = experimentData.ing;
        this.modules[1].metrics[2].value = experimentData.done;
      });
    },
    getEmsData() {
      statLabEquipmentData().then(response => {
        var equipmentData = response.data;
        this.modules[2].metrics[0].value = equipmentData.normal;
        this.modules[2].metrics[1].value = equipmentData.bad;
      });
    },
    getSystemData() {
      listUserAll().then(response => {
        var userData = response;
        this.modules[3].metrics[0].value = userData.length;
      });
      
    },
    async logout() {
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = '';
        })
      }).catch(() => {});
    },
    selectMenu(idx) {
      this.activeIndex = idx
      // 如果集成路由，改为 this.$router.push(...) 加载对应页面
    },
    async openModule(mod) {
      // 先生成并添加路由
      const target = `${origin}/#/${mod.key}`;
      window.location.replace(target);
      window.location.reload();
  }
  }
}
</script>

<style scoped>

.app-root-view {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f8fb 0%, #eef5fb 60%);
  color: #2d3a45;
  font-family: "Helvetica Neue", Arial, "Microsoft YaHei", sans-serif;
  padding: 28px;
  box-sizing: border-box;
  gap: 24px;
  align-items: flex-start;
  background-image: url("../assets/images/index-bg.webp");
  background-size: cover;
}
/* main */
.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  z-index: 2000;
}
/* header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1px 24px;
  background: rgba(255,255,255,0.85);
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(29,41,56,0.06);
  margin-bottom: 18px;
  backdrop-filter: blur(4px);
}
.header-left .title {
  margin: 0;
  font-size: 20px;
  color: #173249;
  font-weight: 700;
}
.header-left .subtitle {
  margin: 4px 0 0;
  color: #6b7b86;
  font-size: 13px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #4b5a65;
}
.logo {
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}
.logo h1 {
  font-size: 22px;
  font-weight: 600;
  display: flex;
  align-items: center;
}
.logo i {
  margin-right: 10px;
  font-size: 24px;
  color: #3498db;
}
.menu {
  margin-top: 8px;
}
.menu-item {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.18s;
  border-left: 4px solid transparent;
}
.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.06);
  border-left: 4px solid #3498db;
}
.menu-item.active {
  background-color: rgba(52, 152, 219, 0.18);
  border-left: 4px solid #3498db;
}
.menu-item i {
  margin-right: 12px;
  font-size: 18px;
  width: 24px;
  text-align: center;
}

/* main */
.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.header h2 {
  font-size: 28px;
  color: #2c3e50;
  font-weight: 600;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* modules */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(30%, 1fr));
  gap: 25px;
}
.module-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
.module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: #3498db;
}
.module-card:nth-child(2)::before { background: #2ecc71; }
.module-card:nth-child(3)::before { background: #e74c3c; }
.module-card:nth-child(4)::before { background: #f39c12; }

.module-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 28px;
  color: white;
}
.module-card:nth-child(1) .module-icon { background: #3498db; }
.module-card:nth-child(2) .module-icon { background: #2ecc71; }
.module-card:nth-child(3) .module-icon { background: #e74c3c; }
.module-card:nth-child(4) .module-icon { background: #f39c12; }

.module-card h3 { font-size: 20px; margin-bottom: 10px; color: #2c3e50; }
.module-card p { color: #7f8c8d; font-size: 14px; line-height: 1.5; }

.stats { display: flex; justify-content: space-between; margin-top: 25px; width: 100%; padding-top: 15px; border-top: 1px solid #ecf0f1; }
.stat-item { text-align: center; }
.stat-value { font-size: 20px; font-weight: bold; color: #2c3e50; }
.stat-label { font-size: 12px; color: #7f8c8d; }

.placeholder { padding: 40px; background: #fff; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }

@media (max-width: 992px) {
  .modules-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .app-root { flex-direction: column; }
  .main-content { padding: 20px; }
  .modules-grid { grid-template-columns: 1fr; }
}
.avatar-container {
  margin-right: 30px;

  .avatar-wrapper {
    margin-top: 5px;
    position: relative;

    .user-avatar {
      cursor: pointer;
      width: 40px;
      height: 40px;
      border-radius: 10px;
    }

    .el-icon-caret-bottom {
      cursor: pointer;
      position: absolute;
      right: -20px;
      top: 25px;
      font-size: 12px;
    }
  }
}
.site-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  vertical-align: middle;
  margin-right: 10px;
}
  .header h2 { display: flex; align-items: center; gap: 8px; }
</style>