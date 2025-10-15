<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="项目流水号" prop="projectNo">
        <el-input
          v-model="queryParams.projectNo"
          placeholder="请输入项目流水号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="项目名称" prop="projectName">
        <el-input
          v-model="queryParams.projectName"
          placeholder="请输入项目名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="项目负责人" prop="manageBy">
        <el-select
          v-model="queryParams.manageBy"
          placeholder="请选择项目负责人"
        >
          <el-option
            v-for="item in userList"
            :key="item.userName"
            :label="item.nickName"
            :value="item.userName"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="项目日期">
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          clearable
        ></el-date-picker>
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
          v-hasPermi="['plasmid:experiment:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['plasmid:experiment:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['plasmid:experiment:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['plasmid:experiment:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          :disabled="multiple"
          @click="handleProgress"
          v-hasPermi="['plasmid:experiment:edit']"
          >更新进展</el-button
        >
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-row :gutter="10" class="mb8">
  <el-col :span="6">
    <el-button-group>
      <el-button
        size="mini"
        :type="queryParams.status === '0' ? 'primary' : 'default'"
        icon="el-icon-time"
        @click="filterStatus('0')"
      >未开始</el-button>
      <el-button
        size="mini"
        :type="queryParams.status === '1' ? 'primary' : 'default'"
        icon="el-icon-refresh"
        @click="filterStatus('1')"
      >进行中</el-button>
      <el-button
        size="mini"
        :type="queryParams.status === '2' ? 'primary' : 'default'"
        icon="el-icon-folder"
        @click="filterStatus('2')"
      >已归档</el-button>
    </el-button-group>
  </el-col>
</el-row>
    <el-table v-loading="loading" :data="pivotTableData" 
    style="width: 100%; border-color: white"
      border
      :row-style="{ height: '20px' }"
      :cell-style="{ padding: '0px' }"
      :header-cell-style="{ color: '#606266' }"
    @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="项目流水号" align="center" prop="projectNo" width="100"/>
      <el-table-column label="项目名称" align="center" prop="projectName" width="200"/>
      <el-table-column label="项目负责人" align="center" prop="manageByNickName" width="100"/>
      <!-- <el-table-column label="项目状态" align="center" prop="projectStatus" width="100"/> -->
      <el-table-column
        v-for="date in recordDateColumns"
        :key="date"
        :label="date"
        :prop="date"
        align="center"
        min-width="140"
        max-width="200"
      />
      <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['plasmid:experiment:edit']"
            :disabled="scope.row.status === '2'"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            :disabled="scope.row.status === '2'"
            v-hasPermi="['plasmid:experiment:remove']"
          >删除</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-notebook-1"
            @click="handleRecord(scope.row)"
          >实验进展</el-button>
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

    <!-- 添加或修改质粒模块-实验管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="80%" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
        <el-col :span="12">
        <el-form-item label="项目流水号" prop="projectNo" label-width="120px">
          <el-input v-model="form.projectNo" placeholder="系统生成" disabled/>
        </el-form-item>
        </el-col>
        <el-col :span="12">
        <el-form-item label="项目名称" prop="projectName" label-width="120px">
          <el-input v-model="form.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        </el-col></el-row>
        <el-row>
        <el-col :span="12">
        <el-form-item
              label="项目负责人"
              prop="manageBy"
              label-width="120px"
            >
              <el-select v-model="form.manageBy" placeholder="请选择项目负责人">
                <el-option
                  v-for="item in userList"
                  :key="item.userName"
                  :label="item.nickName"
                  :value="item.userName"
                ></el-option>
              </el-select>
            </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目状态" prop="status" label-width="120px">
      <el-select v-model="form.status" placeholder="请选择项目状态">
        <el-option label="未开始" value="0"></el-option>
        <el-option label="进行中" value="1"></el-option>
        <el-option label="已归档" value="2"></el-option>
      </el-select>
    </el-form-item>
          </el-col></el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="选择质粒">
              <el-button
                size="small"
                type="success"
                icon="el-icon-search"
                @click="openSelectPlasmidGeneDialog"
                >质粒清单</el-button
              >
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-table :data="plasmidGeneList" style="width: 100%">
        <el-table-column type="selection" :selectable="checkSelectable" width="55" align="center" />
        <el-table-column label="基因名" align="center" prop="geneName" width="200"/>
        <!-- <el-table-column label="基因名" align="center" prop="geneName" width="260" resizable>
          <template slot-scope="scope">
          <el-tooltip v-if="scope.row.geneName!=null" effect="light" placement="top">
            <div class="content" slot="content" v-html="scope.row.geneName"></div>
            <div class="oneLine"> {{scope.row.geneName}}</div>
          </el-tooltip>
        </template>
        </el-table-column> -->
        <el-table-column label="线性酶切" align="center" prop="linearDigestion" />
        <el-table-column label="抗性基因" align="center" prop="resistanceGene" />
        <el-table-column label="实验进展" align="center" prop="progressStatus" />
        <el-table-column label="批次" align="center" prop="batch" />
        <el-table-column label="备注" align="center" prop="remark" resizable>
          <template slot-scope="scope">
          <el-tooltip v-if="scope.row.remark!=null" effect="light" placement="top">
            <div class="content" slot="content" v-html="scope.row.remark"></div>
            <div class="oneLine"> {{scope.row.remark}}</div>
          </el-tooltip>
        </template>
        </el-table-column>
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
    <el-dialog
      :title="'项目进展'"
      :visible.sync="openProgress"
      width="80%"
      append-to-body>
      <el-form :inline="true" style="margin-bottom: 16px;">
        <el-form-item label="项目进展日期">
          <el-date-picker
            v-model="recordDate"
            type="date"
            placeholder="请选择日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
      </el-form>
      <el-table :data="newProgressList" style="width: 100%">
        <el-table-column label="项目流水号" align="center" prop="projectNo" />
        <el-table-column label="项目名称" align="center" prop="projectName" />
        <el-table-column label="项目负责人" align="center" prop="manageByNickName"  />
        <el-table-column label="项目状态" align="center" prop="projectStatus" />
        <el-table-column label="更新状态" align="center" prop="newStatus" width="260">
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.newStatus"
              type="textarea"
              placeholder="请输入更新状态"
            />
          </template>
        </el-table-column>
        </el-table
      >
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmitProgress">确 定</el-button>
        <el-button @click="handleCancelProgress">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listExperiment, getExperiment, delExperiment, addExperiment, updateExperiment, checkPermission,updateExperimentProgress } from "@/api/plasmid/experiment";
