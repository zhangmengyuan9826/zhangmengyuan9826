<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="仓库" prop="warehouseCode">
        <el-select v-model="queryParams.warehouseCode" placeholder="请选择仓库">
          <el-option
            v-for="item in warehouseList"
            :key="item.warehouseCode"
            :label="item.warehouseName"
            :value="item.warehouseCode"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="货位" prop="locationCode">
        <el-select
          v-model="queryParams.locationCode"
          placeholder="请选择货位"
        >
          <el-option
            v-for="(item, index) in locationList"
            :key="item.locationCode"
            :label="formatLocation(item.locationCode)"
            :value="item.locationCode"
          ></el-option>
        </el-select>
      </el-form-item>
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
      <el-form-item label="批次" prop="batch">
        <el-input
          v-model="queryParams.batch"
          placeholder="请输入批次"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="供应商" prop="supplierCode">
        <el-input
          v-model="queryParams.supplierCode"
          placeholder="请输入供应商编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="selectStockInfoTable" v-loading="loading" :data="stockInfoList">
      <el-table-column type="selection" :selectable="checkSelectable" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="infoId" />
      <el-table-column label="仓库" align="center" prop="warehouseName" />
      <el-table-column label="货位" align="center" prop="locationCode" >
        <template slot-scope="scope">
          {{ formatLocation(scope.row.locationCode) }}
        </template>
      </el-table-column>
      <el-table-column label="物料编码" align="center" prop="matCode" />
      <el-table-column label="物料名称" align="center" prop="matName" />
      <el-table-column label="批次" align="center" prop="batch" />
      <el-table-column label="数量" align="center" prop="quantity" />
      <el-table-column label="供应商" align="center" prop="supplierName" />
      <el-table-column label="有效期" width="100">
        <template slot-scope="scope">
          <span :style="getExpiringStyle(scope.row.expiredTime)">
            {{ parseTime(formatDate(scope.row.expiredTime),'{y}-{m}-{d}') }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="center" width="120" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-if="infoIdArr.indexOf(scope.row.infoId) < 0 && scope.row.quantity >0"
            size="mini"
            type="text"
            icon="el-icon-c-scale-to-original"
            @click="handleSelect(scope.row)"
          >选择</el-button>
          <span v-if="infoIdArr.indexOf(scope.row.infoId) >= 0" >已选</span>
          <span v-if="scope.row.quantity <= 0">无库存</span>
        </template>
      </el-table-column>
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
import { listInfo } from "@/api/stock/info";
import { listAllWarehouse } from "@/api/base/warehouse";
import { listAllLocation } from "@/api/base/location";

export default {
  name: "Info",
  props: {
    infoIdArr:{
      type: Array,
      default: [],
    }
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 库存信息表格数据
      stockInfoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      stockInfoList : [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        warehouseCode: null,
        locationCode: null,
        matCode: null,
        matName: null,
        batch: null,
        quantity: null,
        supplierCode: null,
        supplierName: null,
      },

      //选择仓库、实验室
      warehouseList: [],
      locationList: [],
      locationDict: {},
    };
  },
  
  created() {
    // this.getList();
    this.getWarehouseList();
    this.getBaselocationList();
  },
  methods: {
    /** 查询库存信息列表 */
    init (val) {
      this.queryParams.locationCode = val   //接收父组件传递的id值
      this.getList()
    },
    formatLocation(locationCode){
      return locationCode+"-"+this.locationDict[locationCode]
    },
     //查询货位
    getBaselocationList() {
      listAllLocation().then((response) => {
        this.locationList = response;
        this.locationDict = this.locationList.reduce((dict, obj) => {
          dict[obj.locationCode] = obj.locationName;
          return dict;
        }, {});
      });
    },
    getList() {
      this.loading = true;
      console.log(this.queryParams);
      // this.queryParams = dict(this.queryParams , **queryParamsOut)
      listInfo(this.queryParams).then(response => {
        this.stockInfoList = response.rows;
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
    
    //查询仓库
    getWarehouseList(){
      listAllWarehouse().then(response => {
        this.warehouseList = response;
      });
    },
    formatDate(dateString) {
      // return new Date(dateString).toLocaleDateString();
      // 尝试将字符串转换为日期对象
      if(dateString === ""){
        return dateString
      }
      if(! dateString){
        return dateString
      }

      const date = new Date(dateString);
      // 如果无效的日期字符串，返回原始字符串
      if (isNaN(date)) {
        return dateString;
      }
      // 如果是有效的日期，进行格式化
      return date.toLocaleDateString();
    },
    getExpiringStyle(expirationDate) {
      const today = new Date();
      const expDate = new Date(expirationDate);
      const threeMonthsLater = new Date(today);
      const oneMonthsLater = new Date(today);
      threeMonthsLater.setMonth(today.getMonth() + 3);
      oneMonthsLater.setMonth(today.getMonth() + 1);
      if (!isNaN(expDate) && expDate < today) {
        return { color: 'red' };
      };
      if (!isNaN(expDate) && expDate < threeMonthsLater) {
        return { color: 'orange' };
      }
      return {};
    },
    //是否可选
    checkSelectable(row, index){
      if(this.infoIdArr.indexOf(row.infoId) >= 0){
        return false;
      }else{
        return true;
      }
    },
    //选择物料
    handleSelect(row){
      this.$refs.selectStockInfoTable.clearSelection();
      this.$emit('confirmSelect', row);
    },
    //多选物料
    handleSelectArr(){
      let arr = this.$refs.selectStockInfoTable.selection;
      this.$refs.selectStockInfoTable.clearSelection();
      this.$emit('confirmSelectArr', arr);
    },
  }
};
</script>
<style scoped>
.app-container{
  padding: 0px;
}
</style>
