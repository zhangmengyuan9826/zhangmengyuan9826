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
      <el-form-item label="管理编号" prop="eqNo">
        <el-input
          v-model="queryParams.eqNo"
          placeholder="请输入管理编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="火眼编号" prop="hyNo">
        <el-input
          v-model="queryParams.hyNo"
          placeholder="请输入火眼编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设备名称" prop="eqName">
        <el-input
          v-model="queryParams.eqName"
          placeholder="请输入设备名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="制造单位" prop="manufactor">
        <el-input
          v-model="queryParams.manufactor"
          placeholder="请输入制造单位"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="校准时间" prop="calibDate">
        <el-date-picker
          clearable
          v-model="queryParams.calibDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择计量/校准时间"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="实验室" prop="workshop">
        <el-select
          v-model="queryParams.workshop"
          placeholder="请选择实验室"
          filterable
          allow-create
          clearable
        >
          <el-option
            v-for="item in workshopList"
            :key="item.workshopName"
            :label="item.workshopName"
            :value="item.workshopName"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="分类" prop="eqClass">
        <el-select
          v-model="queryParams.eqClass"
          placeholder="请选择A/B/C/D类"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="item in ['A', 'B', 'C', 'D']"
            :key="item"
            :label="item"
            :value="item"
          >
          </el-option
        ></el-select>
      </el-form-item>

      <el-form-item label="是否为计量器具" prop="isMeasure" label-width="150px">
        <el-radio-group v-model="queryParams.isMeasure">
          <el-radio :label="'1'">是</el-radio>
          <el-radio :label="'0'">否</el-radio></el-radio-group
        >
      </el-form-item>
      <el-form-item label="负责人" prop="manageBy">
        <el-select
          v-model="queryParams.manageBy"
          clearable
          placeholder="请选择负责人"
        >
          <el-option
            v-for="item in userList"
            :key="item.userName"
            :label="item.nickName"
            :value="item.userName"
          ></el-option>
        </el-select>
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
          v-hasPermi="['lab:equipment:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['lab:equipment:edit']"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['lab:equipment:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['lab:equipment:export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="equipmentList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="管理编号"
        align="center"
        prop="eqNo"
        width="75px"
      />
      <el-table-column
        label="火眼编号"
        align="center"
        prop="hyNo"
        width="75px"
      />
      <el-table-column
        label="设备名称"
        align="center"
        prop="eqName"
        width="150px"
      />
      <el-table-column
        label="规格型号"
        align="center"
        prop="figNum"
        width="120px"
      />
      <el-table-column label="制造单位" align="center" prop="manufactor" />
      <el-table-column
        label="序列号"
        align="center"
        prop="serialNo"
        width="150px"
      />

      <el-table-column
        label="校准时间"
        align="center"
        prop="calibDate"
        width="100px"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.calibDate, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="校准效期"
        align="center"
        prop="validDate"
        width="100px"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.validDate, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="实验室"
        align="center"
        prop="workshop"
        width="140px"
      />
      <el-table-column
        label="分类"
        align="center"
        prop="eqClass"
        width="50px"
      />
      <!-- <el-table-column label="设备级别组" align="center" prop="eqGroup" /> -->
      <!-- <el-table-column label="是否为计量器具" align="center" prop="isMeasure" /> -->
      <el-table-column label="责任人" align="center" prop="manageBy">
        <template slot-scope="scope">
          {{ getNickName(scope.row.manageBy) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="50px" />
      <el-table-column
        label="操作"
        align="center"
        fixed="right"
        width="120px"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            >详情</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleChange(scope.row)"
            v-hasPermi="['lab:equipment:edit']"
            >变更</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['lab:equipment:remove']"
            >删除</el-button
          >
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

    <!-- 添加或修改仪器设备对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="80%" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="管理编号" prop="eqNo">
              <el-input v-model="form.eqNo" placeholder="请输入管理编号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="火眼编号" prop="hyNo">
              <el-input v-model="form.hyNo" placeholder="请输入火眼编号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="设备名称" prop="eqName">
              <el-input v-model="form.eqName" placeholder="请输入设备名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="规格型号" prop="figNum">
              <el-input v-model="form.figNum" placeholder="请输入规格型号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="制造单位" prop="manufactor">
              <el-input
                v-model="form.manufactor"
                placeholder="请输入制造单位"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="序列号" prop="serialNo">
              <el-input
                v-model="form.serialNo"
                placeholder="请输入出厂编号/序列号"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="安装日期" prop="installDate">
              <el-date-picker
                clearable
                v-model="form.installDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择安装日期"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="启用日期" prop="startDate">
              <el-date-picker
                clearable
                v-model="form.startDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择启用日期"
              >
              </el-date-picker>
            </el-form-item> </el-col
        ></el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="校准时间" prop="calibDate">
              <el-date-picker
                clearable
                v-model="form.calibDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择校准时间"
                :disabled="operType != 'add'"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="校准效期" prop="validDate">
              <el-date-picker
                clearable
                v-model="form.validDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择校准有效期至"
                :disabled="operType != 'add'"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="实验室" prop="workshop">
              <el-select
                v-model="form.workshop"
                placeholder="请选择实验室"
                clearable
                filterable
                allow-create
                :disabled="operType != 'add'"
              >
                <el-option
                  v-for="item in workshopList"
                  :key="item.workshopName"
                  :label="item.workshopName"
                  :value="item.workshopName"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="类别" prop="eqClass">
              <el-select
                v-model="form.eqClass"
                placeholder="请选择A/B/C/D类"
                clearable
                style="width: 200px"
              >
                <el-option
                  v-for="item in ['A', 'B', 'C', 'D']"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option
              ></el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="设备级别组" prop="eqGroup" label-width="150px">
              <el-input v-model="form.eqGroup" placeholder="请输入设备级别组" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item
              label="是否为计量器具"
              prop="isMeasure"
              label-width="150px"
            >
              <el-radio-group v-model="form.isMeasure">
                <el-radio :label="'1'">是</el-radio>
                <el-radio :label="'0'">否</el-radio></el-radio-group
              >
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="责任人" prop="manageBy">
              <el-select
                v-model="form.manageBy"
                clearable
                placeholder="请选择责任人"
                :disabled="operType != 'add'"
              >
                <el-option
                  v-for="item in userList"
                  :key="item.userName"
                  :label="item.nickName"
                  :value="item.userName"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-input v-model="form.status" placeholder="请输入状态" />
            </el-form-item> </el-col
        ></el-row>
        <el-form-item label="描述" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="submitForm"
          v-hasPermi="['lab:equipment:edit']"
          >确 定</el-button
        >
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="变更仪器设备"
      :visible.sync="openChange"
      width="60%"
      append-to-body
    >
      <div>
        <el-form
          :model="changeForm"
          ref="changeForm"
          :rules="changeRules"
          label-width="80px"
        >
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="管理编号" prop="eqNo">
                <el-input v-model="changeForm.eqNo" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="火眼编号" prop="hyNo">
                <el-input v-model="changeForm.hyNo" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="设备名称" prop="eqName">
                <el-input v-model="changeForm.eqName" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="校准时间" prop="calibDate">
                <el-input
                  v-model="changeForm.calibDate"
                  disabled
                /> </el-form-item
            ></el-col>
            <el-col :span="12">
              <el-form-item label="校准效期" prop="validDate">
                <el-input v-model="changeForm.validDate" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="实验室" prop="workshop">
                <el-input v-model="changeForm.workshop" disabled
              /></el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="责任人" prop="manageBy">
                <el-select v-model="changeForm.manageBy" disabled>
                  <el-option
                    v-for="item in userList"
                    :key="item.userName"
                    :label="item.nickName"
                    :value="item.userName"
                  ></el-option> </el-select></el-form-item>
            </el-col>
          </el-row>
          <span style="color: #dd55ee">请在下方输入变更内容：</span>
          <br /><br />
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="校准时间" prop="newCalibDate">
                <el-date-picker
                  v-model="changeForm.newCalibDate"
                  type="date"
                  value-format="yyyy-MM-dd"
                  placeholder="请选择校准时间"
                /> </el-form-item
            ></el-col>
            <el-col :span="12">
              <el-form-item label="校准效期" prop="newValidDate">
                <el-date-picker
                  v-model="changeForm.newValidDate"
                  type="date"
                  value-format="yyyy-MM-dd"
                  placeholder="请选择校准效期"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="实验室" prop="newWorkshop">
                <el-select
                  v-model="changeForm.newWorkshop"
                  filterable
                  allow-create
                  placeholder="请选择实验室"
                >
                  <el-option
                    v-for="item in workshopList"
                    :key="item.workshopName"
                    :label="item.workshopName"
                    :value="item.workshopName"
                  ></el-option> </el-select
              ></el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="责任人" prop="newManageBy">
                <el-select
                  v-model="changeForm.newManageBy"
                  filterable
                  placeholder="请选择责任人"
                >
                  <el-option
                    v-for="item in userList"
                    :key="item.userName"
                    :label="item.nickName"
                    :value="item.userName"
                  ></el-option> </el-select
              ></el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="变更说明" prop="remark">
            <el-input
              v-model="changeForm.remark"
              type="textarea"
              placeholder="请输入变更说明"
            /></el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="submitChange"
          v-hasPermi="['lab:equipment:edit']"
          >确 定</el-button
        >
        <el-button @click="cancelChange">取 消</el-button></div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listEquipment,
  getEquipment,
  delEquipment,
  addEquipment,
  updateEquipment,
  changeEquipment
} from "@/api/lab/equipment";
import { listAllWorkshop } from "@/api/base/workshop";
import { listUserAll } from "@/api/system/user";

export default {
  name: "Equipment",
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
      // 仪器设备表格数据
      equipmentList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        eqNo: null,
        hyNo: null,
        eqName: null,
        figNum: null,
        manufactor: null,
        serialNo: null,
        installDate: null,
        startDate: null,
        calibDate: null,
        validDate: null,
        workshop: null,
        eqClass: null,
        eqGroup: null,
        isMeasure: null,
        manageBy: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        eqNo: [
          { required: true, message: "管理编号不能为空", trigger: "blur" },
        ],
        eqName: [
          { required: true, message: "设备名称不能为空", trigger: "blur" },
        ],
      },
      changeRules: {
        newCalibDate: [
          { required: true, message: "校准时间不能为空", trigger: "blur" },
        ],
        newValidDate: [
          { required: true, message: "校准效期不能为空", trigger: "blur" },
        ],
        newWorkshop: [
          { required: true, message: "实验室不能为空", trigger: "blur" },
        ],
        newManageBy: [
          { required: true, message: "责任人不能为空", trigger: "blur" },
        ],
      },
      workshopList: [],
      workshopDict: {},
      userList: [],
      operType: "",
      // 是否显示变更弹出层
      openChange: false,
      changeForm: {
      eqNo: null,
      hyNo: null,
      eqName: null,
      calibDate: null,
      validDate: null,
      workshop: null,
      manageBy: null,
      newCalibDate: null,  // 确保这些字段被初始化
      newValidDate: null,
      newWorkshop: null,
      newManageBy: null,
      remark: null,
    },
    };
  },
  created() {
    this.getList();
    this.getWorkshopList();
    this.getUserList();
  },
  methods: {
    /** 查询仪器设备列表 */
    getList() {
      this.loading = true;
      listEquipment(this.queryParams).then((response) => {
        this.equipmentList = response.rows;
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
        eqId: null,
        eqNo: null,
        hyNo: null,
        eqName: null,
        figNum: null,
        manufactor: null,
        serialNo: null,
        installDate: null,
        startDate: null,
        calibDate: null,
        validDate: null,
        workshop: null,
        eqClass: null,
        eqGroup: null,
        isMeasure: null,
        manageBy: null,
        status: "0",
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
      this.ids = selection.map((item) => item.eqId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.operType = "add";
      this.reset();
      this.open = true;
      this.title = "添加仪器设备";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.operType = "edit";
      this.reset();
      const eqId = row.eqId || this.ids;
      getEquipment(eqId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改仪器设备";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.eqId != null) {
            updateEquipment(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addEquipment(this.form).then((response) => {
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
      const eqIds = row.eqId || this.ids;
      this.$modal
        .confirm('是否确认删除仪器设备编号为"' + eqIds + '"的数据项？')
        .then(function () {
          return delEquipment(eqIds);
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
        "lab/equipment/export",
        {
          ...this.queryParams,
        },
        `equipment_${new Date().getTime()}.xlsx`
      );
    },
    getWorkshopList() {
      listAllWorkshop().then((response) => {
        this.workshopList = response;
        this.workshopDict = this.workshopList.reduce((dict, obj) => {
          dict[obj.workshopCode] = obj.workshopName;
          return dict;
        }, {});
      });
    },
    getUserList() {
      listUserAll().then((response) => {
        this.userList = response;
      });
    },
    getNickName(userName) {
      const user = this.userList.find((u) => u.userName === userName);
      return user ? user.nickName : userName;
    },
    handleChange(row) {
  this.operType = "change";
  this.reset();
  const eqId = row.eqId || this.ids;
  getEquipment(eqId).then((response) => {
    // 使用Object.assign确保所有字段都被正确设置
    this.changeForm = Object.assign({
      newCalibDate: null,
      newValidDate: null,
      newWorkshop: null,
      newManageBy: null,
      remark: null
    }, response.data);
    
    // 设置新字段的初始值
    this.changeForm.newCalibDate = this.changeForm.calibDate;
    this.changeForm.newValidDate = this.changeForm.validDate;
    this.changeForm.newManageBy = this.changeForm.manageBy;
    this.changeForm.newWorkshop = this.changeForm.workshop;
    
    this.openChange = true;
    this.title = "变更仪器设备";
  });
},
    handleChange_(row) {
      this.operType = "change";
      this.reset();
      const eqId = row.eqId || this.ids;
      getEquipment(eqId).then((response) => {
        this.changeForm = response.data;
        let calibDate = this.changeForm["calibDate"];
        let validDate = this.changeForm["validDate"];
        this.changeForm["newCalibDate"] = calibDate;
        this.changeForm["newValidDate"] = validDate;
        this.changeForm["newManageBy"] = this.changeForm["manageBy"];
        this.changeForm["newWorkshop"] = this.changeForm["workshop"];
        this.openChange = true;
        this.title = "变更仪器设备";
      });
    },
    submitChange() {
      this.$refs["changeForm"].validate((valid) => {
        if (valid) {
          const updatedData = {
            eqId: this.changeForm.eqId,
            eqName: this.changeForm.eqName,
            calibDate: this.changeForm.newCalibDate,
            validDate: this.changeForm.newValidDate,
            workshop: this.changeForm.newWorkshop,
            manageBy: this.changeForm.newManageBy,
            remark: this.changeForm.remark || '' 
          };
          changeEquipment(updatedData).then((response) => {
            this.$modal.msgSuccess("变更成功");
            this.openChange = false;
            this.getList();
          });
        }
      });
    },
    cancelChange() {
      this.openChange = false;
      this.reset();
    },
  },
};
</script>
<style scoped>

</style>
