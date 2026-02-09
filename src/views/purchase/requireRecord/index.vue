<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="需求单号" prop="requireNo">
        <el-input
          v-model="queryParams.requireNo"
          placeholder="请输入需求单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
      <el-form-item label="提单日期" prop="requireDate">
        <el-date-picker
          v-model="queryParams.requireDate"
          type="date"
          placeholder="选择日期"
          style="margin-left: 10px;"
          value-format="yyyy-MM-dd" />
      </el-form-item>
      <el-form-item label="审核日期" prop="approvedDate">

        <el-date-picker
          v-model="queryParams.approvedDate"
          type="date"
          placeholder="选择日期"
          style="margin-left: 10px;"
          value-format="yyyy-MM-dd" />
      </el-form-item>
      <el-form-item label="采购日期" prop="purchaseDate">
        <el-date-picker
          v-model="queryParams.purchaseDate"
          type="date"
          placeholder="选择日期"
          style="margin-left: 10px;"
          value-format="yyyy-MM-dd" />
      </el-form-item>
      <el-form-item label="PO日期" prop="poDate">
        <el-date-picker
          v-model="queryParams.poDate"
          type="date"
          placeholder="选择日期"
          style="margin-left: 10px;"
          value-format="yyyy-MM-dd" />  
      </el-form-item>
      <el-form-item label="到货日期" prop="receivedDate">
        <el-date-picker 
          v-model="queryParams.receivedDate"
          type="date"
          placeholder="选择日期"
          style="margin-left: 10px;"
          value-format="yyyy-MM-dd" />
      </el-form-item>
      <el-form-item label="提单人" prop="requireBy">
        <el-input
          v-model="queryParams.requireBy"
          placeholder="请输入提单人"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['stock:requireRecord:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['stock:requireRecord:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['stock:requireRecord:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['stock:requireRecord:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="StockRequireRecordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="需求单号" align="center" prop="requireNo" />
      <el-table-column label="物料编码" align="center" prop="matCode" />
      <el-table-column label="物料名称" align="center" prop="matName" />
      <!-- <el-table-column label="供应商名称" align="center" prop="supplierName" /> -->
      <el-table-column label="提单日期" align="center" prop="requireDate" >
        <template slot-scope="scope">
          {{ parseTime(formatDate(scope.row.requireDate), "{y}-{m}-{d}") }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="采购日期" align="center" prop="purchaseDate" >
                  <template slot-scope="scope">
          {{ parseTime(formatDate(scope.row.purchaseDate), "{y}-{m}-{d}") }}
        </template>
      </el-table-column> -->
      <el-table-column label="PO日期" align="center" prop="poDate" >
        <template slot-scope="scope">
          {{ parseTime(formatDate(scope.row.poDate), "{y}-{m}-{d}") }}
        </template>
      </el-table-column>
      <el-table-column label="到货日期" align="center" prop="receivedDate" >
                  <template slot-scope="scope">
          {{ parseTime(formatDate(scope.row.receivedDate), "{y}-{m}-{d}") }}
        </template>
      </el-table-column>
      <el-table-column label="提单人" align="center" prop="requireBy" />
      <!-- <el-table-column label="备注" align="center" prop="remark" /> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['stock:requireRecord:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['stock:requireRecord:remove']"
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

    <!-- 添加或修改物料采购流转记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="需求单号" prop="requireNo">
          <el-input v-model="form.requireNo" placeholder="请输入需求单号" :disabled="operType=='edit'"/>
        </el-form-item>
        <el-form-item label="物料编码" prop="matCode">
          <el-input v-model="form.matCode" placeholder="请输入物料编码" :disabled="operType=='edit'" required/>
        </el-form-item>
        <el-form-item label="物料名称" prop="matName">
          <el-input v-model="form.matName" placeholder="请输入物料名称" :disabled="operType=='edit'" required/>
        </el-form-item>
        <el-form-item label="供应商名称" prop="supplierName">
          <el-input v-model="form.supplierName" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item label="提单日期" prop="requireDate">
          <el-date-picker v-model="form.requireDate" placeholder="请输入提单日期" />
        </el-form-item>
        <el-form-item label="审核日期" prop="approvedDate">
          <el-date-picker v-model="form.approvedDate" placeholder="请输入审核日期" />
        </el-form-item>
        <el-form-item label="采购日期" prop="purchaseDate">
          <el-date-picker v-model="form.purchaseDate" placeholder="请输入采购日期" />
        </el-form-item>
        <el-form-item label="PO日期" prop="poDate">
          <el-date-picker v-model="form.poDate" placeholder="请输入PO日期" />
        </el-form-item>
        <el-form-item label="到货日期" prop="receivedDate">
          <el-date-picker v-model="form.receivedDate" placeholder="请输入到货日期" />
        </el-form-item>
        <el-form-item label="提单人" prop="requireBy">
          <el-input v-model="form.requireBy" placeholder="请输入提单人" />
        </el-form-item>
        <el-form-item label="审核人" prop="approvedBy">
          <el-input v-model="form.approvedBy" placeholder="请输入审核人" />
        </el-form-item>
        <el-form-item label="采购人" prop="purchaseBy">
          <el-input v-model="form.purchaseBy" placeholder="请输入采购人" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listStockRequireRecord, getStockRequireRecord, delStockRequireRecord, addStockRequireRecord, updateStockRequireRecord } from "@/api/stock/requireRecord";

export default {
  name: "StockRequireRecord",
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
      // 物料采购流转记录表格数据
      StockRequireRecordList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        requireNo: null,
        matCode: null,
        matName: null,
        supplierName: null,
        requireDate: null,
        approvedDate: null,
        purchaseDate: null,
        poDate: null,
        receivedDate: null,
        requireBy: null,
        approvedBy: null,
        purchaseBy: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        matName: [{
            required: true, message: "物料名称不能为空", trigger: "blur"
        }],
        matCode: [{
            required: true, message: "物料编码不能为空", trigger: "blur"
        }],
      },
      operType : '',
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询物料采购流转记录列表 */
    getList() {
      this.loading = true;
      listStockRequireRecord(this.queryParams).then(response => {
        this.StockRequireRecordList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        recordId: null,
        requireNo: null,
        matCode: null,
        matName: null,
        supplierName: null,
        requireDate: null,
        approvedDate: null,
        purchaseDate: null,
        poDate: null,
        receivedDate: null,
        requireBy: null,
        approvedBy: null,
        purchaseBy: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        delFlag: null,
        remark: null
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
      this.ids = selection.map(item => item.recordId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
        this.operType='add';
      this.reset();
      this.open = true;
      this.title = "添加物料采购流转记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
        this.operType='edit';
      this.reset();
      const recordId = row.recordId || this.ids
      getStockRequireRecord(recordId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改物料采购流转记录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.recordId != null) {
            updateStockRequireRecord(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addStockRequireRecord(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const recordIds = row.recordId || this.ids;
      this.$modal.confirm('是否确认删除物料采购流转记录编号为"' + recordIds + '"的数据项？').then(function() {
        return delStockRequireRecord(recordIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('stock/requireRecord/export', {
        ...this.queryParams
      }, `StockRequireRecord_${new Date().getTime()}.xlsx`)
    },
    formatDate(dateString) {
      // 尝试将字符串转换为日期对象
      if (dateString === "") {
        return dateString;
      }
      if (!dateString) {
        return dateString;
      }
      const date = new Date(dateString);
      // 如果无效的日期字符串，返回原始字符串
      if (isNaN(date)) {
        return dateString;
      }
      // 如果是有效的日期，进行格式化
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    },
  }
};
</script>
