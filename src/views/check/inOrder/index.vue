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
      <el-form-item label="单据号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入单据号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="检验状态" prop="checkStatus">
        <el-select v-model="queryParams.checkStatus" placeholder="请选择">
          <el-option
            v-for="item in checkStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="检验员" prop="checkBy">
        <el-input
          v-model="queryParams.checkBy"
          placeholder="请输入检验员"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间">
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

    <el-table v-loading="loading" :data="inOrderList">
      <el-table-column label="单据号" align="center" prop="orderNo" />
      <el-table-column label="单据类型" align="center" prop="orderTypeLabel" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{
            $moment(scope.row.createTime).format("YYYY-MM-DD HH:mm")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="检验状态"
        align="center"
        prop="checkStatusLabel"
      />
      <el-table-column label="检验员" align="center" prop="checkBy" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.checkStatus === 'un_checkout'"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleCheck(scope.row)"
            v-hasPermi="['stock:inOrder:edit']"
            >检验</el-button
          >
          <el-button
            v-if="scope.row.checkStatus === 'checkout'"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleCheck(scope.row)"
            v-hasPermi="['stock:inOrder:edit']"
            >详情</el-button
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

    <!-- 入库单质检对话框 -->
    <el-dialog
      :title="'入库单质检'"
      :visible.sync="inOrderDetailOpen"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
      :rules="rules"
    >
      <el-form ref="form" :model="form" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="入库单号：">
              <span>{{ form.orderNo }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入库单类型：">
              <span>{{ form.orderTypeLabel }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="创建时间：">
              <span>{{
                $moment(form.createTime).format("YYYY-MM-DD HH:mm")
              }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创建人：">
              <span>{{ form.createBy }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row>
          <el-col :span="24">
            <el-form-item label="COA上传">
              <!-- <template> -->
                <div v-show="ifCamera">
                  <video
                    v-if="ifCamera" 
                    id="videoCamera"
                    :width="videoWidth"
                    :height="videoHeight"
                    autoplay
                  ></video>
                  <canvas
                    id="canvasCamera"
                    style="display: none"
                    :width="videoWidth"
                    :height="videoHeight"
                  ></canvas>
                  <div>                  
                    <el-button @click="setImage()">拍照</el-button>
                    <el-button @click ='switchCamera()'>切换摄像头</el-button>
                  </div>
                </div>

                <el-button
                  v-if="form.checkStatus === 'un_checkout'"
                  v-model="form.coaPic"
                  @click="getCompetence"
                  clearable
                  @keyup.enter.native="handleQuery"
                  >打开摄像头</el-button
                >

                <el-button
                  v-if="form.checkStatus === 'un_checkout'"
                  v-model="form.coaPic"
                  @click="uploadLocalPic()"
                  clearable
                  @keyup.enter.native="handleQuery"
                  >本地上传图片</el-button
                >
                <el-button
                  v-if="form.checkStatus === 'un_checkout'"
                  type="info"
                  plain
                  icon="el-icon-upload2"
                  size="mini"
                  @click="handleImport"
                >导入PDF</el-button>
                </el-form-item>
                </el-col>
                
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="codPdf：" v-model="coaPdf">
              <span>{{ form.coaPdf }}</span>
              <el-button 
                  v-if="form.checkStatus === 'checkout' && form.coaPdf !== null"
                  type="info"
                  plain
                  icon="el-icon-printer"
                  size="mini"
                  @click="viewPdf"
              >PDF预览</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <div
            class="image-container"
            v-for="(image, index) in picList"
            :key="index"
            @mouseenter="showDeleteBtn(index)"
            @mouseleave="hideDeleteBtn()"
          >
            <img 
              :src="image" 
              height="300px"
              width="500px"
              v-if="image && form.coaPicList"                  
              alt="预览"
            />
            <button v-if="hoverIndex === index && form.checkStatus === 'un_checkout'" @click="deleteImage(index)">删除</button>
          </div>
          
        </el-row>
      </el-form>

      <el-table :data="inOrderDetailList" style="width: 100%">
        <el-table-column label="行号" align="center" type="index" />
        <el-table-column
          label="物料编码"
          align="center"
          prop="matCode"
          width="100"
        />
        <el-table-column
          label="物料名称"
          align="center"
          prop="matName"
          width="120"
        />
        <el-table-column
          label="集团编码"
          align="center"
          prop="fdCode"
          width="100"
        />
        <el-table-column
          label="规格"
          align="center"
          prop="figNum"
          width="120"
        />
        <el-table-column
          label="数量"
          align="center"
          prop="quantity"
          width="80"
        />
        <el-table-column
          label="合格数量"
          align="center"
          prop="qualifiedQuantity"
          width="100"
        >
          <template slot-scope="scope">
            <el-input-number
              v-if="form.checkStatus === 'un_checkout'"
              v-model="scope.row.qualifiedQuantity"
              style="width: 90px"
              size="small"
              controls-position="right"
              :min="0"
              :max="scope.row.quantity"
              integer
            />
            <span v-if="form.checkStatus === 'checkout'">{{
              scope.row.qualifiedQuantity
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="单价"
          align="center"
          prop="unitPrice"
          width="80"
        />
        <el-table-column label="单位" align="center" prop="unitCode" width="50">
          <template slot-scope="scope">
            <dict-tag
              :options="dict.type.base_mat_unit"
              :value="scope.row.unitCode"
            />
          </template>
        </el-table-column>
        <el-table-column label="批次" align="center" prop="batch" width="180" />
        <el-table-column
          label="供应商"
          align="center"
          prop="supplierName"
          width="180"
        />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          v-if="form.checkStatus === 'un_checkout'"
          @click="confirmCheck()"
          >确 认</el-button
        >
        <el-button @click="cancelOrderDetail">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 物料COA check导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body :close-on-click-modal="false">
      <el-upload
        ref="upload"
        :limit="1"
        accept=".pdf"
        :on-success="handelUploadPdfSuccess"
        :on-error="handelUploadPdfError"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <div class="el-upload__tip" slot="tip">
            将覆盖已经存在的物料Bom
          </div>
          <span>仅允许导入pdf格式文件。</span>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listInOrder,
  getInOrder,
  checkInOrderCoa,
  checkInOrder,
  getCoaPdfInfo,
} from "@/api/stock/inOrder";
import store from "@/store";
import { Message } from 'element-ui';
import { getToken } from "@/utils/auth";
export default {
  name: "InOrder",
  dicts: ["base_mat_unit"],
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
      // 入库单表格数据
      inOrderList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      postData: {},
      checkQualifiedQuantity0: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderNo: null,
        orderType: null,
        orderStatus: null,
        checkStatus: null,
        checkBy: null,
      },
      // 表单参数
      form: {},
      coaDict: {},
      rules: {
        // coaAddr: [
        //   { required: true, message: "COA文件地址不能为空", trigger: "blur" }
        // ],
      },
      // 日期范围
      dateRange: [],
      picList:[],
      hoverIndex: null,
      //检验状态
      checkStatusOptions: [
        { value: "un_checkout", label: "未检验" },
        { value: "checkout", label: "已检验" },
      ],

      //入库单详情
      inOrderDetailOpen: false,
      inOrderDetailList: [],
      videoWidth: 300,
      videoHeight: 300,
      imageSrc: null,
      coaPdf: null,
      coaPdfUpload: false,
      sysFileName: null,
      thisCancas: null,
      thisContext: null,
      thisVideo: null,
      headers: {
        Authorization: "Bearer " + store.getters.access_token,
      },
      ifCamera: false,
      video: null,
      mediaStream: null,
      backCameraId: null,  // 后置摄像头的ID
      frontCameraId: null,  // 前置摄像头的ID
      // 上传Pdf参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/stock/inOrder/checkPdf/"
      },
      
    };
  },
  created() {
    this.getList();
    // this.switchCamera();
  },
  mounted() {
    console.log("this.ifCamera"+this.ifCamera)
    if(this.ifCamera){
      this.video = document.getElementById('videoCamera');
      this.getCameraStream();
    }
    
  },
  handleAvatarSuccess(res, file) {
      this.$emit('refreshDataList', res.data.url)
    },
  methods: {
    showDeleteBtn(index) {
      this.hoverIndex = index;
    },
    hideDeleteBtn() {
      this.hoverIndex = null;
    },
    deleteImage(index) {
      this.picList.splice(index, 1);
    },
    /** 查询入库单列表 */
    getList() {
      this.loading = true;
      listInOrder(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.inOrderList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.imageSrc= null,
      this.coaPdf- null,
      this.form = {
        orderId: null,
        orderNo: null,
        orderType: null,
        orderStatus: "0",
        checkStatus: "0",
        checkBy: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,        
        coaAddr: null
      };
      this.coaDict={},
      this.sysFileName= null,
      this.coaAddr = null,
      this.coaPdf =null,
      this.coaPdfUpload = false,
      this.resetForm("form");
    },
    reset_that(){
      that.imageSrc= null,
      that.checkQualifiedQuantity0= false
      that.coaPdfUpload = false,
      that.coaDict={},
      that.form = {
        orderId: null,
        orderNo: null,
        orderType: null,
        orderStatus: "0",
        checkStatus: "0",
        checkBy: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        coaAddr: null
      };
      that.resetForm("form");
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
    /** 详情按钮操作 */
    handleCheck(row) {
      this.reset();
      console.log("this.sysFileName")
      console.log(this.sysFileName)
      getInOrder(row.orderId).then((response) => {
        this.form = response.data;
        this.imageSrc = this.form['coaPicList'];   
        // this.imageSrc = [];  
        if(this.imageSrc){
          this.picList = this.imageSrc;
        }
        
        this.inOrderDetailList = response.data.detailList;
        this.inOrderDetailOpen = true;
      });
    },
    cancelOrderDetail() {
      this.reset();
      this.inOrderDetailList = [];
      this.inOrderDetailOpen = false;
    },
    // 调用权限（打开摄像头功能）
    getCompetence() {
      var _this = this;
      this.ifCamera = !this.ifCamera;
      this.thisCancas = document.getElementById("canvasCamera");
      this.thisVideo = document.getElementById("videoCamera");
      this.thisContext = this.thisCancas.getContext("2d");      
      // 旧版本浏览器可能根本不支持mediaDevices，我们首先设置一个空对象
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
      }
      // 一些浏览器实现了部分mediaDevices，我们不能只分配一个对象
      // 使用getUserMedia，因为它会覆盖现有的属性。
      // 这里，如果缺少getUserMedia属性，就添加它。
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
          // 首先获取现存的getUserMedia(如果存在)
          var getUserMedia =
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.getUserMedia;
          // 有些浏览器不支持，会返回错误信息
          // 保持接口一致
          if (!getUserMedia) {
            return Promise.reject(
              new Error("getUserMedia is not implemented in this browser")
            );
          }
          // 否则，使用Promise将调用包装到旧的navigator.getUserMedia
          return new Promise(function (resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        };
      }
      var constraints = {
        audio: false,
        video: {
          width: this.videoWidth,
          height: this.videoHeight,
          transform: "scaleX(-1)",
        },
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
          // 旧的浏览器可能没有srcObject
          if ("srcObject" in _this.thisVideo) {
            _this.thisVideo.srcObject = stream;
          } else {
            // 避免在新的浏览器中使用它，因为它正在被弃用。
            _this.thisVideo.src = window.URL.createObjectURL(stream);
          }
          _this.thisVideo.onloadedmetadata = function (e) {
            _this.thisVideo.play();
          };
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getCameraStream() {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        navigator.mediaDevices.enumerateDevices()
          .then(this.gotDevices)
          .catch(error => console.log('enumerateDevices error: ', error));
      }
    },
    gotDevices(deviceInfos) {
      console.log(deviceInfos);
      for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i];
        if (deviceInfo.kind === 'videoinput') {
            if (deviceInfo.facing === 'front') {
                this.frontCameraId = deviceInfo.deviceId;
            } else if (deviceInfo.facing === 'environment' || deviceInfo.facing === 'back') {
                this.backCameraId = deviceInfo.deviceId;
            }
        }
      }
      this.startStreaming(this.backCameraId);  // 默认使用后置摄像头
    },
    startStreaming(cameraId) {
      const constraints = {
        video: { deviceId: cameraId ? { exact: cameraId } : undefined }
      };
      navigator.mediaDevices.getUserMedia(constraints)
        .then(this.streamSuccess, this.streamFailure);
    },
    streamSuccess(stream) {
      window.stream = stream; // 暂存stream对象
      this.mediaStream = stream;  // 保存到组件的data中
      // this.video.srcObject = stream;
    },
    streamFailure(error) {
      console.log('Something went wrong!', error);
    },
    switchCamera() {
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
      }
      this.startStreaming(this.frontCameraId || this.backCameraId);
    },
  beforeDestroy() {
    if (this.mediaStream) {
      // 停止媒体流
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
  },    
    //  绘制图片（拍照功能）
    setImage() {
      this.ifCamera = false
      var _this = this;
      // 点击，canvas画图
      _this.thisContext.drawImage(
        _this.thisVideo,
        0,
        0,
        _this.videoWidth,
        _this.videoHeight,
      );
      // 获取图片base64链接
      var image = this.thisCancas.toDataURL("image/png");
      this.imageSrc = image;
      this.picList.unshift(this.imageSrc);
    },
    // base64图片转file的方法（base64图片, 设置生成file的文件名）
    base64ToFile(base64, fileName) {
      // 将base64按照 , 进行分割 将前缀  与后续内容分隔开
      const data = base64.split(",");
      // 利用正则表达式 从前缀中获取图片的类型信息（image/png、image/jpeg、image/webp等）
      const type = data[0].match(/:(.*?);/)[1];
      // 从图片的类型信息中 获取具体的文件格式后缀（png、jpeg、webp）
      const suffix = type.split("/")[1];
      // 使用atob()对base64数据进行解码  结果是一个文件数据流 以字符串的格式输出
      const bstr = window.atob(data[1]);
      // 获取解码结果字符串的长度
      let n = bstr.length;
      // 根据解码结果字符串的长度创建一个等长的整形数字数组
      // 但在创建时 所有元素初始值都为 0
      const u8arr = new Uint8Array(n);
      // 将整形数组的每个元素填充为解码结果字符串对应位置字符的UTF-16 编码单元
      while (n--) {
        // charCodeAt()：获取给定索引处字符对应的 UTF-16 代码单元
        u8arr[n] = bstr.charCodeAt(n);
      }
      // 利用构造函数创建File文件对象
      // new File(bits, name, options)
      const file = new File([u8arr], `${fileName}.${suffix}`, {
        type: type,
      });
      // 将File文件对象返回给方法的调用者
      return file;
    },
    // 关闭摄像头
    stopNavigator() {
      this.thisVideo.srcObject.getTracks()[0].stop();
    },

    uploadLocalPic() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ["image/*","pdf/*",];
      input.accept = "pdf/*";
      input.capture = "camera"; // 指定capture属性为camera，打开系统摄像头
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          console.log("upload success")
          const reader = new FileReader();
          reader.onload = (e) => {
            this.imageSrc = e.target.result; // 将图片的base64字符串设置为imageSrc
            this.picList.unshift(this.imageSrc);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click(); // 触发input的点击事件，打开文件选择对话框
    },
    checkCoa(){
      if(this.imageSrc || this.coaPdf){
        return true
      } else{
        for(let i = 0; i < this.inOrderDetailList.length; i++){
          console.log(this.inOrderDetailList[i].matClass)
          if(this.inOrderDetailList[i].matClass.includes("CMC") ){
            return false
          }
          return true
        }
      }      
    },  
    checkQualifiedQuantity(){
        for(let i = 0; i < this.inOrderDetailList.length; i++){
          if(! this.inOrderDetailList[i].qualifiedQuantity > 0 ){
            return false
          }
          return true        
      }      
    },  
    viewPdf(){
      getCoaPdfInfo(this.form.orderId).then(response => {
        const binaryData = [];
        binaryData.push(response);
        let pdfUrl = window.URL.createObjectURL(new Blob(binaryData, { type: "application/pdf" }));
        window.open(pdfUrl);
      });
    },
     /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "PDF上传";
      this.upload.open = true;
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      console.log(2)
      this.upload.isUploading = true;
      console.log(file.name);
      
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },
    handelUploadPdfSuccess(response, file, fileList){ 
      this.coaPdf = file.name
      this.form.coaPdf = file.name;          
      this.upload.open = false;
      this.upload.isUploading = false;
      this.upload.url = this.upload.url
      this.upload.data = {"orderId":this.form.orderId}
      this.$refs.upload.clearFiles();
      this.sysFileName = response.msg;
      this.form.coaPdf = this.coaPdf
      this.coaPdfUpload = true;
      Message.success("上传PDF成功！")
    },
    handelUploadPdfError(response) {
      Message.error("上传PDF失败！")
    },
    updateCheckQualifiedQuantity0(){
      this.checkQualifiedQuantity0 = true
    },
    /** 确认质检结果 */
    confirmCheck() {
      let that = this
      if(! that.checkCoa()){
        Message.warning("CMC实验用物料，需上传COA图片或文件！")
        return 
      }
      if(that.checkQualifiedQuantity() || that.checkQualifiedQuantity0){   
      that.$modal.confirm("是否确认质检结果？").then(()=> {        
          checkInOrder(that.inOrderDetailList).then((response) => {
            that.$modal.msgSuccess("质检成功");
          });
          if (that.form.coaAddr) {
            that.coaDict["coaAddr"] = that.form.coaAddr;
          }
          if (that.imageSrc) {
            // that.coaDict["coaPic"] = that.imageSrc;
            that.coaDict["coaPicList"] = that.picList;
            console.log(that.picList)
          }
          console.log(that.coaPdfUpload)
          if (that.coaPdfUpload) {
            that.coaDict["coaPdf"] = that.coaPdf;
            that.coaDict["sysFileName"] = that.sysFileName;
          }
          that.coaDict["orderId"] = that.form.orderId;
          that.coaDict["orderNo"] = that.form.orderNo;
          checkInOrderCoa(that.coaDict).then((response) => {
            that.$modal.msgSuccess("Coa地址更新成功");
          });
          that.checkQualifiedQuantity0 = false;
          that.inOrderDetailOpen = false;
          that.reset()
          that.cancelOrderDetail();        
          that.getList();           
      });       
    }
    else {       
      that.$modal.confirm("物料合格数量为0，请确认！").then(()=> {
        console.log(that.inOrderDetailList);
        console.log(that.checkQualifiedQuantity());
        that.checkQualifiedQuantity0 = true;
        } 
      ); 
      
    }
      
      },
      
    
  }
};
</script>
</script>
<style scoped>
.camera_outer {
  position: relative;
  overflow: hidden;
  /* background: url("../../assets/img/user_0608_04.png") no-repeat center; */
  background-size: 100%;
  /* video, */
  /* canvas, */
}
.camera_outer .tx_img {
  -moz-transform: scaleX(-1);
  -webkit-transform: scaleX(-1);
  -o-transform: scaleX(-1);
  transform: scaleX(-1);
}

.camera_outer .btn_camera {
  position: absolute;
  bottom: 4px;
  left: 0;
  right: 0;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.3);
  line-height: 50px;
  text-align: center;
  color: #ffffff;
}

.camera_outer .bg_r_img {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
}

.camera_outer .img_bg_camera {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
}

.camera_outer .img {
  width: 300px;
  height: 300px;
}

.camera_outer .img_btn_camera {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  line-height: 50px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.3);
  color: #ffffff;
}

.camera_outer .loding_img {
  width: 50px;
  height: 50px;
}
.image-container {
  position: relative;
  display: inline-block;
}
.image-container button {
  display: none;
  position: absolute;
  top: 5px;
  right: 5px;
}
.image-container:hover button {
  display: block;
}
</style>
