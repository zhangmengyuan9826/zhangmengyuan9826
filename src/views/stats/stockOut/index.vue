<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="物料编码" prop="matCode">
        <el-input
          v-model="queryParams.matCode"
          placeholder="请输入物料编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="物料名称" prop="matName">
        <el-input
          v-model="queryParams.matName"
          placeholder="请输入物料名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="批次号" prop="batch">
        <el-input
          v-model="queryParams.batch"
          placeholder="请输入批次号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="货位号" prop="locationCode">
        <el-input
          v-model="queryParams.locationCode"
          placeholder="请输入货位号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="实验室" prop="workshopCode">
        <el-input
          v-model="queryParams.workshopCode"
          placeholder="请输入货位号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="操作人" prop="updateBy">
        <el-input
          v-model="queryParams.updateBy"
          placeholder="请输入操作人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="出库时间">
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
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="statsStockOutList">
      <el-table-column label="物料编码" align="center" prop="matCode" />
      <el-table-column label="物料名称" align="center" prop="matName" />
      <el-table-column label="规格" align="center" prop="figNum" />
      <el-table-column label="批次" align="center" prop="batch" />
      <el-table-column label="货位号" align="center" prop="locationCode" />
      <el-table-column label="实验室" align="center" prop="workshopCode" />
      <el-table-column label="供应商" align="center" prop="supplierName" />
      <el-table-column label="出库操作者" align="center" prop="updateBy" />
      <el-table-column label="出库时间" align="center" prop="updateTime" />

      <el-table-column label="出库单物料数" align="center" prop="quantity" />
      <el-table-column label="已领取数" align="center" prop="receivedQuantity" />
      <el-table-column label="出库退货单数" align="center" prop="returnQuantity" />
      <el-table-column label="已出库退货数" align="center" prop="finishReturnQuantity" />



    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

  </div>
</template>

<script>
import { listStatsStockOut } from "@/api/stats/stockOut";

export default {
  name: "StatsStockOut",
  data() {
    return {
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        matCode: null,
        matName: null,
      },
      //展示数据
      statsStockOutList: [],
       // 日期范围
      dateRange: [],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询生产订单列表 */
    getList() {
      this.loading = true;
      listStatsStockOut(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.statsStockOutList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('stats/statsOutOrderExport', {
        ...this.queryParams
      }, `stock_out_stats_${new Date().getTime()}.xlsx`)
    },
  }
};
</script>
