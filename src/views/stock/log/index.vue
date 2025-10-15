<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <!-- <el-form-item label="库存id" prop="infoId">
        <el-input
          v-model="queryParams.infoId"
          placeholder="请输入库存id"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="标签id" prop="labelId">
        <el-input
          v-model="queryParams.labelId"
          placeholder="请输入标签id"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
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
      <el-form-item label="操作者" prop="createBy">
        <el-input
          v-model="queryParams.createBy"
          placeholder="请输入操作者"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <!-- <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['stock:log:add']"
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
          v-hasPermi="['stock:log:edit']"
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
          v-hasPermi="['stock:log:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['stock:log:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row> -->

    <el-table
      v-loading="loading"
      :data="logList"
      :header-cell-style="columnStyle"
      :cell-style="columnStyle"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        label="库存id"
        align="center"
        prop="infoId"
        width="80px"
      />
      <el-table-column
        label="标签id"
        align="center"
        prop="labelId"
        width="80px"
      />
      <el-table-column
        label="物料编码"
        align="center"
        prop="matCode"
        width="120px"
      />
      <el-table-column
        label="物料名称"
        align="center"
        prop="matName"
        width="150px"
      />
      <el-table-column label="批次" align="center" prop="batch" />
      <el-table-column
        label="旧采购数量"
        align="center"
        prop="oldPurchaseQuantity"
      />
      <el-table-column
        label="旧合格数量"
        align="center"
        prop="oldUsableQuantity"
      />
      <el-table-column
        label="旧出库数量"
        align="center"
        prop="oldReceivedQuantity"
      />
      <el-table-column label="旧库存数量" align="center" prop="oldQuantity" />

      <el-table-column
        label="采购数量"
        align="center"
        prop="purchaseQuantity"
      />
      <el-table-column label="合格数量" align="center" prop="usableQuantity" />
      <el-table-column
        label="出库数量"
        align="center"
        prop="receivedQuantity"
      />
      <el-table-column label="库存数量" align="center" prop="quantity" />
      <el-table-column label="操作者" align="center" prop="createBy" />
      <el-table-column
        label="操作时间"
        align="center"
        prop="createTime"
        width="100px"
      >
        <template slot-scope="scope">
          {{ formatTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="备注"
        align="center"
        prop="comment"
        width="120px"
      />
      <!-- <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['stock:log:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['stock:log:remove']"
          >删除</el-button>
        </template>
      </el-table-column> -->
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改记录库存信息和物料标签数量的修改记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="库存id" prop="infoId">
          <el-input v-model="form.infoId" placeholder="请输入库存id" />
        </el-form-item>
        <el-form-item label="标签id" prop="labelId">
          <el-input v-model="form.labelId" placeholder="请输入标签id" />
        </el-form-item>
        <el-form-item label="物料编码" prop="matCode">
          <el-input v-model="form.matCode" placeholder="请输入物料编码" />
        </el-form-item>
        <el-form-item label="物料名称" prop="matName">
          <el-input v-model="form.matName" placeholder="请输入物料名称" />
        </el-form-item>
        <el-form-item label="批次" prop="batch">
          <el-input v-model="form.batch" placeholder="请输入批次" />
        </el-form-item>
        <el-form-item label="旧库存数量" prop="oldQuantity">
          <el-input v-model="form.oldQuantity" placeholder="请输入旧库存数量" />
        </el-form-item>
        <el-form-item label="旧采购数量" prop="oldPurchaseQuantity">
          <el-input
            v-model="form.oldPurchaseQuantity"
            placeholder="请输入旧采购数量"
          />
        </el-form-item>
        <el-form-item label="旧合格数量" prop="oldUsableQuantity">
          <el-input
            v-model="form.oldUsableQuantity"
            placeholder="请输入旧合格数量"
          />
        </el-form-item>
        <el-form-item label="旧出库数量" prop="oldReceivedQuantity">
          <el-input
            v-model="form.oldReceivedQuantity"
            placeholder="请输入旧出库数量"
          />
        </el-form-item>
        <el-form-item label="库存数量" prop="quantity">
          <el-input v-model="form.quantity" placeholder="请输入库存数量" />
        </el-form-item>
        <el-form-item label="采购数量" prop="purchaseQuantity">
          <el-input
            v-model="form.purchaseQuantity"
            placeholder="请输入采购数量"
          />
        </el-form-item>
        <el-form-item label="合格数量" prop="usableQuantity">
          <el-input
            v-model="form.usableQuantity"
            placeholder="请输入合格数量"
          />
        </el-form-item>
        <el-form-item label="出库数量" prop="receivedQuantity">
          <el-input
            v-model="form.receivedQuantity"
            placeholder="请输入出库数量"
          />
        </el-form-item>
        <el-form-item label="" prop="comment">
          <el-input
            v-model="form.comment"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item label="删除标识" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入删除标识" />
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
import { listLog, getLog, delLog, addLog, updateLog } from "@/api/stock/log";

export default {
  name: "Log",
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
      // 记录库存信息和物料标签数量的修改记录表格数据
      logList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        infoId: null,
        labelId: null,
        matCode: null,
        matName: null,
        batch: null,
        oldQuantity: null,
        oldPurchaseQuantity: null,
        oldUsableQuantity: null,
        oldReceivedQuantity: null,
        quantity: null,
        purchaseQuantity: null,
        usableQuantity: null,
        receivedQuantity: null,
        comment: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        infoId: [
          { required: true, message: "库存id不能为空", trigger: "blur" },
        ],
        labelId: [
          { required: true, message: "标签id不能为空", trigger: "blur" },
        ],
        matCode: [
          { required: true, message: "物料编码不能为空", trigger: "blur" },
        ],
        matName: [
          { required: true, message: "物料名称不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询记录库存信息和物料标签数量的修改记录列表 */
    getList() {
      this.loading = true;
      listLog(this.queryParams).then((response) => {
        this.logList = response.rows;
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
        logId: null,
        infoId: null,
        labelId: null,
        matCode: null,
        matName: null,
        batch: null,
        oldQuantity: null,
        oldPurchaseQuantity: null,
        oldUsableQuantity: null,
        oldReceivedQuantity: null,
        quantity: null,
        purchaseQuantity: null,
        usableQuantity: null,
        receivedQuantity: null,
        comment: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
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
      this.ids = selection.map((item) => item.logId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加记录库存信息和物料标签数量的修改记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const logId = row.logId || this.ids;
      getLog(logId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改记录库存信息和物料标签数量的修改记录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.logId != null) {
            updateLog(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addLog(this.form).then((response) => {
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
      const logIds = row.logId || this.ids;
      this.$modal
        .confirm(
          '是否确认删除记录库存信息和物料标签数量的修改记录编号为"' +
            logIds +
            '"的数据项？'
        )
        .then(function () {
          return delLog(logIds);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "stock/log/export",
        {
          ...this.queryParams,
        },
        `log_${new Date().getTime()}.xlsx`
      );
    },
    formatTime(val) {
      if (!val) return "";
      const date = new Date(val);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const h = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      const s = String(date.getSeconds()).padStart(2, "0");
      return `${y}-${m}-${d} ${h}:${min}:${s}`;
    },
    columnStyle({ row, column, rowIndex, columnIndex }) {
      let styleString = "";
      // header boder
      if (rowIndex === 0) {
        styleString += "border-top: 1px solid #5f5f5f;";
      }
      if (
        columnIndex == 8 ||
        columnIndex == 7 ||
        columnIndex == 6 ||
        columnIndex == 5
      ) {
        styleString += "background: rgba(255, 192, 203, 0.2);";
      } else if (
        columnIndex == 12 ||
        columnIndex == 11 ||
        columnIndex == 10 ||
        columnIndex == 9
      ) {
        styleString += "background: rgba(192, 255, 212, 0.2);";
      }
      return styleString;
    },
  },
};
</script>
<style type="text/css" scoped>
/* 粉色列样式 */
/* 修复：精确控制表格列样式 */
.el-table .pink-column {
  background-color: rgba(63, 69, 65, 0.526) !important;
}

/* 确保表头也应用样式 */
.el-table .pink-column-header {
  background-color: #5f5f5f !important;
}

/* 修复：精确控制单元格样式 */
.el-table .el-table__body .pink-column .cell {
  background-color: #ffd6e7 !important;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: 600;
  text-align: center;
}

/* 表头样式 */
.el-table thead th {
  background-color: #f3e5f5;
  color: #7b1fa2;
  font-weight: 600;
  text-align: center;
}
</style>
