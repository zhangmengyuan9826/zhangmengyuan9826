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
          placeholder="请输入财务编码"
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
          placeholder="请输入供应商"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="生产时间" prop="prodTime">
        <el-date-picker clearable
          v-model="queryParams.prodTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择生产时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="入库单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入入库单号"
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
          v-hasPermi="['stock:matLabel:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAddSelf"
          v-hasPermi="['stock:matLabel:addAdmin']"
        >手动新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['stock:matLabel:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          :disabled="multiple"
          @click="handleExport"
          v-hasPermi="['stock:matLabel:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-printer"
          size="mini"
          @click="handlePrintBatch"
          v-hasPermi="['stock:matLabel:list']"
        >批量打印</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="matLabelList" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" fixed align="center" prop="labelId" />
      <el-table-column label="物料编码" fixed align="center" prop="matCode" width="100" />
      <el-table-column label="物料描述" fixed align="center" prop="matName" width="120" />
      <el-table-column label="集团编码" align="center" prop="fdCode" width="100" />
      <el-table-column label="规格" align="center" prop="figNum" width="150" />
      <el-table-column label="物料组" align="center" prop="matGroupName" width="80" />
      <el-table-column label="分类" align="center" prop="matClassName" width="80" />
      <el-table-column label="采购数量" align="center" prop="quantity" width="80" />
      <el-table-column label="合格数量" align="center" prop="usableQuantity" width="80" />
      <el-table-column label="已领数" align="center" prop="receivedQuantity" width="80" />
      <el-table-column label="单价" align="center" prop="unitPrice" width="80" />
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
      <el-table-column label="存储条件" align="center" prop="storageCondition" width="80">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.storage_conditions" :value="scope.row.storageCondition"/>
        </template>
      </el-table-column>
      <el-table-column label="批次" align="center" prop="batch" width="180" />
      <el-table-column label="品牌" align="center" prop="brand" width="180" />
      <!-- <el-table-column label="生产时间" align="center" prop="prodTime" width="120">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.prodTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="生产日期" width="100">
        <template slot-scope="scope">        
            {{ parseTime(formatDate(scope.row.prodTime),'{y}-{m}-{d}') }}        
        </template>
      </el-table-column>
      <el-table-column label="有效期" width="100">
        <template slot-scope="scope">
          <span :style="getExpiringStyle(scope.row.expiredTime)">
            {{ parseTime(formatDate(scope.row.expiredTime),'{y}-{m}-{d}') }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="入库单号" align="center" prop="orderNo" width="180" />
      <el-table-column label="操作" fixed="right" align="center" width="120" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-printer"
            @click="handleComplement(scope.row)"
            v-hasPermi="['stock:matLabel:list']"
          >打印</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['stock:matLabel:remove']"
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

    <!-- 添加或修改物料标签对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1000px" append-to-body :close-on-click-modal="false">
      物料数据信息
      <hr style="border:1px solid #DDD"/>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-form-item v-if="addSelect" label="物料来源" prop="matCode">
            <el-radio-group v-model="form.matSource" @change="valueChange">
                <el-radio :label="1">主数据</el-radio>
                <el-radio :label="0">物料需求单</el-radio>
              </el-radio-group>
          </el-form-item>
          <el-col :span="12">
            <el-form-item label="物料编码" prop="matCode">
              <el-input                 
                v-model="form.matCode" 
                readonly 
                placeholder="请选择物料"
                :disabled="!addSelect"
                >
                <el-button slot="append" icon="el-icon-search" @click="openSelectMatDialog(form.matSource)"></el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物料描述" prop="matName">
              <el-input v-model="form.matName" placeholder="请输入物料描述" :disabled="addSelect" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="集团编码" prop="fdCode">
              <el-input v-model="form.fdCode" placeholder="请输入集团编码" :disabled="addSelect" :required="addSelect" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格" prop="figNum">
              <el-input v-model="form.figNum" placeholder="请输入规格" :disabled="addSelect" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="物料组" prop="matGroup">
              <el-select v-model="form.matGroup" placeholder="请选择物料组" :disabled="addSelect">
                <el-option
                  v-for="item in groupList"
                  :key="item.groupCode"
                  :label="item.groupName"
                  :value="item.groupCode"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="matClass">
              <el-select v-model="form.matClass" placeholder="请选择物料分类" :disabled="addSelect">
                <el-option
                  v-for="item in classList"
                  :key="item.classCode"
                  :label="item.className"
                  :value="item.classCode"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="集团单位" prop="fdunitCode">
              <el-select
                v-model="form.fdunitCode"
                placeholder="请输入集团单位"
                filterable
                clearable
                :disabled="addSelect" 
                :required="addSelect"
                @blur="getCurVal_fdunit"
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
            <el-form-item label="品牌" prop="brand">
              <el-input v-model="form.brand" placeholder="请输入规格" :disabled="addSelect" />
            </el-form-item>
          </el-col>
        </el-row>
        采购信息
        <hr style="border:1px solid #DDD"/>
        <el-row>
          <el-col :span="12">
            <el-form-item label="批次" prop="batch">
              <el-input v-model="form.batch" placeholder="请输入批次" />
            </el-form-item>
          </el-col>
        
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplierName">
              <el-input v-model="form.supplierName" readonly placeholder="请选择供应商">
                <el-button slot="append" icon="el-icon-search" @click="openSelectSupplierDialog"></el-button>
              </el-input>
            </el-form-item>
          </el-col>
          </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="火眼单位" prop="unitCode">
              <!-- <el-select v-model="form.unitCode" placeholder="请选择火眼单位">
                <el-option
                  v-for="dict in dict.type.base_mat_unit"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select> -->
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
            <el-form-item label="生产时间" prop="prodTime">
              <el-date-picker clearable
                v-model="form.prodTime"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择生产时间"
                :picker-options="{ disabledDate: (time) => disabledDateProduct(time) }"
                >
              </el-date-picker>
            </el-form-item>
          </el-col>
          </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="有效期" prop="expiredTime">
              <el-date-picker clearable
                v-model="form.expiredTime"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择有效期"
                :picker-options="{ disabledDate: (time) => disabledDateExpired(time) }"
                >
              </el-date-picker>
            </el-form-item>
          </el-col>  
          <el-col :span="12"> 
          
          <el-form-item label="存储条件" prop="storageCondition">
            
        <!-- <span slot="label">
          <el-tooltip content="存储条件说明存储条件说明存储条件说明存储条件说明存储条件说明存储条件说明" placement="top">
          <i class="el-icon-question"><b>存储条件</b></i>
          </el-tooltip>
        </span> -->
        
        <el-select v-model="form.storageCondition" placeholder="请选择存储条件">
            <el-option
              v-for="dict in dict.type.storage_conditions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
      </el-form-item> 
        </el-col>  
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="form.quantity" controls-position="right" :min="1" integer/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单价" prop="unitPrice">
              <el-input-number v-model="form.unitPrice" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row>
        <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入物料备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="'选择物料主数据'" :visible.sync="selectMatOpen" width="1200px" append-to-body :close-on-click-modal="false">
      <selectMat @confirmSelect="confirmSelectMat"></selectMat>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSelectMat">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="'选择物料需求单'" :visible.sync="selectMatRequireOpen" width="1200px" append-to-body :close-on-click-modal="false">
      <selectMatRequire @confirmSelect="confirmSelectMatRequire"></selectMatRequire>
      <div slot="footer" class="dialog-footer">
        <el-button @click="confirmSelectMatRequire">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="'选择供应商'" :visible.sync="selectSupplierOpen" width="1200px" append-to-body :close-on-click-modal="false">
      <selectSupplier @confirmSelect="confirmSelectSupplier"></selectSupplier>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSelectSupplier">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMatLabel, getMatLabel, delMatLabel, addMatLabel, updateMatLabel, printLabel, printLabelBatch } from "@/api/stock/matLabel";
import { listAllGroup } from "@/api/base/group";
import { listAllClass } from "@/api/base/class";
import selectMat from "../../components/select-mat/index"
import selectMatRequire from "../../components/select-mat-require/index"
import selectSupplier from "../../components/select-supplier/index"


export default {
  name: "MatLabel",
  dicts: ['base_mat_unit','storage_conditions'],
  components: { selectMat, selectSupplier,selectMatRequire },
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
      matLabelList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      addSelect : true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        labelType: null,
        matCode: null,
        matName: null,
        fdCode: null,
        figNum: null,
        matGroup: null,
        matClass: null,
        unitCode: null,
        batch: null,
        supplierCode: null,
        supplierName: null,
        prodTime: null,
        quantity: null,
        unitPrice: null,
        orderNo: null,
        orderType: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        matCode: [
          { required: true, message: "请选择物料", trigger: "blur" },
        ],
        matName: [
          { required: true, message: "物料名称不能为空", trigger: "blur" },
        ],
        // fdCode: [
        //   { required: true, message: "财务编码不能为空", trigger: "blur" },
        // ],
        figNum: [
          { required: true, message: "规格不能为空", trigger: "blur" },
        ],
        matGroup: [
          { required: true, message: "请选择物料组", trigger: "blur" },
        ],
        matClass: [
          { required: true, message: "请选择物料分类", trigger: "blur" },
        ],
        unitCode: [
          { required: true, message: "请选择火眼单位", trigger: "blur" },
        ],
        batch: [
          { required: true, message: "批次不能为空", trigger: "blur" },
        ],

        supplierName: [
          { required: true, message: "供应商名称不能为空", trigger: "blur" },
        ],
        prodTime: [
          { required: true, message: "请选择生产时间", trigger: "blur" },
        ],
        expiredTime: [
          { required: true, message: "有效期", trigger: "blur" },
        ],
        quantity: [
          { required: true, message: "请输入数量", trigger: "blur" },
        ],
        storageCondition: [
          { required: true, message: "请选择存储条件", trigger: "blur" },
        ],
      },

      //组、分类
      groupList: [],
      classList: [],
      //选择物料
      selectMatOpen: false,
      selectMatRequireOpen: false,
      //选择供应商
      selectSupplierOpen: false,

    };
  },
  created() {
    this.getList();
    this.getGroupList();
    this.getClassList();
  },
  
  methods: {
    valueChange(value) {
      this.$nextTick(() => {
      });
    },
    disabledDateProduct(date) {
      return date.getTime() > Date.now()
    },
    disabledDateExpired(date) {
      return date.getTime() < Date.now()
    },
    /** 查询物料标签列表 */
    getList() {
      this.loading = true;
      listMatLabel(this.queryParams).then(response => {
        this.matLabelList = response.rows;
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
        labelId: null,
        labelType: null,
        matCode: null,
        matName: null,
        fdCode: null,
        figNum: null,
        matGroup: null,
        matClass: null,
        unitCode: null,
        batch: null,
        supplierCode: null,
        supplierName: null,
        brand: null,
        prodTime: null,
        quantity: null,
        qualifiedQuantity: null,
        receivedQuantity: null,
        unitPrice: null,
        orderNo: null,
        orderType: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        storageCondition: null,
        remark: null,
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
      this.ids = selection.map(item => item.labelId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.form = {};
      this.reset();
      this.open = true;
      this.addSelect = true;
      this.title = "添加物料标签";
    },
    handleAddSelf() {
      this.reset();
      this.addSelect = false;
      this.form = {"matCode":"userSelf_matcode"};
      this.open = true;
      this.title = "手动添加物料标签";      
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const labelId = row.labelId || this.ids
      getMatLabel(labelId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改物料标签";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.labelType = 'purchase';
          if (this.form.labelId != null) {
            updateMatLabel(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMatLabel(this.form).then(response => {
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
      const labelIds = row.labelId || this.ids;
      this.$modal.confirm('是否确认删除物料标签编号为"' + labelIds + '"的数据项？').then(function() {
        return delMatLabel(labelIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('stock/matLabel/export', {
        ids: this.ids.join(',')
      }, `matLabel_${new Date().getTime()}.xlsx`)
    },
    /** 批量打印 */
    handlePrintBatch(row){
      const labelIds = row.labelId || this.ids;
      printLabelBatch(labelIds).then(response => {
        const binaryData = [];
        binaryData.push(response);
        let pdfUrl = window.URL.createObjectURL(new Blob(binaryData, { type: "application/pdf" }));
        window.open(pdfUrl);
      });
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
    //选择物料
    openSelectMatDialog(matSource){
      console.log("matSource",matSource)
      if(matSource===1){ // 主数据
        this.selectMatOpen = true;
        this.form={}
      } else {
        this.form={}
        this.selectMatRequireOpen = true;
      }
      
    },
    cancelSelectMat(){
      this.selectMatOpen = false;
    },
    cancelSelectMatRequire(){
      this.selectMatRequireOpen = false;
    },
    confirmSelectMat(item){
      console.log(item)
      this.form.matCode = item.matCode;
      this.form.matName = item.matName;
      this.form.fdCode = item.fdCode;
      this.form.figNum = item.figNum;
      this.form.brand = item.brand;
      this.form.matGroup = item.matGroup;
      this.form.matClass = item.matClass;
      this.form.fdunitCode = item.fdunitCode;
      this.form.unitCode = item.unitCode;
      this.form.unitCode = item.unitCode;
      // this.form.batch = 'CG'+ this.$moment().format('YYYYMMDDHHmmss');
      if(item.matClass==='YY'){
        this.form.supplierName='非小试物料供应商'
        this.form.supplierCode='YY_SUPPLIER'
      }
      console.log(this.form)
      this.selectMatOpen = false;
    },
    confirmSelectMatRequire(item){
      console.log(item)
      this.form.matCode = item.matCode;
      this.form.matName = item.matName;
      this.form.fdCode = item.fdCode;
      this.form.figNum = item.figNum;
      this.form.brand = item.brand;
      this.form.matGroup = item.matGroup;
      this.form.matClass = item.matClass;
      this.form.fdunitCode = item.unitCode;
      this.form.unitCode = item.unitCode;
      // this.form.batch = 'CG'+ this.$moment().format('YYYYMMDDHHmmss');
      if(item.matClass==='YY'){
        this.form.supplierName='非小试物料供应商'
        this.form.supplierCode='YY_SUPPLIER'
      }
      console.log(this.form)
      this.selectMatRequireOpen = false;
    },
    //选择供应商
    openSelectSupplierDialog(){
      this.selectSupplierOpen = true;
    },
    cancelSelectSupplier(){
      this.selectSupplierOpen = false;
    },
    confirmSelectSupplier(item){
      this.form.supplierCode = item.supplierCode;
      this.form.supplierName = item.supplierName;
      this.selectSupplierOpen = false;
    },
    //补码
    handleComplement(item){
      printLabel(item.labelId).then(response => {
        const binaryData = [];
        binaryData.push(response);
        let pdfUrl = window.URL.createObjectURL(new Blob(binaryData, { type: "application/pdf" }));
        window.open(pdfUrl);
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
    getCurVal_unit(val) {
      this.value = val.target.value
    },
    getCurVal_fdunit(val) {
      this.value = val.target.value
    },
  }
};
</script>
