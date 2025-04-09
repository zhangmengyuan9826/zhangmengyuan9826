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
      <el-form-item label="订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户" prop="client">
        <el-input
          v-model="queryParams.client"
          placeholder="请输入客户"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="服务商" prop="serviceProvider">
        <el-input
          v-model="queryParams.serviceProvider"
          placeholder="请输入服务商"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否常规合成" prop="isSynthesis">
        <el-input
          v-model="queryParams.isSynthesis"
          placeholder="请输入是否常规合成"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="管线" prop="pipeline">
        <el-input
          v-model="queryParams.pipeline"
          placeholder="请输入管线"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="管线编号" prop="pipelineNo">
        <el-input
          v-model="queryParams.pipelineNo"
          placeholder="请输入管线编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="下单日期" prop="orderDate">
        <el-date-picker
          clearable
          v-model="queryParams.orderDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择下单日期"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="到货日期" prop="arrivalDate">
        <el-date-picker
          clearable
          v-model="queryParams.arrivalDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择到货日期"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="周期" prop="period">
        <el-input
          v-model="queryParams.period"
          placeholder="请输入周期"
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
          v-hasPermi="['plasmid:order:add']"
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
          v-hasPermi="['plasmid:order:edit']"
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
          v-hasPermi="['plasmid:order:remove']"
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
          v-hasPermi="['plasmid:order:export']"
          >导出</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-dropdown
          size="mini"
          :disabled="multiple"
          v-hasPermi="['plasmid:order:edit']"
        >
          <el-button type="info" plain size="mini" icon="el-icon-right">
            状态更新<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="button in statusDictButtonsCheck"
              :key="button.value"
              icon="el-icon-plus"
              size="mini"
              @click.native="handleChangeStatus(button.value)"
            >
              {{ button.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="orderList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="orderId" />
      <el-table-column label="订单号" align="center" prop="orderNo" />
      <el-table-column label="客户" align="center" prop="client" />
      <el-table-column label="服务商" align="center" prop="serviceProvider" />
      <el-table-column label="是否常规合成" align="center" prop="isSynthesis" />
      <el-table-column label="管线" align="center" prop="pipeline" />
      <el-table-column label="管线编号" align="center" prop="pipelineNo" />
      <el-table-column
        label="下单日期"
        align="center"
        prop="orderDate"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.orderDate, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="到货日期"
        align="center"
        prop="arrivalDate"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.arrivalDate, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="周期" align="center" prop="period" />
      <el-table-column
          label="订单状态"
          align="center"
          prop="orderStatus"
          width="100"
        >
          <template slot-scope="scope">
            <span :style="formatStatusStyle(scope.row.orderStatus)">
              {{ formatStatus(scope.row.orderStatus) }}
            </span>
          </template>
        </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['plasmid:order:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['plasmid:order:remove']"
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

    <!-- 添加或修改质粒订单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="90%" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col span="8">
            <el-form-item label="订单号" prop="orderNo">
              <el-input v-model="form.orderNo" placeholder="请输入订单号" />
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="客户" prop="client">
              <el-input v-model="form.client" placeholder="请输入客户" />
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="服务商" prop="serviceProvider">
              <el-input
                v-model="form.serviceProvider"
                placeholder="请输入服务商"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col span="8">
            <el-form-item label="是否常规合成" prop="isSynthesis">
              <el-input
                v-model="form.isSynthesis"
                placeholder="请输入是否常规合成"
              />
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="管线" prop="pipeline">
              <el-input v-model="form.pipeline" placeholder="请输入管线" />
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="管线编号" prop="pipelineNo">
              <el-input
                v-model="form.pipelineNo"
                placeholder="请输入管线编号"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col span="8">
            <el-form-item label="下单日期" prop="orderDate">
              <el-date-picker
                clearable
                v-model="form.orderDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择下单日期"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="到货日期" prop="arrivalDate">
              <el-date-picker
                clearable
                v-model="form.arrivalDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择到货日期"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
        
          <el-col span="8">
            <el-form-item label="周期" prop="period">
              <el-input v-model="form.period" placeholder="请输入周期" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
        <el-row>
          <el-col span="8">
            <el-form-item label="选择质粒">
              <el-button
                size="small"
                type="success"
                icon="el-icon-search"
                @click="openSelectPlasmidGeneDialog"
                >物料标签清单</el-button
              >
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-table :data="plasmidGeneList" style="width: 100%">
        <el-table-column label="基因名" align="center" prop="geneName" />
        <el-table-column label="质粒载体" align="center" prop="plasmidVector" />
        <el-table-column
          label="质粒全称"
          align="center"
          prop="plasmidFullName"
        />
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
        <el-table-column label="cds长度(bp)" align="center" prop="cdsLength" />
        <el-table-column
          label="质粒全长(bp)"
          align="center"
          prop="plasmidFullLength"
        />
        <el-table-column label="3'UTR" align="center" prop="utr3" />
        <el-table-column label="5'UTR" align="center" prop="utr5" />
        <el-table-column label="polyA" align="center" prop="polyA" />
        <el-table-column label="CDS序列" align="center" prop="cdsSeq" />
        <el-table-column label="启动子" align="center" prop="promoter" />
        <el-table-column label="载体类型 I" align="center" prop="vectorType1" />
        <el-table-column
          label="载体类型 II"
          align="center"
          prop="vectorType2"
        />
        <el-table-column label="标签信息" align="center" prop="tagInfo" />
        <el-table-column label="接头" align="center" prop="linker" />
        <el-table-column
          label="CDS表达蛋白数量"
          align="center"
          prop="cdsProteinNum"
        />
        <el-table-column label="信号肽" align="center" prop="signalPeptide" />
        <el-table-column label="蛋白类型" align="center" prop="proteinType" />
        <el-table-column label="增强子" align="center" prop="enhancer" />
        <el-table-column label="批次" align="center" prop="batch" />
        <el-table-column
          label="操作"
          align="center"
          width="80"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-scissors"
              @click="handleRemove(scope.$index, scope.row)"
              >去除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="'选择质粒'"
      :visible.sync="selectPlasmidGeneOpen"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <selectPlasmidGene
        ref="plasmidGenePage"
        :geneIdArr="geneIdArr"
        @confirmSelectArr="confirmSelectPlasmidGeneArr"
        @confirmSelect="confirmSelectPlasmidGene"
      >
      </selectPlasmidGene>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSelectPlasmidGene">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listOrder,
  getOrder,
  delOrder,
  addOrder,
  updateOrder,
  updateOrderStatus,
} from "@/api/plasmid/order";
import selectPlasmidGene from "../../components/select-plasmid-gene/index";

export default {
  name: "Order",
  components: { selectPlasmidGene },
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
      // 质粒订单表格数据
      orderList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderNo: null,
        client: null,
        serviceProvider: null,
        isSynthesis: null,
        pipeline: null,
        pipelineNo: null,
        orderDate: null,
        arrivalDate: null,
        period: null,
        orderStatus: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        orderNo: [
          { required: true, message: "订单号不能为空", trigger: "blur" },
        ],
      },
      selectPlasmidGeneOpen: false,
      plasmidGeneList: [],
      geneIdArr: [],
      statusDictButtons: [
        { name: "已下单", value: "created", type: "PRIMARY" },
        { name: "中间过程-1", value: "approved", type: "DANGER" },
        { name: "中间过程-2", value: "un_approved", type: "danger" },
        { name: "已到货", value: "done", type: "PRIMARY" },
      ],
      statusDictButtonsCheck: [
        { name: "中间过程-1", value: "approved", type: "warning" },
        { name: "中间过程-2", value: "un_approved", type: "danger" },
        { name: "已到货", value: "done", type: "PRIMARY" },
        { name: "实验中", value: "done2", type: "PRIMARY" },
      ],
      statusDict: {
        created: "已下单",
        approved: "中间过程-1",
        un_approved: "中间过程-2",
        done: "已到货",
        done2: "实验中",
      },
      statusColor: {
        created: "orange",
        approved: "green",
        un_approved: "red",
        processing: "blue",
        un_purchase: "red",
        done: "grey",
        done2: "blue",
        finished: "grey",
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询质粒订单列表 */
    getList() {
      this.loading = true;
      listOrder(this.queryParams).then((response) => {
        this.orderList = response.rows;
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
        orderId: null,
        orderNo: null,
        client: null,
        serviceProvider: null,
        isSynthesis: null,
        pipeline: null,
        pipelineNo: null,
        orderDate: null,
        arrivalDate: null,
        period: null,
        orderStatus: "0",
        remark: null,
        createTime: null,
        createBy: null,
        updateTime: null,
        updateBy: null,
        delFlag: null,
      };
      this.resetForm("form");
    },
    openSelectPlasmidGeneDialog() {
      this.selectPlasmidGeneOpen = true;
      this.$nextTick(function () {
        this.$refs.plasmidGenePage.getList();
      });
    },
    cancelSelectPlasmidGene() {
      this.selectPlasmidGeneOpen = false;
    },
    confirmSelectPlasmidGene(item) {
      this.plasmidGeneList.unshift(item);
      this.geneIdArr.push(item.geneId);
      this.selectPlasmidGeneOpen = false;
    },
    confirmSelectPlasmidGeneArr(arr) {
      let that = this;
      arr &&
        arr.length > 0 &&
        arr.forEach((item) => {
          that.geneIdArr.push(item.geneId);
          that.plasmidGeneList.unshift(item);
        });
      that.selectPlasmidGeneOpen = false;
    },
    //去除物料标签
    handleRemove(index, row) {
      this.geneIdArr.splice(this.geneIdArr.indexOf(row.geneId), 1);
      this.plasmidGeneList.splice(index, 1);
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
      this.ids = selection.map((item) => item.orderId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.plasmidGeneList = [];
      this.title = "添加质粒订单";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const orderId = row.orderId || this.ids;
      getOrder(orderId).then((response) => {
        this.form = response.data;
        this.plasmidGeneList = response.data.geneList;
        this.open = true;
        this.title = "修改质粒订单";
      });
    },
    /** 提交按钮-新增 */
    submitFormAdd() {
      let that = this;
      if(!that.geneIdList || that.geneIdList.length === 0){
        that.$modal.msgError("请选择至少一个质粒");
        return;
      }
      that.$modal.confirm('是否确认创建订单？').then(function() {            
            that.form.geneIdList = this.geneIdArr;
            that.form.geneList = [];
            addOrder(this.form).then(response => {
            that.$modal.msgSuccess("新增成功");
            that.open = false;
            that.getList();
            that.reset();
            that.geneIdArr = [];
            that.plasmidGeneList = [];
            });
        });
    },
    /** 提交按钮-新增 */
    submitFormUpdate() {

    },
    submitForm() {
      let that = this;
      if(!that.geneIdArr || that.geneIdArr.length === 0){
        that.$modal.msgError("请选择至少一个质粒");
        return;
      }
      that.$refs["form"].validate((valid) => {
        if (valid) {
            that.form.geneIdList = that.geneIdArr;
          if (that.form.orderId != null) {
            updateOrder(that.form).then((response) => {
              that.$modal.msgSuccess("修改成功");
              that.open = false;
              that.getList();
            });
          } else {
            that.$modal.confirm('是否确认创建订单？').then(function() {            
            // this.form.orderType = 'purchase';
            console.log(that.form)
            addOrder(that.form).then(response => {
            that.$modal.msgSuccess("新增成功");
            that.open = false;
            that.getList();
            that.reset();
            that.geneIdArr = [];
            that.plasmidGeneList = [];
            });
        });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const orderIds = row.orderId || this.ids;
      this.$modal
        .confirm('是否确认删除质粒订单编号为"' + orderIds + '"的数据项？')
        .then(function () {
          return delOrder(orderIds);
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
        "plasmid/order/export",
        {
          ...this.queryParams,
        },
        `order_${new Date().getTime()}.xlsx`
      );
    },
    formatStatus(statusCode) {
      return this.statusDict[statusCode];
    },
    formatStatusStyle(statusCode) {
      return { color: this.statusColor[statusCode] };
    },
    handleChangeStatus(status){
      this.newStatus = status;
      var request = {
        orderIds: this.ids,
        orderStatus: this.newStatus,
        // remarkString: this.checkform.remark,
      };
      updateOrderStatus(request).then(() => {
        this.getList();
        // this.checkform = {};
        this.$modal.msgSuccess("更改成功");
      });
    }
  },
};
</script>
