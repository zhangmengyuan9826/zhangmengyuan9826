<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="仓库" prop="warehouseCode">
        <el-select v-model="queryParams.warehouseCode" placeholder="请选择仓库">
          <el-option
            v-for="item in warehouseList"
            :key="item.warehouseCode"
            :label="item.warehouseName"
            :value="item.warehouseCode"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="货位" prop="locationCode">
        <el-select
          v-model="queryParams.locationCode"
          placeholder="请选择货位"
        >
          <el-option
            v-for="(item, index) in locationList"
            :key="item.locationCode"
            :label="formatLocation(item.locationCode)"
            :value="item.locationCode"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="物料编码" prop="matCode">
        <el-input
          v-model="queryParams.matCode"
          placeholder="请输入物料编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="物料名称" prop="matName">
        <el-input
          v-model="queryParams.matName"
          placeholder="请输入物料名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="物品标签" prop="matTag">
        <el-select
          v-model="queryParams.matTag"
          placeholder="请输入物品标签检索内容"
          filterable
          clearable
          @blur="getCurVal"
        >
          <el-option
            v-for="item in tagList"
            :key="item.tagCode"
            :label="item.tagName"
            :value="item.tagCode"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="批次" prop="batch">
        <el-input
          v-model="queryParams.batch"
          placeholder="请输入批次"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="供应商" prop="supplierName">
        <el-input
          v-model="queryParams.supplierName"
          placeholder="请输入供应商名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否过期" prop="isExpired">
        <el-select v-model="queryParams.isExpired" placeholder="请选择是否过期">
          <el-option
            v-for="item in isExpiredList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- 非零库存 -->
      <el-form-item label="非零库存" prop="isNotEmpty">
        <el-radio-group v-model="queryParams.params.isNotEmpty">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
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
          :disabled="multiple"
          @click="handleExport"
          v-hasPermi="['stock:info:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="infoList"  @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="仓库" align="center" prop="warehouseName" />
      <el-table-column label="货位" align="center" prop="locationCode" >
        <template slot-scope="scope">
          {{ formatLocation(scope.row.locationCode) }}
        </template>
      </el-table-column>
      <el-table-column label="物料编码" align="center" prop="matCode" />
      <el-table-column label="物料名称" align="center" prop="matName" />
      <el-table-column label="批次" align="center" prop="batch" />
      <el-table-column label="规格" align="center" prop="figNum" />
      <el-table-column label="数量" align="center" prop="quantity" />
      <el-table-column label="火眼单位" align="center" prop="unitCode">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.base_mat_unit" :value="scope.row.unitCode"/>
        </template>
      </el-table-column>
      <el-table-column label="品牌" align="center" prop="brand" />
      <el-table-column label="有效期" width="100">        
        <template slot-scope="scope">
          <span :style="getExpiringStyle(scope.row.expiredTime)">
            {{ parseTime(formatDate(scope.row.expiredTime),'{y}-{m}-{d}') }}
          </span>
        </template>
      </el-table-column>
       <el-table-column label="创建日期" align="center" prop="createTime" />
       <el-table-column label="操作" align="center" width="180"  class-name="small-padding" v-hasPermi="['stock:info:editAdmin']">
        <template slot-scope="scope">
        <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['stock:info:editAdmin']"
          >修改</el-button>
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
    <el-dialog
      :title="'修改物料标签及库存信息'"
      :visible.sync="open"
      width="1000px"
      append-to-body
      :close-on-click-modal="false"
    >
    <el-form ref="form" :model="form" label-width="80px" :rules="rules">
      <el-row>
          <el-col :span="12">
      <el-form-item label="物料编码" prop="matCode">
          <el-input v-model="form.matCode" type="text" :disabled="true"/>
        </el-form-item>
        </el-col>
          <el-col :span="12">
        <el-form-item label="物料描述" prop="matName">
          <el-input v-model="form.matName" :disabled="true"/>
        </el-form-item>
         </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
        <el-form-item label="规格" prop="figNum">
          <el-input v-model="form.figNum" :disabled="true"/>
        </el-form-item>
         </el-col>
          <el-col :span="12">
        <el-form-item label="批次" prop="batch">
          <el-input v-model="form.batch" :disabled="true" />
        </el-form-item>
        </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
        <el-form-item label="仓库编码" prop="warehouseCode">
          <el-input v-model="form.warehouseCode" :disabled="true" />
        </el-form-item>
         </el-col>
          <el-col :span="12">
        <el-form-item label="货位" prop="locationCode">
          <el-select
            v-model="form.locationCode"
            placeholder="请选择货位"
            :disabled="true"
          >
            <el-option
              v-for="(item, index) in locationList"
              :key="item.locationCode"
              :label="formatLocation(item.locationCode)"
              :value="item.locationCode"
            ></el-option>
          </el-select>
        </el-form-item>
        </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
        <el-form-item label="火眼单位" prop="unitCode">
              <el-select
                v-model="form.unitCode"
                placeholder="请输入火眼单位"
                filterable
                clearable
                @blur="getCurVal_unit"
              >
                <el-option
                  v-for="dict in dict.type.base_mat_unit"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
         </el-col>
         <el-col :span="12">
        <el-form-item label="批次" prop="batch">
          <el-input v-model="form.batch" :disabled="false" />
        </el-form-item>
        </el-col>
        </el-row>
        <el-row>
          
        <el-col :span="12">
          <el-form-item label="生产日期" prop="prodTime">
            <el-date-picker
          clearable
          v-model="form.prodTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择生产日期"
        >
        </el-date-picker>
            </el-form-item></el-col>
        <el-col :span="12">
          <el-form-item label="有效期" prop="expiredTime">
            <el-date-picker
          clearable
          v-model="form.expiredTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择有效期"
        >
        </el-date-picker>
            </el-form-item></el-col>    </el-row>
        <el-row>
          <el-col :span="12">
        <el-form-item label="采购数量" prop="quantity">
          <el-input-number v-model="form.quantity" controls-position="right" :min="1" integer/>
        </el-form-item>
        </el-col>
          <el-col :span="12">
        <el-form-item label="合格数量" prop="usableQuantity">
          <el-input-number v-model="form.usableQuantity" controls-position="right" :min="0" :max="form.quantity" integer/>
        </el-form-item>
        </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
        <el-form-item label="已出库数量" prop="receivedQuantity">
          <el-input-number v-model="form.receivedQuantity" controls-position="right" :min="0" :max="form.usableQuantity" integer/>
        </el-form-item>
         </el-col>
          <el-col :span="12">
        <el-form-item label="库存数量" prop="remainQuantity">
          <el-input-number v-model="form.remainQuantity" controls-position="right" :min="0" :max="form.usableQuantity" integer/>
        </el-form-item>
        </el-col>
        </el-row>
      <el-row>
        <el-form-item label="修改原因" prop="comment" required=true>
              <el-input v-model="form.comment" placeholder="请输入修改原因" />
            </el-form-item>
      </el-row>
    </el-form>
    <p><b>*物料数量校验规则：</b>1. 所有数量需大于0；2.合格数量不得大于采购数量；3.出库数量不得大于合格数量；4.库存数量不得大于合格数量；5.库存数量+出库数量需等于合格数量；</p>
    <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listInfo, handleUpdate } from "@/api/stock/info";
