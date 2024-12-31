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
          placeholder="请输入物料描述"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="三级编码" prop="subcode">
        <el-input
          v-model="queryParams.subcode"
          placeholder="请输入三级编码"
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
      <el-form-item label="批次" prop="batch">
        <el-input
          v-model="queryParams.batch"
          placeholder="请输入批次"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="品牌" prop="brandName">
        <el-input
          v-model="queryParams.brandName"
          placeholder="请输入供应商"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="生产时间" prop="prodTime">
        <el-date-picker
          clearable
          v-model="queryParams.prodTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择生产时间"
        >
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
          v-hasPermi="['stock:matRequire:add']"
          >物料搜索新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAddSelf"
          v-hasPermi="['stock:matRequire:add']"
          >物料手动导入</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="true"
          @click="handleDelete"
          v-hasPermi="['stock:matRequire:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          :disabled="multiple"
          @click="handleExport"
          v-hasPermi="['stock:matRequire:export']"
          >导出</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-printer"
          size="mini"
          :disabled="true"
          @click="handlePrintBatch"
          v-hasPermi="['stock:matRequire:list']"
          >批量打印</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="matRequireList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="编号"
        fixed
        align="center"
        prop="requireId"
        width="60"
      />
      <el-table-column
        label="物料编码"
        fixed
        align="center"
        prop="matCode"
        width="120"
      />
      <el-table-column
        label="三级编码"
        align="center"
        prop="subcode"
        width="100"
      />
      <el-table-column
        label="物料名称"
        fixed
        align="center"
        prop="matName"
        width="120"
      />
      <el-table-column label="规格" align="center" prop="figNum" width="100" />
      <el-table-column label="货号" align="center" prop="artNum" width="100" />
      <el-table-column label="品牌" align="center" prop="brand" width="100" />
      <el-table-column
        label="采购单位"
        align="center"
        prop="unitCode"
        width="80"
      >
        <template slot-scope="scope">
          <dict-tag
            :options="dict.type.base_mat_unit"
            :value="scope.row.unitCode"
          />
        </template>
      </el-table-column>
      <el-table-column label="数量" align="center" prop="quantity" width="80" />
      <el-table-column
        label="单价"
        align="center"
        prop="unitPrice"
        width="80"
      />
      <el-table-column label="总价" align="center" prop="sumPrice" width="80" />
      <el-table-column
        label="申请人"
        align="center"
        prop="requireBy"
        width="80"
      />
      <el-table-column
        label="PM项目号"
        align="center"
        prop="pmProject"
        width="150"
      />
      <el-table-column
        label="收货人"
        align="center"
        prop="consignee"
        width="80"
      />
      <el-table-column
        label="是否单一"
        align="center"
        prop="isSingle"
        width="80"
      >
        <template slot-scope="scope">
          {{ formatBoolType(scope.row.isSingle) }}
        </template>
      </el-table-column>
      <el-table-column
        label="是否进口"
        align="center"
        prop="isImport"
        width="80"
      >
        <template slot-scope="scope">
          {{ formatBoolType(scope.row.isSingle) }}
        </template>
      </el-table-column>
      <el-table-column
        label="创建日期"
        align="center"
        prop="createTime"
        width="100"
      >
        <template slot-scope="scope">
          {{ parseTime(formatDate(scope.row.createTime), "{y}-{m}-{d}") }}
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改物料标签对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="1000px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="物料编码" prop="matCode">
              <el-input
                v-model="form.matCode"
                readonly
                placeholder="请选择物料"
              >
                <el-button
                  slot="append"
                  icon="el-icon-search"
                  @click="openSelectMatDialog"
                ></el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="三级编码" prop="subcode">
              <el-select
                v-model="form.subcode"
                placeholder="请输入检索内容"
                filterable
                clearable
                @blur="getCurVal"
              >
                <el-option
                  v-for="item in subcodeList"
                  :key="item.subcodeCode"
                  :label="item.subcodeName"
                  :value="item.subcodeCode"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="物料名称" prop="matName">
              <el-input
                v-model="form.matName"
                placeholder="请输入物料名称"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌" prop="brand">
              <el-select
                v-model="form.brand"
                placeholder="请输入检索内容"
                filterable
                clearable
                @blur="getCurVal_brand"
              >
                <el-option
                  v-for="item in brandList"
                  :key="item.brandCode"
                  :label="item.brandName"
                  :value="item.brandName"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="规格" prop="figNum">
              <el-input
                v-model="form.figNum"
                placeholder="请输入规格"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货号" prop="artNum">
              <el-input
                v-model="form.artNum"
                placeholder="请输入货号"
                :rules="coderules"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="采购单位" prop="unitCode">
              <el-input v-model="form.unitCode" placeholder="请输入采购单位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input v-model="form.quantity" placeholder="请输入数量" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="单价(RMB)" prop="unitPrice">
              <el-input
                v-model="form.unitPrice"
                placeholder="请输入单价(RMB)"
                :rules="coderules"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总价" prop="sumPrice">
              <el-input v-model="form.sumPrice" placeholder="请输入总价" />
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :span="12">
            <el-form-item label="申请人" prop="requireBy">
              <el-input v-model="form.requireBy" placeholder="请输入申请人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="PM项目号" prop="pmProject">
              <el-select v-model="form.pmProject" placeholder="请选择PM项目">
                <el-option
                  v-for="item in pmProjectList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="分类" prop="matClass">
            <span slot="label">
          <el-tooltip content="分类说明分类说明分类说明分类说明分类说明分类说明" placement="top">
          <i class="el-icon-question"><b>分类</b></i>
          </el-tooltip>
        </span>
              <el-select v-model="form.matClass" placeholder="请选择物料分类" >
                <el-option
                  v-for="item in classList"
                  :key="item.classCode"
                  :label="item.className"
                  :value="item.classCode"
                ></el-option>
              </el-select>
            </el-form-item>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="收货人" prop="consignee">
              <el-input v-model="form.consignee" placeholder="请输入收货人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话" prop="phoneNum">
              <el-input v-model="form.phoneNum" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入地址" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="是否单一" prop="isSingle">
              <el-radio-group v-model="form.isSingle" @change="valueChange">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="单一原因" prop="singleReason">
              <el-input v-model="form.singleReason" placeholder="单一原因" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否进口" prop="isImport">
              <el-radio-group v-model="form.isImport" @change="valueChange2">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="进口原因" prop="importReason">
              <el-input
                v-model="form.importReason"
                placeholder="进口原因"
                :rules="dynamicRules"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :title="'选择物料'"
      :visible.sync="selectMatOpen"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <selectMat @confirmSelect="confirmSelectMat"></selectMat>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSelectMat">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :title="title"
      :visible.sync="openSelf"
      width="1000px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="物料编码" prop="matCode">
              <el-input
                v-model="form.matCode"
                readonly
                placeholder="请选择物料"
              >
                <el-button
                  slot="append"
                  icon="el-icon-search"
                  @click="openSelectMatDialog"
                ></el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="三级编码" prop="subcode">
              <el-select
                v-model="form.subcode"
                placeholder="请输入检索内容"
                filterable
                clearable
                @blur="getCurVal"
              >
                <el-option
                  v-for="item in subcodeList"
                  :key="item.subcodeCode"
                  :label="item.subcodeName"
                  :value="item.subcodeCode"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="物料名称" prop="matName">
              <el-input
                v-model="form.matName"
                placeholder="请输入物料名称"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌" prop="brand">
              <el-select
                v-model="form.brand"
                placeholder="请输入检索内容"
                filterable
                clearable
                @blur="getCurVal_brand"
              >
                <el-option
                  v-for="item in brandList"
                  :key="item.brandCode"
                  :label="item.brandName"
                  :value="item.brandName"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="规格" prop="figNum">
              <el-input
                v-model="form.figNum"
                placeholder="请输入规格"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货号" prop="artNum">
              <el-input
                v-model="form.artNum"
                placeholder="请输入货号"
                :rules="coderules"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="采购单位" prop="unitCode">
              <el-input v-model="form.unitCode" placeholder="请输入采购单位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input v-model="form.quantity" placeholder="请输入数量" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="单价(RMB)" prop="unitPrice">
              <el-input
                v-model="form.unitPrice"
                placeholder="请输入单价(RMB)"
                :rules="coderules"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总价" prop="sumPrice">
              <el-input v-model="form.sumPrice" placeholder="请输入总价" />
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :span="12">
            <el-form-item label="申请人" prop="requireBy">
              <el-input v-model="form.requireBy" placeholder="请输入申请人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="PM项目号" prop="pmProject">
              <el-select v-model="form.pmProject" placeholder="请选择PM项目">
                <el-option
                  v-for="item in pmProjectList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="分类" prop="matClass">
            <span slot="label">
          <el-tooltip content="分类说明分类说明分类说明分类说明分类说明分类说明" placement="top">
          <i class="el-icon-question"><b>分类</b></i>
          </el-tooltip>
        </span>
              <el-select v-model="form.matClass" placeholder="请选择物料分类" >
                <el-option
                  v-for="item in classList"
                  :key="item.classCode"
                  :label="item.className"
                  :value="item.classCode"
                ></el-option>
              </el-select>
            </el-form-item>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="收货人" prop="consignee">
              <el-input v-model="form.consignee" placeholder="请输入收货人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话" prop="phoneNum">
              <el-input v-model="form.phoneNum" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入地址" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="是否单一" prop="isSingle">
              <el-radio-group v-model="form.isSingle" @change="valueChange">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="单一原因" prop="singleReason">
              <el-input v-model="form.singleReason" placeholder="单一原因" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否进口" prop="isImport">
              <el-radio-group v-model="form.isImport" @change="valueChange2">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="进口原因" prop="importReason">
              <el-input
                v-model="form.importReason"
                placeholder="进口原因"
                :rules="dynamicRules"
              />
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
import {
  listMatRequire,
  getMatRequire,
  delMatRequire,
  addMatRequire,
  updateMatRequire,
} from "@/api/stock/matRequire";
import { listAllGroup } from "@/api/base/group";
import { listAllClass } from "@/api/base/class";
import { listAllSubcode } from "@/api/base/subcode";
import { listAllBrand } from "@/api/base/brand";
import selectMat from "../../components/select-mat/index";
import selectSupplier from "../../components/select-supplier/index";
import cloneDeep from "lodash/cloneDeep";

