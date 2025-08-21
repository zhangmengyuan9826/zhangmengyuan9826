<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="质粒载体" prop="plasmidVector">
        <el-input
          v-model="queryParams.plasmidVector"
          placeholder="请输入质粒载体"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>      
      <el-form-item label="抗性基因" prop="resistanceGene">
        <el-input
          v-model="queryParams.resistanceGene"
          placeholder="请输入抗性基因"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>      
      <el-form-item label="克隆宿主" prop="cloneHost">
        <el-input
          v-model="queryParams.cloneHost"
          placeholder="请输入克隆宿主"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="载体类型" prop="vectorType">
        <el-input
          v-model="queryParams.vectorType"
          placeholder="请输入载体类型"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="表达宿主" prop="expressHost">
        <el-input
          v-model="queryParams.expressHost"
          placeholder="请输入表达宿主"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="3’UTR" prop="utr3">
        <el-input
          v-model="queryParams.utr3"
          placeholder="请输入3’UTR"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      
      <el-form-item label="5’UTR" prop="utr5">
        <el-input
          v-model="queryParams.utr5"
          placeholder="请输入5’UTR"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      
      <el-form-item label="polyA" prop="polyA">
        <el-input
          v-model="queryParams.polyA"
          placeholder="请输入polyA"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      
      <el-form-item label="启动子" prop="promoter">
        <el-input
          v-model="queryParams.promoter"
          placeholder="请输入启动子"
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
          v-hasPermi="['plasmid:meta:add']"
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
          v-hasPermi="['plasmid:meta:edit']"
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
          v-hasPermi="['plasmid:meta:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['plasmid:meta:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="metaList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="质粒载体" align="center" prop="plasmidVector" fixed=""/>
      <el-table-column label="cds位置" align="center" prop="cdsSite" />
      <el-table-column label="抗性基因" align="center" prop="resistanceGene" />
      <el-table-column label="抗性基因位置" align="center" prop="resistanceGeneSite" />
      <el-table-column label="克隆宿主" align="center" prop="cloneHost" />
      <el-table-column label="载体类型" align="center" prop="vectorType" />
      <el-table-column label="载体类型I" align="center" prop="vectorType1" />
      <el-table-column label="表达宿主" align="center" prop="expressHost" />
      <el-table-column label="3’UTR" align="center" prop="utr3" />
      <el-table-column label="3’UTR位置" align="center" prop="utr3Site" />
      <el-table-column label="5’UTR" align="center" prop="utr5" />
      <el-table-column label="5’UTR位置" align="center" prop="utr5Site" />
      <el-table-column label="polyA" align="center" prop="polyA" />
      <el-table-column label="polyA位置" align="center" prop="polyASite" />
      <el-table-column label="启动子" align="center" prop="promoter" />
      <el-table-column label="启动子位置" align="center" prop="promoterSite" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['plasmid:meta:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['plasmid:meta:remove']"
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

    <!-- 添加或修改质粒载体参与构建序列的元数据对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="80%" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
        <el-col :span="12">
        <el-form-item label="质粒载体" prop="plasmidVector" >
          <el-select
              clearable
              v-model="form.plasmidVector"
              default-first-option
              placeholder="请选择或输入"
            >
              <el-option
                v-for="item in fieldDataDict['plasmidVector']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
        </el-form-item>
        </el-col>
        <el-col :span="12">
        <el-form-item label="cds位置" prop="cdsSite" label-width="115px">
          <el-input v-model="form.cdsSite" placeholder="请输入cds位置，格式：100..200" />
        </el-form-item>
        </el-col>
        </el-row>
        <el-row>
        <el-col :span="12">
        <el-form-item label="抗性基因" prop="resistanceGene">
          <el-select
              clearable
              v-model="form.resistanceGene"
              default-first-option
              placeholder="请选择或输入"
            >
              <el-option
                v-for="item in fieldDataDict['resistanceGene']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
        </el-form-item>
        </el-col>
        <el-col :span="12">
        <el-form-item label="抗性基因位置" prop="resistanceGeneSite" label-width="115px">
          <el-input v-model="form.resistanceGeneSite" placeholder="请输入抗性基因位置" />
        </el-form-item>
        </el-col>
        </el-row>
        <el-row>
        <el-col :span="8">
        <el-form-item label="克隆宿主" prop="cloneHost">
          <el-input v-model="form.cloneHost" placeholder="请输入克隆宿主" />
        </el-form-item>
        </el-col>
        <el-col :span="8">
        <el-form-item label="载体类型I" prop="vectorType1" label-width="105px">
          <el-input v-model="form.vectorType1" placeholder="请输入载体类型1" />
        </el-form-item>
        </el-col>
        <el-col :span="8">
        <el-form-item label="表达宿主" prop="expressHost">
          <el-input v-model="form.expressHost" placeholder="请输入表达宿主" />
        </el-form-item>
        </el-col>
        </el-row>
        <el-row>
        <el-col :span="12">
        <el-form-item label="3’UTR" prop="utr3">
          <el-select
              clearable
              v-model="form.utr3"
              default-first-option
              placeholder="请选择或输入"
            >
              <el-option
                v-for="item in fieldDataDict['utr3']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
        </el-form-item>
        </el-col>
        <el-col :span="12">
        <el-form-item label="3’UTR位置" prop="utr3Site" label-width="115px">
          <el-input v-model="form.utr3Site" placeholder="请输入3’UTR位置" />
        </el-form-item>
        </el-col>
        </el-row>
        <el-row>
        <el-col :span="12">
        <el-form-item label="5’UTR" prop="utr5">
          <el-select
              clearable
              v-model="form.utr5"
              default-first-option
              placeholder="请选择或输入"
            >
              <el-option
                v-for="item in fieldDataDict['utr5']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
        </el-form-item>
        </el-col>
        <el-col :span="12">
        <el-form-item label="5’UTR位置" prop="utr5Site" label-width="115px">
          <el-input v-model="form.utr5Site" placeholder="请输入5’UTR位置" />
        </el-form-item>
        </el-col>
        </el-row>
        <el-row>
        <el-col :span="12">
        <el-form-item label="polyA" prop="polyA">
          <el-select
              clearable
              v-model="form.polyA"
              default-first-option
              placeholder="请选择或输入"
            >
              <el-option
                v-for="item in fieldDataDict['polyA']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
        </el-form-item>
        </el-col>
        <el-col :span="12">
        <el-form-item label="polyA位置" prop="polyASite" label-width="115px">
          <el-input v-model="form.polyASite" placeholder="请输入polyA位置" />
        </el-form-item>
        </el-col>
        </el-row>
        <el-row>
        <el-col :span="12">
        <el-form-item label="启动子" prop="promoter">
          <el-select
              clearable
              v-model="form.promoter"
              default-first-option
              placeholder="请选择或输入"
            >
              <el-option
                v-for="item in fieldDataDict['promoter']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
        </el-form-item>
        </el-col>
        <el-col :span="12">
        <el-form-item label="启动子位置" prop="promoterSite" label-width="115px">
          <el-input v-model="form.promoterSite" placeholder="请输入启动子位置" />
        </el-form-item>
        </el-col>
        </el-row>
        <el-row>
        <el-col :span="24">
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMeta, getMeta, delMeta, addMeta, updateMeta } from "@/api/plasmid/meta";
import { getDictDataListByDictType } from "@/api/plasmid/dictData";
import { getDicts } from "@/api/system/dict/data";
import { getToken } from "@/utils/auth";
import { Message } from 'element-ui';
export default {
  name: "Meta",
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
      // 质粒载体参与构建序列的元数据表格数据
      metaList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        plasmidVector: null,
        cdsSite: null,
        resistanceGene: null,
        resistanceGeneSite: null,
        cloneHost: null,
        vectorType: null,
        vectorType1: null,
        expressHost: null,
        utr3: null,
        utr3Site: null,
        utr5: null,
        utr5Site: null,
        polyA: null,
        polyASite: null,
        promoter: null,
        promoterSite: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        plasmidVector: [
          { required: true, message: "质粒载体不能为空", trigger: "blur" }
        ],
        // cloneHost: [
        //   { required: true, message: "质粒载体不能为空", trigger: "blur" }
        // ],
        vectorType: [
          { required: true, message: "载体类型不能为空", trigger: "blur" }
        ],
        vectorType1: [
          { required: true, message: "载体类型I(真核 | 原核 |...)不能为空", trigger: "blur" }
        ],
        // expressHost: [
        //   { required: true, message: "质粒载体不能为空", trigger: "blur" }
        // ],
        utr3: [
          { required: true, message: "3’UTR不能为空", trigger: "blur" }
        ],
        utr5: [
          { required: true, message: "5‘UTR不能为空", trigger: "blur" }
        ],
        polyA: [
          { required: true, message: "polyA不能为空", trigger: "blur" }
        ],
        promoter: [
          { required: true, message: "启动子不能为空", trigger: "blur" }
        ],
        cdsSite: [
          { required: true, message: '请输入cds范围值' },
          { validator: this.validateRangeFormat, trigger: 'blur' }
        ],
        utr3Site: [
          { required: true, message: '请输入utr3范围值' },
          { validator: this.validateRangeFormat, trigger: 'blur' }
        ],
        utr5Site: [
          { required: true, message: '请输入utr5范围值' },
          { validator: this.validateRangeFormat, trigger: 'blur' }
        ],
        polyASite: [
          { required: true, message: '请输入polyA范围值' },
          { validator: this.validateRangeFormat, trigger: 'blur' }
        ],
        resistanceGeneSite: [
          { required: true, message: '请输入resistanceGene范围值' },
          { validator: this.validateRangeFormat, trigger: 'blur' }
        ],
        promoterSite: [
          { required: true, message: '请输入promoter范围值' },
          { validator: this.validateRangeFormat, trigger: 'blur' }
        ],
      },
      fieldDataDict: [],
      fieldList:[],
    };
  },
  created() {
    this.initData();
  },
  methods: {
    validateRangeFormat(rule, value, callback) {
      if (!value) {
        return callback(new Error('请输入范围值'));
      }
      const rangeRegex = /^\d+\.\.\d+$/;
      if (!rangeRegex.test(value)) {
        return callback(new Error('格式应为数字..数字，如1..100'));
      }
      const [start, end] = value.split('..').map(Number);
      if (start >= end) {
        return callback(new Error('起始值必须小于结束值'));
      }
      callback();
    },
    
    initData() {
      getDicts("plasmid_field").then((response) => {
        this.fieldList = response.data.map((item) => item.dictValue);
        this.getField();
        this.getList();
      });
    },
    getField() {
      this.loading = true;
      if (this.fieldList.length === 0) {
        this.loading = false;
        this.showSearch = true;
        return;
      }
      this.fieldList.forEach((field) => {
        getDictDataListByDictType(field).then((response) => {
          this.fieldDataDict[field] = response.data.map((item) => ({
            label: item["dictLabel"],
            value: item["dictValue"],
            content: item["content"],
          }));
        });
      });
      this.loading = false;
      this.showSearch = true;
    },
    /** 查询质粒载体参与构建序列的元数据列表 */
    getList() {
      this.loading = true;
      listMeta(this.queryParams).then(response => {
        this.metaList = response.rows;
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
        metaId: null,
        plasmidVector: null,
        cdsSite: null,
        resistanceGene: null,
        resistanceGeneSite: null,
        cloneHost: null,
        vectorType: null,
        vectorType1: null,
        expressHost: null,
        utr3: null,
        utr3Site: null,
        utr5: null,
        utr5Site: null,
        polyA: null,
        polyASite: null,
        promoter: null,
        promoterSite: null,
        delFlag: null,
        createTime: null,
        createBy: null,
        updateTime: null,
        updateBy: null,
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
      this.ids = selection.map(item => item.metaId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加质粒载体参与构建序列的元数据";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const metaId = row.metaId || this.ids
      getMeta(metaId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改质粒载体参与构建序列的元数据";
      });
    },
    validForm(form){
      const [start1, end1] = form.promoterSite.split('..').map(Number)      
      const [start2, end2] = form.utr5Site.split('..').map(Number)
      const [start3, end3] = form.cdsSite.split('..').map(Number)
      const [start4, end4] = form.utr3Site.split('..').map(Number)
      const [start5, end5] = form.polyASite.split('..').map(Number)
      // 元件顺序
      if(end1 < start2 && end2 < start3 && end3<start4 && end4<start5){
        return true;
      } else {
        return false;
      }
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if(! this.validForm(this.form)){
            return;
          }
          if (this.form.metaId != null) {
            updateMeta(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMeta(this.form).then(response => {
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
      const metaIds = row.metaId || this.ids;
      this.$modal.confirm('是否确认删除质粒载体参与构建序列的元数据编号为"' + metaIds + '"的数据项？').then(function() {
        return delMeta(metaIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('plasmid/meta/export', {
        ...this.queryParams
      }, `meta_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
