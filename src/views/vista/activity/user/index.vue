<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="物料名称" prop="matName">
        
        <el-select v-model="queryParams.matName" placeholder="物料名称" clearable filterable style="width: 200px">
            <el-option
                v-for="item in matNames"
                :key="item"
                :label="item"
                :value="item">
            </el-option></el-select>
      </el-form-item>

      <el-form-item label="操作时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['stock:prodOrder:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleData"
          v-hasPermi="['stock:prodOrder:export']"
        >查看数据</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <!-- 查看表格数据 -->
    <el-dialog
      :visible.sync="showTableDialog"
      width="90%"
      top="50px"
      :close-on-click-modal="false"
      :before-close="handleClose">
        <span slot="title">物料出入库详情</span>
        <el-table
          :data="tableData"
          border
          stripe
          style="width: 100%"
          v-loading="loading"
          element-loading-text="正在加载..."
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.3)">

        <el-table-column
            prop="matName"
            label="物料名称"
            width="180"
            align="center">
        </el-table-column>
        <el-table-column
            prop="operTypeLabel"
            label="操作类型"
            width="120"
            align="center">
        </el-table-column>
        <el-table-column
            prop="quantity"
            label="数量"
            width="100"
            align="center"
        ></el-table-column>
        <el-table-column
            prop="operDate"
            label="操作日期"
            width="120"
            align="center"
        ></el-table-column>
        <el-table-column
            prop="userName"
            label="操作用户"
            width="120"
            align="center"
        ></el-table-column>
        </el-table>
        <pagination
            v-show="total>0"
            :total="total"
            :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize"
            @pagination="getList"
            />
      </el-dialog>
    <!-- chart: 折线图 -->
    <el-card class="box-card" shadow="hover" style="margin-bottom: 20px">
        <StackedBarChart :initData="initData" title="物料-用户操作情况"/>
    </el-card>
    </div>
</template>

<script>
import { vistaMatUser } from '@/api/vista/activity';
import { getRecordMatNames } from '@/api/stock/record';
import { exportStatsStockIn } from '@/api/stats/stockIn';
require('echarts/theme/macarons') // echarts theme

import StackedBarChart from '../../charts/StackedBarChart.vue';

export default {
  name: 'VistaMatUser',
  components: {
    StackedBarChart
  },
  data() {
    return {
      loading: false,
      showSearch: true,
      showTableDialog: false,
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        matCode: null,
        matName: null,
        matTag: null,
      },
      total: 0,
      tableData: [],
      initData: [

        ],
        matNames: [],
    };
  },
  created() {
    // this.getList();
    this.handleGetRecordMatNames();
    },
  methods: {    
    handleGetRecordMatNames(){
        getRecordMatNames().then((res) => {
            this.matNames = res.data;
        });
    },
    // 获取列表数据
    getList() {
        if(this.queryParams.matName == null || this.queryParams.matName.trim() === ''){
          this.$message.warning("请输入物料名称");
          return;
        }
      vistaMatUser(this.addDateRange(this.queryParams, this.dateRange)).then((res) => {
        this.loading = false;
        const returnData = res.data || [];
            
        const data = returnData.map(matStock => ({
            xLabel: matStock.xLabel,
            value: matStock.quantity,
            classType: matStock.classType,
        }));
        // 处理图表数据
        this.initData = data;
        console.log(this.initData);
      }).catch(() => {
        this.loading = false;
      });
    },
    // 重置查询条件
    resetQuery() {
      this.$refs.queryForm.resetFields();
      this.dateRange = [];
      this.queryParams.pageNum = 1;
      this.getList();
    },
    // 搜索按钮
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    // 导出数据
    handleExport() {
      if (this.dateRange && this.dateRange.length === 2) {
        this.queryParams.startTime = this.dateRange[0];
        this.queryParams.endTime = this.dateRange[1];
      } else {
        this.queryParams.startTime = null;
        this.queryParams.endTime = null;
      }
      exportStatsStockIn(this.queryParams).then((res) => {
        const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
        const downloadElement = document.createElement('a');
        const href = window.URL.createObjectURL(blob); // 创建下载的链接
        downloadElement.href = href;
        downloadElement.download = '库存统计.xlsx';
        document.body.appendChild(downloadElement);
        downloadElement.click();
        document.body.removeChild(downloadElement);
      });
    },
    handleData() {
      if(this.queryParams.matName == null || this.queryParams.matName.trim() === ''){
        this.$message.warning("请输入物料名称");
        return;
      }
      this.showTableDialog = true;
      this.tableData = this.initData
      this.loading = false;
    },
  }
};
</script>
