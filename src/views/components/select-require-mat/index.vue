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

    <el-table ref="selectMatTable" v-loading="loading" :data="matList" style="width: 100%">
      <el-table-column label="物料编码" align="center" prop="matCode" width="100" />
      <el-table-column label="物料描述" align="center" prop="matName" width="120" />
      <el-table-column label="集团编码" align="center" prop="fdCode" width="100" />
      <el-table-column label="规格" align="center" prop="figNum" width="100" />
      <el-table-column label="货号" align="center" prop="artNum" width="100" />
      <el-table-column label="物料组" align="center" prop="matGroupName" width="80" />
      <el-table-column label="分类" align="center" prop="matClass" width="80" />
      <el-table-column label="三级编码" align="center" prop="subcode" width="80" />
      <el-table-column label="品牌" align="center" prop="brand" width="80" />
      <el-table-column label="集团单位" align="center" prop="fdunitCode" width="80">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.base_mat_unit" :value="scope.row.fdunitCode"/>
        </template>
      </el-table-column>
      <el-table-column label="火眼单位" align="center" prop="unitCode" width="80">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.base_mat_unit" :value="scope.row.unitCode"/>
        </template>
      </el-table-column>
      <!-- <el-table-column label="安全库存" align="center" prop="safetyStock" width="80" /> -->
      <!-- <el-table-column label="标准价" align="center" prop="standardPrice" width="100" /> -->
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
    <!-- <el-row :gutter="10" class="mb8" >
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleSelectArr"
        >选择</el-button>
      </el-col>
    </el-row> -->
    
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
import { listMat } from "@/api/base/mat";
import { listAllGroup } from "@/api/base/group";
import { listAllClass } from "@/api/base/class";
import { listAllSubcode } from "@/api/base/subcode";

export default {
  name: "SelectMat",
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
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 物料主数据表格数据
      matList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        matCode: null,
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
      listMat(this.queryParams).then(response => {
        this.matList = response.rows;
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
      // 加一个提示：前往链接“https://hywms.com”检查过期物料库存。
      this.$alert(
        `<div>
          请先前往 <a href="https://365.kdocs.cn/l/csnuFbPK8qab" target="_blank" style="color:#409EFF;">【金山文档 | WPS云文档】 过期物料领用记录表</a> 检查过期物料库存。
        </div>`,
        '过期物料库存检查',
        {
          dangerouslyUseHTMLString: true,
          showCancelButton: true,
          confirmButtonText: '确认无过期物料',
          cancelButtonText: '存在过期物料',
          callback: (action) => {
        if (action === 'cancel') {
          this.$prompt('请填写不使用过期物料的原因：', '提报说明', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputType: 'textarea',
            inputPlaceholder: '请输入原因',
            inputValidator: (value) => {
          if (!value) return '原因不能为空';
          return true;
            }
          }).then(({ value }) => {
            // 可以在这里处理填写的原因
            row.expiredStockReason = value;
            row.expiredStockStatus="1";
            this.$refs.selectMatTable.clearSelection();
            this.$emit("confirmSelect", row);
          });
        } else {
          row.expiredStockReason = "";
          row.expiredStockStatus="0";
          this.$refs.selectMatTable.clearSelection();
          this.$emit("confirmSelect", row);
        }
          }
        }
      );
      return;

      // this.$refs.selectMatTable.clearSelection();
      // this.$emit("confirmSelect", row);
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