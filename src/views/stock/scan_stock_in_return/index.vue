<template>
  <!--错误信息-->

  <!-- <p class="decode-result">
          扫描结果:
          <b>{{ result }}</b>
      </p>
      <扫描结果-->
  <!-- <p @click="openCamera">打开相机</p>
      <div v-show="show" class="cameraMessage">
          <p @click="closeCamera">关闭相机</p>
          <p @click="openFlash">打开手电筒</p>
          <p @click="switchCamera">相机反转</p>
      </div> -->
  <div class="app-container">
    <p class="error">{{ error }}</p>
    <!--错误信息-->
    <el-button
      type="primary"
      @click="reScan"
      :customStyle="'width:120px;height:64px;margin-left:10px;'"
      >扫码</el-button
    >

    <p class="decode-result">
      扫描结果:
      <b>{{ result }}</b>
    </p>

    <div v-if="ifscan">
      <qrcode-stream
        v-show="qrcode"
        :camera="camera"
        :torch="torchActive"
        @decode="onDecode"
        @init="onInit"
      >
        <div>
          <div class="qr-scanner">
            <div class="box">
              <div class="line"></div>
              <div class="angle"></div>
            </div>
            <div class="txt">
              将二维码/条码放入框内，即自动扫描
              <div class="myQrcode">我的二维码</div>
            </div>
          </div>
        </div>
      </qrcode-stream>
    </div>
    <el-button
      type="primary"
      @click="confirm"
      :customStyle="'width:120px;height:64px;margin-left:10px;'"
      >提交</el-button
    >
    <div class="order">
      <div>单据类型：</div>
      <div class="label">{{ order.orderTypeLabel }}</div>
      <div>当前货位：</div>
      <div class="label">{{ selectLocation }}</div>
    </div>
    <div class="detail">
      <div v-for="(item, index) in order.detailList" :key="index">
        <div
          :class="[
            item.lineNo === selectItem.lineNo
              ? 'detail-item active'
              : 'detail-item',
          ]"
          @click="chooseItem(item)"
        >
          <div class="left">{{ item.lineNo }}、</div>
          <div class="right">
            <div>物料编码：{{ item.matCode }}</div>
            <div>物料名称：{{ item.matName }}</div>
            <div>规格：{{ item.figNum }}</div>
            <div>
              <span>需退：{{ item.quantity }}</span>
              <span class="unit">已退：{{ item.returnQuantity }}</span>
            </div>
            <div>
              所在货位：{{
                item.locationCode ? formatLocation(item.locationCode) : ""
              }}
            </div>
          </div>
          <div class="tag">
            <el-tag
              text=""
              type="warning"
              v-if="item.quantity > item.returnQuantity"
              >待完成</el-tag
            >
            <el-tag text="" type="success" v-else>已完成</el-tag>
          </div>
        </div>
        <!-- <u-gap bgColor="#e5e6e7" height="1"></u-gap> -->
      </div>
    </div>
    <!-- <el-button type="primary" @click="confirm" :customStyle="'width:120px;height:64px;margin-left:10px;'">提交</el-button> -->
    <el-dialog
      title="选择物料"
      :visible.sync="showModal"
      center
      showCancelButton
    >
      <div class="slot-content">
        <div class="content-line">
          <div class="content-line-label">物料编码：</div>
          <div>{{ scanMatLabelItem.matCode }}</div>
        </div>
        <div class="content-line">
          <div class="content-line-label">物料名称：</div>
          <div>{{ scanMatLabelItem.matName }}</div>
        </div>
        <div class="content-line">
          <div class="content-line-label">规格：</div>
          <div>{{ scanMatLabelItem.figNum }}</div>
        </div>
        <div class="content-line">
          <div class="content-line-label">批次：</div>
          <div>{{ scanMatLabelItem.batch }}</div>
        </div>
        <div class="content-line">
          <div class="content-line-label">生产日期：</div>
          <div>{{ scanMatLabelItem.prodTime }}</div>
        </div>
        <div class="content-line">
          <div class="content-line-label">标签剩余：</div>
          <div>{{ scanMatLabelItem.remainingQuantity }}</div>
        </div>
        <div class="content-line">
          <div class="content-line-label">需领数：</div>
          <div>{{ scanMatLabelItem.needQuantity }}</div>
        </div>
        <div class="content-line quantity">
          <div class="content-line-label">退回:</div>
          <div>
            <!-- <u-number-box :inputWidth="80" slot="right-icon" v-model="scanMatLabelItem.inputQuantity" step="1" :min="0.01" decimalLength="2"/> -->
            <el-input-number
              v-model="scanMatLabelItem.inputQuantity"
              :min="0"
              :step="1"
              integer
            ></el-input-number>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelSelectMatLabel">取 消</el-button>
        <el-button type="primary" @click="confirmSelectMatLabel()"
          >确定</el-button
        >
      </span>
    </el-dialog>
  </div>
  <!-- <u-toast ref="loadinToast"></u-toast> -->
