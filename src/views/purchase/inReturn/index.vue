<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="退货单号" prop="returnNo">
        <el-input
          v-model="queryParams.returnNo"
          placeholder="请输入入库退货单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="退货原因" prop="returnReason">
        <el-input
          v-model="queryParams.returnReason"
          placeholder="请输入入库退货原因"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="入库单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入入库单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['stock:inReturn:add']"
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
          v-hasPermi="['stock:inReturn:remove']"
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
          v-hasPermi="['stock:inReturn:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="inReturnList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="退货单号" align="center" prop="returnNo" />
      <el-table-column label="退货类型" align="center" prop="returnTypeLabel" />
      <el-table-column label="单据状态" align="center" prop="returnStatusLabel" />
      <el-table-column label="入库单号" align="center" prop="orderNo" />
      <el-table-column label="仓库" align="center" prop="warehouseName" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleDetail(scope.row)"
            v-hasPermi="['stock:inReturn:edit']"
          >详情</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['stock:inReturn:remove']"
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

    <!-- 添加或修改入库单退货对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1200px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="入库单号" prop="orderNo">
              <el-input v-model="form.orderNo" readonly placeholder="请选择入库单">
                <el-button slot="append" icon="el-icon-search" @click="openSelectInOrderDialog"></el-button>
              </el-input>
            </el-form-item>
          </el-col>
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
        </el-row>
        <el-row>
          <el-form-item label="退货原因" prop="returnReason">
            <el-input v-model="form.returnReason" placeholder="请输入退货原因" />
          </el-form-item>
        </el-row>
      </el-form>
      <el-table class="detail-table" :data="inReturnDetailList" style="width: 100%">
        <el-table-column label="行号" align="center" type="index" />
        <el-table-column label="物料编码" align="center" prop="matCode" width="100" />
        <el-table-column label="物料名称" align="center" prop="matName" width="120" />
        <el-table-column label="集团编码" align="center" prop="fdCode" width="100" />
        <el-table-column label="规格" align="center" prop="figNum" width="120" />
        <el-table-column label="已入库数" align="center" prop="stockInQuantity" width="80" />
        <el-table-column label="需退货数" align="center" prop="quantity" width="100">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.quantity" style="width: 90px" size="small" controls-position="right" :min="1" integer/>
          </template>
        </el-table-column>
        <el-table-column label="单位" align="center" prop="unitCode" width="80">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.base_mat_unit" :value="scope.row.unitCode"/>
          </template>
        </el-table-column>
        <el-table-column label="批次" align="center" prop="batch" width="180" />
        <el-table-column label="供应商" align="center" prop="supplierName" width="180" />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="'选择入库单'" :visible.sync="selectInOrderOpen" width="1200px" append-to-body :close-on-click-modal="false">
      <selectInOrder @confirmSelect="confirmSelectInOrder"></selectInOrder>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSelectInOrder">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 入库退货单详情对话框 -->
    <el-dialog class="detail-dialog" :title="'入库退货单详情'" :visible.sync="inOrderReturnDetailOpen" width="1200px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="120px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="入库退货单号：">
              <span>{{form.returnNo}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="退货类型：">
              <span>{{form.returnTypeLabel}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="入库单号：">
              <span>{{form.orderNo}}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="退货原因：">
            <span>{{form.returnReason}}</span>
          </el-form-item>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="仓库：">
              <span>{{form.warehouseName}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="创建人：">
              <span>{{form.createBy}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="创建时间：">
              <span>{{$moment(form.createTime).format('YYYY-MM-DD HH:mm')}}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-table class="detail-table" :data="inReturnDetailList" style="width: 100%">
        <el-table-column label="行号" align="center" type="index" />
        <el-table-column label="物料编码" align="center" prop="matCode" width="100" />
        <el-table-column label="物料名称" align="center" prop="matName" width="120" />
        <el-table-column label="集团编码" align="center" prop="fdCode" width="100" />
        <el-table-column label="规格" align="center" prop="figNum" width="120" />
        <el-table-column label="需退货数" align="center" prop="quantity" width="80"/>
        <el-table-column label="已退库数" align="center" prop="returnQuantity" width="80" />
        <el-table-column label="单位" align="center" prop="unitCode" width="80">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.base_mat_unit" :value="scope.row.unitCode"/>
          </template>
        </el-table-column>
        <el-table-column label="批次" align="center" prop="batch" width="180" />
        <el-table-column label="供应商" align="center" prop="supplierName" width="180" />
        <el-table-column label="所在货位" align="center" prop="locationCode" width="100">
          <template slot-scope="scope">
            {{ formatLocation(scope.row.locationCode) }}
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" icon="el-icon-printer" @click="confirmPrintInOrderReturn">打 印</el-button>
        <el-button @click="cancelOrderReturnDetail">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listInReturn, getInReturn, delInReturn, addInReturn, printInOrderReturn } from "@/api/stock/inReturn";
import { returnListRecord } from "@/api/stock/record";
import { listAllWarehouse } from "@/api/base/warehouse";
import { listAllLocation } from "@/api/base/location";

import selectInOrder from "../../components/select-in-order/index"

export default {
  name: "InReturn",
  dicts: ['base_mat_unit'],
  components: { selectInOrder },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      returnNos: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 入库单退货表格数据
      inReturnList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        returnNo: null,
        return_type: 'purchase_return',
        returnReason: null,
        returnStatus: null,
        orderNo: null,
        warehouseCode: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        orderNo: [
          { required: true, message: "请选择入库单", trigger: "blur" },
        ],
        warehouseCode: [
          { required: true, message: "请选择仓库", trigger: "blur" },
        ],
        returnReason: [
          { required: true, message: "退货原因不能为空", trigger: "blur" },
        ],
      },

      //仓库
      warehouseList: [],

      //选择入库单
      selectInOrderOpen: false,

      //入库退货详情
      inOrderReturnDetailOpen: false,
      inReturnDetailList: [],
      locationList: [],
      locationDict: {},
    };
  },
  created() {
    this.getList();
    this.getWarehouseList();
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
    /** 查询入库单退货列表 */
    getList() {
      this.loading = true;
      listInReturn(this.queryParams).then(response => {
        this.inReturnList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
      this.inReturnDetailList = [];
    },
    // 表单重置
    reset() {
      this.form = {
        returnId: null,
        returnNo: null,
        returnType: 'purchase_return',
        returnReason: null,
        returnStatus: "0",
        orderNo: null,
        warehouseCode: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      };
      this.resetForm("form");
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.returnId)
      this.returnNos = selection.map(item => item.returnNo)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加入库退货单";
    },
    /** 详情 */
    handleDetail(row){
      this.reset();
      getInReturn(row.returnId).then(response => {
        this.form = response.data;
        this.inReturnDetailList = response.data.detailList;
        this.inOrderReturnDetailOpen = true;
      });
    },
    confirmPrintInOrderReturn(){
      printInOrderReturn(this.form.returnId).then(response => {
        const binaryData = [];
        binaryData.push(response);
        let pdfUrl = window.URL.createObjectURL(new Blob(binaryData, { type: "application/pdf" }));
        window.open(pdfUrl);
      });
    },
    cancelOrderReturnDetail(){
      this.inOrderReturnDetailOpen = false;
    },
    /** 提交按钮 */
    submitForm() {
      let that = this;
      if(!that.inReturnDetailList || that.inReturnDetailList.length === 0){
        that.$modal.msgError("请选择退货信息");
        return;
      }
      let checkFlag = false;
      that.inReturnDetailList.forEach(item => {
        if(item.quantity > 0){
          checkFlag = true;
        }
      });
      if(!checkFlag){
        that.$modal.msgError("请至少选择一项退货");
        return;
      }
      that.$refs["form"].validate(valid => {
        if (valid) {
          that.$modal.confirm('是否确认创建入库退货单？').then(function() {
            that.form.detailList = that.inReturnDetailList;
            that.form.returnType = 'purchase_return';
            addInReturn(that.form).then(response => {
              that.$modal.msgSuccess("新增成功");
              that.open = false;
              that.getList();
              that.reset();
              that.inReturnDetailList = [];
            });
          });
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const returnIds = row.returnId || this.ids;
      const delReturnNos = row.returnNo || this.returnNos;
      this.$modal.confirm('是否确认删除入库退货单号为 "' + delReturnNos + '" 的数据项？').then(function() {
        return delInReturn(returnIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('stock/inReturn/export', {
        ids: this.ids.join(',')
      }, `inReturn_${new Date().getTime()}.xlsx`)
    },
    //查询仓库
    getWarehouseList(){
      listAllWarehouse().then(response => {
        this.warehouseList = response;
      });
    },
    //选择入库单
    openSelectInOrderDialog(){
      this.selectInOrderOpen = true;
      this.reset();
      this.inReturnDetailList = [];
    },
    confirmSelectInOrder(item){
      this.form.orderNo = item.orderNo;
      //查询入库单详情
      returnListRecord(item.orderNo).then(response => {
        let recordList = response.data;
        recordList && recordList.length > 0 && recordList.forEach(detail => {
          let inReturnDetail = {
            warehouseCode: detail.warehouseCode,
            labelId: detail.labelId,
            matCode: detail.matCode,
            matName: detail.matName,
            fdCode: detail.fdCode,
            figNum: detail.figNum,
            matGroup: detail.matGroup,
            matClass: detail.matClass,
            unitCode: detail.unitCode,
            batch: detail.batch,
            stockInQuantity: detail.quantity,
            quantity: 0,
            locationCode: detail.locationCode,
            supplierCode: detail.supplierCode,
            supplierName: detail.supplierName,
            prodTime: detail.prodTime,
          };
          this.inReturnDetailList.push(inReturnDetail);
        });
        this.selectInOrderOpen = false;
      });
    },
    cancelSelectInOrder(){
      this.selectInOrderOpen = false;
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