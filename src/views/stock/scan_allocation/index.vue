<template>
 <div class="app-container">
  <p class="error">{{ error }}</p> 
      <!--错误信息-->
  <el-button type="primary" @click="reScan" :customStyle="'width:120px;height:64px;margin-left:10px;'">扫码</el-button>
  <p>拣货调拨流程：调拨单【ORDER】——源货位单【LOCATION】——选择物料标签 ——物料标签【LABEL】——提交</p>
  <p>接收调拨流程：调拨单【ORDER】——目的货位单【LOCATION】——选择物料标签 ——物料标签【LABEL】——提交</p>
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
    <el-button type="primary" @click="confirm" :customStyle="'width:120px;height:64px;margin-left:10px;'" :disabled="allowConfirm">提交</el-button>  
    <div class="order">
			<div class="tips">发起货位：</div>
			<div class="label"> &nbsp;{{order.srcLocationName}}</div>
			<div class="tips">目标货位：</div>
			<div class="label"> &nbsp;{{order.destLocationName}}</div>
		</div>
		<div class="detail">
			<div v-for="(item, index) in detailShowList" :key="index">
        <div  v-if="order.allotProgress === 'created'" :class="[item.detailId === selectItem.detailId ? 'detail-item active' : 'detail-item']" @click="chooseItem(item)">
					<div class="left">{{item.lineNo}}、</div>
					<div class="right">
						<div>物料编码：{{item.matCode}}</div>
						<div>物料名称：{{item.matName}}</div>
						<div>规格：{{item.figNum}}</div>
            <div>供应商：{{item.supplierName}}</div>
            <div>所在货位：{{ formatLocation(item.locationCode) }}</div>
						<div>
							<span>数量：{{item.quantity}}</span>
							<span class="unit">单位：{{item.unitCode}}</span>
						</div>
					</div>
					
				</div>
        <div v-if="order.allotProgress === 'picking'" :class="[item.detailId === selectItem.detailId ? 'detail-item active' : 'detail-item']" @click="chooseItem(item)">
					<div class="left">{{index + 1}}、</div>
					<div class="right">
						<div>物料编码：{{item.matCode}}</div>
						<div>物料名称：{{item.matName}}</div>
						<div>规格：{{item.figNum}}</div>
            <div>供应商：{{item.supplierName}}</div>
						<div>
							<span>发起数量：{{item.quantity}}</span>
							<span class="unit">单位：{{item.unitCode}}</span>
						</div>
						<div>
							<span>接收数量：{{item.signQuantity}}</span>
							<span class="unit">接收货位：{{ item.destLocationCode ? formatLocation(item.destLocationCode) : ''}}</span>
						</div>
            <div class="tag">
						<el-tag text="" type="error" v-if="item.allotProgress==='created'">待完成</el-tag>
						<el-tag text="" type="success" v-else>已完成</el-tag>
					</div>
					</div>
				</div>
			</div>
		</div>
    </div>    
</template>

<script>
// 引入
import { QrcodeStream } from 'vue-qrcode-reader';
import { getInfo,submitAllot } from "@/api/stock/allotOrder";
import { getMatLabel } from "@/api/stock/matLabel";
import { Message } from "element-ui";
import { listAllLocation } from "@/api/base/location";