import { 
  listGene,
  submitDoneGeneByGeneIds
 } from "@/api/plasmid/gene";
import  { getDictDataListByDictType } from "@/api/plasmid/dictData"
import selectPlasmidGene from "../../components/select-plasmid-geneExp/index";
import { getDicts } from "@/api/system/dict/data";
import { Message } from 'element-ui';
import { listUserAll } from "@/api/system/user";
export default {
  name: "Experiment",
  components: { selectPlasmidGene },
  dicts: ['plasmid_field'],
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
      // 质粒模块-实验管理表格数据
      experimentList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        projectNo: null,
        projectName: null,
        manageBy: null,
        status: '1'  // 默认显示进行中, 可选值：unstarted, 1, 2        
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        // projectNo: [
        //   { required: true, message: "项目流水号不能为空", trigger: "blur" }
        // ],
        projectName: [
          { required: true, message: "项目名称不能为空", trigger: "blur" }
        ],
      },
      selectPlasmidGeneOpen: false,
      geneIdArr: [],
      plasmidGeneList: [],
      userList: [],
      openProgress: false,
      newProgressList: [],
      recordDate: '',
      recordDateColumns: [],
      pivotTableData: [],
      dateRange: [],
      statusFilter: '未开始', // 默认过滤状态
    };
  },
  created() {
    this.initDateRange();
    this.getList();
    this.getUserList();
  },
  computed: {
  filteredPivotTableData() {
    // projectStatus字段值需和标签对应
    const statusMap = {
      '未开始': '0',
      '进行中': '1',
      '已归档': '2'
    };
    this.getList();
    return this.pivotTableData.filter(item => item.projectStatus === statusMap[this.statusFilter]);
  }
},
  methods: {
    filterStatus(status) {
      this.queryParams.status = status;
      this.getList();
    // 只需触发刷新，computed会自动更新
  },
    initDateRange(){
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
          // 格式化为 yyyy-MM-dd
      const format = date => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };

      this.dateRange = [format(start), format(end)];
    },
    handleProgress(row) {
      const expIds = row.expId || this.ids;
      this.newProgressList = this.experimentList.filter(item => expIds.includes(item.expId));
      this.openProgress = true;
    },
    handleCancelProgress(){
      this.openProgress = false;
    },
    handleSubmitProgress() {
      if (!this.recordDate) {
        Message.error("请选择实验进展日期");
        return;
      }
      this.newProgressList.forEach(item => {
        item.recordDate = this.recordDate;
        item.projectStatus = item.newStatus; // 假设新状态为当前项目状态
        updateExperimentProgress(item).then(() => {
          Message.success(item.projectName + "实验进展更新成功");
        }).catch(() => {
          Message.error(item.projectName + "实验进展更新失败");
        });
      });
      this.openProgress = false;
      this.getList();
    },
    getUserList() {
      listUserAll().then((response) => {
        this.userList = response;
      });
    },
    handleRecord(row){
      this.$router.push({path: '/plasmid/experiment/experiment-list/index/' + row.projectNo});
    },
     //是否可选
    checkSelectable(row, index){
      if(this.geneIdArr.indexOf(row.geneId) >= 0){
        return false;
      }else{
        return true;
      }
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
    //去除质粒
    handleRemove(index, row) {
      this.geneIdArr.splice(this.geneIdArr.indexOf(row.geneId), 1);
      this.plasmidGeneList.splice(index, 1);
    },
    /** 查询质粒模块-实验管理列表 */
    getList() {
      this.loading = true;
      listExperiment(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.experimentList = response.rows;
        // 处理所有progressList，收集所有recordDate
        let allDates = new Set();
        // 透视化每个项目
        this.pivotTableData = this.experimentList
          .map(item => {
            let row = {
              projectNo: item.projectNo,
              projectName: item.projectName,
              manageBy: item.manageBy,
              manageByNickName: item.manageByNickName,
              projectStatus: item.projectStatus,
              expId: item.expId,
              status: item.status
            };
            (item.progressList || []).forEach(d => {   
              let projectStatus = d.projectStatus.trim();
              if(projectStatus !== undefined && projectStatus !== null && projectStatus !== '' && projectStatus.length > 0){
                row[d.recordDate] = projectStatus;
                allDates.add(d.recordDate);
              } 
            });
            return row;
          });
          this.recordDateColumns = Array.from(allDates).sort((a, b) => new Date(b) - new Date(a));
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
        expId: null,
        projectNo: null,
        projectName: null,
        manageBy: null,
        projectStatus: "0",
        designUser: null,
        cmcUser: null,
        vitroUser: null,
        analyseUser: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        delFlag: null,
        remark: null
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
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.expId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加实验项目管理";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const expId = row.expId || this.ids
      console.log(row)
      const params = {manageBy:row.manageBy, createBy:row.createBy, expId:expId}
      // 修改权限验证
      // checkPermission(params).then(response => {
      //   if(response == 0){
      //     Message.error("无权限！")
      //     return;
      //   } else {
      //       getExperiment(expId).then(response => {
      //         this.form = response.data;
      //         this.plasmidGeneList = response.data.detailList;
      //         this.open = true;
      //         this.title = "修改质粒模块-实验管理";
      //       });
      //   }
      // });
      getExperiment(expId).then(response => {
              this.form = response.data;
              this.plasmidGeneList = response.data.detailList;
              this.open = true;
              this.title = "修改质粒模块-实验管理";
            });
      
    },
    
    /** 提交按钮 */
    submitForm() {
      checkPermission({manageBy:this.form.manageBy, createBy:this.form.createBy}).then(response => {
        if(response == 0){
          // Message.error("无权限！")
          // return;
        }
        this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.geneIdList = this.geneIdArr;
          if (this.form.expId != null) {
            updateExperiment(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addExperiment(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
        })
      
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const expIds = row.expId || this.ids;
      checkPermission({manageBy:row.manageBy, createBy:row.createBy}).then(response => {
        if(response == 0){
          Message.error("无权限！")
          return;
        }
        this.$modal.confirm('是否确认删除质粒模块-实验管理编号为"' + expIds + '"的数据项？').then(function() {
            return delExperiment(expIds);
          }).then(() => {
            this.getList();
            this.$modal.msgSuccess("删除成功");
          }).catch(() => {});

          })
      
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('plasmid/experiment/export', {
        ...this.queryParams
      }, `experiment_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
