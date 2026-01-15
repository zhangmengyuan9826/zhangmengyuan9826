<template>
    <div class="app-container">
        <h2>质粒编号管理</h2>
        <!-- Gene management content goes here -->
        <el-table
            :data="numberData"
            border
            style="width: 90%; margin-left:5%"
            v-loading="loading">
            <el-table-column
                prop="index"
                label="-"
                width="50">
                <template slot-scope="scope">
                    {{ 'p'+ String(scope.$index)+"X" }}
                </template></el-table-column>
            <el-table-column
                v-for="i in 10"
                :key="i"
                :prop="String(i-1)"
                :label="'Column ' + (i-1)"
                width="100"
                align="center">
                <template slot-scope="scope">
                  <div>
                    <!-- 做成点击按钮 -->
                    <el-button
                      type="text"
                      @click="openGeneNo(scope.row[String(i-1)])"
                      style="padding: 0; margin-bottom: 4px; color: #3d3d3d; cursor: pointer; align-items: center;">{{ scope.row[String(i-1)] }}</el-button>
                    <div style="display: flex; align-items: center;">
                      <el-progress
                        v-if="scope.row['usage'+(i-1)] && scope.row['usage'+(i-1)] !== '-'"
                        :percentage="scope.row['usage'+(i-1)] || 0"
                        :text-inside="true"
                        :stroke-width="16"
                        style="width: 100px; margin-right: 8px;"
                      />
                    </div>
                  </div>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog
            title="Gene Numbers Occupancy Details"
            :visible.sync="dialogVisible"
            width="1000px">
            <span>*灰色为已占用编号，绿色为可用编号.</span>
            <span slot="footer" class="dialog-footer">
              <el-button @click="dialogVisible = false">Close</el-button>
            </span>
            <el-table
                :data="geneNoList"
                border
                style="width: 100%"
                v-loading="loadingDetail">
                <el-table-column
                    prop="index"
                    label="-"
                    width="40">
                    <template slot-scope="scope">
                        {{ scope.$index + 1 }}
                    </template>
                </el-table-column>
                <el-table-column
                    v-for="i in 9"
                    :key="i"
                    :prop="String(i)"
                    :label="'No ' + String(i)"
                    width="100">
                    <template slot-scope="scope">                        
                        <template v-if="scope.row['geneId'+i]">
                            <el-tooltip
                                effect="light"
                                placement="top"
                            >
                                <div
                                class="content"
                                slot="content"
                                v-html="scope.row['geneName'+i]"
                                ></div>
                                <div class="oneLine">
                                    <el-button
                                        type="text"
                                        @click="openGeneDetail(scope.row['geneId'+i])"
                                        style="background: #ddd; color: #333; width: 100%; padding: 0; min-height: 32px; cursor: pointer;">
                                        {{ scope.row[String(i)] }}
                                    </el-button>
                                </div>
                            </el-tooltip>
                            
                        </template>
                        <template v-else>
                            <!-- 按钮，提示是否前往新增质粒 -->
                            <el-button
                                type="text"
                                @click="handleAddGene(scope.row[String(i)])"
                                style="background: #4dc270; color: #fff; width: 100%; padding: 0; min-height: 32px; cursor: pointer;">
                                {{ scope.row[String(i)] }}
                            </el-button>
                        </template>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>

        <el-dialog
            title="Gene Detail"
            :visible.sync="geneDetailVisible"
            width="70%">
            <el-form ref="geneForm" :model="geneForm" label-width="80px">
                <el-col :span="24">
                <el-form-item label="基因名" prop="geneName" label-width="100px">{{ geneForm.geneName }}</el-form-item>
                </el-col>
                <el-col :span="24">
                <el-form-item
                    label="质粒载体"
                    prop="plasmidVector"
                    label-width="100px"
                >
                    {{ geneForm.plasmidVector }}
                </el-form-item>
                </el-col>
            <el-col :span="12">
                <el-form-item label="订单编码" prop="orderNo">
                   {{ geneForm.orderNo }}
                </el-form-item>
                </el-col>
                <el-col :span="12">
                <el-form-item label="载体编号" prop="vectorNo" label-width="100px">
                    {{ geneForm.vectorNo }}
                </el-form-item>
                </el-col>
                <el-col :span="24">
                <el-form-item
                    label="质粒全长名称"
                    prop="plasmidFullName"
                    label-width="110px"
                >
                    {{ geneForm.plasmidFullName }}
                </el-form-item>
                </el-col>
                <el-col>
                <el-form-item label="CDS序列" prop="cdsSeq" label-width="100px">
                    <el-input
                        type="textarea"
                        v-model="geneForm.cdsSeq"
                        :autosize="{ minRows: 1, maxRows: 10 }"
                        resize="none"
                        placeholder="暂无"
                        readonly
                        :class="{'readonly-textarea': true}"
                        :style="{ overflowY: 'auto' }"
                    />
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                <el-form-item
                    label="线性酶切"
                    prop="linearDigestion"
                    label-width="100px"
                >
                    {{ geneForm.linearDigestion }}
                </el-form-item>
                </el-col>
                <el-col :span="8">
                <el-form-item
                    label="抗性基因"
                    prop="resistanceGene"
                    label-width="110px"
                >
                    {{ geneForm.resistanceGene }}
                </el-form-item>
                </el-col>
                <el-col :span="8">
                <el-form-item label="linker" prop="linker" label-width="110px">
                    {{ geneForm.linker }}
                </el-form-item>
                </el-col>
                <el-col :span="8">
                <el-form-item
                    label="cds长度(bp)"
                    prop="cdsLength"
                    label-width="100px"
                >
                    {{ geneForm.cdsLength }}
                </el-form-item>
                </el-col>
                <el-col :span="8">
                <el-form-item
                    label="质粒全长(bp)"
                    prop="plasmidFullLength"
                    label-width="110px"
                >
                    {{ geneForm.plasmidFullLength }}
                </el-form-item>
                </el-col>
                <el-col :span="8">
                <el-form-item
                    label="CDS表达蛋白数量"
                    prop="cdsProteinNum"
                    label-width="140px"
                >
                    {{ geneForm.cdsProteinNum }}
                </el-form-item>
                </el-col>
                <el-col :span="8">
                <el-form-item label="3'UTR" prop="utr3" label-width="100px">
                    {{ geneForm.utr3 }}
                </el-form-item>
                </el-col>

                <el-col :span="8">
                <el-form-item label="5'UTR" prop="utr5" label-width="110px">
                    {{ geneForm.utr5 }}
                </el-form-item>
                </el-col>
                <el-col :span="8">
                <el-form-item label="polyA" prop="polyA" label-width="110px">
                    {{ geneForm.polyA }}
                </el-form-item>
                </el-col>

                <el-col :span="8">
                <el-form-item label="启动子" prop="promoter" label-width="100px">
                    {{ geneForm.promoter }}
                </el-form-item>
                </el-col>
                <el-col :span="8">
                <el-form-item label="加帽" prop="cap" label-width="110px">
                    {{ geneForm.cap }}
                </el-form-item>
                </el-col>
                <el-col :span="8">
                <el-form-item
                    label="原核/真核载体"
                    prop="vectorType1"
                    label-width="110px"
                >
                    {{ geneForm.vectorType1 }}
                </el-form-item>
                </el-col>
                <el-col :span="8">
                <el-form-item label="载体类型" prop="vectorType2" label-width="100px" >
                    {{ geneForm.vectorType2 }}
                </el-form-item>
                </el-col>
                <el-col :span="8">
                <el-form-item
                    label="预测蛋白类型"
                    prop="proteinType"
                    label-width="110px"
                >
                    {{ geneForm.proteinType }}
                </el-form-item>
                </el-col>

                <el-col :span="8">
                <el-form-item label="信号肽" prop="signalPeptide" label-width="110px">
                    {{ geneForm.signalPeptide }}
                </el-form-item>
                </el-col>
                <el-col>
                <el-form-item
                    label="合成方式"
                    prop="compoundMethod"
                    label-width="100px"
                >
                    {{ geneForm.compoundMethod }}
                </el-form-item>
                </el-col>
                <el-col>
                <el-form-item label="设计方案" prop="designMethod" label-width="100px">
                    {{ geneForm.designMethod }}
                </el-form-item>
                </el-col>
                <el-col>
                <el-form-item label="备注" prop="remark" label-width="100px">
                    {{ geneForm.remark }}
                </el-form-item>
                </el-col>
            <el-row>
                <el-col :span="12">
                <el-form-item label="下单日期" prop="orderDate" label-width="100px">
                    <el-date-picker
                    readonly
                    v-model="geneForm.orderDate"
                    type="date"
                    placeholder="选择日期"
                    value-format="yyyy-MM-dd"
                    style="width: 100%;"
                    >
                    </el-date-picker>
                </el-form-item>
                </el-col>
                <el-col :span="12">
                <el-form-item label="到货日期" prop="receiveDate" label-width="100px">
                    <el-date-picker
                    readonly
                    v-model="geneForm.receiveDate"
                    type="date"
                    placeholder="选择日期"
                    value-format="yyyy-MM-dd"
                    style="width: 100%;"
                    >
                    </el-date-picker>
                </el-form-item>
                </el-col>
            </el-row>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import { listGeneNo, getGene } from "@/api/plasmid/gene";
