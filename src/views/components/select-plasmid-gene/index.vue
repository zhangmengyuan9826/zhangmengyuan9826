<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="基因名" prop="geneName">
        <el-input
          v-model="queryParams.geneName"
          placeholder="请输入"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="质粒全称" prop="plasmidFullName">
        <el-input
          v-model="queryParams.plasmidFullName"
          placeholder="请输入"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="启动子" prop="promoter">
        <el-input
          v-model="queryParams.promoter"
          placeholder="请输入"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="批次" prop="batch">
        <el-input
          v-model="queryParams.batch"
          placeholder="请输入"
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
          @click="handleSelectArr"
        >选择</el-button>
      </el-col>      
    </el-row>

      <el-table
      ref="selectPlasmidGeneTable"
      v-loading="loading"
      :data="plasmidGeneList"
      style="width: 100%;border-color:white"
      border
      :row-style="{height:'20px'}"
    >
      <el-table-column type="selection" :selectable="checkSelectable" width="55" align="center" />
      <!-- <el-table-column label="geneId" align="center" prop="geneId" /> -->
      <!-- <el-table-column label="基因名" align="center" prop="geneName" width="130" resizable>
         <template slot-scope="scope">
        <el-tooltip v-if="scope.row.geneName!=null" effect="light" placement="top">
          <div class="content" slot="content" v-html="scope.row.geneName"></div>
          <div class="oneLine"> {{scope.row.geneName}}</div>
        </el-tooltip>
      </template>
      </el-table-column> -->
      <el-table-column label="基因名" align="center" prop="geneName" width="130" resizable>
         <template slot-scope="scope">
          <div @click="handleClick">
            <el-tooltip v-if="scope.row.geneName!=null & !editing" effect="light" placement="top">
              <div class="content" slot="content" v-html="scope.row.geneName"></div>
              <div class="oneLine"> {{scope.row.geneName}}</div>
            </el-tooltip>              
            <el-input
              v-else
              ref="input"
              v-model="scope.row.geneName"
              @blur="handleBlur"
              @keyup.enter="handleBlur"
            />
            </div>
          </template>         
      </el-table-column>
      <el-table-column label="质粒载体" align="center" prop="plasmidVector" resizable/>
      <el-table-column label="质粒全称" align="center" prop="plasmidFullName" width="130" resizable>
        <template slot-scope="scope">
        <el-tooltip v-if="scope.row.plasmidFullName!=null" effect="light" placement="top">
          <div class="content" slot="content" v-html="scope.row.plasmidFullName"></div>
          <div class="oneLine"> {{scope.row.plasmidFullName}}</div>
        </el-tooltip>
      </template>
      </el-table-column>
      <el-table-column label="线性酶切" align="center" prop="linearDigestion" />
      <el-table-column label="抗性基因" align="center" prop="resistanceGene" />
      <el-table-column label="cds长度(bp)" align="center" prop="cdsLength" />
      <el-table-column label="质粒全长(bp)" align="center" prop="plasmidFullLength" />
      <el-table-column label="3'UTR" align="center" prop="utr3" />
      <el-table-column label="5'UTR" align="center" prop="utr5" />
      <el-table-column label="polyA" align="center" prop="polyA" />
      <el-table-column label="CDS序列" align="center" prop="cdsSeq" >
        <template slot-scope="scope">
        <el-tooltip v-if="scope.row.cdsSeq!=null" effect="light" placement="top">
          <div class="content" slot="content" v-html="scope.row.cdsSeq"></div>
          <div class="oneLine"> {{scope.row.cdsSeq}}</div>
        </el-tooltip>
      </template>
      </el-table-column>
      <el-table-column label="启动子" align="center" prop="promoter" />
      <el-table-column label="载体类型 I" align="center" prop="vectorType1" />
      <el-table-column label="载体类型 II" align="center" prop="vectorType2" />
      <el-table-column label="linker" align="center" prop="linker" />
      <el-table-column label="CDS表达蛋白数量" align="center" prop="cdsProteinNum" />
      <el-table-column label="信号肽" align="center" prop="signalPeptide" />
      <el-table-column label="预测蛋白类型" align="center" prop="proteinType" />
      <el-table-column label="批次" align="center" prop="batch" />
      <el-table-column label="备注" align="center" prop="remark" resizable>
        <template slot-scope="scope">
        <el-tooltip v-if="scope.row.remark!=null" effect="light" placement="top">
          <div class="content" slot="content" v-html="scope.row.remark"></div>
          <div class="oneLine"> {{scope.row.remark}}</div>
        </el-tooltip>
      </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="center" width="120" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleDetail(scope.row.geneId)"
            >详情</el-button
          >
          <el-button
            v-if="geneIdArr.indexOf(scope.row.geneId) < 0"
            size="mini"
            type="text"
            icon="el-icon-c-scale-to-original"
            @click="handleSelect(scope.row)"
          >选择</el-button>
          <el-button
            v-if="geneIdArr.indexOf(scope.row.geneId) >= 0"
            size="mini"
            type="plain"
            disabled
          >已选</el-button>

          <!-- <span v-if="geneIdArr.indexOf(scope.row.geneId) >= 0">已选</span> -->
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
        <el-dialog :title="title" :visible.sync="open" width="90%" append-to-body>
      <el-form ref="form" :model="form" label-width="80px">
        <el-col :span="12">
          <el-form-item label="基因名" prop="geneName" label-width="100px">
            <el-input clearable v-model="form.geneName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
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
          <el-form-item label="载体编号" prop="vectorNo" label-width="100px">
            <el-input clearable v-model="form.vectorNo" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="质粒全长名称"
            prop="plasmidFullName"
            label-width="100px"
          >
            <el-input
              clearable
              v-model="form.plasmidFullName"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item
            label="线性酶切"
            prop="linearDigestion"
            label-width="100px"
          >
            <el-select
              clearable
              v-model="form.linearDigestion"
              default-first-option
              placeholder="请选择或输入"
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
            label-width="100px"
          >
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
        <el-col :span="8">
          <el-form-item label="linker" prop="linker" label-width="130px">
            <el-select
              clearable
              v-model="form.linker"
              default-first-option
              placeholder="请选择或输入"
            >
              <el-option
                v-for="item in fieldDataDict['linker']"
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
            label="cds长度(bp)"
            prop="cdsLength"
            label-width="100px"
          >
            <el-input clearable v-model="form.cdsLength" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="质粒全长(bp)"
            prop="plasmidFullLength"
            label-width="100px"
          >
            <el-input
              clearable
              v-model="form.plasmidFullLength"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="CDS表达蛋白数量"
            prop="cdsProteinNum"
            label-width="130px"
          >
            <el-input
              clearable
              v-model="form.cdsProteinNum"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="3'UTR" prop="utr3" label-width="100px">
            <template>
              <el-popover
                placement="top"
                width="300"
                trigger="hover"
                :content="selectedOptionLabel(form.utr3, fieldDataDict['utr3'])"
                :disabled="
                  !selectedOptionLabel(form.utr3, fieldDataDict['utr3'])
                "
              >
                <el-select
                  slot="reference"
                  v-model="form.utr3"
                  default-first-option
                  placeholder="请选择或输入"
                  clearable
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
          <el-form-item label="5'UTR" prop="utr5" label-width="100px">
            <template>
              <el-popover
                placement="top"
                width="300"
                trigger="hover"
                :content="selectedOptionLabel(form.utr3, fieldDataDict['utr5'])"
                :disabled="
                  !selectedOptionLabel(form.utr3, fieldDataDict['utr5'])
                "
              >
                <el-select
                  slot="reference"
                  v-model="form.utr5"
                  default-first-option
                  placeholder="请选择或输入"
                  clearable
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
          <el-form-item label="polyA" prop="polyA" label-width="130px">
            <template>
              <el-popover
                placement="top"
                width="300"
                trigger="hover"
                :content="
                  selectedOptionLabel(form.polyA, fieldDataDict['polyA'])
                "
                :disabled="
                  !selectedOptionLabel(form.polyA, fieldDataDict['polyA'])
                "
              >
                <el-select
                  slot="reference"
                  v-model="form.polyA"
                  default-first-option
                  placeholder="请选择或输入"
                  clearable
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

        <el-col>
          <el-form-item label="CDS序列" prop="cdsSeq">
            <el-input
              type="textarea"
              v-model="form.cdsSeq"
              :autosize="{ minRows: 1, maxRows: 10 }"
              resize="none"
              placeholder="请输入备注"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="启动子" prop="promoter">
            <el-select
              v-model="form.promoter"
              default-first-option
              placeholder="请选择或输入"
              clearable
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
          <el-form-item label="加帽" prop="cap">
            <el-input clearable v-model="form.cap" placeholder="请输入" />
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="载体类型 I" prop="vectorType1">
            <el-select
              v-model="form.vectorType1"
              default-first-option
              placeholder="请选择或输入"
              clearable
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
        <el-col :span="8">
          <el-form-item label="载体类型 II" prop="vectorType2">
            <el-select
              v-model="form.vectorType2"
              default-first-option
              placeholder="请选择或输入"
              clearable
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
          <el-form-item label="预测蛋白类型" prop="proteinType">
            <el-select
              v-model="form.proteinType"
              placeholder="请选择或输入"
              clearable
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
          <el-form-item label="信号肽" prop="signalPeptide">
            <el-select
              v-model="form.signalPeptide"
              default-first-option
              placeholder="请选择或输入"
              clearable
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
        <el-col>
          <el-form-item label="合成方式" prop="compoundMethod">
            <el-input
              type="textarea"
              v-model="form.compoundMethod"
              :autosize="{ minRows: 1, maxRows: 10 }"
              resize="none"
              placeholder="请输入备注"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>

        <el-col>
          <el-form-item label="备注" prop="remark">
            <el-input
              type="textarea"
              v-model="form.remark"
              :autosize="{ minRows: 1, maxRows: 10 }"
              resize="none"
              placeholder="请输入备注"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>
      </el-form>
      
    </el-dialog>
  </div>
