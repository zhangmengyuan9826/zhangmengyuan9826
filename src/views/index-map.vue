<template>
  <div id="china-map" style="width: 100%; height: 600px;"></div>
</template>

<script>
import * as echarts from 'echarts';
// 引入中国地图
import chinaJson from '@/assets/map/china.json';

export default {
  mounted() {
    this.initChinaMap();
  },
  methods: {
    initChinaMap() {
      echarts.registerMap('china', chinaJson);
      
      const chartDom = document.getElementById('china-map');
      const myChart = echarts.init(chartDom);
      
      
      const option = {
        title: {
          text: '中国地图示例',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}<br/>{c} (万)'
        },
        visualMap: {
          min: 0,
          max: 2500,
          left: 'left',
          top: 'bottom',
          text: ['高', '低'],
          calculable: true
        },
        series: [
          {
            name: '数据名称',
            type: 'map',
            mapType: 'china',  // 使用中国地图
            roam: true,        // 允许缩放和平移
            label: {
              show: false, // 不显示省份名称
              fontSize: 10
            },
            itemStyle: {
              areaColor: '#e9ecef',
              borderColor: '#111'
            },
            emphasis: {
              itemStyle: {
                areaColor: '#ff7e5f'
              },
              label: {
                show: false,
                color: '#fff'
              }
            },
            // 模拟数据
            data: [
              { name: '北京', value: 2189 },
              { name: '上海', value: 2487 },
              { name: '广东', value: 12601 },
              { name: '浙江', value: 6456 },
              { name: '江苏', value: 8474 },
              // ... 其他省份数据
            ]
          },
          // 在地图上叠加饼图
          {
            type: 'pie',
            coordinateSystem: 'geo',
            radius: 40,
            center: [116.4074, 390.9042], // 北京经纬度
            data: [
              { value: 1048, name: 'A' },
              { value: 735, name: 'B' },
              { value: 580, name: 'C' }
            ],
            label: { show: false },
            labelLine: { show: false },
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            color: ['#FF6B6B', '#4ECDC4', '#FFD93D'] // 自定义饼图配色
          }
        ]
      };
      
      myChart.setOption(option);
      
      // 响应窗口大小变化
      window.addEventListener('resize', () => {
        myChart.resize();
      });
    }
  }
};
</script>