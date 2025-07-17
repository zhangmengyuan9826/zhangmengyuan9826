<template>
  <div class="chart-container">
    <div class="filter-container">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        
        <el-form-item label="物料选择">
          <el-select
            v-model="queryParams.materialIds"
            multiple
            filterable
            placeholder="请选择物料"
            style="width: 300px"
          >
            <el-option
              v-for="item in materialOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div ref="chart" style="width: 100%; height: 500px;"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
// import { getMaterialStatistics } from '@/api/statistics';
// import { listMaterials } from '@/api/material';
import {
  listInOrder } from "@/api/stock/inOrder";

export default {
  data() {
    return {
      queryParams: {
        dateRange: [this.getDefaultStartDate(), this.getDefaultEndDate()],
        materialIds: []
      },
      materialOptions: [],
      chart: null
    };
  },
  mounted() {
    this.initChart();
    this.loadMaterialOptions();
    this.fetchData();
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  },
  methods: {
    // 初始化图表
    initChart() {
      this.chart = echarts.init(this.$refs.chart);
      window.addEventListener('resize', this.resizeChart);
    },
    
    resizeChart() {
      this.chart && this.chart.resize();
    },
    
    // 获取默认开始日期(30天前)
    getDefaultStartDate() {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      return date;
    },
    
    // 获取默认结束日期(今天)
    getDefaultEndDate() {
      return new Date();
    },
    
    // 加载物料选项
    async loadMaterialOptions() {
      try {
        const res = await listMaterials();
        this.materialOptions = res.data;
      } catch (error) {
        console.error('加载物料列表失败:', error);
      }
    },
    
    // 获取统计数据
    async fetchData() {
      if (!this.queryParams.dateRange || this.queryParams.dateRange.length !== 2) {
        this.$message.warning('请选择日期范围');
        return;
      }
      
      if (!this.queryParams.materialIds || this.queryParams.materialIds.length === 0) {
        this.$message.warning('请选择至少一个物料');
        return;
      }
      
      try {
        const params = {
          startDate: this.queryParams.dateRange[0],
          endDate: this.queryParams.dateRange[1],
          materialIds: this.queryParams.materialIds.join(',')
        };
        
        const res = await getMaterialStatistics(params);
        this.renderChart(res.data);
      } catch (error) {
        console.error('获取统计数据失败:', error);
        this.$message.error('获取数据失败');
      }
    },
    
    // 渲染图表
    renderChart(data) {
      if (!data || data.length === 0) {
        this.chart.clear();
        this.$message.warning('没有符合条件的数据');
        return;
      }
      
      // 提取时间轴数据
      const dates = [...new Set(data.flatMap(item => item.details.map(d => d.date)))].sort();
      
      // 准备系列数据
      const series = data.map(material => {
        return {
          name: material.materialName,
          type: 'line',
          data: dates.map(date => {
            const detail = material.details.find(d => d.date === date);
            return detail ? detail.quantity : 0;
          }),
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3
          },
          emphasis: {
            focus: 'series'
          }
        };
      });
      
      const option = {
        title: {
          text: '物料库存变化趋势',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: data.map(item => item.materialName),
          bottom: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates,
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: '数量'
        },
        series: series,
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100
          },
          {
            start: 0,
            end: 100
          }
        ]
      };
      
      this.chart.setOption(option);
    },
    
    // 重置查询
    resetQuery() {
      this.queryParams = {
        dateRange: [this.getDefaultStartDate(), this.getDefaultEndDate()],
        materialIds: []
      };
    }
  }
};
</script>

<style scoped>
.chart-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.filter-container {
  margin-bottom: 20px;
}
</style>