export default {
    name: "GeneManage",
    data() {
        return {
            loading: true,
            loadingDetail: true,
            dialogVisible: false,
            geneDetailVisible: false,
            geneNameList: [],
            // Data properties for gene management can be added here
            numberData: [                
                {'0': '-',   '1': 'p01', '2': 'p02', '3':'p03', '4':'p04', '5':'p05','6':'p06','7':'p07','8':'p08','9':'p09',
                    'usage0':'-','usage1':'-','usage2':'20%','usage3':'30%','usage4':'10%','usage5':'5%','usage6':'15%','usage7':'25%','usage8':'35%','usage9':'40%'
                },
                {'0': 'p10', '1': 'p11', '2': 'p12', '3':'p13', '4':'p14', '5':'p15','6':'p16','7':'p17','8':'p18','9':'p19',
                    'usage0':'-','usage1':'-','usage2':'20%','usage3':'30%','usage4':'10%','usage5':'5%','usage6':'15%','usage7':'25%','usage8':'35%','usage9':'40%'
                },
                {'0': 'p20', '1': 'p21', '2': 'p22', '3':'p23', '4':'p24', '5':'p25','6':'p26','7':'p27','8':'p28','9':'p29',
                    'usage0':'-','usage1':'-','usage2':'20%','usage3':'30%','usage4':'10%','usage5':'5%','usage6':'15%','usage7':'25%','usage8':'35%','usage9':'40%'
                },
                {'0': 'p30', '1': 'p31', '2': 'p32', '3':'p33', '4':'p34', '5':'p35','6':'p36','7':'p37','8':'p38','9':'p39',
                    'usage0':'-','usage1':'-','usage2':'20%','usage3':'30%','usage4':'10%','usage5':'5%','usage6':'15%','usage7':'25%','usage8':'35%','usage9':'40%'
                },
                {'0': 'p40', '1': 'p41', '2': 'p42', '3':'p43', '4':'p44', '5':'p45','6':'p46','7':'p47','8':'p48','9':'p49',
                    'usage0':'-','usage1':'-','usage2':'20%','usage3':'30%','usage4':'10%','usage5':'5%','usage6':'15%','usage7':'25%','usage8':'35%','usage9':'40%'
                },
                {'0': 'p50', '1': 'p51', '2': 'p52', '3':'p53', '4':'p54', '5':'p55','6':'p56','7':'p57','8':'p58','9':'p59',
                    'usage0':'-','usage1':'-','usage2':'20%','usage3':'30%','usage4':'10%','usage5':'5%','usage6':'15%','usage7':'25%','usage8':'35%','usage9':'40%'
                },
                {'0': 'p60', '1': 'p61', '2': 'p62', '3':'p63', '4':'p64', '5':'p65','6':'p66','7':'p67','8':'p68','9':'p69',
                    'usage0':'-','usage1':'-','usage2':'20%','usage3':'30%','usage4':'10%','usage5':'5%','usage6':'15%','usage7':'25%','usage8':'35%','usage9':'40%'
                },
                {'0': 'p70', '1': 'p71', '2': 'p72', '3':'p73', '4':'p74', '5':'p75','6':'p76','7':'p77','8':'p78','9':'p79',
                    'usage0':'-','usage1':'-','usage2':'20%','usage3':'30%','usage4':'10%','usage5':'5%','usage6':'15%','usage7':'25%','usage8':'35%','usage9':'40%'
                },
                {'0': 'p80', '1': 'p81', '2': 'p82', '3':'p83', '4':'p84', '5':'p85','6':'p86','7':'p87','8':'p88','9':'p89',
                    'usage0':'-','usage1':'-','usage2':'20%','usage3':'30%','usage4':'10%','usage5':'5%','usage6':'15%','usage7':'25%','usage8':'35%','usage9':'40%'
                },
                {'0': 'p90', '1': 'p91', '2': 'p92', '3':'p93', '4':'p94', '5':'p95','6':'p96','7':'p97','8':'p98','9':'p99',
                    'usage0':'-','usage1':'-','usage2':'20%','usage3':'30%','usage4':'10%','usage5':'5%','usage6':'15%','usage7':'25%','usage8':'35%','usage9':'40%'
                }
            ],
            geneNoList: [
                {'1': 'p10-01', '2': 'p10-02', '3':'p10-03', '4':'p10-04', '5':'p10-05','6':'p10-06','7':'p10-07','8':'p10-08','9':'p10-09'},
                {'1': 'p10-11', '2': 'p10-12', '3':'p10-13', '4':'p10-14', '5':'p10-15','6':'p10-16','7':'p10-17','8':'p10-18','9':'p10-19'},
                {'1': 'p10-21', '2': 'p10-22', '3':'p10-23', '4':'p10-24', '5':'p10-25','6':'p10-26','7':'p10-27','8':'p10-28','9':'p10-29'},
                {'1': 'p10-31', '2': 'p10-32', '3':'p10-33', '4':'p10-34', '5':'p10-35','6':'p10-36','7':'p10-37','8':'p10-38','9':'p10-39'},
                {'1': 'p10-41', '2': 'p10-42', '3':'p10-43', '4':'p10-44', '5':'p10-45','6':'p10-46','7':'p10-47','8':'p10-48','9':'p10-49'},
                {'1': 'p10-51', '2': 'p10-52', '3':'p10-53', '4':'p10-54', '5':'p10-55','6':'p10-56','7':'p10-57','8':'p10-58','9':'p10-59'},
                {'1': 'p10-61', '2': 'p10-62', '3':'p10-63', '4':'p10-64', '5':'p10-65','6':'p10-66','7':'p10-67','8':'p10-68','9':'p10-69'},
                {'1': 'p10-71', '2': 'p10-72', '3':'p10-73', '4':'p10-74', '5':'p10-75','6':'p10-76','7':'p10-77','8':'p10-78','9':'p10-79'},
                {'1': 'p10-81', '2': 'p10-82', '3':'p10-83', '4':'p10-84', '5':'p10-85','6':'p10-86','7':'p10-87','8':'p10-88','9':'p10-89'},
            ],
            geneForm: {},
        };
    },
    created() {
        // Initialization logic for gene management can be added here
        this.getList();
    },
    methods: {
        handleAddGene(geneNo) {
            this.$confirm(
              `质粒编号 ${geneNo} 可用. 是否前往创建一条新质粒?`,
              '新增质粒',
              {
                confirmButtonText: '前往',
                cancelButtonText: '取消',
                type: 'warning',
              }
            ).then(() => {
              // 跳转后怎么加载新增页面，并且带上geneNo参数
              this.$router.push({ path: '/plasmid/gene/', query: { method:'addNo', newGeneName: geneNo } });
            }).catch(() => {
              // User cancelled the action
            });
        },
        openGeneNo(geneNo) {
            console.log("Opening gene number details for geneNo:", geneNo);
  
            for(let i=0;i<9;i++){
                for(let j=1;j<10;j++){
                    var curGeneNameList = this.geneNameList.filter(item => item.geneName.startsWith(geneNo + '-'+ String(i)+String(j)));
                    if(curGeneNameList.length > 0){
                        this.geneNoList[i]['geneId'+j] = curGeneNameList[0].geneId;  
                        this.geneNoList[i]['geneName'+j] = curGeneNameList[0].geneName; 
                    } else {
                        this.geneNoList[i]['geneId'+j] = null;  
                        this.geneNoList[i]['geneName'+j] = null;
                    }
                    this.geneNoList[i][String(j)] = geneNo + '-' + String(i)+String(j);
            }}
            this.loadingDetail = false;
            
            // parse
            this.dialogVisible = true;

            // Additional logic to fetch and display gene number details can be added here
        },
        openGeneDetail(geneId) {
            console.log("Opening gene detail for geneId:", geneId);
            getGene(geneId).then((response) => {
                this.geneForm = response.data;
                this.geneDetailVisible = true;
            });
        },
        // Methods for gene management can be added here
        getList() {
            // Placeholder for fetching gene list
            this.loading=true;
            listGeneNo().then(response => {
                // geneList = 
                //  [{'geneId':1,'geneName':'p24-05_DS-Cav1_TMCT_TFopt_BsaI'},
                // {'geneId':2,'geneName':'p20-02_DS-Cav1_GSopt_BspQI'}
                // ]
                this.geneNameList = response.data;
                this.numberData = this.parseGeneData(this.geneNameList);
                this.loading = false;
            })
            console.log("Fetching gene list...");
        },
        parseGeneData(geneNoList) {
            // Placeholder for parsing gene data
            // geneName: 'p29-31_MPXV-1103'
            var geneNos = []
            geneNoList.forEach((item) => {
                var geneNo = item.geneName.split('-')[0]; // 'p29'
                geneNos.push(geneNo);
            });
            var numberData = this.numberData;
            // 计算geneNos中重复个数，除以81作为频率
            for(let i=0; i<10;i++){
                for (let j=0;j<10;j++){
                    let geneNo = 'p'+ String(i) + String(j);
                    let count = geneNos.filter(x => x === geneNo).length;                    
                    let usage = (count / 81 * 100).toFixed(1);
                    numberData[i]['usage'+String(j)] = usage;
                }
            }
            console.log("Parsed number data:", numberData);
            return numberData;
        }
    }
}
</script>

<style>
.app-container2 {
  padding: 20px;
  background-color: #4dc270;
}
.el-progress-bar__outer{
    background-color: #c9cbd0 !important;
}

</style>