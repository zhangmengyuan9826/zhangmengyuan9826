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
      <el-form-item label="基因名" prop="geneName">
        <el-input
          v-model="queryParams.geneName"
          placeholder="请输入"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="质粒全称" prop="plasmidFullName">
        <el-input
          v-model="queryParams.plasmidFullName"
          placeholder="请输入"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="启动子" prop="promoter" label-width="100px">
        <el-input
          v-model="queryParams.promoter"
          placeholder="请输入"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="批次" prop="batch">
        <el-input
          v-model="queryParams.batch"
          placeholder="请输入"
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
          v-hasPermi="['plasmid:gene:add']"
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
          v-hasPermi="['plasmid:gene:edit']"
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
          v-hasPermi="['plasmid:gene:remove']"
          >删除</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-upload2"
          size="mini"
          @click="handleImport"
          v-hasPermi="['plasmid:gene:import']"
          >导入</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['plasmid:gene:export']"
          >导出</el-button
        >
      </el-col>
    </el-row>
    <right-toolbar
      :showSearch.sync="showSearch"
      @queryTable="getList"
    ></right-toolbar>

    <el-table
      v-loading="loading"
      :data="plasmidList"
      style="width: 100%; border-color: white"
      border
      :row-style="{ height: '20px' }"
      :cell-style="{ padding: '0px' }"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="基因名"
        align="center"
        prop="geneName"
        width="130"
        resizable
      >
        <template slot-scope="scope">
          <el-tooltip
            v-if="scope.row.geneName != null"
            effect="light"
            placement="top"
          >
            <div
              class="content"
              slot="content"
              v-html="scope.row.geneName"
            ></div>
            <div class="oneLine">{{ scope.row.geneName }}</div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        label="质粒载体"
        align="center"
        prop="plasmidVector"
        resizable
      />
      <el-table-column
        label="质粒全称"
        align="center"
        prop="plasmidFullName"
        width="130"
        resizable
      >
        <template slot-scope="scope">
          <el-tooltip
            v-if="
              (scope.row.plasmidFullName != null) &
              (scope.row.plasmidFullName.length > 1)
            "
            effect="light"
            placement="top"
          >
            <div
              class="content"
              slot="content"
              v-html="scope.row.plasmidFullName"
            ></div>
            <div class="oneLine">{{ scope.row.plasmidFullName }}</div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        label="线性酶切"
        align="center"
        prop="linearDigestion"
        resizable
      />
      <el-table-column
        label="抗性基因"
        align="center"
        prop="resistanceGene"
        resizable
      />
      <el-table-column
        label="cds长度(bp)"
        align="center"
        prop="cdsLength"
        resizable
      />
      <el-table-column
        label="质粒全长(bp)"
        align="center"
        prop="plasmidFullLength"
      />
      <el-table-column label="3'UTR" align="center" prop="utr3" resizable />
      <el-table-column label="5'UTR" align="center" prop="utr5" resizable />
      <el-table-column label="polyA" align="center" prop="polyA" resizable />
      <!-- <el-table-column label="CDS序列" align="center" prop="cdsSeq" /> -->
      <el-table-column
        label="启动子"
        align="center"
        prop="promoter"
        resizable
      />
      <el-table-column label="加帽" align="center" prop="cap" resizable />
      <el-table-column label="批次" align="center" prop="batch" resizable />
      <el-table-column label="状态" align="center" prop="status" resizable>
        <template slot-scope="scope">
          <span :style="formatStatusStyle(scope.row.status)">
            {{ formatStatus(scope.row.status) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" resizable>
        <template slot-scope="scope">
          <el-tooltip
            v-if="scope.row.remark != null"
            effect="light"
            placement="top"
          >
            <div class="content" slot="content" v-html="scope.row.remark"></div>
            <div class="oneLine">{{ scope.row.remark }}</div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="110"
        resizable
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(scope.row.geneId)"
            >详情</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            :disabled="scope.row.orderNo != '' & scope.row.orderNo != null"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['plasmid:gene:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-copy-document"
            @click="handleCopy(scope.row)"
            v-hasPermi="['plasmid:gene:add']"
            >复制</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['plasmid:gene:remove']"
            >删除</el-button>
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

    <!-- 添加或修改质粒基因管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="94%" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-col :span="8">
          <el-form-item label="基因名" prop="geneName" label-width="100px">
            <el-input 
            clearable 
            v-model="form.geneName" 
            onkeyup="value=value.replace(/[^\x00-\xff]/g, '')"
            placeholder="请输入基因名，禁止输入中文及中文字符" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="质粒载体"
            prop="plasmidVector"
            label-width="100px"
          >
            <el-select
              clearable
              v-model="form.plasmidVector"
              default-first-option
              placeholder="请选择或输入"
            >
              <el-option
                v-for="item in fieldDataDict['plasmidVector']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
            <el-form-item label="订单编码" prop="orderNo">
              <el-input v-model="form.orderNo" :disabled='true' placeholder="由系统生成编码" />
            </el-form-item>
          </el-col>
        <el-col :span="12">
          <el-form-item label="载体编号" prop="vectorNo" label-width="100px">
            <el-input clearable v-model="form.vectorNo" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="质粒全长名称"
            prop="plasmidFullName"
            label-width="110px"
          >
            <el-input
              clearable
              v-model="form.plasmidFullName"
              onkeyup="value=value.replace(/[^\x00-\xff]/g, '')"
              placeholder="请输入质粒全长名称，禁止输入中文及中文字符"
            />
          </el-form-item>
        </el-col>
        <el-col>
          <el-form-item label="CDS序列" prop="cdsSeq" label-width="100px">
            <el-input
              type="textarea"
              v-model="form.cdsSeq"
              onkeyup="value=value.replace(/[^ATCGUatcgu]/g, '')"
              :autosize="{ minRows: 1, maxRows: 10 }"
              resize="none"
              placeholder="请输入序列，只能输入ATCGU或atcgu"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="线性酶切"
            prop="linearDigestion"
            label-width="100px"
          >
            <el-select
              clearable
              v-model="form.linearDigestion"
              default-first-option
              placeholder="请选择或输入"
            >
              <el-option
                v-for="item in fieldDataDict['linearDigestion']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="8">
          <el-form-item
            label="5'酶切"
            prop="digestion5"
            label-width="130px"
            
          >
            <el-select
              clearable
              v-model="form.digestion5"
              default-first-option
              placeholder="请选择或输入"
            >
              <el-option
                v-for="item in fieldDataDict['digestion5']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="3'酶切"
            prop="digestion3"
            label-width="100px"
          >
            <el-select
              clearable
              v-model="form.digestion3"
              default-first-option
              placeholder="请选择或输入"
            >
              <el-option
                v-for="item in fieldDataDict['digestion3']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col> -->
        <el-col :span="8">
          <el-form-item
            label="抗性基因"
            prop="resistanceGene"
            label-width="110px"
          >
            <el-select
              clearable
              v-model="form.resistanceGene"
              default-first-option
              placeholder="请选择或输入"
            >
              <el-option
                v-for="item in fieldDataDict['resistanceGene']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="linker" prop="linker" label-width="60px">
            <el-input
              v-model="form.linker"
              placeholder="请与CDS表达蛋白数量保持一致。用‘;’分割。"
            />            
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="cds长度(bp)"
            prop="cdsLength"
            label-width="100px"
          >
            <el-input clearable v-model="form.cdsLength" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="质粒全长(bp)"
            prop="plasmidFullLength"
            label-width="110px"
          >
            <el-input
              clearable
              v-model="form.plasmidFullLength"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="CDS表达蛋白数量"
            prop="cdsProteinNum"
            label-width="140px"
          >
            <el-input-number 
              v-model="form.cdsProteinNum"
              controls-position="right"
              :min="1"
              :precision="0"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="3'UTR" prop="utr3" label-width="100px">
            <template>
              <el-popover
                placement="top"
                width="300"
                trigger="hover"
                :content="selectedOptionLabel(form.utr3, fieldDataDict['utr3'])"
                :disabled="
                  selectedOptionLabel(form.utr3, fieldDataDict['utr3']) ==''
                "
              >
                <el-select
                  slot="reference"
                  v-model="form.utr3"
                  default-first-option
                  placeholder="请选择或输入"
                  clearable
                >
                  <el-option
                    v-for="item in fieldDataDict['utr3']"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-popover>
            </template>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="5'UTR" prop="utr5" label-width="110px">
            <template>
              <el-popover
                placement="top"
                width="300"
                trigger="hover"
                :content="selectedOptionLabel(form.utr3, fieldDataDict['utr5'])"
                :disabled="
                  selectedOptionLabel(form.utr3, fieldDataDict['utr5']) == ''
                "
              >
                <el-select
                  slot="reference"
                  v-model="form.utr5"
                  default-first-option
                  placeholder="请选择或输入"
                  clearable
                >
                  <el-option
                    v-for="item in fieldDataDict['utr5']"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-popover>
            </template>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="polyA" prop="polyA" label-width="100px">
            <template>
              <el-popover
                placement="top"
                width="300"
                trigger="hover"
                :content="
                  selectedOptionLabel(form.polyA, fieldDataDict['polyA'])
                "
                :disabled="
                  selectedOptionLabel(form.polyA, fieldDataDict['polyA']).size ===0
                "
              >
                <el-select
                  slot="reference"
                  v-model="form.polyA"
                  default-first-option
                  placeholder="请选择或输入"
                  clearable
                >
                  <el-option
                    v-for="item in fieldDataDict['polyA']"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-popover>
            </template>
          </el-form-item>
        </el-col>
        

        <el-col :span="8">
          <el-form-item label="启动子" prop="promoter" label-width="100px">
            <el-select
              v-model="form.promoter"
              default-first-option
              placeholder="请选择或输入"
              clearable
            >
              <el-option
                v-for="item in fieldDataDict['promoter']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="加帽" prop="cap" label-width="110px">
            <el-input clearable v-model="form.cap" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="8">
          <el-form-item label="增强子" prop="enhancer" label-width="130px">
            <el-input clearable v-model="form.enhancer" placeholder="请输入" />
          </el-form-item>
        </el-col> -->

        <el-col :span="8">
          <el-form-item label="载体类型 I" prop="vectorType1" label-width="100px">
            <el-select
              v-model="form.vectorType1"
              default-first-option
              placeholder="请选择或输入"
              clearable
            >
              <el-option
                v-for="item in fieldDataDict['vectorType1']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="载体类型 II" prop="vectorType2" label-width="100px">
            <el-select
              v-model="form.vectorType2"
              default-first-option
              placeholder="请选择或输入"
              clearable
            >
              <el-option
                v-for="item in fieldDataDict['vectorType2']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="预测蛋白类型" prop="proteinType" label-width="110px">
            <el-select
              v-model="form.proteinType"
              placeholder="请选择或输入"
              clearable
            >
              <el-option
                v-for="item in fieldDataDict['proteinType']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="信号肽" prop="signalPeptide" label-width="100px">
            <el-select
              v-model="form.signalPeptide"
              default-first-option
              placeholder="请选择或输入"
              clearable
            >
              <el-option
                v-for="item in fieldDataDict['signalPeptide']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col >
          <el-form-item label="批次" prop="batch" label-width="100px">
            <el-input clearable v-model="form.batch" placeholder="请输入" />
          </el-form-item>
        </el-col> -->
        <el-col>
          <el-form-item label="合成方式" prop="compoundMethod" label-width="100px">
            <el-input
              type="textarea"
              v-model="form.compoundMethod"
              :autosize="{ minRows: 1, maxRows: 10 }"
              resize="none"
              placeholder="请输入备注"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>

        <el-col>
          <el-form-item label="备注" prop="remark" label-width="100px">
            <el-input
              type="textarea"
              v-model="form.remark"
              :autosize="{ minRows: 1, maxRows: 10 }"
              resize="none"
              placeholder="请输入备注"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="viewType !== 'View'" type="primary" @click="submitTemp"
          >暂 存</el-button
        >
        <el-button v-if="viewType !== 'View'" type="primary" @click="submitForm"
          >确 定</el-button
        >
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 物料导入对话框 -->
    <el-dialog
      :title="upload.title"
      :visible.sync="upload.open"
      width="400px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <!-- <div class="el-upload__tip" slot="tip">
            <el-checkbox v-model="upload.updateSupport" />
            是否更新已经存在的物料数据
          </div> -->
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link
            type="primary"
            :underline="false"
            style="font-size: 12px; vertical-align: baseline"
            @click="importTemplate"
            >下载模板</el-link
          >
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
  listGene,
  getGene,
  delGene,
  addGene,
  updateGene,
} from "@/api/plasmid/gene";
import { getDictDataListByDictType } from "@/api/plasmid/dictData";
import { getDicts } from "@/api/system/dict/data";
import { getToken } from "@/utils/auth";
import { Message } from 'element-ui';

export default {
  name: "Gene",
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
      // 质粒基因管理表格数据
      plasmidList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        geneName: null,
        plasmidVector: null,
        plasmidFullName: null,
        linearDigestion: null,
        resistanceGene: null,
        promoter: null,
        vectorType1: null,
        vectorType2: null,
        tagInfo: null,
        linker: null,
        signalPeptide: null,
        proteinType: null,
        enhancer: null,
        batch: null,
      },
      // 表单参数
      form: {
      },
      // 表单校验
      rules: {
        geneName: [
          { required: true, message: "基因名不能为空", trigger: "blur" },
        ],
        plasmidVector: [
          { required: true, message: "质粒载体不能为空", trigger: "change" },
        ],
        vectorNo: [
          { required: true, message: "载体编号不能为空", trigger: "blur" },
        ],
        cdsSeq: [
          { required: true, message: "CDS序列不能为空", trigger: "change" },
        ],
        plasmidFullName: [
          { required: true, message: "质粒全称不能为空", trigger: "blur" },
        ],
        linearDigestion: [
          { required: true, message: "线性酶切不能为空", trigger: "change" },
        ],
        resistanceGene: [
          { required: true, message: "抗性基因不能为空", trigger: "blur" },
        ],
        cdsLength: [
          { required: true, message: "cds长度不能为空", trigger: "change" },
        ],
        plasmidFullLength: [
          { required: true, message: "质粒全长不能为空", trigger: "blur" },
        ],
        utr3: [
          { required: true, message: "3'UTR不能为空", trigger: "change" },
        ],
        utr5: [
          { required: true, message: "5'UTR不能为空", trigger: "blur" },
        ],
        polyA: [
          { required: true, message: "polyA不能为空", trigger: "change" },
        ],
        promoter: [
          { required: true, message: "启动子不能为空", trigger: "blur" },
        ],
        cap: [
          { required: true, message: "加帽不能为空", trigger: "change" },
        ],
        vectorType1: [
          { required: true, message: "载体类型 I不能为空", trigger: "blur" },
        ],
        vectorType2: [
          { required: true, message: "载体类型 II不能为空", trigger: "change" },
        ],
        linker: [
          { required: true, message: "linker不能为空", trigger: "blur" },
        ],
        cdsProteinNum: [
          { required: true, message: "CDS表达蛋白数量不能为空", trigger: "change" },
        ],
        signalPeptide: [
          { required: true, message: "信号肽不能为空", trigger: "blur" },
        ],
        proteinType: [
          { required: true, message: "预测蛋白类型不能为空", trigger: "change" },
        ],
      },
      fieldList: [],
      _dicts: {},
      fieldDataDict: [],
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
        url: process.env.VUE_APP_BASE_API + "/plasmid/gene/importData",
      },
      statusDict: {
        created: "已创建",
        temporary: "草稿",
      },
      statusColor: {
        created: "green",
        temporary: "orange",
        ordered: "grey",
      },
      selectedValue: "",
      viewType: "View",
    };
  },
  watch: {
    "form.cdsSeq"(newVal) {
      this.form.cdsLength = newVal.length;
    },
    "form.geneName"(newVal) {
      var _geneName = newVal != null & newVal != '' ? newVal : ""
      var _pVector = this.form.plasmidVector != null & this.form.plasmidVector != '' ? this.form.plasmidVector : ""
      this.form.plasmidFullName = _geneName +"_" +_pVector;
    },
    "form.plasmidVector"(newVal) {
      var _pVector = newVal != null & newVal != '' ? newVal : ""
      var _geneName = this.form.geneName != null & this.form.geneName != '' ? this.form.geneName : ""
      this.form.plasmidFullName = _geneName+"_"+_pVector;
    },
  },
  created() {
    this.showSearch = false;
    this.initData();
  },
  methods: {
    selectedOptionLabel(value, options) {
      if (options) {
        const option = options.find((item) => item.value === value);
        return option ? "序列：" + option.content : "";
      }
      return "";
    },
    /** 查询质粒基因管理列表 */
    getList() {
      this.loading = true;
      listGene(this.queryParams).then((response) => {
        this.plasmidList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    initData() {
      getDicts("plasmid_field").then((response) => {
        this.fieldList = response.data.map((item) => item.dictValue);
        this.getField();
        this.getList();
      });
    },
    getField() {
      this.loading = true;
      if (this.fieldList.length === 0) {
        this.loading = false;
        this.showSearch = true;
        return;
      }
      this.fieldList.forEach((field) => {
        getDictDataListByDictType(field).then((response) => {
          this.fieldDataDict[field] = response.data.map((item) => ({
            label: item["dictLabel"],
            value: item["dictValue"],
            content: item["content"],
          }));
        });
      });
      this.loading = false;
      this.showSearch = true;
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        geneId: null,
        geneName: null,
        plasmidVector: null,
        plasmidFullName: null,
        linearDigestion: null,
        resistanceGene: null,
        cdsLength: null,
        plasmidFullLength: null,
        utr3: null,
        utr5: null,
        digestion5:null,
        digestion3:null,
        polyA: null,
        cdsSeq: null,
        promoter: 'T7',
        vectorType1: '原核',
        vectorType2: null,
        tagInfo: null,
        linker: '无',
        cdsProteinNum: 1,
        signalPeptide: null,
        proteinType: null,
        enhancer: null,
        batch: null,
        createTime: null,
        createBy: null,
        updateTime: null,
        updateBy: null,
        delFlag: null,
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
      this.ids = selection.map((item) => item.geneId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.viewType = "Edit";
      this.open = true;
      this.title = "添加质粒基因";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const geneId = row.geneId || this.ids;
      this.viewType = "Edit";
      getGene(geneId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改质粒基因";
      });
    },
    submitTemp() {
      this.form["status"] = "temporary";
      if (this.form.geneId != null) {
        updateGene(this.form).then((response) => {
          this.$modal.msgSuccess("修改成功");
          this.open = false;
          this.getList();
        });
      } else {
        addGene(this.form).then((response) => {
          this.$modal.msgSuccess("新增成功");
          this.open = false;
          this.getList();
        });
      }
    },
    /** 修改按钮操作 */
    handleCopy(row) {
      this.reset();
      const geneId = row.geneId || this.ids;
      this.viewType = "Copy";
      getGene(geneId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "复制添加质粒基因";
      });
    },
    validateCdsProandLinker(num,linker){
      if(num === 1){
        if(linker != '无'){
          return false
        }
      } else if(num === 2){
        if(linker == '无'){
          return false
        }else if(linker == '' | linker == null){
          return false
        } else if(linker.indexOf(";")!== -1){
          return false
        }
      } else if(num > 2){
        if(linker.indexOf(";")=== -1){
          return false
        } else if(linker.split(";").length !== num-1){
          return false
        }
      }
      return true;
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          //规则校验
          if(!this.validateCdsProandLinker(this.form.cdsProteinNum,this.form.linker)){
            Message.warning("CDS表达蛋白数量 和 linker 填写校验不通过！")
            return
          }
          this.form.status = "created";
          if (this.form.geneId != null) {
            if(this.viewType == "Copy"){
              this.form['geneId'] = null;
              this.form['orderNo'] = null;
              this.form['updateTime'] = null;
              this.form['updateBy'] = null;
              addGene(this.form).then((response) => {
                this.$modal.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              });
            } else {
              updateGene(this.form).then((response) => {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              });
            }
            
          } else {
            addGene(this.form).then((response) => {
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
      const geneIds = row.geneId || this.ids;
      this.$modal
        .confirm('是否确认删除质粒基因编号为"' + geneIds + '"的数据项？')
        .then(function () {
          return delGene(geneIds);
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
        "plasmid/gene/export",
        {
          ...this.queryParams,
        },
        `plasmid_${new Date().getTime()}.xlsx`
      );
    },
    handleImport() {
      this.upload.title = "质粒基因导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      this.download(
        "plasmid/gene/downloadTemplate",
        {},
        `plasmid_gene_template_${new Date().getTime()}.xlsx`
      );
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(
        "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" +
          response.msg +
          "</div>",
        "导入结果",
        { dangerouslyUseHTMLString: true }
      );
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },
    formatLongPurpose(purpose) {
      if (purpose && purpose.length >= 10) {
        return purpose.substring(0, 10) + "...";
      }
      return purpose;
    },
    formatStatus(statusCode) {
      return this.statusDict[statusCode];
    },
    formatStatusStyle(statusCode) {
      return { color: this.statusColor[statusCode] };
    },
    handleDetail(geneId) {
      getGene(geneId).then((response) => {
        this.form = response.data;
        this.viewType = "View";
        this.open = true;
        this.title = "质粒基因详情";
      });
    },
  }
};
</script>
<style type="text/css">
::v-deep(.el-table__body td) {
  border: none !important;
}
::v-deep(.el-table--border),
::v-deep(.el-table--group) {
  border: none !important;
}
.el-table--border .el-table__cell {
  border-right: white;
}
.content {
  max-width: 300px;
}
.oneLine {
  overflow: hidden;
  white-space: pre;
  text-overflow: ellipsis;
}
</style>
