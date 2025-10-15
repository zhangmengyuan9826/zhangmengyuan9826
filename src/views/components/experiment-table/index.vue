<template>
  <div class="experiment-table">
    <!-- 项目信息 -->
    <div class="project-header">
      <div class="serial-number">流水号: {{ projectInfo.projectNo }}</div>
      <div class="project-name">项目名称: {{ projectInfo.projectName }}</div>
      <div class="researcher">负责人: {{ projectInfo.manageBy }}</div>
    </div>

    <!-- 表格容器 -->
    <div class="table-wrapper">
      <table class="fixed-table">
        <thead>
          <tr>
            <th :colspan="5">质粒情况</th>
            <th :colspan="uniqueDates.length">实验状态</th>
          </tr>
          <tr>
            <th v-for="(col, colIndex) in columns" :key="col.key" :rowspan="col.rowspan" :colspan="col.colspan" :style="col.style" :class="{'fixed-column': colIndex === 0 || colIndex === 1}">
              {{ col.label }}
            </th>
            <th v-for="recordDate in uniqueDates" :key="recordDate">{{ recordDate }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(plasmid, pIndex) in plasmids" :key="plasmid.geneName">
            <td v-for="(col, colIndex) in columns" :key="col.key" 
              :style="getGeneColHighlightStyle(col.key, plasmid[col.key], col.style)" 
              :class="{'fixed-column': colIndex === 0 || colIndex === 1}">
              <template v-if="col.key === 'index'">
                {{ pIndex + 1 }}
              </template>
              <template v-else-if="col.key === 'orderStatus'">
                {{ getOrderStatusText(plasmid[col.key]) }}
              </template>
              <template v-else>
                {{ plasmid[col.key] }}
              </template>
            </td>
            <td v-for="(recordDate,dateIndex) in uniqueDates" :key="`${plasmid.geneName}-${recordDate}`"
                :style="Object.assign(
                  {},
                  getStatusHighlightStyle(recordDate, getStatusForDate(plasmid, recordDate)),
                  dateIndex === 0 && uniqueDates[0] && uniqueDates[1] && 
                  getStatusForDate(plasmid, recordDate) !== getStatusForDate(plasmid, uniqueDates[1])
                    ? { background: '#ffd6e0' }
                    : {}
                )"
                >
              {{ getStatusForDate(plasmid, recordDate) }}
            </td>
          </tr>
        </tbody>

      </table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    rawData: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      projectInfo: {
        projectNo: "M.25005",
        projectName: "自复制优化系列2",
        manageBy: "admin"
      },
      plasmids: [],
      uniqueDates: [],
      columns: [
        { key: 'index', label: '序号', rowspan: 2, style: { minWidth: '40px', width: '40px', maxWidth: '80px', background: '#f5f5f5' } },
        { key: 'geneName', label: '质粒名称', rowspan: 2, style: { minWidth: '180px', wordBreak: 'break-all', whiteSpace: 'normal', maxWidth: '300px' } },
        { key: 'resistanceGene', label: '抗性基因', rowspan: 2, style: { width: '120px' } },
        { key: 'linearDigestion', label: '线性酶切', rowspan: 2, style: { width: '120px' } },
        { key: 'orderStatus', label: '到货情况', rowspan: 2, style: { width: '120px' } }
      ],
      resizing: {
        active: false,
        colIndex: null,
        startX: 0,
        startWidth: 0
      },
      statusDict: {
        status1: "草稿",
        status2: "已创建",
        status3: "已下单",
        status4: "已到货",
        status5: "实验中",
        status6: "实验完成",
        status7: "状态异常",
        status8: "状态回退"
      }
    };
  },
  created() {
    this.processData();
  },
  methods: {
    processData() {
      if (!this.rawData || this.rawData.length === 0) return;      
      // 提取项目信息(假设第一条数据包含项目信息)
      this.projectInfo.projectName = this.rawData[0].projectName;
      this.projectInfo.projectNo = this.rawData[0].projectNo;
      this.projectInfo.manageBy = this.rawData[0].manageBy;
      // 按质粒分组
      const plasmidMap = new Map();
      this.rawData.forEach(item => {
        if (!plasmidMap.has(item.geneName)) {
          plasmidMap.set(item.geneName, {
            geneName: item.geneName,
            resistanceGene: item.resistanceGene,
            linearDigestion: item.linearDigestion,
            orderStatus: item.orderStatus,
            statusTimeline: []
          });
        }
        plasmidMap.get(item.geneName).statusTimeline.push({
          recordDate: item.recordDate,
          progressStatus: item.progressStatus
        });
      });
      
      this.plasmids = Array.from(plasmidMap.values());
      
      // 收集所有唯一日期并排序(最新日期在前)
      const dateSet = new Set();
      this.rawData.forEach(item => dateSet.add(item.recordDate));
      this.uniqueDates = Array.from(dateSet).sort((a, b) => new Date(b) - new Date(a));
    },
    getStatusForDate(plasmid, recordDate) {
      const statusItem = plasmid.statusTimeline.find(item => item.recordDate === recordDate);
      const status = statusItem ? statusItem.progressStatus : "";
      return status;
    },
    startResize(e, colIndex) {
      this.resizing.active = true;
      this.resizing.colIndex = colIndex;
      this.resizing.startX = e.clientX;
      this.resizing.startWidth = parseInt(this.columns[colIndex].style.width || '220', 10);
      document.addEventListener('mousemove', this.onResize);
      document.addEventListener('mouseup', this.stopResize);
    },
    onResize(e) {
      if (!this.resizing.active) return;
      const dx = e.clientX - this.resizing.startX;
      const newWidth = Math.max(60, this.resizing.startWidth + dx);
      this.$set(this.columns[this.resizing.colIndex].style, 'width', newWidth + 'px');
    },
    stopResize() {
      this.resizing.active = false;
      document.removeEventListener('mousemove', this.onResize);
      document.removeEventListener('mouseup', this.stopResize);
    },
    getOrderStatusText(statusKey) {
      return this.statusDict[statusKey] || statusKey;
    },
    getStatusHighlightStyle(recordDate, status) {
      // 获取该日期下所有质粒的状态
      const allStatus = this.plasmids.map(p => this.getStatusForDate(p, recordDate)).filter(Boolean);
      // 统计出现次数
      const statusCount = {};
      allStatus.forEach(s => { statusCount[s] = (statusCount[s] || 0) + 1; });
      // 找到出现最多的状态
      let maxCount = 0, mainStatus = '';
      Object.keys(statusCount).forEach(s => {
        if (statusCount[s] > maxCount) {
          maxCount = statusCount[s];
          mainStatus = s;
        }
      });
      // 如果当前状态与主状态不同且不为空，则标紫色
      if (status && status !== mainStatus) {
        return { color: '#b40da9' };
      }
      return {};
    },
    getGeneColHighlightStyle(colKey, value, baseStyle = {}) {
      // 只处理抗性基因和线性酶切
      if (colKey !== 'resistanceGene' && colKey !== 'linearDigestion') return baseStyle || {};
      // 获取该列所有值
      const allVals = this.plasmids.map(p => p[colKey]).filter(Boolean);
      // 统计出现次数
      const valCount = {};
      allVals.forEach(v => { valCount[v] = (valCount[v] || 0) + 1; });
      // 找到出现最多的值
      let maxCount = 0, mainVal = '';
      Object.keys(valCount).forEach(v => {
        if (valCount[v] > maxCount) {
          maxCount = valCount[v];
          mainVal = v;
        }
      });
      // 如果当前值与主值不同且不为空，则标深绿色
      if (value && value !== mainVal) {
        return Object.assign({}, baseStyle, { color: '#007a3d' });
      }
      return baseStyle || {};
    }
  }
};
</script>