export default {
  components: { QrcodeStream },
  data() {
		return {
      result: '', // 扫码结果信息
      code:'',
      error: '', // 错误信息
      // show: false,
      // qrcode: false,
      qrcode: true,
      torchActive: false,
      camera: 'auto',
      ifscan: true,
      order: {
        orderNo: '',
        orderTypeLabel: '',
        detailList: [],
      },
			//调拨单
			order:{
				allotNo:'',
				srcWarehouseName: '',
				destWarehouseName: '',
        srcLocationName: '',
				destLocationName: '',
				detailList: [],
			},
			//加载
			toastParams: {
				type: 'loading',
				title: '正在加载',
				message: "正在加载",
				iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/loading.png',
				duration: 60000,
			},
			//参数
			params: { },
			//当前货位
			selectLocation: '',
			//当前选中项
			selectItem: {},
			detailList: [],
      detailShowList: [],
			matLabelList: [],
      allotOrderNo: '',
      locationCode: '',
      scanAim: '',
      matLabelListResult:[],
      allowConfirm: true,
      locationList: [],
      locationDict: {},
		}

	},
  created() {
    this.getBaselocationList();
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
    onDecode(result) {
        // alert(result)
        this.result = result;
        this.ifscan=false;
        if(result.indexOf("ORDER:") === 0){            
          this.order.allotNo = result.replace("ORDER:", "");            
          this.loadAllotOrder();
          Message.success("扫码成功：调拨单："+this.order.allotNo)
        } else if(result.indexOf("LOCATION") === 0){// //扫码货位
          if(!this.order.allotNo){
            Message.warning('请先扫描调拨单');
            return;
          }
          if(this.order.allotProgress !== 'picking'){
            Message.warning('请发起仓库完成拣货')
            return;
          }
          let codeArr = result.match(/:(\S*)/)[1].split(":");            
          if(codeArr && codeArr.length === 2){
            // this.selectItem.destLocationCode = codeArr[0];
            this.selectItem.signQuantity = this.selectItem.quantity;
            this.locationCode = codeArr[0];
          }     
                        
          if (this.locationCode === this.order.srcLocationCode){
            // 挑货
            Message.success("扫码成功：挑拣货位单："+codeArr)
            this.scanAim = 'OUT'
          } else if (this.locationCode === this.order.destLocationCode){
            // 入货
            Message.success("扫码成功：入库货位单："+codeArr)
            this.scanAim = 'IN'
          } else {              
            Message.warning('非该调拨单的出库和入库货位！')
            return;
          } 
          this.loadLocationMatlabel();
        }else if(result.indexOf("LABEL") === 0){//扫码物料标签
          if(!this.order.allotNo){
                Message.warning('请先扫描调拨单')
                return;
              }
          if(!this.locationCode){
                Message.warning('请先扫描货位单')
                return;
              }
          let labelId = result.replace("LABEL:", "");
          this.scanMatLabel(labelId);
                  
        }else{
          Message.error('二维码不正确');
        }
      },
      reScan(){
      this.ifscan=!this.ifscan;
    },
    loadAllotOrder(){
      getInfo((this.order.allotNo)).then((res) => {
        console.log(res)
				if(res.code === 200){
					this.order = res.data;
          this.detailList = this.order.detailList					
				}else{
          console.log(res)
          Message.error(res.message);
				}
			});
      
		},
    loadLocationMatlabel(){
      this.matLabelList = [];
      if(this.scanAim==="OUT"){          
        this.detailList && this.detailList.length > 0 && this.detailList.forEach(item => {
          if(item.allotProgress==="created"){
            this.detailShowList.unshift(item);
          }          
        });
        if(!this.detailShowList){
          Message.warning("无未拣货的物料！");
        }
      } else if(this.scanAim==="IN"){          
        this.detailList && this.detailList.length > 0 && this.detailList.forEach(item => {
          if(item.allotProgress==="picking"){
            this.detailShowList.unshift(item);
          }          
        });
        if(!this.detailShowList){
          Message.warning("无未入库的物料！");
        }
      }
    },
    //选择行
		chooseItem(item){
      alert("chose")
			this.selectItem = item;
      console.log(this.selectItem)
		},
    loadMatLabel(labelId){      
      getMatLabel(labelId).then((res)=>{
        if(res.code === 200){
					let matLabel = res.data;
					matLabel.quantity = matLabel.usableQuantity - matLabel.receivedQuantity;
					matLabel.srcWarehouseCode = matLabel.warehouseCode;
					matLabel.srcLocationCode = matLabel.locationCode;
					this.matLabelList.unshift(matLabel);
				}else{
					Message.error(res.msg)
				}
				this.showModal = true;
      });
    },
    scanMatLabel(labelId){
      console.log(labelId)
      console.log(this.selectItem.labelId)
      console.log(labelId==this.selectItem.labelId)
      if(labelId==this.selectItem.labelId){
        getMatLabel(labelId).then((res)=>{
          if(res.code === 200){
            this.matLabelListResult.unshift(this.selectItem);
            this.allowConfirm = !this.allowConfirm
          }else{
            Message.error(res.msg)
          }
          Message.success("扫码成功：物料标签单："+labelId)		
          this.showModal = true;
      });
      }else {
        Message.error("非选择的目标物料！")
        return 
      }
      
    },    
    //提交
    confirm(){
			let that = this;
      if(!that.matLabelListResult){
        Message.error("未选择物料标签！")  
        return
      }else{
        this.$confirm('确认提交调拨信息?', '提示', { type: 'warning' }).then(
        () => {
            console.log(that.matLabelListResult)
            that.order.detailList = that.matLabelListResult
            submitAllot(that.order).then((allotRes) => {
							if(allotRes.code === 200){
								that.order = [];
								that.selectLocation = '';
								that.selectItem = {};
								that.matLabelList = [];
                that.allowConfirm = true;
                that.matLabelListResult = [];
                that.detailList = [];
                that.detailShowList = [];
							}
							else{
                Message.error(allotRes.msg)   
              }
        }
      )

			});
      }
      
		},
    async onInit(promise) {
          const { capabilities } = await promise; 
          const TORCH_IS_SUPPORTED = !!capabilities.torch;
          try {
              await promise;
          } catch (error) {
              if (error.name === 'NotAllowedError') {
                  this.error = 'ERROR: 您需要授予相机访问权限';
              } else if (error.name === 'NotFoundError') {
                  this.error = 'ERROR: 这个设备上没有摄像头';
              } else if (error.name === 'NotSupportedError') {
                  this.error = 'ERROR: 所需的安全上下文(HTTPS、本地主机)';
              } else if (error.name === 'NotReadableError') {
                  this.error = 'ERROR: 相机被占用';
              } else if (error.name === 'OverconstrainedError') {
                  this.error = 'ERROR: 安装摄像头不合适';
              } else if (error.name === 'StreamApiNotSupportedError') {
                  this.error = 'ERROR: 此浏览器不支持流API';
              }
              Message.error(this.error)
          }
      },
  }
}
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
  content: '';
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
.order{
	padding: 0 20px 0 20px;
	display: flex;
	align-items: flex-end;
	font-size: 30px;
	color: #515151;

}
.tips{
		font-size: 28px;
	}
	.label{
		font-size: 28px;
		margin-right: 40px;
		width: 180px;
		border-bottom: 1px solid #515151;
	}
.detail{
	padding: 20px;
	.detail-item{
		padding: 10px;
		display: flex;
		position: relative;
		border-radius: 1%;
		.right{
			font-size: 26px;
			.unit{
				padding-left: 80px;
			}
		}
		.tag{
			position: absolute;
			top: 10px;
			right: 10px;
		}
	}
	.active{
		background-color: #e6e6e6;
	}
}
.slot-content{
	width: 520px;
	.content-line{
		display: flex;
		align-items: flex-end;
		.content-line-label{
			display: flex;
			justify-content: flex-end;
			width:180px;
		}
	}
	.quantity{
		margin-top: 10px;
		align-items: center;
	}
}
</style>
