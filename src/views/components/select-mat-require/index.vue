<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="物料编码" prop="matCode">
        <el-input
          v-model="queryParams.matCode"
          placeholder="请输入物料编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="需求单号" prop="requireNo">
        <el-input
          v-model="queryParams.requireNo"
          placeholder="请输入物料需求单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="物料描述" prop="matName">
        <el-input
          v-model="queryParams.matName"
          placeholder="请输入物料描述"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="集团编码" prop="fdCode">
        <el-input
          v-model="queryParams.fdCode"
          placeholder="请输入集团编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="规格" prop="figNum">
        <el-input
          v-model="queryParams.figNum"
          placeholder="请输入规格"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="货号" prop="artNum">
        <el-input
          v-model="queryParams.artNum"
          placeholder="请输入货号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="物料组" prop="matGroup">
        <el-select v-model="queryParams.matGroup" placeholder="请选择物料组">
          <el-option
            v-for="item in groupList"
            :key="item.groupCode"
            :label="item.groupName"
            :value="item.groupCode"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="分类" prop="matClass">
        <el-select v-model="queryParams.matClass" placeholder="请选择物料分类">
          <el-option
            v-for="item in classList"
            :key="item.classCode"
            :label="item.className"
            :value="item.classCode"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="三级编码" prop="subcode">
          <el-select v-model="queryParams.subcode" placeholder="请选择三级编码">
            <el-option
              v-for="item in subcodeList"
              :key="item.subcodeCode"
              :label="item.subcodeName"
              :value="item.subcodeCode"
            ></el-option>
          </el-select>
        </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>   

    <el-table ref="selectMatRequireDetailTable" v-loading="loading" :data="matRequireDetailList" style="width: 100%">
      <el-table-column type="selection" v-if="selectType === 'multiple'" width="55" align="center" />
      <el-table-column label="需求单号" align="center" prop="requireNo" width="100" />
      <el-table-column label="物料编码" align="center" prop="matCode" width="100" />
      <el-table-column label="物料描述" align="center" prop="matName" width="120" />
      <!-- <el-table-column label="集团编码" align="center" prop="fdCode" width="100" /> -->
      <el-table-column label="规格" align="center" prop="figNum" width="100" />
      <el-table-column label="货号" align="center" prop="artNum" width="100" />
      <el-table-column label="物料组" align="center" prop="matGroup" width="80" >
        
      </el-table-column>
      <el-table-column label="分类" align="center" prop="matClass" width="80" >
        
      </el-table-column>
      <!-- <el-table-column label="三级编码" align="center" prop="subcode" width="80" /> -->
      <el-table-column label="品牌" align="center" prop="brand" width="80" />
      <el-table-column label="火眼单位" align="center" prop="unitCode" width="80">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.base_mat_unit" :value="scope.row.unitCode"/>
        </template>
      </el-table-column>
      <!-- <el-table-column label="安全库存" align="center" prop="safetyStock" width="80" /> -->
      <el-table-column label="申请人" align="center" prop="createBy" width="100" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="100" />
      <el-table-column label="操作" align="center" width="80" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-check"
            @click="handleSelect(scope.row)"
          >选择</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-row :gutter="10" class="mb8" v-if="selectType === 'multiple'">
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
import { listMatRequireDetailDialog } from "@/api/stock/matRequire";
import { listAllGroup } from "@/api/base/group";
import { listAllClass } from "@/api/base/class";
import { listAllSubcode } from "@/api/base/subcode";

export default {
  name: "SelectMatRequire",
  dicts: ['base_mat_unit'],
  props: {
    selectType: {
      type: String,
      default: 'single',
    },
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
      // 物料主数据表格数据
      matRequireDetailList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        matCode: null,
        requireNo: null,
        matName: null,
        fdCode: null,
        figNum: null,
        artNum: null,
        matGroup: null,
        matClass: null,
        unitCode: null,
        grossWeight: null,
        safetyStock: null,
        standardPrice: null,
      },

      //组、分类
      groupList: [],
      classList: [],
      subcodeList:[],
    };
  },
  created() {
    this.getList();
    this.getGroupList();
    this.getClassList();
  },
  methods: {
    /** 查询物料主数据列表 */
    getList() {
      this.loading = true;
      listMatRequireDetailDialog(this.queryParams).then(response => {
        this.matRequireDetailList = response.rows;
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
    //确认选择
    handleSelect(row){
      this.$refs.selectMatRequireDetailTable.clearSelection();
      this.$emit("confirmSelect", row);
    },
    handleSelectArr(){
      let arr = this.$refs.selectMatRequireDetailTable.selection;
      this.$refs.selectMatRequireDetailTable.clearSelection();
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
    getSubcodeList(){
      listAllSubcode().then(response => {
        this.subcodeList = response;
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