<style scoped>
.project-header {
  margin-bottom: 24px;
  padding: 18px 32px 14px 32px;
  background: linear-gradient(90deg, #e0eafc 0%, #cfdef3 100%);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(180, 213, 255, 0.18);
  display: flex;
  align-items: center;
  gap: 32px;
  min-height: 56px;
}

.project-header div {
  display: flex;
  align-items: center;
  font-size: 17px;
  font-weight: 500;
  color: #2b3a55;
  letter-spacing: 1px;
  margin-right: 0;
  padding-right: 18px;
  border-right: 1.5px solid #b3c6e0;
}

.project-header div:last-child {
  border-right: none;
  padding-right: 0;
}

/* 如果需要特定宽度可以这样设置 */
.serial-number {
  min-width: 120px;
}
.project-name {
  min-width: 220px; /* 减去其他两个元素的宽度 */
}
.researcher {
  min-width: 100px;
}
.experiment-table {
  font-family: Arial, sans-serif;
  margin: 20px;
}
.experiment-table {
  font-family: Arial, sans-serif;
  margin: 20px;
}


/* 表格容器样式 */
.table-wrapper {
  width: 100%; /* 容器宽度100% */
  overflow-x: auto; /* 横向滚动条 */
  border: 1px solid #ddd;
  position: relative;
}

/* 固定宽度表格 */
.fixed-table {
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

/* 固定列样式 */
.fixed-column {
  position: sticky;
  left: 0;
  background-color: rgb(246, 246, 246);
  z-index: 2;
  min-width: 150px; /* 固定列的宽度 */
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 表头样式 */
.fixed-table thead th {
  position: sticky;
  top: 0;
  background-color: #ceeef8;
  z-index: 3;
}

.fixed-table th {
  position: relative;
}

/* 表格单元格样式 */
.fixed-table th, 
.fixed-table td {
  border: 1px solid #ffffff;
  padding: 8px 12px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 斑马纹效果 */
.fixed-table tbody tr:nth-child(even) {
  background-color: #f6f6f6;
}

.fixed-table tbody tr:hover {
  background-color: #f1f1f1;
}

/* 固定列的悬停效果 */
.fixed-column:hover {
  background-color: #e9e9e9;
}

/* .resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
  background: transparent;
} */
</style>