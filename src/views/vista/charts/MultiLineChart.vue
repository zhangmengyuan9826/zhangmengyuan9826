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
  name: 'MultiLineChart',
  props: {
    initData: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    initData: {
      handler() {
        this.initChart();
      },
      immediate: true
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
      const title = this.initData[0]?.title || '';
      
      // 获取所有操作类型
      const classTypes = [...new Set(this.initData.map(item => item.classType))];
      
      // 获取所有日期
      const xLabels = [...new Set(this.initData.map(item => item.xLabel))].sort();
      
      // 为每种操作类型准备数据
      const seriesData = classTypes.map(classType => {
        // 按日期分组该操作类型的数据
        const dataByDate = {};
        this.initData
          .filter(item => item.classType === classType)
          .forEach(item => {
            dataByDate[item.xLabel] = (dataByDate[item.xLabel] || 0) + item.quantity;
          });
        
        // 构建系列数据
        const data = xLabels.map(xLabel => dataByDate[xLabel] || 0);

        return {
          name: this.getClassTypeName(classType),
          type: 'line',
          data: data,
          smooth: true
        };
      });

      const option = {
        title: {
          text: `${title}`,
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
          data: classTypes.map(type => this.getClassTypeName(type)),
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
          data: xLabels,
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

    getClassTypeName(classType) {
      return classType;
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