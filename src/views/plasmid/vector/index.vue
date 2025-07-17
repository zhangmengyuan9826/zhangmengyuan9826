<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="质粒设计中的属性" prop="variable">
        <el-select v-model="queryParams.variable" placeholder="请选择质粒设计中的属性" clearable>
          <el-option
            v-for="dict in dict.type.plasmid_field"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="属性中文名" prop="variableChi">
        <el-input
          v-model="queryParams.variableChi"
          placeholder="请输入属性中文名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="质粒载体名" prop="itemName">
        <el-input
          v-model="queryParams.itemName"
          placeholder="请输入质粒载体名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="质粒载体的属性" prop="property">
        <el-input
          v-model="queryParams.property"
          placeholder="请输入质粒载体的属性"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="质粒载体的属性的中文名" prop="propChi">
        <el-input
          v-model="queryParams.propChi"
          placeholder="请输入质粒载体的属性的中文名"
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
          v-hasPermi="['plasmid:vector:add']"
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
          v-hasPermi="['plasmid:vector:edit']"
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
          v-hasPermi="['plasmid:vector:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['plasmid:vector:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="vectorList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="${comment}" align="center" prop="vectorId" />
      <el-table-column label="质粒设计中的属性" align="center" prop="variable">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.plasmid_field" :value="scope.row.variable"/>
        </template>
      </el-table-column>
      <el-table-column label="属性中文名" align="center" prop="variableChi" />
      <el-table-column label="质粒载体名" align="center" prop="itemName" />
      <el-table-column label="质粒载体的属性" align="center" prop="property" />
      <el-table-column label="质粒载体的属性的中文名" align="center" prop="propChi" />
      <el-table-column label="属性的值" align="center" prop="propValue" />
      <el-table-column label="属性补充说明" align="center" prop="propRemark" />
      <el-table-column label="${comment}" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['plasmid:vector:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['plasmid:vector:remove']"
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

    <!-- 添加或修改质粒载体参数对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="80%" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="质粒设计中的属性" prop="variable">
          <el-select v-model="form.variable" placeholder="请选择质粒设计中的属性">
            <el-option
              v-for="dict in dict.type.plasmid_field"
              :key="dict.value"
              :label="dict.label"
:value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="属性中文名" prop="variableChi">
          <el-input v-model="form.variableChi" placeholder="请输入属性中文名" />
        </el-form-item>
        <el-form-item label="质粒载体名" prop="itemName">
          <el-input v-model="form.itemName" placeholder="请输入质粒载体名" />
        </el-form-item>
        <el-form-item label="质粒载体的属性" prop="property">
          <el-input v-model="form.property" placeholder="请输入质粒载体的属性" />
        </el-form-item>
        <el-form-item label="质粒载体的属性的中文名" prop="propChi">
          <el-input v-model="form.propChi" placeholder="请输入质粒载体的属性的中文名" />
        </el-form-item>
        <el-form-item label="属性的值" prop="propValue">
          <el-input v-model="form.propValue" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="属性补充说明" prop="propRemark">
          <el-input v-model="form.propRemark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="${comment}" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="${comment}" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入${comment}" />
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
import { listVector, getVector, delVector, addVector, updateVector } from "@/api/plasmid/vector";

export default {
  name: "Vector",
  dicts: ['plasmid_field'],
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
      // 质粒载体参数表格数据
      vectorList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        variable: null,
        variableChi: null,
        itemName: null,
        property: null,
        propChi: null,
        propValue: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        variable: [
          { required: true, message: "质粒设计中的属性不能为空", trigger: "change" }
        ],
        itemName: [
          { required: true, message: "质粒载体名不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询质粒载体参数列表 */
    getList() {
      this.loading = true;
      listVector(this.queryParams).then(response => {
        this.vectorList = response.rows;
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
        vectorId: null,
        variable: null,
        variableChi: null,
        itemName: null,
        property: null,
        propChi: null,
        propValue: null,
        propRemark: null,
        remark: null,
        createTime: null,
        createBy: null,
        updateTime: null,
        updateBy: null,
        delFlag: null
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
      this.ids = selection.map(item => item.vectorId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加质粒载体参数";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const vectorId = row.vectorId || this.ids
      getVector(vectorId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改质粒载体参数";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.vectorId != null) {
            updateVector(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addVector(this.form).then(response => {
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
      const vectorIds = row.vectorId || this.ids;
      this.$modal.confirm('是否确认删除质粒载体参数编号为"' + vectorIds + '"的数据项？').then(function() {
        return delVector(vectorIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('plasmid/vector/export', {
        ...this.queryParams
      }, `vector_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
