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
        // 只有在 ref 可用时才初始化 / 更新图表，避免 "invalid dom" 错误
        if (this.$refs && this.$refs.chart) {
          this.initChart();
        } else {
          this.$nextTick(() => {
            if (this.$refs && this.$refs.chart) this.initChart();
          });
        }
      },
      immediate: true,
      deep: true
    }
  },
  data() {
    return {
      chart: null
    };
  },
  mounted() {
    // mounted 时确保初始化
    this.$nextTick(() => {
      if (this.$refs && this.$refs.chart) this.initChart();
    });
  },
  beforeDestroy() {
    if (this.chart) {
      try { this.chart.dispose(); } catch (e) {}
      this.chart = null;
    }
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    initChart() {
      // 如果已经有实例，先销毁，避免重复初始化
      if (this.chart) {
        try { this.chart.dispose(); } catch (e) {}
        this.chart = null;
        window.removeEventListener('resize', this.handleResize);
      }
      if (!this.$refs || !this.$refs.chart) return;
      this.chart = echarts.init(this.$refs.chart);
      this.updateChart();
    },
    
    updateChart() {
      if (!this.chart) return;
      this.chart.clear();

      // 获取所有x轴数据
      const xLabels = [...new Set(this.initData.map(item => item.xLabel))];
      
      // 获取所有图例和系列数据
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
          },
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
              if (param.value > 0) {
                result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
                total += param.value;
              }
              
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

      this.chart.setOption(option, true);
      window.removeEventListener('resize', this.handleResize);
      window.addEventListener('resize', this.handleResize);
    },
    
    handleResize() {
      if (this.chart) {
        this.chart.resize();
      }
    }
  },
};
</script>

<style scoped>

.chart-container {
  width: 100%;
  height: 100%;
}
</style>