import {getMatLabel} from "@/api/stock/matLabel"
import { listAllWarehouse } from "@/api/base/warehouse";
import { listAllLocation } from "@/api/base/location";
import { listAllTag } from "@/api/base/tag";

export default {
  name: "Info",
  dicts: ['base_mat_unit'],
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
      // 库存信息表格数据
      infoList: [],
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
        matCode: null,
        matName: null,
        batch: null,
        quantity: null,
        supplierCode: null,
        supplierName: null,
        isExpired: null,
        isNotEmpty: 1,
        params:{}
      },
      isExpiredList:[
        {value:'','label':'全部'},
        {value:'1','label':'过期'},
      {value:'2','label':'未过期'}],
      //选择仓库、实验室
      warehouseList: [],
      form: {},
      open: false,
      rules: {
        comment: [
          { required: true, message: "修改原因不能为空", trigger: "blur" },
        ]
        },
      locationList: [],
      locationDict: {},
      tagList: [],
    };
  },
  created() {   
    // 获取get url的请求参数：是否过期
    var currentUrl = window.location.href;
    if(currentUrl.indexOf("isExpired=1") > -1){
      this.queryParams['isExpired']='1'
    } else if(currentUrl.indexOf("isExpired=2") > -1){
      this.queryParams['isExpired']='2'
    } 
    this.getList();
    this.getWarehouseList();
    this.getBaselocationList();
    this.getTagList();
  },
  methods: {
    formatLocation(locationCode){
      return locationCode+"-"+this.locationDict[locationCode]
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
    /** 查询库存信息列表 */
    getList() {
      this.loading = true;  
      // if (!this.queryParams['params']) {
      //   this.queryParams['params'] = {};
      // }
      // this.queryParams['params']['isNotEmpty'] = this.queryParams.isNotEmpty
      listInfo(this.queryParams).then(response => {
        this.infoList = response.rows;
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
      this.queryParams['isExpired']=''
      this.handleQuery();
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.infoId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('stock/info/export', {
        ids: this.ids.join(',')
      }, `info_${new Date().getTime()}.xlsx`)
    },
    handleEdit(row) {
      if (!row['labelId']) {
        this.$message.error("找不到物料标签信息！");
        return;
      }
      getMatLabel(row.labelId).then((response) => {
        this.form = response.data
        this.form['remainQuantity'] = row.quantity
        this.form['infoId'] = row.infoId
        console.log(this.form)
        this.open = true
      })
    },
    getCurVal(val) {
      this.value = val.target.value;
    },
    getCurVal_unit(val) {
      this.value = val.target.value
    },
    submitForm() {
      let that = this;
      if(that.form.quantity<0 | that.form.usableQuantity <0 | that.form.usableQuantity>that.form.quantity | that.form.receivedQuantity <0 | that.form.receivedQuantity > that.form.usableQuantity | that.form.remainQuantity<0| that.form.remainQuantity > that.form.usableQuantity- that.form.receivedQuantity){
        that.$modal.msgError("库存数量校验不合格！");
        return
      }
      if(that.form.receivedQuantity+that.form.remainQuantity !== that.form.usableQuantity){
        that.$modal.msgError("库存数量校验不合格！");
        return
      }
      that.form['params'] = {"infoId":that.form.infoId, "quantity":that.form.remainQuantity,"comment":that.form.comment}
      that.$refs["form"].validate((valid) => {
        if (valid) {
          that.$modal.confirm('是否确认修改物料标签编号为"' + that.form.matCode + '"的数据项？').then(function() {
          handleUpdate(that.form).then(response => {
          that.getList();
          that.$modal.msgSuccess("修改成功");
          that.open=false;
        }).catch(() => {})
        });
        }
      })
      
    },
    cancel(){
      this.open=false;
    },

    //查询仓库
    getWarehouseList(){
      listAllWarehouse().then(response => {
        this.warehouseList = response;
      });
    },
    formatDate(dateString) {
      // return new Date(dateString).toLocaleDateString();
      // 尝试将字符串转换为日期对象
      if(dateString === ""){
        return dateString
      }
      if(! dateString){
        return dateString
      }

      const date = new Date(dateString);
      // 如果无效的日期字符串，返回原始字符串
      if (isNaN(date)) {
        return dateString;
      }
      // 如果是有效的日期，进行格式化
      return date.toLocaleDateString();
    },
    getExpiringStyle(expirationDate) {
      const today = new Date();
      const expDate = new Date(expirationDate);
      const threeMonthsLater = new Date(today);
      const oneMonthsLater = new Date(today);
      threeMonthsLater.setMonth(today.getMonth() + 3);
      oneMonthsLater.setMonth(today.getMonth() + 1);
      if (!isNaN(expDate) && expDate < today) {
        return { color: 'red' };
      };
      if (!isNaN(expDate) && expDate < threeMonthsLater) {
        return { color: 'orange' };
      }
      return {};
    },
    getTagList() {
      listAllTag().then((response) => {
        this.tagList = response;
      });
    },
  }
};
</script>
