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
      <el-form-item label="物料名称" prop="matName">
        <el-select
          v-model="queryParams.matName"
          placeholder="物料名称"
          clearable
          filterable
          style="width: 200px"
        >
          <el-option
            v-for="item in matNames"
            :key="item"
            :label="item"
            :value="item"
          >
          </el-option
        ></el-select>
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
      <el-form-item label="操作者" prop="manageBy">
        <el-select
          v-model="queryParams.createBy"
          clearable
          placeholder="请选择操作者"
        >
          <el-option
            v-for="item in userList"
            :key="item.userName"
            :label="item.nickName"
            :value="item.userName"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="实验室" prop="workshopCode">
        <el-select
          v-model="queryParams.workshopCode"
          placeholder="请选择实验室"
          clearable
        >
          <el-option
            v-for="item in workshopList"
            :key="item.workshopCode"
            :label="item.workshopName"
            :value="item.workshopCode"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="操作时间">
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
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="default"
          plain
          icon="el-icon-view"
          size="mini"
          @click="handleView"
          >查看数据</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['vista:chart:export']"
          >导出</el-button
        >
      </el-col>
      <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar> -->
    </el-row>
    <div style="display: flex">
      <!-- 左侧选择区 -->

<div style="display: flex; flex-direction: column; gap: 16px; width: 200px; max-width: 500px; margin-left: 20px;margin-right: 20px;">
  <div style="display: flex; align-items: center; gap: 12px;">
    <div style="display: flex; align-items: center; min-width: 40px;">
       <span style="font-size: 18px; color: #606266; vertical-align: middle;">
      <i class="el-icon-data-analysis"></i>
    </span>
    </div>
    <el-select v-model="chartType" placeholder="图表类型" style="flex: 1;">
      <el-option label="柱状图" value="bar"></el-option>
      <el-option label="线图" value="line"></el-option>
    </el-select>
  </div>
  
  <div style="display: flex; align-items: center; gap: 12px;">
    <label style="font-size: 13px; color: #606266; min-width: 40px;">横轴</label>
    <el-select v-model="xLabel" placeholder="选择横坐标" clearable style="flex: 1;">
      <el-option
    v-for="item in options"
    :key="item.value"
    :label="item.label"
    :value="item.value"
  ></el-option>
    </el-select>
  </div>
  
  <div style="display: flex; align-items: center; gap: 12px;">
    <label style="font-size: 13px; color: #606266; min-width: 40px;">类别</label>
    <el-select v-model="classType" placeholder="选择类别" clearable style="flex: 1;">
      <el-option
    v-for="item in options"
    :key="item.value"
    :label="item.label"
    :value="item.value"
  ></el-option>
    </el-select>
  </div>
</div>
      <!-- 右侧图表区 -->
      <el-card
        class="box-card"
        shadow="hover"
        style="flex: 1; margin-bottom: 20px"
      >
        <MultiLineChart v-if="chartType=='line'" :initData="initData" />
        <StackedBarChart v-if="chartType=='bar'" :initData="initData" />
      </el-card>
    </div>
    <el-dialog 
      append-to-body 
      :title="'成图数据'" 
      :visible.sync="openView" 
      :close-on-click-modal="false">
      <el-table :data="chartData" style="width: 100%">
  <el-table-column
     :label="getLabelByValue(xLabel)"
    prop="xLabel"
    align="center"
  />
  <el-table-column
     :label="getLabelByValue(classType)"
    prop="classType"
    align="center"
  />
  <el-table-column
    label="数量"
    prop="quantity"
    align="center"
  />
</el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="handleView"
    />
    </el-dialog>
  </div>
</template>

<script>
import { listAllWorkshop } from "@/api/base/workshop";
import { listAllTag } from "@/api/base/tag";
import { getRecordMatNames } from "@/api/stock/record";
import { getVistaChartData, getVistaChartDataPages } from "@/api/vista/activity";
import MultiLineChart from "./charts/MultiLineChart.vue";
import StackedBarChart from "./charts/StackedBarChart.vue";
import { listUserAll } from "@/api/system/user";

