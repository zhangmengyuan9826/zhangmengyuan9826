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

    <el-table ref="selectPlasmidGeneTable" v-loading="loading" :data="plasmidGeneList" style="width: 100%">
      <el-table-column type="selection" :selectable="checkSelectable" width="55" align="center" />
      <el-table-column label="geneId" align="center" prop="geneId" />
      <el-table-column label="基因名" align="center" prop="geneName" />
      <el-table-column label="质粒载体" align="center" prop="plasmidVector" />
      <el-table-column label="质粒全称" align="center" prop="plasmidFullName" />
      <el-table-column label="线性酶切" align="center" prop="linearDigestion" />
      <el-table-column label="抗性基因" align="center" prop="resistanceGene" />
      <el-table-column label="cds长度(bp)" align="center" prop="cdsLength" />
      <el-table-column label="质粒全长(bp)" align="center" prop="plasmidFullLength" />
      <el-table-column label="3'UTR" align="center" prop="utr3" />
      <el-table-column label="5'UTR" align="center" prop="utr5" />
      <el-table-column label="polyA" align="center" prop="polyA" />
      <el-table-column label="CDS序列" align="center" prop="cdsSeq" />
      <el-table-column label="启动子" align="center" prop="promoter" />
      <el-table-column label="载体类型 I" align="center" prop="vectorType1" />
      <el-table-column label="载体类型 II" align="center" prop="vectorType2" />
      <el-table-column label="标签信息" align="center" prop="tagInfo" />
      <el-table-column label="接头" align="center" prop="linker" />
      <el-table-column label="CDS表达蛋白数量" align="center" prop="cdsProteinNum" />
      <el-table-column label="信号肽" align="center" prop="signalPeptide" />
      <el-table-column label="蛋白类型" align="center" prop="proteinType" />
      <el-table-column label="增强子" align="center" prop="enhancer" />
      <el-table-column label="批次" align="center" prop="batch" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" fixed="right" align="center" width="120" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-if="geneIdArr.indexOf(scope.row.geneId) < 0"
            size="mini"
            type="text"
            icon="el-icon-c-scale-to-original"
            @click="handleSelect(scope.row)"
          >选择</el-button>

          <span v-if="geneIdArr.indexOf(scope.row.geneId) >= 0">已选</span>
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
  </div>
</template>

<script>
import { listGene } from "@/api/plasmid/gene";

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

    };
  },
  created() {
    this.getList();
    // this.getGroupList();
    // this.getClassList();
  },
  methods: {
    /** 查询物料标签列表 */
    getList() {
      this.loading = true;
      listGene(this.queryParams).then(response => {
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
  }
};
</script>

<style scoped>
.app-container{
  padding: 0px;
}
</style>