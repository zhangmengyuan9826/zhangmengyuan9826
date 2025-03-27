<template>
 <div class="app-container">
  <p class="error">{{ error }}</p> 
      <!--错误信息-->
  <el-button type="primary" @click="reScan" :customStyle="'width:120px;height:64px;margin-left:10px;'">扫码</el-button>
<p>入库流程：入库单【ORDER】——货位单【LOCATION】</p>
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
      </qrcode-stream></div>
    <div class="order">
			<div>单据类型：</div>
			<div class="label">{{order.orderTypeLabel}}</div>
			<div>业务员：</div>
			<div class="label">{{order.createBy}}</div>
		</div>
		<div class="detail">
			<div v-for="(item, index) in order.detailList" :key="index">
				<div :class="[item.lineNo === selectItem.lineNo ? 'detail-item active' : 'detail-item']" @click="chooseItem(item)">
					<div class="left">{{item.lineNo}}、</div>
					<div class="right">
						<div>物料编码：{{item.matCode}}</div>
						<div>物料名称：{{item.matName}}</div>
						<div>规格：{{item.figNum}}</div>
						<div>批次：{{item.batch}}</div>
            <div>有效期：{{item.expiredTime}}</div>
						<div>
							<span>数量：{{item.quantity}}</span>
							<span class="unit">单位：{{item.unitName}}</span>
						</div>
						<div>入库货位：{{ item.locationCode ? formatLocation(item.locationCode) : ''}}</div>
					</div>
					<div class="tag">
						<el-tag text="" type="error" v-if="!item.locationCode">待完成</el-tag>
						<el-tag text="" type="success" v-else>已完成</el-tag>
					</div>
				</div>
				<!-- <u-gap bgColor="#e5e6e7" height="1"></u-gap> -->
			</div>
		</div>
    <el-button type="primary" @click="confirm" :customStyle="'width:120px;height:64px;margin-left:10px;'">提交</el-button>
		</div>
		<!-- <u-toast ref="loadinToast"></u-toast> -->
    
</template>

<script>
 
// 引入
import { QrcodeStream } from 'vue-qrcode-reader';
import { getInfoM,submitStockIn  } from "@/api/stock/inOrder";
import { listAllLocation } from "@/api/base/location";
import { Message } from "element-ui";
export default {
  // 注册
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
          //加载
			toastParams: {
				type: 'loading',
				title: '正在加载',
				message: "正在加载",
				iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/loading.png',
				duration: 60000,
			},
          //当前选中项
			selectItem: {},
			//参数
			params: {},
      //当前货位
			selectLocation: '',
			//当前选中项
			selectItem: {},
      selected :false,
      matLabelList: [],
      locationList: [],
      locationDict: {},
      };
  },
  created(){
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
          Message.success(result)
          // result="ORDER:IP20240123113873"
          this.result = result;
          this.ifscan=false;
          if(result.indexOf("ORDER:") === 0){
						this.order.orderNo = result.replace("ORDER:", "");     
            Message.success("扫码成功：入库单："+result)      
						this.loadStockInOrder();
					} else if(result.indexOf("LOCATION") === 0){// //扫码货位
						if(!this.order.orderNo){
							Message.warning('请先扫描入库单');
              // uni.showToast({ title: '请先扫描入库单', icon: 'none' })
							// this.$refs.loadinToast.hide();
							return;
						}
            Message.success("扫码成功：货位单："+result)
						if(!this.selectItem.detailId){
              Message.warning('请先选择行项目');
							return;
						}
						let codeArr = result.match(/:(\S*)/)[1].split(":");
						if(codeArr && codeArr.length === 2){
							this.selectItem.locationCode = codeArr[0];
							this.selectItem.warehouseCode = codeArr[1];
							// this.$refs.loadinToast.hide();
						} else if(codeArr){
              this.selectItem.locationCode = codeArr[0];
            }
					}else{
            Message.error('二维码不正确');
					}
      },
      reScan(){
        this.ifscan=!this.ifscan;
      },
      loadStockInOrder(){
      
      getInfoM((this.order.orderNo)).then((res) => {
        console.log(res)
				if(res.code === 200){					
          if (res.data.checkStatus !=='checkout'){
            Message.error("入库单未完成质检！")
            return
          }
          this.order = res.data;
          
				}else{
          Message.warning(res.message);
				}
				// this.$refs.loadinToast.hide();
			});
      
		},
    //选择行
		chooseItem(item){
      Message.warning("chose")
			this.selectItem = item;
      this.selected = true;
		},
		//提交
    confirm(){
			let that = this;
      if(!this.selected){
        Message.warning("未选择入库单！")
        return
      }
      if(!this.selectItem.locationCode){
        Message.warning("未扫描货位码！")
        return
      }
      this.$confirm('确认提交入库信息？', '提示', { type: 'warning' }).then(
        () => {
          // that.$refs.loadinToast.show({ ...that.toastParams });
            submitStockIn(that.order).then((stockInRes) => {
							if(stockInRes.code === 200){
                Message.success("入库单提交成功")
								that.order = [];
								that.selectItem = {};
                this.ifscan= true;
							}
							Message.warning({ title: stockInRes.msg, icon: 'none' })
							// that.$refs.loadinToast.hide();
        }
      )
			});
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

  },
};
</script>

<style scoped>
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
.label{
		margin-right: 40px;
		width: 180px;
		border-bottom: 1px solid #515151;
	}
.detail-item{
		padding: 10px;
		display: flex;
		position: relative;
		border-radius: 1%;}
    .right{
			font-size: 26px;
			
		}
.unit{
				padding-left: 80px;
			}		
.detail{
	padding: 20px;
	
		
	}
.tag{
			position: absolute;
			top: 10px;
			right: 10px;
		}
	.active{
		background-color: #e6e6e6;
	}

</style>