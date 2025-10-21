<template>
  <div class="chart-container">
    <div ref="chart" style="width: 100%; height: 500px;"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts/lib/echarts';
// 按需引入需要的组件
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/title';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/grid';

export default {
  name: 'StackedBarChart',
  props: {
    initData: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: 'WMS仓储信息分布堆叠图'
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
        return;
      }

      // 获取所有车间（x轴数据）
      const xLabels = [...new Set(this.initData.map(item => item.xLabel))];
      
      // 获取所有物料名称（图例和系列数据）
      const classTypes = [...new Set(this.initData.map(item => item.classType))];
      
      // 为每种物料准备数据
      const seriesData = classTypes.map(classType => {
        // 构建每个车间对应的数量数据
        const data = xLabels.map(xLabel => {
          const item = this.initData.find(
            d => d.classType === classType && d.xLabel === xLabel
          );
          return item ? item.quantity : 0;
        });

        return {
          name: classType,
          type: 'bar',
          stack: 'total', // 堆叠的关键配置
          data: data,
          emphasis: {
            focus: 'series'
          }
        };
      });

      const option = {
        title: {
          text: this.title,
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            let result = `${params[0].axisValue}<br/>`;
            let total = 0;
            
            params.forEach(param => {
              result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
              total += param.value;
            });
            
            result += `<hr style="margin: 5px 0; border: none; border-top: 1px solid #ccc;">`;
            result += `总计: ${total}`;
            
            return result;
          }
        },
        legend: {
          data: classTypes,
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
          },
          name: ''
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
    },
    title: {
      handler() {
        if (this.chart) {
          this.updateChart();
        }
      }
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