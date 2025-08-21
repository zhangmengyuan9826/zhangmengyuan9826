<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="项目流水号" prop="projectNo" label-width="110px">
        <el-input
          v-model="queryParams.projectNo"
          placeholder="请输入项目流水号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="基因名称" prop="geneName">
        <el-input
          v-model="queryParams.geneName"
          placeholder="请输入基因名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="实验进展" prop="progressStatus">
          <el-select
            v-model="queryParams.progressStatus"
            default-first-option
            filterable
            allow-create
            placeholder="请选择或输入"
          >
            <el-option
              v-for="item in fieldDataDict['progressStatus']"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
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
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['plasmid:detail:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="detailList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="项目号" align="center" prop="projectNo" />
      <el-table-column label="项目名称" align="center" prop="projectName" />
      <el-table-column label="基因名称" align="center" prop="geneName" />
      <el-table-column label="酶切位点" align="center" prop="linearDigestion" />
      <el-table-column label="抗性基因" align="center" prop="resistanceGene" />
      <el-table-column label="实验进展状态" align="center" prop="progressStatus" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
            <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handlePlasmidDetail(scope.row.geneId)"
          >质粒</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleExperiment(scope.row.projectNo)"
          >实验</el-button>          
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

    <!-- 添加或修改质粒模块-实验质粒对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="项目流水号" prop="projectNo">
          <el-input v-model="form.projectNo" placeholder="请输入项目流水号" />
        </el-form-item>
        <el-form-item label="基因名称" prop="geneName">
          <el-input v-model="form.geneName" placeholder="请输入基因名称" />
        </el-form-item>
        <el-form-item label="抗性" prop="resistanceGene">
          <el-input v-model="form.resistanceGene" placeholder="请输入基因名称" />
        </el-form-item>
        <el-form-item label="基因名称" prop="linearDigestion">
          <el-input v-model="form.linearDigestion" placeholder="请输入基因名称" />
        </el-form-item>
       
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="质粒详情" :visible.sync="openPlasmid" width="94%" height="1000px" append-to-body>
      <el-form ref="form" :model="form" label-width="80px">
        <el-row>
        <el-col :span="8">
          <el-form-item label="基因名" prop="geneName" label-width="100px">
            <el-input
              v-model="form.geneName" disabled              
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="8">
          <el-form-item
            label="质粒载体"
            prop="plasmidVector"
            label-width="100px"
          >
            <el-select
              clearable
              v-model="form.plasmidVector"
              default-first-option
              placeholder="请选择或输入"
              disabled
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
        <el-col :span="8">
          <el-form-item label="订单编码" prop="orderNo">
            <el-input
              v-model="form.orderNo"
              disabled
            />
          </el-form-item>
        </el-col>
        </el-row>
         <el-row>
        <el-col :span="12">
          <el-form-item label="载体编号" prop="vectorNo" label-width="100px">
            <el-input v-model="form.vectorNo" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="质粒全长名称"
            prop="plasmidFullName"
            label-width="110px"
          >
            <el-input
              v-model="form.plasmidFullName"
              disabled
            />
          </el-form-item>
        </el-col>
        </el-row>
         <el-row>
        <el-col>
          <el-form-item label="CDS序列" prop="cdsSeq" label-width="100px">
            <el-input
              type="textarea"
              v-model="form.cdsSeq"
              disabled
            >
            </el-input>
          </el-form-item>
        </el-col>
        </el-row>
         <el-row>
        <el-col :span="8">
          <el-form-item
            label="线性酶切"
            prop="linearDigestion"
            label-width="100px"
          >
            <el-select
              v-model="form.linearDigestion"
              default-first-option
              disabled
            >
              <el-option
                v-for="item in fieldDataDict['linearDigestion']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="抗性基因"
            prop="resistanceGene"
            label-width="110px"
          >
            <el-select
              clearable
              v-model="form.resistanceGene"
              default-first-option
              disabled
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
        <el-col :span="8">
          <el-form-item label="linker" prop="linker" label-width="110px">
            <el-input
              v-model="form.linker"
              disabled
            />
          </el-form-item>
        </el-col>
        </el-row>
         <el-row>
        <el-col :span="8">
          <el-form-item
            label="cds长度(bp)"
            prop="cdsLength"
            label-width="100px"
          >
            <el-input v-model="form.cdsLength" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="质粒全长(bp)"
            prop="plasmidFullLength"
            label-width="110px"
          >
            <el-input
              v-model="form.plasmidFullLength"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="CDS表达蛋白数量"
            prop="cdsProteinNum"
            label-width="140px"
          >
            <el-input
              v-model="form.cdsProteinNum"
              disabled
            />
          </el-form-item>
        </el-col>
        </el-row>
         <el-row>
        <el-col :span="8">
          <el-form-item label="3'UTR" prop="utr3" label-width="100px">
            <template>
              <el-popover
                placement="top"
                width="300"
                trigger="hover"
                :content="selectedOptionLabel(form.utr3, fieldDataDict['utr3'])"
                :disabled="
                  selectedOptionLabel(form.utr3, fieldDataDict['utr3']) == ''
                "
              >
                <el-select
                  slot="reference"
                  v-model="form.utr3"
                  default-first-option
                  disabled
                >
                  <el-option
                    v-for="item in fieldDataDict['utr3']"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-popover>
            </template>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="5'UTR" prop="utr5" label-width="110px">
            <template>
              <el-popover
                placement="top"
                width="300"
                trigger="hover"
                :content="selectedOptionLabel(form.utr3, fieldDataDict['utr5'])"
                :disabled="
                  selectedOptionLabel(form.utr3, fieldDataDict['utr5']) == ''
                "
              >
                <el-select
                  slot="reference"
                  v-model="form.utr5"
                  default-first-option
                  disabled
                >
                  <el-option
                    v-for="item in fieldDataDict['utr5']"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-popover>
            </template>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="polyA" prop="polyA" label-width="110px">
            <template>
              <el-popover
                placement="top"
                width="300"
                trigger="hover"
                :content="
                  selectedOptionLabel(form.polyA, fieldDataDict['polyA'])
                "
                :disabled="
                  selectedOptionLabel(form.polyA, fieldDataDict['polyA'])
                    .size === 0
                "
              >
                <el-select
                  slot="reference"
                  v-model="form.polyA"
                  default-first-option
                  disabled
                >
                  <el-option
                    v-for="item in fieldDataDict['polyA']"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-popover>
            </template>
          </el-form-item>
        </el-col>
</el-row>
         <el-row>
        <el-col :span="8">
          <el-form-item label="启动子" prop="promoter" label-width="100px">
            <el-select
              v-model="form.promoter"
              default-first-option
              disabled
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
        <el-col :span="8">
          <el-form-item label="加帽" prop="cap" label-width="110px">
            <el-input disabled v-model="form.cap" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="原核/真核载体"
            prop="vectorType1"
            label-width="110px"
          >
            <el-select
              v-model="form.vectorType1"
              default-first-option
              disabled
            >
              <el-option
                v-for="item in fieldDataDict['vectorType1']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        </el-row>
         <el-row>
        <el-col :span="8">
          <el-form-item label="载体类型" prop="vectorType2" label-width="100px">
            <el-select
              v-model="form.vectorType2"
              default-first-option
              disabled
            >
              <el-option
                v-for="item in fieldDataDict['vectorType2']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="预测蛋白类型"
            prop="proteinType"
            label-width="110px"
          >
            <el-select
              v-model="form.proteinType"
              disabled
            >
              <el-option
                v-for="item in fieldDataDict['proteinType']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="信号肽" prop="signalPeptide" label-width="110px">
            <el-select
              v-model="form.signalPeptide"
              default-first-option
              disabled
            >
              <el-option
                v-for="item in fieldDataDict['signalPeptide']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        </el-row>
         <el-row>
        <el-col>
          <el-form-item
            label="合成方式"
            prop="compoundMethod"
            label-width="100px"
          >
            <el-input
              type="textarea"
              v-model="form.compoundMethod"
              :autosize="{ minRows: 1, maxRows: 10 }"
              resize="none"
              disabled
            >
            </el-input>
          </el-form-item>
        </el-col>
        </el-row>
         <el-row>
        <el-col>
          <el-form-item label="备注" prop="remark" label-width="100px">
            <el-input
              type="textarea"
              v-model="form.remark"
              :autosize="{ minRows: 1, maxRows: 10 }"
              resize="none"
              disabled
            >
            </el-input>
          </el-form-item>
        </el-col>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { listDetail, getDetail, delDetail, addDetail, updateDetail } from "@/api/plasmid/detail";
import { getGene } from "@/api/plasmid/gene";
import {
  getDictDataShortListByDictType,
} from "@/api/plasmid/dictData";
import { getDicts } from "@/api/system/dict/data";
import { getToken } from "@/utils/auth";
import { Message } from "element-ui";

export default {
  name: "Detail",
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
      // 质粒模块-实验质粒表格数据
      detailList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        projectNo: null,
        geneName: null,
        geneId: null,
        progressStatus: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      openPlasmid: false,
      fieldList: [],
      _dicts: {},
      fieldDataDict: [],
    };
  },
  created() {
    this.initData();
  },
  methods: {
    initData(){
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
        getDictDataShortListByDictType(field).then((response) => {
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
    selectedOptionLabel(value, options) {
      if (options) {
        const option = options.find((item) => item.value === value);
        return option ? "序列：" + option.content : "";
      }
      return "";
    },
    handlePlasmidDetail(geneId){
        getGene(geneId).then((response) => {
        this.form = response.data;
        this.openPlasmid = true;
      });
    },
    handleExperiment(projectNo){
        this.$router.push({path: '/plasmid/experiment/experiment-list/index/' + projectNo});
    },
    /** 查询质粒模块-实验质粒列表 */
    getList() {
      this.loading = true;
      listDetail(this.queryParams).then(response => {
        this.detailList = response.rows;
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
        detailId: null,
        projectNo: null,
        geneName: null,
        geneId: null,
        progressStatus: "0",
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
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
      this.ids = selection.map(item => item.detailId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加质粒模块-实验质粒";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const detailId = row.detailId || this.ids
      getDetail(detailId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改质粒模块-实验质粒";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.detailId != null) {
            updateDetail(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addDetail(this.form).then(response => {
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
      const detailIds = row.detailId || this.ids;
      this.$modal.confirm('是否确认删除质粒模块-实验质粒编号为"' + detailIds + '"的数据项？').then(function() {
        return delDetail(detailIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('plasmid/detail/export', {
        ...this.queryParams
      }, `detail_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
