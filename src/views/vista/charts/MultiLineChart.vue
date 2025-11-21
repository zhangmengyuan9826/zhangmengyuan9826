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
        // 如果 ref 可用立即更新，否则在下一次 tick 尝试初始化
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
    // 确保 DOM 就绪后再初始化，避免 invalid dom 错误
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
      // 销毁旧实例并移除监听，防止重复和残留
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

      // 如果没有数据，清空图表并返回
      if (!this.initData || this.initData.length === 0) {
        this.chart.clear();
        return;
      }

      // 清空旧配置，避免 echarts merge 导致残留 series/legend
      this.chart.clear();

      // 获取标题（如果有）
      const title = this.initData[0] && this.initData[0].title ? this.initData[0].title : '';

      // 获取所有操作类型与横轴点
      const classTypes = [...new Set(this.initData.map(item => item.classType))];
      const xLabels = [...new Set(this.initData.map(item => item.xLabel))].sort();

      // 构造 series 数据
      const seriesData = classTypes.map(classType => {
        const dataByX = {};
        this.initData
          .filter(item => item.classType === classType)
          .forEach(item => {
            dataByX[item.xLabel] = (dataByX[item.xLabel] || 0) + Number(item.quantity || 0);
          });
        const data = xLabels.map(x => dataByX[x] || 0);
        return {
          name: this.getClassTypeName(classType),
          type: 'line',
          data,
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

      // 强制替换旧配置（避免 merge）
      this.chart.setOption(option, true);

      // 确保 resize 监听只注册一次
      window.removeEventListener('resize', this.handleResize);
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
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>