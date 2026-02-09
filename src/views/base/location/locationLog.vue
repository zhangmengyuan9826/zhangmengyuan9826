<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="仓库编码" prop="warehouseCode">
        <el-input
          v-model="queryParams.warehouseCode"
          placeholder="请输入仓库编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="货架编码" prop="locationCode">
        <el-input
          v-model="queryParams.locationCode"
          placeholder="请输入货架编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="原-货架名" prop="locationNameOld" label-width="120px">
        <el-input
          v-model="queryParams.locationNameOld"
          placeholder="请输入原-货架名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="新-货架名" prop="locationNameNew" label-width="120px">
        <el-input
          v-model="queryParams.locationNameNew"
          placeholder="请输入新-货架名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="更新日期" prop="operTime">
        <el-date-picker clearable
          v-model="queryParams.operTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择更新日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="更新者" prop="operUser">
        <el-input
          v-model="queryParams.operUser"
          placeholder="请输入更新者"
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
          disabled
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="handleDelete"
          v-hasPermi="['base:location_log:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['base:location_log:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="location_logList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- index -->
      <el-table-column label="序号" align="center" type="index" />
      <el-table-column label="仓库编码" align="center" prop="warehouseCode" />
      <el-table-column label="货架编码" align="center" prop="locationCode" />
      <el-table-column label="原-货架名" align="center" prop="locationNameOld" />
      <el-table-column label="新-货架名" align="center" prop="locationNameNew" />
      <el-table-column label="更新日期" align="center" prop="operTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.operTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="operUser" />
      
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
import { listLocation_log, getLocation_log, delLocation_log, addLocation_log, updateLocation_log } from "@/api/base/location_log";

export default {
  name: "Location_log",
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
      // 货架变更记录表格数据
      location_logList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        warehouseCode: null,
        locationCode: null,
        locationNameOld: null,
        locationNameNew: null,
        operTime: null,
        operUser: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        locationId: [
          { required: true, message: "货位id不能为空", trigger: "blur" }
        ],
        warehouseCode: [
          { required: true, message: "仓库编码不能为空", trigger: "blur" }
        ],
        locationCode: [
          { required: true, message: "货架编码不能为空", trigger: "blur" }
        ],
        locationNameOld: [
          { required: true, message: "原-货架名不能为空", trigger: "blur" }
        ],
        locationNameNew: [
          { required: true, message: "新-货架名不能为空", trigger: "blur" }
        ],
        operTime: [
          { required: true, message: "更新日期不能为空", trigger: "blur" }
        ],
        operUser: [
          { required: true, message: "更新者不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询货架变更记录列表 */
    getList() {
      this.loading = true;
      listLocation_log(this.queryParams).then(response => {
        this.location_logList = response.rows;
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
        warehouseCode: null,
        locationCode: null,
        locationNameOld: null,
        locationNameNew: null,
        operTime: null,
        operUser: null
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
      this.ids = selection.map(item => item.logId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加货架变更记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const logId = row.logId || this.ids
      getLocation_log(logId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改货架变更记录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.logId != null) {
            updateLocation_log(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addLocation_log(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除货架变更记录编号为"' + logIds + '"的数据项？').then(function() {
        return delLocation_log(logIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('base/location_log/export', {
        ...this.queryParams
      }, `location_log_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