export default {
  name: "MatRequire",
  dicts: ["base_mat_unit"],
  components: { selectMat, selectSupplier },
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
      matRequireList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      openSelf: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        labelType: null,
        matCode: null,
        matName: null,
        fdCode: null,
        figNum: null,
        artNum: null,
        matGroup: null,
        matClass: null,
        unitCode: null,
        batch: null,
        brandCode: null,
        brandName: null,
        prodTime: null,
        quantity: null,
        unitPrice: null,
        orderNo: null,
        orderType: null,
      },
      subcodeRequiredInfos: [
        "matName",
        "artNum",
        "brand",
        "figNum",
        "unitCode",
        "quantity",
      ],
      dict_1: [
        { label: "是", value: "1" },
        { label: "1", value: "是" },
        { label: "0", value: "否" },
        { label: "否", value: "0" },
      ],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        matCode: [{ required: true, message: "请选择物料", trigger: "blur" }],
        subcode: [
          { required: true, message: "请选择三级分类编码", trigger: "blur" },
        ],
        matName: [
          { required: true, message: "物料名称不能为空", trigger: "blur" },
        ],
        artNum: [{ required: true, message: "货号不能为空", trigger: "blur" }],
        brand: [{ required: true, message: "品牌不能为空", trigger: "blur" }],
        figNum: [{ required: true, message: "规格不能为空", trigger: "blur" }],
        unitCode: [
          { required: true, message: "请选择采购单位", trigger: "blur" },
        ],
        quantity: [{ required: true, message: "请输入数量", trigger: "blur" }],
        unitPrice: [{ required: true, message: "请输入单价", trigger: "blur" }],
        requireBy: [
          { required: true, message: "申请人不能为空", trigger: "blur" },
        ],
        consignee: [
          { required: true, message: "收货人不能为空", trigger: "blur" },
        ],
        phoneNum: [
          { required: true, message: "电话不能为空", trigger: "blur" },
        ],
        singleReason: [
          { required: false, message: "请输入单一原因", trigger: "blur" },
        ],
        importReason: [
          { required: false, message: "请输入进口原因", trigger: "blur" },
        ],
        isSingle: [
          { required: true, message: "请选择是否单一", trigger: "blur" },
        ],
        isImport: [
          { required: true, message: "请选择是否进口", trigger: "blur" },
        ],
      },

      //组、分类
      groupList: [],
      classList: [],
      subcodeList: [],
      brandList: [],

      //选择物料
      selectMatOpen: false,
      //选择供应商
      selectSupplierOpen: false,
      pmProjectList: [
        { label: "基于结构的核酸疫苗设计与研发", value: "P23Z31900N0001" },
        {
          label: "创新呼吸道合胞病毒mRNA疫苗开发与应用",
          value: "P23Z31900N0002",
        },
        { label: "新型脂质体研发", value: "P23Z31900N0003" },
        { label: "核酸疫苗工艺开发与技术转移", value: "P24Z31900N0004" },
      ],
      keyWord: "",
    };
  },
  created() {
    this.getList();
    this.getGroupList();
    this.getClassList();
    this.getSubcodeList();
    this.getBrandList();
  },
  change: {},
  computed: {
    fillist() {
      return this.subcodeList.filter((p) => {
        return (
          p.subcodeName.indexOf(this.keyWord) !== -1 ||
          p.subcodeCode.indexOf(this.keyWord) !== -1
        );
      });
    },
    coderules() {
      console.log(this.form.subcode);
      if ((this.form.subcode === "") | (this.form.subcode === null)) {
        for (let i = 0; i < this.subcodeRequiredInfos.length; i++) {
          const _ruleSingle = cloneDeep(
            this.rules[this.subcodeRequiredInfos[i]]
          );
          _ruleSingle[0].required = true;
          this.rules[this.subcodeRequiredInfos[i]] = _ruleSingle;
        }
      } else {
        for (let i = 0; i < this.subcodeRequiredInfos.length; i++) {
          const _ruleSingle = cloneDeep(
            this.rules[this.subcodeRequiredInfos[i]]
          );
          _ruleSingle[0].required = false;
          this.rules[this.subcodeRequiredInfos[i]] = _ruleSingle;
        }
      }
    },

    dynamicRules() {
      // 单一
      const _ruleSingle = cloneDeep(this.rules.singleReason); // 使用cloneDeep进行深拷贝; // 创建一个规则数组的副本
      // 如果 subjectNo 填写了，则将 softName 设置为必填
      if (this.form.isSingle === 1) {
        _ruleSingle[0].required = true;
      } else if (this.form.isSingle === 0) {
        _ruleSingle[0].required = false;
      }
      this.rules.singleReason = _ruleSingle;

      // 进口
      const _ruleImport = cloneDeep(this.rules.importReason); // 使用cloneDeep进行深拷贝; // 创建一个规则数组的副本
      // 如果 subjectNo 填写了，则将 softName 设置为必填
      if (this.form.isImport === 1) {
        _ruleImport[0].required = true;
      } else if (this.form.isImport === 0) {
        _ruleImport[0].required = false;
      }
      this.rules.importReason = _ruleImport;
    },
  },
  methods: {
    getCurVal(val) {
      this.value = val.target.value;
    },
    getCurVal_brand(val) {
      this.value = val.target.value;
    },

    /** 查询物料标签列表 */
    getList() {
      this.loading = true;
      listMatRequire(this.queryParams).then((response) => {
        this.matRequireList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    valueChange(value) {
      this.$nextTick(() => {
        console.log(value);
      });
    },
    valueChange2(value) {
      this.$nextTick(() => {
        console.log(value);
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
        subcode: null,
        fdCode: null,
        figNum: null,
        artNum: null,
        matGroup: null,
        matClass: null,
        unitCode: null,
        batch: null,
        brandCode: null,
        brandName: null,
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
      this.ids = selection.map((item) => item.labelId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "搜索添加物料标签";
      this.$set(
        this.form,
        "address",
        "深圳市盐田区海山街道田东社区深盐路2028号大百汇生命健康产业园1栋一单元6楼"
      );
      this.$set(this.form, "isSingle", 0);
      this.$set(this.form, "isImport", 0);
    },
    handleAddSelf() {
      this.reset();
      this.openSelf = true;
      this.title = "手动添加物料标签";
      this.$set(
        this.form,
        "address",
        "深圳市盐田区海山街道田东社区深盐路2028号大百汇生命健康产业园1栋一单元6楼"
      );
      this.$set(this.form, "isSingle", 0);
      this.$set(this.form, "isImport", 0);
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const labelId = row.labelId || this.ids;
      getMatRequire(labelId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改物料标签";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.form.labelType = "purchase";
          if (this.form.labelId != null) {
            updateMatRequire(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMatRequire(this.form).then((response) => {
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
      this.$modal
        .confirm('是否确认删除物料标签编号为"' + labelIds + '"的数据项？')
        .then(function () {
          return delMatRequire(labelIds);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "stock/matRequire/export",
        {
          ...this.queryParams,
        },
        `matRequire_${new Date().getTime()}.xlsx`
      );
    },
    /** 批量打印 */
    handlePrintBatch(row) {
      const labelIds = row.labelId || this.ids;
      printRequireBatch(labelIds).then((response) => {
        const binaryData = [];
        binaryData.push(response);
        let pdfUrl = window.URL.createObjectURL(
          new Blob(binaryData, { type: "application/pdf" })
        );
        window.open(pdfUrl);
      });
    },
    /** 查询组、分类 */
    getGroupList() {
      listAllGroup().then((response) => {
        this.groupList = response;
      });
    },
    getClassList() {
      listAllClass().then((response) => {
        this.classList = response;
      });
    },
    getSubcodeList() {
      listAllSubcode().then((response) => {
        this.subcodeList = response;
      });
    },
    getBrandList() {
      listAllBrand().then((response) => {
        this.brandList = response;
      });
    },
    //选择物料
    openSelectMatDialog() {
      this.selectMatOpen = true;
    },
    cancelSelectMat() {
      this.selectMatOpen = false;
    },
    confirmSelectMat(item) {
      this.form.matCode = item.matCode;
      this.form.matName = item.matName;
      this.form.fdCode = item.fdCode;
      this.form.figNum = item.figNum;
      this.form.artNum = item.artNum;
      this.form.matGroup = item.matGroup;
      this.form.matClass = item.matClass;
      this.form.unitCode = item.unitCode;
      this.form.subcode = item.subcode;
      this.form.brand = item.brand;

      this.form.batch = "CG" + this.$moment().format("YYYYMMDDHHmmss");
      this.selectMatOpen = false;
    },
    //补码
    handleComplement(item) {
      printRequire(item.labelId).then((response) => {
        const binaryData = [];
        binaryData.push(response);
        let pdfUrl = window.URL.createObjectURL(
          new Blob(binaryData, { type: "application/pdf" })
        );
        window.open(pdfUrl);
      });
    },
    formatDate(dateString) {
      // return new Date(dateString).toLocaleDateString();
      // 尝试将字符串转换为日期对象
      if (dateString === "") {
        return dateString;
      }
      if (!dateString) {
        return dateString;
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
        return { color: "red" };
      }
      if (!isNaN(expDate) && expDate < threeMonthsLater) {
        return { color: "orange" };
      }
      return {};
    },
    formatBoolType(boolType) {
      if (boolType === "1" || boolType === 1) {
        return "是";
      } else if (boolType === "0" || boolType === 0) {
        return "否";
      }
      return boolType;
    },
  },
};
</script>
