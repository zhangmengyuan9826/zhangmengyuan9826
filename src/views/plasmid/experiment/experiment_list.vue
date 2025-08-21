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
      <el-form-item label="质粒名称" prop="geneName">
        <el-input
          v-model="queryParams.geneName"
          placeholder="请输入质粒名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="日期节点">
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
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['stock:record:add']"
          >更新状态</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['stock:record:export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <div>
      <ExperimentStatusTable v-if="!loading" :raw-data="recordList" />
    </div>
    <el-dialog
      title="质粒实验状态变更"
      :visible.sync="open"
      width="80%"
      append-to-body
      max-height="700"      
    >
      <el-form ref="form" :model="form" label-width="80px" :rules="recordRules">
        <el-form-item label="更新状态" prop="newStatus">
          <el-select
            v-model="form.newStatus"
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
        <el-form-item label="变更日期" prop="newDate">
          <el-date-picker
            clearable
            v-model="form.newDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择日期"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <el-table :data="detailList" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column
          label="基因名"
          align="center"
          prop="geneName"
          width="130"
          resizable
        >
          <template slot-scope="scope">
            <el-tooltip
              v-if="scope.row.geneName != null"
              effect="light"
              placement="top"
            >
              <div
                class="content"
                slot="content"
                v-html="scope.row.geneName"
              ></div>
              <div class="oneLine">{{ scope.row.geneName }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          label="线性酶切"
          align="center"
          prop="linearDigestion"
        />
        <el-table-column
          label="抗性基因"
          align="center"
          prop="resistanceGene"
        />
        <el-table-column
          label="实验进展"
          align="center"
          prop="progressStatus"
        />
        <el-table-column label="批次" align="center" prop="batch" />
        <el-table-column label="备注" align="center" prop="remark" resizable>
          <template slot-scope="scope">
            <el-tooltip
              v-if="scope.row.remark != null"
              effect="light"
              placement="top"
            >
              <div
                class="content"
                slot="content"
                v-html="scope.row.remark"
              ></div>
              <div class="oneLine">{{ scope.row.remark }}</div>
            </el-tooltip>
          </template>
        </el-table-column></el-table
      >
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
        <el-button @click="handleCancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listProjectRecord,addExpRecord } from "@/api/plasmid/experiment";
import { listDetailAll } from "@/api/plasmid/detail";
import { listAllLocation } from "@/api/base/location";
import ExperimentStatusTable from "../../components/experiment-table/index";
import { getDictDataListByDictType } from "@/api/plasmid/dictData";
import { getDicts } from "@/api/system/dict/data";
import { Message } from "element-ui";

export default {
  name: "Record",
  dicts: ["base_mat_unit"],
  components: { ExperimentStatusTable },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      open: false,
      fieldDataDict: {},
      plasmidData: [
        {
          projectNo: "M.25005",
          projectName: "自复制优化系列2",
          geneName: "p30-35-MIUI-T7-VEEV-GFP-G26A-HY",
          resistanceGene: "Amp",
          linearDigestion: "BspQI",
          progressStatus: "mRNA制备",
          orderStatus: "SA",
          statusDate: "2025/7/25",
          status: "mRNA制备",
        },
        {
          projectNo: "M.25005",
          projectName: "自复制优化系列2",
          geneName: "p30-35-MIUI-T7-VEEV-GFP-G26A-HY--",
          resistanceGene: "Amp",
          linearDigestion: "Basl",
          progressStatus: "mRNA制备",
          orderStatus: "SA",
          statusDate: "2025/7/25",
          status: "mRNA制备",
        },
      ],
      // 库存流水表格数据
      backendData: [
        {
          projectNo: "M.25005",
          projectName: "自复制优化系列2",
          geneName: "p30-35-MIUI-T7-VEEV-GFP-G26A-HY",
          resistanceGene: "Amp",
          orderStatus: "SA",
          statusDate: "2025/7/25",
          status: "mRNA制备",
        },
        {
          projectNo: "M.25005",
          projectName: "自复制优化系列2",
          geneName: "p30-35-MIUI-T7-VEEV-GFP-G26A-HY",
          resistanceGene: "Amp",
          orderStatus: "SA",
          statusDate: "2025/7/18",
          status: "mRNA制备",
        },
        {
          projectNo: "M.25005",
          projectName: "自复制优化系列2",
          geneName: "p30-35-MIUI-T7-VEEV-GFP-G26A-HY",
          resistanceGene: "Amp",
          orderStatus: "SA",
          statusDate: "2025/7/11",
          status: "mRNA制备",
        },
        {
          projectNo: "M.25005",
          projectName: "自复制优化系列2",
          geneName: "p30-35-MIUI-T7-VEEV-GFP-G26A-HY",
          resistanceGene: "Amp",
          orderStatus: "SA",
          statusDate: "2025/5/25",
          status: "mRNA制备",
        },
        {
          projectNo: "M.25005",
          projectName: "自复制优化系列2",
          geneName: "p30-35-MIUI-T7-VEEV-GFP-G26A-HY",
          resistanceGene: "Amp",
          orderStatus: "SA",
          statusDate: "2025/5/18",
          status: "mRNA制备",
        },
        {
          projectNo: "M.25005",
          projectName: "自复制优化系列2",
          geneName: "p30-35-MIUI-T7-VEEV-GFP-G26A-HY",
          resistanceGene: "Amp",
          orderStatus: "SA",
          statusDate: "2025/5/11",
          status: "mRNA制备",
        },
        {
          projectNo: "M.25005",
          projectName: "自复制优化系列2",
          geneName: "p30-35-MIUI-T7-VEEV-GFP-G26A-HY",
          resistanceGene: "Amp",
          orderStatus: "√",
          statusDate: "2025/6/04",
          status: "mRNA制备",
        },
        {
          projectNo: "M.25005",
          projectName: "自复制优化系列2",
          geneName: "p30-35-MIUI-T7-VEEV-GFP-G26A-HY",
          resistanceGene: "Amp",
          orderStatus: "√",
          statusDate: "2025/6/14",
          status: "mRNA制备",
        },
        {
          projectNo: "M.25005",
          projectName: "自复制优化系列2",
          geneName: "p30-35-MIUI-T7-VEEV-GFP-G26A-HY",
          resistanceGene: "Amp",
          orderStatus: "√",
          statusDate: "2025/7/04",
          status: "mRNA制备",
        },
        {
          projectNo: "M.25005",
          projectName: "自复制优化系列2",
          geneName: "p30-35-MIUI-T7-VEEV-GFP-G26A-HY--",
          resistanceGene: "Amp",
          orderStatus: "√",
          statusDate: "2025/7/25",
          status: "mRNA制备",
        },
        {
          projectNo: "M.25005",
          projectName: "自复制优化系列2",
          geneName: "p30-35-MIUI-T7-VEEV-GFP-G26A-HY--",
          resistanceGene: "Amp",
          orderStatus: "√",
          statusDate: "2025/7/18",
          status: "mRNA制备",
        },
        {
          projectNo: "M.25005",
          projectName: "自复制优化系列2",
          geneName: "p30-35-MIUI-T7-VEEV-GFP-G26A-HY",
          resistanceGene: "Amp",
          orderStatus: "√",
          statusDate: "2025/7/11",
          status: "mRNA制备",
        },
        {
          projectNo: "M.25005",
          projectName: "自复制优化系列2",
          geneName: "p30-35-MIUI-T7-VEEV-GFP-G26A-HY--",
          resistanceGene: "Amp",
          orderStatus: "√",
          statusDate: "2025/7/04",
          status: "mRNA制备",
        },
      ],
      // 查询参数
      queryParams: {
        projectNo:''
      },
      form: { newStatus: "", newDate: "" },
      recordRules: {newStatus: [
          { required: true, message: "状态不能为空", trigger: "blur" },
        ],newDate: [
          { required: true, message: "日期不能为空", trigger: "blur" },
        ],},
      // 日期范围
      dateRange: [],
      locationDict: {},
      recordList:[],
      detailIds:[],
      projectNo:'',
      detailList:[],
      recordListDone: false,
    };
  },
  created() {
    this.initData();
  },
  methods: {
    //是否可选
    handleAdd() {
        listDetailAll({'projectNo': this.projectNo}).then((response)=>{
            this.detailList = response.data;
            this.open = true;
        })      
    },
    handleSelectionChange(selection) {
      this.detailIds = selection.map((item) => item.detailId);
    },
    handleCancel(){
        this.open = false;
    },
    handleSubmit(){
        this.$refs["form"].validate((valid) => {
        if (valid) {
            if(!this.detailIds || this.detailIds.length == 0){
            Message.warning("请先选择质粒！")
            return
        }
        for(let i=0;i<this.detailIds.length;i++){
            const newData = {'detailId': this.detailIds[i], 'progressStatus':this.form.newStatus, 'recordDate':this.form.newDate}
            addExpRecord(newData).then((response)=>{
                
            })            
        }
        this.open=false;
        this.getList();
        }})
        
    },
    initData() {
      getDicts("plasmid_field").then((response) => {
        this.fieldList = response.data.map((item) => item.dictValue);
        this.getField();        
        const projectNo = this.$route.params && this.$route.params.projectNo;
        this.queryParams.projectNo = projectNo;
        this.projectNo = projectNo;
        this.getList();
        this.setDefaultProjectNo(projectNo);
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
          }));
        });
      });
      this.loading = false;
      this.showSearch = true;
    },
    formatLocation(locationCode) {
      return locationCode + "-" + this.locationDict[locationCode];
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
    setDefaultProjectNo(projectNo) {
      this.queryParams.projectNo = projectNo;
    },
    getList() {
      this.loading = true;
      listProjectRecord(this.addDateRange(this.queryParams, this.dateRange)).then((response) => {
        this.recordList = response.data;
        this.loading = false;
        this.recordListDone = true;
      });
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
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "plasmid/experiment/record-export",
        {
          ...{projectNo: this.queryParams.projectNo},
        },
        `expRecord_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