</template>

<script>
import { listGeneDialog, getGene} from "@/api/plasmid/gene";
import { getDictDataListByDictType } from "@/api/plasmid/dictData";
import { getDicts } from "@/api/system/dict/data";

export default {
  name: "PlasmidGene",
//   dicts: ['base_mat_unit'],
  props: {
    geneIdArr:{
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
      // 物料标签表格数据
      plasmidGeneList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        geneName: null,
        plasmidVector: null,
        plasmidFullName: null,
        linearDigestion: null,
        resistanceGene: null,
        promoter: null,
        vectorType1: null,
        vectorType2: null,
        tagInfo: null,
        linker: null,
        signalPeptide: null,
        proteinType: null,
        enhancer: null,
        batch: null,
      },

      //组、分类
      groupList: [],
      classList: [],
      open: false,
      form: {},
      fieldList: [],
      _dicts: {},
      fieldDataDict: [],
      title:"",
      editing: false,
      currentValue: this.value
    };
  },
  created() {
    this.initData();
  },
  methods: {
    handleDetail(geneId){      
      getGene(geneId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "质粒基因详情";
      });
    },
    initData() {
      getDicts("plasmid_field").then((response) => {
        this.fieldList = response.data.map((item) => item.dictValue);
        this.getField();
        this.getList();
      });
    },
    selectedOptionLabel(value,options) {
      if(options){
        const option = options.find(item => item.value === value);
        return option ? "序列："+option.content : '';
      }
      return ""      
    },
    getField() {
      this.loading = true;
      if (this.fieldList && this.fieldList.length === 0) {
        this.loading = false;
        this.showSearch = true;
        return;
      }
      this.fieldList.forEach((field) => {
        getDictDataListByDictType(field).then((response) => {
          this.fieldDataDict[field] = response.data.map((item) => ({
            label: item["dictLabel"],
            value: item["dictValue"],
            content: item['content'],
          }));
        });
      });
      this.loading = false;
      this.showSearch = true;
    },
    // 表单重置
    reset() {
      this.form = {
        geneName: null,
        plasmidVector: null,
        plasmidFullName: null,
        linearDigestion: null,
        resistanceGene: null,
        cdsLength: null,
        plasmidFullLength: null,
        utr3: null,
        utr5: null,
        polyA: null,
        cdsSeq: null,
        promoter: null,
        vectorType1: null,
        vectorType2: null,
        tagInfo: null,
        linker: null,
        cdsProteinNum: null,
        signalPeptide: null,
        proteinType: null,
        enhancer: null,
        batch: null,
      };
      this.resetForm("form");
      this.geneIdArr=null;
    },
        /** 查询物料标签列表 */
    getList() {
      this.loading = true;
      listGeneDialog(this.queryParams).then(response => {
        this.plasmidGeneList = response.rows;
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
    //是否可选
    checkSelectable(row, index){
      if(this.geneIdArr.indexOf(row.geneId) >= 0){
        return false;
      }else{
        return true;
      }
    },
    //选择物料
    handleSelect(row){
      this.$refs.selectPlasmidGeneTable.clearSelection();
      this.$emit('confirmSelect', row);
    },
    //多选物料
    handleSelectArr(){
      let arr = this.$refs.selectPlasmidGeneTable.selection;
      this.$refs.selectPlasmidGeneTable.clearSelection();
      this.$emit('confirmSelectArr', arr);
    },
    /** 查询组、分类 */
    getGroupList(){
      listAllGroup().then(response => {
        this.groupList = response;
      });
    },
    getClassList(){
      listAllClass().then(response => {
        this.classList = response;
      });
    },
    formatLongPurpose(purpose) {
      if (purpose && purpose.length >= 10) {
        return purpose.substring(0, 10) + "...";
      }
      return purpose;
    },
    handleClick() {
      this.editing = true
      this.$nextTick(() => {
        this.$refs.input.focus()
      })
    },
    handleBlur() {
      if (this.required && !this.currentValue) {
        this.$message.error('此项不能为空')
        return
      }
      this.editing = false
      this.$emit('input', this.currentValue)
    }
  }
};
</script>

<style  type="text/css">
  .app-container{
    padding: 0px;
  }
  .content {
    max-width: 300px
  }
  .oneLine {
    overflow: hidden;
    white-space: pre;
    text-overflow: ellipsis;
    font-size: 8;
  }
  .el-table--border .el-table__cell{
    border-right: white;
  }
  ::v-deep(.el-table__body td) {
    border: none !important;
  }
  ::v-deep(.el-table--border),
  ::v-deep(.el-table--group) {
    border: none !important;
  }
 .el-dialog {
  display: flex;
  flex-direction: column;
}

.el-dialog__body {
  flex: 1;
  overflow: auto;
}
</style>