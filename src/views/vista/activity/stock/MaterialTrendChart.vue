<template>
  <div class="chart-container">
    <div ref="chart" style="width: 95%; height: 400px;"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts/lib/echarts';
// 按需引入需要的组件
import 'echarts/lib/chart/line';
import 'echarts/lib/component/title';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/grid';

export default {
  name: 'MaterialTrendChart',
  props: {
    initData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      chart: null
    };
  },
  mounted() {
    this.initChart();
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chart);
      this.updateChart();
    },
    
    updateChart() {
      if (!this.initData || this.initData.length === 0) {
        return {};
      }

      // 获取唯一的物料名称（用于标题）
      const matName = this.initData[0]?.matName || '';
      
      // 获取所有操作类型
      const operTypes = [...new Set(this.initData.map(item => item.operTypeLabel))];
      
      // 获取所有日期
      const dates = [...new Set(this.initData.map(item => item.operDate))].sort();
      
      // 为每种操作类型准备数据
      const seriesData = operTypes.map(operTypeLabel => {
        // 按日期分组该操作类型的数据
        const dataByDate = {};
        this.initData
          .filter(item => item.operTypeLabel === operTypeLabel)
          .forEach(item => {
            dataByDate[item.operDate] = (dataByDate[item.operDate] || 0) + item.quantity;
          });
        
        // 构建系列数据
        const data = dates.map(date => dataByDate[date] || 0);
        
        return {
          name: this.getOperTypeName(operTypeLabel),
          type: 'line',
          data: data,
          smooth: true
        };
      });

      const option = {
        title: {
          text: `${matName} - 库存趋势图`,
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            let result = `${params[0].axisValue}<br/>`;
            params.forEach(param => {
              result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
            });
            return result;
          }
        },
        legend: {
          data: operTypes.map(type => this.getOperTypeName(type)),
          top: '10%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '20%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: '数量'
        },
        series: seriesData
      };

      this.chart.setOption(option);
      
      // 响应窗口大小变化
      window.addEventListener('resize', this.handleResize);
    },
    
    getOperTypeName(operType) {      
      return operType;
    },
    
    handleResize() {
      if (this.chart) {
        this.chart.resize();
      }
    }
  },
  watch: {
    initData: {
      handler() {
        if (this.chart) {
          this.updateChart();
        }
      },
      deep: true
    }
  }
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>