export default {
  name: "VistaChartMain",
  components: {
    MultiLineChart,
    StackedBarChart
  },
  data() {
  return {
    loading: false,
    showSearch: true, // 添加这个
    // 总条数
    total: 0,
    queryParams: {
      pageNum: 1,
      pageSize: 10,
      matCode: "",
      matName: "",
      matTag: "",
      batch: "",
      locationCode: "",
      workshopCode: "",
      updateBy: "",
    },
    userList: [],
    tagList: [],
    dateRange: [],
    initData: [],
    workshopList: [],
    workshopDict: {},
    xLabel: "",
    classType: "",
    chartType: "bar",
    matNames: [], // 添加这个
    openView: false,
    chartData: [],
    options: [
        { label: "物料名称", value: "mat_name" },
        { label: "物品标签", value: "mat_tag" },
        { label: "操作人", value: "create_by" },
        { label: "实验室", value: "workshop_code" },
        { label: "操作时间", value: "create_time" },
        { label: "操作类型", value: "record_type" }
      ],
    
  };
},
  created() {
    this.handleGetRecordMatNames();
    this.getWorkshopList();
    this.getTagList();
    this.getUserList();
  },
  methods: {
    handleQuery() {
      // 执行查询操作
      if (
        this.xLabel == "" ||
        this.xLabel.length === 0 
      ) {
        this.$message.warning("请选择图表横坐标！");
        return;
      }
      // var chartNo = this.getChartNo();
      var chartNo = 0;
      var chartParams = {};

      chartParams['xLabel'] = this.xLabel;
      chartParams['classType'] = this.classType;
      this.addDateRange(this.queryParams, this.dateRange)
      Object.assign(this.queryParams.params, chartParams);

      getVistaChartData(
        chartNo,
        this.queryParams
      )
        .then((res) => {
          this.loading = false;
          var resData = res.data || [];
          resData = resData.filter(item => item.classType != null && item.classType !== '');
          if(this.xLabel == "create_time"){
            var classType = resData.map(item => item.classType);
            resData = this.completeDateAxisMultipleTypes(resData, classType);
          }
          this.initData = resData;
        })
        .catch(() => {});
    },
    completeDateAxisMultipleTypes(data, classTypes = ["管理员"]) {
  // 获取所有日期
  const dates = data.map(item => new Date(item.xLabel));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  
  // 按日期和类型组织数据
  const dataMap = new Map();
  data.forEach(item => {
    const key = `${item.xLabel}_${item.classType}`;
    dataMap.set(key, item);
  });

  const result = [];
  const currentDate = new Date(minDate);
  
  while (currentDate <= maxDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    classTypes.forEach(classType => {
      const key = `${dateStr}_${classType}`;
      
      if (dataMap.has(key)) {
        result.push(dataMap.get(key));
      } else {
        result.push({
          xLabel: dateStr,
          quantity: 0,
          classType: classType,
          xlabel: dateStr
        });
      }
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
},
    getChartNo() {
      //   p1
      // input: matName,
      // outPut: xLabel: date, classType: recordType,
      if (
        this.queryParams.matName &&
        this.queryParams.matName != "" &&
        this.xLabel == "createTime" &&
        (this.classType == "recordType" || this.classType == "")
      ) {
        this.classType = "recordType";
        return 1;
      }
      //   p2
      // input: matName,
      // outPut: xLabel: workshopCode, classType: matName,
      else if (
        this.queryParams.matName &&
        this.queryParams.matName != "" &&
        this.xLabel == "workshopCode" &&
        (this.classType == "matName" || this.classType == "")
      ) {
        this.classType = "matName";
        return 2;
      }
      //   p3
      // input: matName,
      // outPut: nicnName: , classType: recordType,
      else if (
        this.queryParams.matName &&
        this.queryParams.matName != "" &&
        this.xLabel == "createBy" &&
        (this.classType == "recordType" || this.classType == "")
      ) {
        this.classType = "recordType";
        return 3;
      }
      //   p4
      // input: createBy,
      // outPut: xLabel: matName, classType: recordType,,
      else if (
        this.queryParams.createBy &&
        this.queryParams.createBy != "" &&
        this.xLabel == "matName" &&
        (this.classType == "recordType" || this.classType == "")
      ) {
        this.classType = "recordType";
        return 4;
      }
      //   p5
      // input: createBy,
      // outPut: xLabel: matTag, classType: recordType,
      else if (
        this.queryParams.createBy &&
        this.queryParams.createBy != "" &&
        this.xLabel == "matTag" &&
        (this.classType == "recordType" || this.classType == "")
      ) {
        this.classType = "recordType";
        return 5;
      }
      //   p6
      // input: createBy,
      // outPut: xLabel: createTime, classType: recordType,
      else if (
        this.queryParams.createBy &&
        this.queryParams.createBy != "" &&
        this.xLabel == "createTime" &&
        (this.classType == "recordType" || this.classType == "")
      ) {
        this.classType = "recordType";
        return 6;
      }
      //   p7
      // input: createBy,
      // outPut: xLabel: workshopCode, classType: recordType,
      else if (
        this.queryParams.createBy &&
        this.queryParams.createBy != "" &&
        this.xLabel == "workshopCode" &&
        (this.classType == "recordType" || this.classType == "")
      ) {
        this.classType = "recordType";
        return 7;
      }
      //   p8
      // input: workshopCode,
      // outPut: xLabel: classType, classType: recordType
      else if (
        this.queryParams.workshopCode &&
        this.queryParams.workshopCode != "" &&
        this.xLabel == "classType" &&
        this.classType == ""
      ) {
        this.classType = "recordType";
        return 8;
      }
      //   p9
      // input: workshopCode,
      // outPut: xLabel: matTag, classType: recordType
      else if (
        this.queryParams.workshopCode &&
        this.queryParams.workshopCode != "" &&
        this.xLabel == "matTag" &&
        (this.classType == "recordType" || this.classType == "")
      ) {
        this.classType = "recordType";
        return 9;
      }
      //   p10
      // input: workshopCode,
      // outPut: xLabel: createTime, classType: recordType
      else if (
        this.queryParams.workshopCode &&
        this.queryParams.workshopCode != "" &&
        this.xLabel == "createTime" &&
        (this.classType == "recordType" || this.classType == "")
      ) {
        this.classType = "recordType";
        return 10;
      }
      //   p11
      // input: null,
      // outPut: xLabel: matName, classType: recordType,
      else if (
        this.xLabel == "matName" &&
        (this.classType == "recordType" || this.classType == "")
      ) {
        this.classType = "recordType";
        return 11;
      }
      //   p12
      // input: null,
      // outPut: xLabel: matTag, classType: recordType,
      else if (
        this.xLabel == "matTag" &&
        (this.classType == "recordType" || this.classType == "")
      ) {
        this.classType = "recordType";
        return 12;
      }
      //   p13
      // input: null,
      // outPut: xLabel: createBy, classType: recordType,
      else if (
        this.xLabel == "createBy" &&
        (this.classType == "recordType" || this.classType == "")
      ) {
        this.classType = "recordType";
        return 13;
      }
      //   p14
      // input: null,
      // outPut: xLabel: matName, classType: createBy,
      else if (
        this.xLabel == "matName" &&
        this.classType == "createBy" 
      ) {
        return 14;
      }      
      //   p15
      // input: null,
      // outPut: xLabel: matTag, classType: createBy,
      else if (
        this.xLabel == "matTag" &&
        this.classType == "createBy" 
      ) {
        return 15;
      } 
      //   p16
      // input: null,
      // outPut: xLabel: matName, classType: workshopCode,
      else if (
        this.xLabel == "matName" &&
        this.classType == "workshopCode"
      ) {
        return 16;
      } 
      //   p17
      // input: null,
      // outPut: xLabel: matTag, classType: workshopCode,
      else if (
        this.xLabel == "matTag" &&
        this.classType == "workshopCode"
      ) {
        return 17;
      } 
       //   p18
      // input: null,
      // outPut: xLabel: createTime, classType: workshopCode,
      else if (
        this.xLabel == "createTime" &&
        this.classType == "workshopCode"
      ) {
        return 18;
      } 
      else {
        return 0;
      }
    },
    getCurVal() {
      // 获取当前值的逻辑
    },
    handleGetRecordMatNames() {
      getRecordMatNames().then((res) => {
        this.matNames = res.data;
      });
    },
    getUserList() {
      listUserAll().then((response) => {
        this.userList = response;
        console.log(this.userList);
      });
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
    getTagList() {
      listAllTag().then((response) => {
        this.tagList = response;
      });
    },

    handleView(){
      if (
        this.xLabel == "" ||
        this.xLabel.length === 0 
      ) {
        this.$message.warning("请选择图表横坐标！");
        return;
      }
      if (
        this.classType == "" ||
        this.classType.length === 0 
      ) {
        this.classType = 'record_type';
        return;
      }
      var chartParams = {};

      chartParams['xLabel'] = this.xLabel;
      chartParams['classType'] = this.classType;
      this.addDateRange(this.queryParams, this.dateRange)
      Object.assign(this.queryParams.params, chartParams);
      getVistaChartDataPages(
        this.queryParams
      ).then(res => {
        let resData = res.rows  || [];
        resData = resData.filter(item => item.classType != null && item.classType !== '');
        this.chartData = resData
        console.log(this.chartData);
        this.total = res.total;
        this.openView = true;
      })
    },
    handleClose(){
      this.openView = false;
    },
    handleExport(){
      this.download(
        "vista/chart/export",
        {
          ...this.queryParams
        },
        `vista_${new Date().getTime()}.xlsx`
      );
    },
    getLabelByValue(val) {
    const opt = this.options.find(opt => opt.value === val);
    return opt ? opt.label : val;
  },
  },
};
</script>
