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
      <el-form-item label="设备名称" prop="eqName">
        <el-input
          v-model="queryParams.eqName"
          placeholder="请输入设备名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="校准日期" prop="calibDate">
        <el-input
          v-model="queryParams.calibDate"
          placeholder="请输入校准日期"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="校准效期" prop="validDate">
        <el-input
          v-model="queryParams.validDate"
          placeholder="请输入校准效期"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="实验室" prop="workshop">
        <el-input
          v-model="queryParams.workshop"
          placeholder="请输入实验室"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="责任人" prop="manageBy">
        <el-input
          v-model="queryParams.manageBy"
          placeholder="请输入责任人"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['equipmentRecord:record:export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="recordList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="设备名称" align="center" prop="eqName" />
      <el-table-column
        label="原始-校准日期"
        align="center"
        prop="calibDateOld"
      />
      <el-table-column
        label="原始-校准效期"
        align="center"
        prop="validDateOld"
      />
      <el-table-column label="原始-实验室" align="center" prop="workshopOld" />
      <el-table-column label="原始-责任人" align="center" prop="manageByOld" />
      <el-table-column label="校准日期" align="center" prop="calibDate" />
      <el-table-column label="校准效期" align="center" prop="validDate" />
      <el-table-column label="实验室" align="center" prop="workshop" />
      <el-table-column label="责任人" align="center" prop="manageBy" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            >详情</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改仪器变更记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备id" prop="eqId">
              <el-input v-model="form.eqId" placeholder="请输入设备id" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备名称" prop="eqName">
              <el-input v-model="form.eqName" placeholder="请输入设备名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="calibDateOld">
              <template slot="label">
                <span style="color: red">原始-校准日期</span>
              </template>
              <el-input v-model="form.calibDateOld" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="validDateOld">
              <template slot="label">
                <span style="color: red">原始-校准效期</span>
              </template>
              <el-input v-model="form.validDateOld" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="workshopOld">
              <template slot="label">
                <span style="color: red">原始-实验室</span>
              </template>
              <el-input v-model="form.workshopOld" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="validDateOld">
              <template slot="label">
                <span style="color: red">原始-校准效期</span>
              </template>
              <el-input v-model="form.validDateOld" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="校准日期" prop="calibDate">
              <el-input v-model="form.calibDate" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="校准效期" prop="validDate">
              <el-input v-model="form.validDate" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实验室" prop="workshop">
              <el-input v-model="form.workshop" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="责任人" prop="manageBy">
              <el-input v-model="form.manageBy" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" />
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {
  listRecord,
  getRecord,
  delRecord,
  addRecord,
  updateRecord,
} from "@/api/lab/equipmentRecord";

export default {
  name: "Record",
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
      // 仪器变更记录表格数据
      recordList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        eqId: null,
        eqName: null,
        calibDateOld: null,
        validDateOld: null,
        workshopOld: null,
        manageByOld: null,
        calibDate: null,
        validDate: null,
        workshop: null,
        manageBy: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询仪器变更记录列表 */
    getList() {
      this.loading = true;
      listRecord(this.queryParams).then((response) => {
        this.recordList = response.rows;
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
        eqId: null,
        eqName: null,
        calibDateOld: null,
        validDateOld: null,
        workshopOld: null,
        manageByOld: null,
        calibDate: null,
        validDate: null,
        workshop: null,
        manageBy: null,
        remark: null,
        createTime: null,
        createBy: null,
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
      this.ids = selection.map((item) => item.recordId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加仪器变更记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const recordId = row.recordId || this.ids;
      getRecord(recordId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改仪器变更记录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.recordId != null) {
            updateRecord(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addRecord(this.form).then((response) => {
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
      this.$modal
        .confirm('是否确认删除仪器变更记录编号为"' + recordIds + '"的数据项？')
        .then(function () {
          return delRecord(recordIds);
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
        "equipmentRecord/record/export",
        {
          ...this.queryParams,
        },
        `record_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
