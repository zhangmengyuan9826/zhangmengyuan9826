<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="单据号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入单据号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="单据状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="请选择">
          <el-option
            v-for="item in orderStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
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
      <el-form-item label="创建时间">
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
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['stock:outOrder:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['stock:outOrder:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          :disabled="multiple"
          @click="handleExport"
          v-hasPermi="['stock:outOrder:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="outOrderList" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="单据号" align="center" prop="orderNo" />
      <el-table-column label="单据类型" align="center" prop="orderTypeLabel" />
      <el-table-column label="仓库" align="center" prop="warehouseName" />
      <el-table-column label="实验室" align="center" prop="workshopName" />
      <el-table-column label="单据状态" align="center" prop="orderStatusLabel" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{$moment(scope.row.createTime).format('YYYY-MM-DD HH:mm')}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleDetail(scope.row)"
            v-hasPermi="['stock:outOrder:edit']"
          >详情</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['stock:outOrder:remove']"
            :disabled="scope.row.orderStatusLabel!=='已创建'"
          >删除</el-button>
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

    <!-- 添加出库单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1200px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="仓库" prop="warehouseCode">
              <el-select v-model="form.warehouseCode" placeholder="请选择仓库">
                <el-option
                  v-for="item in warehouseList"
                  :key="item.warehouseCode"
                  :label="item.warehouseName"
                  :value="item.warehouseCode"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="实验室" prop="workshopCode">
              <el-select v-model="form.workshopCode" placeholder="请选择实验室">
                <el-option
                  v-for="item in workshopList"
                  :key="item.workshopCode"
                  :label="item.workshopName"
                  :value="item.workshopCode"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="用途/原因" prop="orderReason">
            <el-input placeholder="请输入用途/原因" v-model="form.orderReason"/>
          </el-form-item>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="选择物料标签">
              <el-button size="small" type="success" icon="el-icon-search" @click="openSelectMatLabelDialog">物料清单</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-table :data="matLabelList" style="width: 100%">
        <el-table-column label="行号" align="center" type="index" />
        <el-table-column label="物料编码" align="center" prop="matCode"/>
        <el-table-column label="物料名称" align="center" prop="matName"/>
        <el-table-column label="规格" align="center" prop="figNum"/>
        <el-table-column label="数量" align="center" prop="quantity">
          <template slot-scope="scope">
            <el-input-number style="width: 100px" size="small" 
            v-model="scope.row.quantity" controls-position="right" 
            :min="1" :max="scope.row.maxQuantity" :precision="0"/>
          </template>
        </el-table-column>
        <el-table-column label="单位" align="center" prop="unitCode">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.base_mat_unit" :value="scope.row.unitCode"/>
          </template>  
        </el-table-column>
        <el-table-column label="货位" align="center" prop="locationCode" >
        <template slot-scope="scope">
          {{ formatLocation(scope.row.locationCode) }}
        </template>
      </el-table-column>
        <el-table-column label="操作" align="center" width="80" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-scissors"
              @click="handleRemove(scope.$index, scope.row)"
            >去除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">创 建</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 出库单详情对话框 -->
    <el-dialog class="detail-dialog" :title="'出库单详情'" :visible.sync="outOrderDetailOpen" width="1200px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="120px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="出库单号：">
              <span>{{form.orderNo}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="仓库：">
              <span>{{form.warehouseName}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="领料人：">
              <span>{{form.createBy}}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="领料时间：">
              <span>{{$moment(form.createTime).format('YYYY-MM-DD HH:mm')}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="实验室：">
              <span>{{form.workshopName}}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="用途/原因：">
            <span>{{form.orderReason}}</span>
          </el-form-item>
        </el-row>
      </el-form>
      <el-table class="detail-table" :data="matLabelList" style="width: 100%">
        <el-table-column label="行号" align="center" prop="lineNo" />
        <el-table-column label="物料编码" align="center" prop="matCode"/>
        <el-table-column label="物料名称" align="center" prop="matName"/>
        <el-table-column label="规格" align="center" prop="figNum"/>
        <el-table-column label="数量" align="center" prop="quantity"/>
        <el-table-column label="已领" align="center" prop="receivedQuantity"/>
        <el-table-column label="单位" align="center" prop="unitCode">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.base_mat_unit" :value="scope.row.unitCode"/>
          </template>
        </el-table-column>
        <el-table-column label="货位" align="center" prop="locationCode" >
        <template slot-scope="scope">
          {{ formatLocation(scope.row.locationCode) }}
        </template>
      </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmPrintOutOrder">打 印</el-button>
        <el-button @click="cancelOrderDetail">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="'选择物料标签'" :visible.sync="selectMatLabelOpen" width="1200px" append-to-body :close-on-click-modal="false">
      <selectMatLabel ref="matLabelPage"  :labelIdArr="labelIdArr" :selectType="'multiple'" @confirmSelectArr="confirmSelectMatLabelArr" @confirmSelect="confirmSelectMatLabel"></selectMatLabel>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSelectMatLabel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listOutOrder, getOutOrder, delOutOrder, addOutOrder, printOutOrder } from "@/api/stock/outOrder";
import { listAllWorkshop } from "@/api/base/workshop";
import { listAllWarehouse } from "@/api/base/warehouse";
import { listAllLocation } from "@/api/base/location";

// import selectMat from "../../components/select-mat/index"
import selectMatLabel from "../../components/select-mat-label-out/index";

export default {
  name: "OutOrder",
  dicts: ['base_mat_unit'],
  components: { selectMatLabel },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      orderNos: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 出库单表格数据
      outOrderList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderNo: null,
        orderType: 'common',
        prodOrderNo: null,
        warehouseCode: null,
        workshopCode: null,
        orderReason: null,
        matCode: null,
        matName: null,
        quantity: null,
        orderStatus: null,
        warehouseKeeper: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        warehouseCode: [
          { required: true, message: "请选择仓库", trigger: "blur" },
        ],
        workshopCode: [
          { required: true, message: "请选择实验室", trigger: "blur" },
        ],
        orderReason: [
          { required: true, message: "用途/原因不能为空", trigger: "blur" },
        ],
      },

      // 日期范围
      dateRange: [],

      //单据状态
      orderStatusOptions:[
        {value: 'created', label: '已创建'}, 
        {value: 'printed', label: '已打印'},
        {value: 'received', label: '已领料'},
      ],

      //仓库
      warehouseList: [],
      workshopList: [],
      //选择物料
      // selectMatOpen: false,
      //选择物料标签
      selectMatLabelOpen: false,

      //出库单详情
      outOrderDetailOpen: false,
      matLabelList: [],
      //防重复标签
      labelIdArr: [],
      locationList: [],
      locationDict: {},
    };
  },
  created() {
    this.getList();
    this.getWarehouseList();
    this.getWorkshopList();
    this.getBaselocationList();
  },
  methods: {
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
    /** 查询出库单列表 */
    getList() {
      this.loading = true;
      listOutOrder(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.outOrderList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
      this.matLabelList = [];
    },
    // 表单重置
    reset() {
      this.form = {
        orderId: null,
        orderNo: null,
        orderType: null,
        prodOrderNo: null,
        warehouseCode: null,
        workshopCode: null,
        orderReason: null,
        matCode: null,
        matName: null,
        quantity: null,
        orderStatus: "0",
        warehouseKeeper: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      };
      this.matLabelList=[];
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.orderId)
      this.orderNos = selection.map(item => item.orderNo)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加出库单";
    },
    /** 详情 */
    handleDetail(row){
      this.reset();
      getOutOrder(row.orderId).then(response => {
        this.form = response.data;
        this.matLabelList = response.data.detailList;
        this.outOrderDetailOpen = true;
      });
    },
    confirmPrintOutOrder(){
      printOutOrder(this.form.orderId).then(response => {
        const binaryData = [];
        binaryData.push(response);
        let pdfUrl = window.URL.createObjectURL(new Blob(binaryData, { type: "application/pdf" }));
        window.open(pdfUrl);
      });
    },
    cancelOrderDetail(){
      this.outOrderDetailOpen = false;
    },
    /** 提交按钮 */
    submitForm() {
      let that = this;
      if(!that.matLabelList || that.matLabelList.length === 0){
        that.$modal.msgError("请选择物料");
        return;
      }
      let checkFlag = false;
      that.matLabelList.forEach(item => {
        if(item.quantity > 0){
          checkFlag = true;
        }
      });
      if(!checkFlag){
        that.$modal.msgError("请至少选择一项领取");
        return;
      }
      that.$refs["form"].validate(valid => {
        if (valid) {
          that.$modal.confirm('是否确认创建出库单？').then(function() {
            that.form.detailList = that.matLabelList;
            that.form.orderType = 'common';
            addOutOrder(that.form).then(response => {
              that.$modal.msgSuccess("新增成功");
              that.open = false;
              that.getList();
              that.reset();
              that.labelIdArr = [];
              that.matLabelList = [];
            });
          });
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const orderIds = row.orderId || this.ids;
      const delOrderNos = row.orderNo || this.orderNos;
      this.$modal.confirm('是否确认删除出库单号为 "' + delOrderNos + '" 的数据项？').then(function() {
        return delOutOrder(orderIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('stock/outOrder/export', {
        ids: this.ids.join(',')
      }, `outOrder_${new Date().getTime()}.xlsx`)
    },
    //查询仓库、实验室
    getWarehouseList(){
      listAllWarehouse().then(response => {
        this.warehouseList = response;
      });
    },
    getWorkshopList(){
      listAllWorkshop().then(response => {
        this.workshopList = response;
      });
    },
    //选择物料标签
    openSelectMatLabelDialog(){
      this.selectMatLabelOpen = true;
      this.$nextTick(function(){ 
        this.$refs.matLabelPage.getList();
      })
    },
    confirmSelectMatLabel(item){
      let detail = {
        labelId: item.labelId,
        matCode: item.matCode,
        matName: item.matName,
        fdCode: item.fdCode,
        figNum: item.figNum,
        quantity: 0,
        maxQuantity: item.maxQuantity,
        matTag: item.matTag,
        unitCode: item.unitCode,
        batch: item.batch,
        brand: item.brand,
        supplierCode: item.supplierCode,
        locationCode: item.locationCode
      };
      this.matLabelList.unshift(detail);
      this.labelIdArr.push(item.labelId);
      this.selectMatLabelOpen = false;
    },
    confirmSelectMatLabelArr(arr){
      let that = this;
      arr && arr.length > 0 && arr.forEach(item => {
        let detail = {
          labelId: item.labelId,
          matCode: item.matCode,
          matName: item.matName,
          fdCode: item.fdCode,
          figNum: item.figNum,
          matGroup: item.matGroup,
          matClass: item.matClass,
          quantity: 0,
          maxQuantity: item.maxQuantity,
          matTag: item.matTag,
          unitCode: item.unitCode,
          batch: item.batch,
          brand: item.brand,
          supplierCode: item.supplierCode,
          locationCode: item.locationCode
        };
        that.matLabelList.unshift(detail);
        that.labelIdArr.push(item.labelId);
      });
      this.selectMatLabelOpen = false;
    },

    cancelSelectMatLabel(){
      this.selectMatLabelOpen = false;
    },
    //去除物料标签
    handleRemove(index, row){
      this.labelIdArr.splice(this.labelIdArr.indexOf(row.labelId), 1);
      this.matLabelList.splice(index, 1);
    },
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.detail-dialog{
  .el-form-item{
    margin-bottom: 0px;
  }
  .detail-table{
    margin-top: 20px;
  }
}
</style>