</template>

<script>
// 引入
import { QrcodeStream } from "vue-qrcode-reader";
import axios from "axios";
import { getInfo, submitInReturn } from "@/api/stock/inReturn";
import { getMatLabel } from "@/api/stock/matLabel";
import { listAllLocation } from "@/api/base/location";
import { Message } from "element-ui";
export default {
  components: { QrcodeStream },
  data() {
    return {
      //订单
      result: "", // 扫码结果信息
      rescode: "",
      error: "", // 错误信息
      // show: false,
      // qrcode: false,
      qrcode: true,
      torchActive: false,
      camera: "auto",
      ifscan: true,
      order: {
        returnNo: "",
        returnTypeLabel: "",
        detailList: [],
      },
      //加载
      toastParams: {
        type: "loading",
        title: "正在加载",
        message: "正在加载",
        iconUrl: "https://cdn.uviewui.com/uview/demo/toast/loading.png",
        duration: 60000,
      },
      //参数
      params: {},

      //当前货位
      selectLocation: "",
      selectWarehouseCode: "",
      //当前选中项
      selectItem: {},

      //选择物料
      showModal: false,
      scanMatLabelItem: {},

      //退回集,key:标签ID，value:数量
      returnMap: {},
      locationList: [],
      locationDict: {},
    };
  },
  created() {
    this.getBaselocationList();
  },
  methods: {
    formatLocation(locationCode) {
      return locationCode + "-" + this.locationDict[locationCode];
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
    onDecode(result) {
      // alert(result)
      this.result = result;
      this.ifscan = false;
      if (result.indexOf("ORDER:") === 0) {
        this.order.returnNo = result.replace("ORDER:", "");

        this.loadStockInOrder();
        Message.success("扫码成功：入库退货单：" + result);
      } else if (result.indexOf("LOCATION") === 0) {
        // //扫码货位
        if (!this.order.returnNo) {
          Message.warning("请先扫描入库单");
          // this.$refs.loadinToast.hide();
          return;
        }
        Message.success("扫码成功：货位单：" + result);

        let codeArr = result.match(/:(\S*)/)[1].split(":");
        if (codeArr && codeArr.length === 2) {
          this.selectLocation = codeArr[0];
          this.selectWarehouseCode = codeArr[1];
        }
      } else if (result.indexOf("LABEL") === 0) {
        //扫码物料标签
        if (!this.order.returnNo) {
          Message.warning("请先扫描入库退货单");
          return;
        }
        if (!this.selectLocation) {
          Message.warning("请先扫描货位");
          return;
        }
        if (!this.selectItem.detailId) {
          Message.warning("请先选择行项目");
          return;
        }
        if (this.selectItem.warehouseCode !== this.selectWarehouseCode) {
          Message.warning("非目标仓库");
          return;
        }
        if (this.selectItem.locationCode !== this.selectLocation) {
          Message.warning("非目标货位");
          return;
        }
        Message.success("扫码成功：物料标签码：" + result);
        let labelId = result.replace("LABEL:", "");
        this.selectMatLabel(labelId);
      } else {
        Message.error("二维码不正确");
      }
    },
    reScan() {
      this.ifscan = !this.ifscan;
    },
    loadStockInOrder() {
      getInfo(this.order.returnNo).then((res) => {
        console.log(res);
        if (res.code === 200) {
          this.order = res.data;
        } else {
          console.log(res);
          Message.error(res.message);
        }
        // this.$refs.loadinToast.hide();
      });
    },
    //选择行
    chooseItem(item) {
      this.selectItem = item;
    },
    selectMatLabel(labelId) {
      if (this.selectItem.quantity - this.selectItem.returnQuantity === 0) {
        Message.warning("物料已达需退量");
        return;
      }
      this.scanMatLabelItem = {};
      this.inputQuantity = 1;
      getMatLabel(labelId).then((res) => {
        if (res.code === 200) {
          this.scanMatLabelItem = res.data;
          if (this.selectItem.matCode !== this.scanMatLabelItem.matCode) {
            Message.warning("非目标物料");
            return;
          }
          if (this.selectItem.warehouseCode !== this.scanMatLabelItem.warehouseCode) {
            Message.warning("非目标仓库物料");
            return;
          }
          //标签剩余数
          let labelId = this.scanMatLabelItem.labelId;
          if (this.returnMap.hasOwnProperty(labelId)) {
            this.scanMatLabelItem.remainingQuantity -= this.returnMap[labelId];
          }
          //判断标签是否还能领取
          if (this.scanMatLabelItem.remainingQuantity === 0) {
            Message.warning("标签已领完");
            return;
          }
          //还需退数
          this.scanMatLabelItem.needQuantity = this.selectItem.quantity - this.selectItem.returnQuantity;
          //现退回数
          if (this.scanMatLabelItem.remainingQuantity >= this.scanMatLabelItem.needQuantity) {
            this.scanMatLabelItem.inputQuantity = this.scanMatLabelItem.needQuantity;
          } else {
            this.scanMatLabelItem.inputQuantity = this.scanMatLabelItem.remainingQuantity;
          }
        } else {
          Message.error(res.msg);
        }
        this.showModal = true;
      });
    },
    confirmSelectMatLabel() {
      let matCode = this.selectItem.matCode;
      //记录扫码 标签id-数量
      let labelId = this.scanMatLabelItem.labelId;
      if (this.returnMap.hasOwnProperty(labelId)) {
        this.returnMap[labelId] += this.inputQuantity;
      } else {
        this.returnMap[labelId] = this.scanMatLabelItem.inputQuantity;
      }
      //修改已领数
      this.selectItem.returnQuantity += this.scanMatLabelItem.inputQuantity;
      this.showModal = false;
    },
    cancelSelectMatLabel() {
      this.showModal = false;
    },
    //提交
    confirm() {
      let that = this;
      this.$confirm("确认提交退货信息", "提示", { type: "warning" }).then(
        () => {
          // that.$refs.loadinToast.show({ ...that.toastParams });
          let inReturnRequestBody = {
            returnNo: that.order.returnNo,
            returnMap: that.returnMap,
          };
          submitInReturn(inReturnRequestBody).then((stockInReturnRes) => {
            if (stockInReturnRes.code === 200) {
              that.order = [];
              that.selectLocation = "";
              that.selectItem = {};
              that.scanMatLabelItem = {};
              that.returnMap = {};
            } else {
              Message.error(stockInReturnRes.msg);
            }

            // that.$refs.loadinToast.hide();
          });
        }
      );
    },
    async onInit(promise) {
      const { capabilities } = await promise;

      const TORCH_IS_SUPPORTED = !!capabilities.torch;
      try {
        await promise;
      } catch (error) {
        if (error.name === "NotAllowedError") {
          this.error = "ERROR: 您需要授予相机访问权限";
        } else if (error.name === "NotFoundError") {
          this.error = "ERROR: 这个设备上没有摄像头";
        } else if (error.name === "NotSupportedError") {
          this.error = "ERROR: 所需的安全上下文(HTTPS、本地主机)";
        } else if (error.name === "NotReadableError") {
          this.error = "ERROR: 相机被占用";
        } else if (error.name === "OverconstrainedError") {
          this.error = "ERROR: 安装摄像头不合适";
        } else if (error.name === "StreamApiNotSupportedError") {
          this.error = "ERROR: 此浏览器不支持流API";
        }
        Message.error(this.error);
      }
    },
  },
};
</script>
<style scoped lang="scss">
.error {
  font-weight: bold;
  color: red;
}
.cameraMessage {
  width: 100%;
  height: 60px;
}
.qr-scanner {
  background-image: linear-gradient(
      0deg,
      transparent 24%,
      rgba(32, 255, 77, 0.1) 25%,
      rgba(32, 255, 77, 0.1) 26%,
      transparent 27%,
      transparent 74%,
      rgba(32, 255, 77, 0.1) 75%,
      rgba(32, 255, 77, 0.1) 76%,
      transparent 77%,
      transparent
    ),
    linear-gradient(
      90deg,
      transparent 24%,
      rgba(32, 255, 77, 0.1) 25%,
      rgba(32, 255, 77, 0.1) 26%,
      transparent 27%,
      transparent 74%,
      rgba(32, 255, 77, 0.1) 75%,
      rgba(32, 255, 77, 0.1) 76%,
      transparent 77%,
      transparent
    );
  background-size: 3rem 3rem;
  background-position: -1rem -1rem;
  width: 100%;
  /* height: 100%; */
  height: 100vh;
  /* height: 288px; */
  position: relative;
  background-color: #1110;
  margin-top: 40%;

  /* background-color: #111; */
}
/* .qrcode-stream-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 82px;
  clear: both;
} */
/* .qrcode-stream-wrapper >>> .qrcode-stream-camera {
  width: 213px;
  height: 210px;
  clear: both;
  margin-top: 39px;
} */
.qr-scanner .box {
  width: 213px;
  height: 213px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
  border: 0.1rem solid rgba(0, 255, 51, 0.2);
  /* background: url('http://resource.beige.world/imgs/gongconghao.png') no-repeat center center; */
}
.qr-scanner .txt {
  width: 100%;
  height: 35px;
  line-height: 35px;
  font-size: 14px;
  text-align: center;
  /* color: #f9f9f9; */
  margin: 0 auto;
  position: absolute;
  top: 10%;
  left: 0;
}
.qr-scanner .myQrcode {
  text-align: center;
  color: #00ae10;
}
.qr-scanner .line {
  height: calc(100% - 2px);
  width: 100%;
  background: linear-gradient(180deg, rgba(0, 255, 51, 0) 43%, #00ff33 211%);
  border-bottom: 3px solid #00ff33;
  transform: translateY(-100%);
  animation: radar-beam 2s infinite alternate;
  animation-timing-function: cubic-bezier(0.53, 0, 0.43, 0.99);
  animation-delay: 1.4s;
}

.qr-scanner .box:after,
.qr-scanner .box:before,
.qr-scanner .angle:after,
.qr-scanner .angle:before {
  content: "";
  display: block;
  position: absolute;
  width: 3vw;
  height: 3vw;

  border: 0.2rem solid transparent;
}

.qr-scanner .box:after,
.qr-scanner .box:before {
  top: 0;
  border-top-color: #00ff33;
}

.qr-scanner .angle:after,
.qr-scanner .angle:before {
  bottom: 0;
  border-bottom-color: #00ff33;
}

.qr-scanner .box:before,
.qr-scanner .angle:before {
  left: 0;
  border-left-color: #00ff33;
}

.qr-scanner .box:after,
.qr-scanner .angle:after {
  right: 0;
  border-right-color: #00ff33;
}

@keyframes radar-beam {
  0% {
    transform: translateY(-100%);
  }

  100% {
    transform: translateY(0);
  }
}
.order {
  padding: 0 20px 0 20px;
  display: flex;
  align-items: flex-end;
  font-size: 30px;
  color: #515151;
  .label {
    font-size: 28px;
    margin-right: 40px;
    width: 165px;
    border-bottom: 1px solid #515151;
  }
}
.detail {
  padding: 20px;
  .detail-item {
    padding: 10px;
    display: flex;
    position: relative;
    border-radius: 1%;
    .right {
      font-size: 26px;
      .unit {
        padding-left: 80px;
      }
    }
    .tag {
      position: absolute;
      top: 10px;
      right: 10px;
    }
  }
  .active {
    background-color: #e6e6e6;
  }
}
.slot-content {
  width: 520px;
  .content-line {
    display: flex;
    align-items: flex-end;
    .content-line-label {
      display: flex;
      justify-content: flex-end;
      width: 180px;
    }
  }
  .quantity {
    margin-top: 10px;
    align-items: center;
  }
}
</style>
