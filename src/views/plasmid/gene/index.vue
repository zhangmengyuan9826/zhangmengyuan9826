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
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleDownload"
          v-hasPermi="['plasmid:gene:download']"
          >下载质粒</el-button
        >
      </el-col>
    </el-row>
    <!-- <right-toolbar
      :showSearch.sync="showSearch"
      @queryTable="getList"
    ></right-toolbar> -->

    <div >
      <el-table
        v-loading="loading"
        :data="plasmidList"
        style="width: 100%; border-color: white;"
        border
        height="calc(100vh - 40px)"  
        :row-style="{ height: '20px' }"
        :cell-style="{ padding: '0px'}"
        :header-cell-style="{ color: '#606266', fixed: true, background: '#f5f7fa', fontWeight: 'bold' }"
        @selection-change="handleSelectionChange"
      >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="序号"
        align="center"
        type="index"
        width="60"
        :index="(index) => (queryParams.pageNum - 1) * queryParams.pageSize + index + 1"
      />
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
      <el-table-column
        label="启动子"
        align="center"
        prop="promoter"
        resizable
      />
      <el-table-column label="状态" align="center" prop="status" resizable>
        <template slot-scope="scope">
          <span :style="formatStatusStyle(scope.row.status)">
            {{ formatStatus(scope.row.status) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createBy" resizable >
        <template slot-scope="scope">
          {{ getNickName(scope.row.createBy) }}
        </template>
      </el-table-column>  
      <el-table-column label="设计方案" align="center" prop="designMethod" resizable>
        <template slot-scope="scope">
          <el-tooltip
            v-if="scope.row.designMethod != null"
            effect="light"
            placement="top"
          >
            <div class="content" slot="content" v-html="scope.row.designMethod"></div>
            <div class="oneLine">{{ scope.row.designMethod }}</div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="到货日期" align="center" prop="receiveDate" resizable />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="160"
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
            icon="el-icon-view"
            @click="handleFullSeq(scope.row)"
            >序列</el-button
          >
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            :disabled="scope.row.orderNo != '' && scope.row.orderNo != null"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['plasmid:gene:edit']"
            >修改</el-button
          > -->
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
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
            >复制</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['plasmid:gene:remove']"
            >删除</el-button
          >
        </template>
      </el-table-column>
      </el-table>
    </div>
<div class="load-more-row">
  <template v-if="plasmidList.length < total">
    <el-button
      type="primary"
      plain
      icon="el-icon-plus"
      size="mini"
      @click="loadMoreData"
    >点击加载更多
    </el-button>
  </template>
  <template v-else>
    <span style="color: #909399;">已加载全部数据</span>
  </template>
  <span class="data-count">共 {{ plasmidList.length }} / {{ total }} 条数据</span>
</div>
    <!-- <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    /> -->

    <!-- 添加或修改质粒基因管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="94%" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-col :span="8">
          <el-form-item label="基因名" prop="geneName" label-width="100px">
            <el-input
              clearable
              v-model="form.geneName"
              onkeyup="value=value.replace(/[^\x00-\xff]/g, '')"
              placeholder="请输入基因名，禁止输入中文及中文字符"
            />
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
            <el-input
              v-model="form.orderNo"
              disabled
              placeholder="由系统生成编码"
            />
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
              placeholder="请输入序列，只能输入ATCGU或atcgu；环化载体输入完整序列"
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
          <el-form-item label="linker" prop="linker" label-width="110px">
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
              placeholder="请输入；填0则由系统生成；"
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
                  selectedOptionLabel(form.utr3, fieldDataDict['utr3']) == ''
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
          <el-form-item label="polyA" prop="polyA" label-width="110px">
            <template>
              <el-popover
                placement="top"
                width="300"
                trigger="hover"
                :content="
                  selectedOptionLabel(form.polyA, fieldDataDict['polyA'])
                "
                :disabled="
                  selectedOptionLabel(form.polyA, fieldDataDict['polyA'])
                    .size === 0
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
        <el-col :span="8">
          <el-form-item
            label="原核/真核载体"
            prop="vectorType1"
            label-width="110px"
          >
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
          <el-form-item label="载体类型" prop="vectorType2" label-width="100px" >
            <el-select
              v-model="form.vectorType2"
              default-first-option
              disabled
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
          <el-form-item
            label="预测蛋白类型"
            prop="proteinType"
            label-width="110px"
          >
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
          <el-form-item label="信号肽" prop="signalPeptide" label-width="110px">
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
        <el-col>
          <el-form-item
            label="合成方式"
            prop="compoundMethod"
            label-width="100px"
          >
            <el-input
              type="textarea"
              v-model="form.compoundMethod"
              :autosize="{ minRows: 1, maxRows: 10 }"
              resize="none"
              placeholder="请输入合成方式"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col>
          <el-form-item label="设计方案" prop="designMethod" label-width="100px">
            <el-input
              type="textarea"
              v-model="form.designMethod"
              :autosize="{ minRows: 1, maxRows: 10 }"
              resize="none"
              placeholder="请输入设计方案"
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
        <span>下单情况</span>
      <el-row>
        <el-col :span="12">
          <el-form-item label="下单日期" prop="orderDate" label-width="100px">
            <el-date-picker
              v-model="form.orderDate"
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
              v-model="form.receiveDate"
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
    <!-- 基因导入对话框 -->
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
        :action="upload.url + '?isSaveTemp=' + upload.isSaveTemp"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">
            <el-checkbox v-model="upload.isSaveTemp" />
            校验失败的信息是否存为草稿？
          </div>
        <div class="el-upload__tip text-center" slot="tip">
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
    <el-dialog
      title="完整序列"
      :visible.sync="showFullSeq"
      width="650px"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="dna-container">
        <pre v-html="fullSeqHtml"></pre>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listGene,
  getGene,
  getGeneFullSeq,
  delGene,
  addGene,
  updateGene,
} from "@/api/plasmid/gene";
import {
  getDictDataShortListByDictType,
  getDictDataSeqListByDictType,
} from "@/api/plasmid/dictData";
import { listPVNames, getPlasmidVentorByName } from "@/api/plasmid/meta";
import { getDicts } from "@/api/system/dict/data";
import { listUserAll } from "@/api/system/user";

import { getToken } from "@/utils/auth";
import { Message } from "element-ui";

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
        pageSize: 20,
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
      form: {},
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
        cdsLength: [
          { required: true, message: "cds长度不能为空", trigger: "change" },
        ],
        plasmidFullLength: [
          { required: true, message: "质粒全长不能为空", trigger: "blur" },
        ],
        utr3: [{ required: true, message: "3'UTR不能为空", trigger: "change" }],
        utr5: [{ required: true, message: "5'UTR不能为空", trigger: "blur" }],
        polyA: [
          { required: true, message: "polyA不能为空", trigger: "change" },
        ],
        promoter: [
          { required: true, message: "启动子不能为空", trigger: "blur" },
        ],
        vectorType1: [
          {
            required: true,
            message: "原核/真核 载体不能为空",
            trigger: "blur",
          },
        ],
        vectorType2: [
          { required: true, message: "载体类型不能为空", trigger: "change" },
        ],
        linker: [
          { required: true, message: "linker不能为空", trigger: "blur" },
        ],
        cdsProteinNum: [
          {
            required: true,
            message: "CDS表达蛋白数量不能为空",
            trigger: "change",
          }          
        ],
        designMethod: [
            { required: true, message: "设计方案不能为空", trigger: "blur" },
          ],
      },
      circRules: {
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
        vectorType1: [
          { required: true, message: "原核/真核 载体不能为空", trigger: "blur" },
        ],
        vectorType2: [
          { required: true, message: "载体类型不能为空", trigger: "change" },
        ],
      },
      fieldList: [],
      fieldDataDict: [],
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        isSaveTemp: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/plasmid/gene/importData",
      },
      statusDict: {
        status2: "已创建",
        status1: "草稿",
      },
      statusColor: {
        status2: "green",
        status1: "orange",
        status3: "grey",
      },
      viewType: "View",
      pVectorFormElements: [
        "resistanceGene",
        "utr3",
        "utr5",
        "polyA",
        "promoter",
        "vectorType1",
        "vectorType2",
      ],
      linkerInfos: {},
      resistanceGeneInfos: {},
      fieldSeqList: ["linker"],
      signalPeptideInfos: {},
      loadFullSeq: false,
      showFullSeq: false,
      fullSeq: "atcg...",
      fullSeqHtml: "",
      userList: [],
      originalPVector: "",
    };
  },
  computed: {},
  watch: {
    "form.cdsSeq"(newVal) {
      if (newVal && newVal != "") {
        this.form.cdsLength = newVal.length;
        this.getLinkerInfo(newVal);
        this.getSignalPeptideInfo(newVal);
      } else {
        this.form.cdsLength = 0;
      }
    },
    "form.geneName"(newVal) {
      var _geneName = (newVal != null) & (newVal != "") ? newVal : "";
      var _pVector =
        (this.form.plasmidVector != null) & (this.form.plasmidVector != "")
          ? this.form.plasmidVector
          : "";
      this.form.plasmidFullName = _geneName + "_" + _pVector;
    },
    "form.plasmidVector"(newVal) {
      // 检测到质粒载体发生变化，是否更新质粒骨架信息？
      // 提示用户确认是否更新骨架信息
      if(this.viewType === 'View' || this.open == false){
        return
      }
      if(newVal == this.originalPVector || newVal == null || newVal == ""){
        return
      } else {
        this.originalPVector = newVal
      }

      this.$confirm('检测到质粒载体发生改变，是否更新质粒骨架信息？', '提示', {
        confirmButtonText: '更新',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          var _pVector = (newVal != null) & (newVal != "") ? newVal : "";
          var _geneName =
            (this.form.geneName != null) & (this.form.geneName != "")
              ? this.form.geneName
              : "";
          this.form.plasmidFullName = _geneName + "_" + _pVector;
          this.generateFormByPlasmidVector(newVal);
        })
        .catch(() => {
          // 用户取消：不执行更新
        });      
    },
    'form.vectorType2'(newVal){
        if(newVal == "环化"){
            this.rules.polyA = [{ required: false }];
            this.rules.utr3 = [{ required: false }];
            this.rules.utr5 = [{ required: false }];
            this.rules.resistanceGeneSite = [{ required: false }];
            this.rules.promoter = [{ required: false }]
          } else {
            this.rules.polyA = [  { required: true, message: "polyA不能为空", trigger: "change" } ];
            this.rules.utr3 = [ { required: true, message: "3'UTR不能为空", trigger: "change" } ];
            this.rules.utr5 = [ { required: true, message: "5'UTR不能为空", trigger: "blur" } ];
            this.rules.resistanceGeneSite = [ { required: true, message: "抗性基因不能为空", trigger: "change" } ];
            this.rules.promoter = [ { required: true, message: "启动子不能为空", trigger: "blur" } ]
          }
          this.$nextTick(() => {
            this.$refs.formRef && this.$refs.formRef.clearValidate();
          });
      
  }},
  created() {
    this.showSearch = false;
    this.initData();
  },
  methods: {
  loadMoreData() {
      this.queryParams.pageSize += 20;
      this.getList();
    },
    getUserList() {
      listUserAll().then((response) => {
        this.userList = response;
      });
    },
    // 获取用户中文昵称
    getNickName(userName) {
      const user = this.userList.find((u) => u.userName === userName);
      return user ? user.nickName : userName;
    },
    formattedDnaSimple(fullSeq) {
      const chunkSize = 60;
      let html = "";
      for (let i = 0; i < fullSeq.length; i += chunkSize) {
        const lineNumber = (i + 1).toString().padStart(6, " ");
        const chunk = fullSeq.substr(i, chunkSize);        
        // Add space every 10 characters
        let spacedChunk = '';
        for (let j = 0; j < chunk.length; j++) {
          const char = chunk[j];      
          spacedChunk += char;      
          if ((j + 1) % 10 === 0 && j !== chunk.length - 1) {
            spacedChunk += ' ';
          }
        }        
        html += `<span class="line-number">${lineNumber}</span> ${spacedChunk}\n`;
      }
      return html;
    },
    // 格式化DNA序列显示
    formattedDna(fullSeqInfo) {
      const fullSeq = fullSeqInfo['pvSeq']
      const chunkSize = 60;
      let html = "";
      for (let i = 0; i < fullSeq.length; i += chunkSize) {
        const lineNumber = (i + 1).toString().padStart(6, " ");
        const chunk = fullSeq.substr(i, chunkSize);        
        // Process each character in the chunk
        let spacedChunk = '';
        for (let j = 0; j < chunk.length; j++) {
          const globalPos = i + j + 1; // +1 because positions start at 1
          const char = chunk[j];      
          // format colors
          if (globalPos >= fullSeqInfo['polyASiteStart'] && globalPos <= fullSeqInfo['polyASiteEnd']) {
            spacedChunk += `<span class="polyA-highlight content-highlight">${char}</span>`;
          } else if (globalPos >= fullSeqInfo['utr3SiteStart'] && globalPos <= fullSeqInfo['utr3SiteEnd']) {
            spacedChunk += `<span class="utr3-highlight content-highlight">${char}</span>`;
          }else if (globalPos >= fullSeqInfo['cdsSiteStart'] && globalPos <= fullSeqInfo['cdsSiteEnd']) {
            spacedChunk += `<span class="cds-highlight content-highlight">${char}</span>`;
          }else if (globalPos >= fullSeqInfo['utr5SiteStart'] && globalPos <= fullSeqInfo['utr5SiteEnd']) {
            spacedChunk += `<span class="utr5-highlight content-highlight">${char}</span>`;
          }else if (globalPos >= fullSeqInfo['promoterSiteStart'] && globalPos <= fullSeqInfo['promoterSiteEnd']) {
            spacedChunk += `<span class="promoter-highlight content-highlight">${char}</span>`;
          }else if (globalPos >= fullSeqInfo['resistanceGeneSiteStart'] && globalPos <= fullSeqInfo['resistanceGeneSiteEnd']) {
            spacedChunk += `<span class="resistance-highlight content-highlight">${char}</span>`;
          }else {
            spacedChunk += char;
          }      
          // Add space every 10 characters
          if ((j + 1) % 10 === 0 && j !== chunk.length - 1) {
            spacedChunk += ' ';
          }
        }        
        html += `<span class="line-number">${lineNumber}</span> ${spacedChunk}\n`;
      }
      return html;
    },
    // 自动从cds序列中识别到linker序列，并计算表达蛋白的数量
    getLinkerInfo(cdsSeq) {
      var cdsProteinSeq = this.translateSequence(cdsSeq);
      var linkerList = [];
      var proteinNum = 1;
      if (this.linkerInfos && this.linkerInfos.length > 0) {
        for (let i = 0; i < this.linkerInfos.length; i++) {
          var linkerProteinSeq = this.linkerInfos[i]["proteinSeq"];
          var match =
            cdsProteinSeq.match(new RegExp(linkerProteinSeq, "gi")) || [];
          proteinNum = proteinNum + match.length;
          if (match.length > 0) {
            linkerList = [
              ...linkerList,
              ...Array(match.length).fill(this.linkerInfos[i]["dictValue"]),
            ];
          }
        }
      }
      if (linkerList.length > 0) {
        this.$set(this.form, "cdsProteinNum", proteinNum);
        this.$set(this.form, "linker", linkerList.join(";"));
      } else {
        this.$set(this.form, "cdsProteinNum", 1);
        this.$set(this.form, "linker", "无");
      }
    },
    // 自动从cds序列中识别到信号肽
    getSignalPeptideInfo(cdsSeq) {
      var cdsProteinSeq = this.translateSequence(cdsSeq);
      if (this.signalPeptideInfos && this.signalPeptideInfos.length > 0) {
        for (let i = 0; i < this.signalPeptideInfos.length; i++) {
          var signalPeptideProteinSeq =
            this.signalPeptideInfos[i]["proteinSeq"];
          if (signalPeptideProteinSeq != "" && signalPeptideProteinSeq != null 
              && signalPeptideProteinSeq == cdsProteinSeq.slice(0, signalPeptideProteinSeq.length) ){
              this.$set(
                this.form,
                "signalPeptide",
                this.signalPeptideInfos[i]["dictValue"]
              );
              break;            
          }
        }
      }
    },
    // 质粒载体更新后，同步更新表单字段信息
    generateFormByPlasmidVector(pVector) {
      if (pVector && pVector != "") {
        getPlasmidVentorByName(pVector).then((response) => {
          if (response.data && response.data != "") {
            var pVector = response.data;
            for (let i = 0; i < this.pVectorFormElements.length; i++) {
              this.$set(
                this.form,
                this.pVectorFormElements[i],
                pVector[this.pVectorFormElements[i]]
              );
            }
            // checkRules(pVector.vectorType2)
            
          }
        });
      }
    },
    // 根据value获取option的label和content
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
    // 初始化数据字典的数据
    initData() {
      getDicts("plasmid_field").then((response) => {
        this.fieldList = response.data.map((item) => item.dictValue);
        this.getField();
        this.getFieldSeqs();
        this.getPlasmidVectorList();
        this.getUserList();
        this.getList();
      });
    },
    getPlasmidVectorList(){
      listPVNames().then((response) => {
        this.fieldDataDict['plasmidVector'] = response.data.map((item) => ({
          label: item,
          value: item,
        }));
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
        getDictDataShortListByDictType(field).then((response) => {
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
    // 初始化序列数据字典——存在核酸活蛋白序列的字段
    getFieldSeqs() {
      getDictDataSeqListByDictType("linker").then((response) => {
        this.linkerInfos = response.data;
      });
      getDictDataSeqListByDictType("resistanceGene").then((response) => {
        this.resistanceGeneInfos = response.data;
      });
      getDictDataSeqListByDictType("signalPeptide").then((response) => {
        this.signalPeptideInfos = response.data;
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
        digestion5: null,
        digestion3: null,
        polyA: null,
        cdsSeq: null,
        promoter: "T7",
        vectorType1: "原核",
        vectorType2: "线性",
        tagInfo: null,
        linker: "无",
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
        designMethod: null,
        remark: null,
        receiveDate: null,
        orderDate: null,
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
        this.originalPVector = response.data.plasmidVector;
        this.open = true;
        this.title = "修改质粒基因";
      });
    },
    // 提交暂存草稿
    submitTemp() {
      this.form["status"] = "status1";
      if (this.viewType == "Copy") {
        this.form["geneId"] = null;
        this.form["orderNo"] = null;
        this.form["updateTime"] = null;
        this.form["updateBy"] = null;
        addGene(this.form)
          .then((response) => {
            this.$modal.msgSuccess("新增成功");
            this.open = false;
            this.getList();
          })
          .catch((err) => {
            Message.error(err);
            return;
          });
      } else {
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
      }
    },
    /** 修改按钮操作 */
    handleCopy(row) {
      this.reset();
      const geneId = row.geneId || this.ids;
      this.viewType = "Copy";
      getGene(geneId).then((response) => {
        this.form = response.data;
        this.originalPVector = response.data.plasmidVector;
        this.open = true;
        this.title = "复制添加质粒基因";
      });
    },
    // CDS表达蛋白数量 和 linker 填写校验
    validateCdsProAndLinker(num, linker) {
      if (num === 1) {
        if (linker != "无") {
          return false;
        }
      } else if (num === 2) {
        if (linker == "无") {
          return false;
        } else if ((linker == "") | (linker == null)) {
          return false;
        } else if (linker.indexOf(";") !== -1) {
          return false;
        }
      } else if (num > 2) {
        if (linker.indexOf(";") === -1) {
          return false;
        } else if (linker.split(";").length !== num - 1) {
          return false;
        }
      }
      return true;
    },
    // 表单规则校验
    validateForm(formInfo) {
      if (
        !this.validateCdsProAndLinker(formInfo.cdsProteinNum, formInfo.linker)
      ) {
        Message.warning("CDS表达蛋白数量 和 linker 填写校验不通过！");
        return false;
      }
      if (formInfo.cdsSeq) {
        const stopCodons = ["UAA", "UAG", "UGA", "TAA", "TAG", "TGA"];
        const seq = formInfo.cdsSeq.toUpperCase();
        const lastCodon = seq.slice(-3);
        if (!stopCodons.includes(lastCodon)) {
          Message.error("cds序列结尾无终止密码子！");
          return false;
        }
      }
      return true;
      // if(!this.validateCdsProAndLinker(formInfo.plasmidVector, formInfo.resistanceGene)){
      //   Message.warning("不存在该线性酶切序列！")
      //   return false;
      // }
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          //规则校验
          if (this.form.vectorType2 != "环化" && !this.validateForm(this.form)){
            return;
          }
          this.form.status = "status2";
          if (this.form.geneId != null) {
            if (this.viewType == "Copy") {
              this.form["geneId"] = null;
              this.form["orderNo"] = null;
              this.form["updateTime"] = null;
              this.form["updateBy"] = null;
              addGene(this.form)
                .then((response) => {
                  this.$modal.msgSuccess("新增成功");
                  this.open = false;
                  this.getList();
                })
                .catch((err) => {
                  Message.error(err);
                  return;
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
    handleDownload() {
      this.download(
        "plasmid/gene/download",
        {
          ...this.queryParams,
        },
        `plasmidVector_${new Date().getTime()}.xlsx`
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
    formatStatus(statusCode) {
      return this.statusDict[statusCode];
    },
    formatStatusStyle(statusCode) {
      return { color: this.statusColor[statusCode] };
    },
    /** 详情按钮操作 */
    handleDetail(geneId) {
      this.reset();
      getGene(geneId).then((response) => {
        this.form = response.data;
        this.viewType = "View";
        this.open = true;
        this.title = "质粒基因详情";
      });
    },
    // 生成完整的序列
    handleFullSeq(row) {
      this.loadFullSeq = true;
      if(row.vectorType2 == "环化"){
        this.$alert("环化质粒不支持生成完整序列！","提示");
        this.loadFullSeq = false;
        return;
      }
      getGeneFullSeq(row.geneId).then((response) => {
        if(response.code == '500'){
          Message.error("获取完整序列失败，请稍后重试！");
          this.loadFullSeq = false;
          return;
        }
        this.fullSeqInfo = response.data;
        if(this.fullSeqInfo.length == 1 && this.fullSeqInfo['pvSeq'] != ""){
         this.fullSeqHtml = this.formattedDnaSimple(this.fullSeqInfo);
        } else {
            this.fullSeqHtml = this.formattedDna(this.fullSeqInfo);
        }        
        this.showFullSeq = true;
      }).catch(err => {
        Message.error("获取完整序列失败，请稍后重试！");
        this.loadFullSeq = false;
      });
    },
    /**
     * 将核酸序列翻译为蛋白质序列
     * @param {string} sequence - 核酸序列(DNA或RNA)
     * @param {boolean} isRNA - 是否为RNA序列(默认为false，即DNA)
     * @returns {string} 蛋白质序列(氨基酸单字母代码)
     */
    translateSequence(sequence, isRNA = false) {
      // 遗传密码子表 (标准)
      const codonTable = {
        ATA: "I", ATC: "I", ATT: "I", ATG: "M", ACA: "T", ACC: "T", ACG: "T", ACT: "T", AAC: "N", AAT: "N", AAA: "K",
        AAG: "K", AGC: "S", AGT: "S", AGA: "R", AGG: "R", CTA: "L", CTC: "L", CTG: "L", CTT: "L", CCA: "P", CCC: "P",
        CCG: "P", CCT: "P", CAC: "H", CAT: "H", CAA: "Q", CAG: "Q", CGA: "R", CGC: "R", CGG: "R", CGT: "R", GTA: "V",
        GTC: "V", GTG: "V", GTT: "V", GCA: "A", GCC: "A", GCG: "A", GCT: "A", GAC: "D", GAT: "D", GAA: "E", GAG: "E",
        GGA: "G", GGC: "G", GGG: "G", GGT: "G", TCA: "S", TCC: "S", TCG: "S", TCT: "S", TTC: "F", TTT: "F", TTA: "L",
        TTG: "L", TAC: "Y", TAT: "Y", TAA: "*", TAG: "*", TGC: "C", TGT: "C", TGA: "*", TGG: "W",
        // RNA密码子
        AUA: "I", AUC: "I", AUU: "I", AUG: "M", ACA: "T", ACC: "T", ACG: "T", ACU: "T", AAC: "N", AAU: "N", AAA: "K",
        AAG: "K", AGC: "S", AGU: "S", AGA: "R", AGG: "R", CUA: "L", CUC: "L", CUG: "L", CUU: "L", CCA: "P", CCC: "P",
        CCG: "P", CCU: "P", CAC: "H", CAU: "H", CAA: "Q", CAG: "Q", CGA: "R", CGC: "R", CGG: "R", CGU: "R", GUA: "V",
        GUC: "V", GUG: "V", GUU: "V", GCA: "A", GCC: "A", GCG: "A", GCU: "A", GAC: "D", GAU: "D", GAA: "E", GAG: "E",
        GGA: "G", GGC: "G", GGG: "G", GGU: "G", UCA: "S", UCC: "S", UCG: "S", UCU: "S", UUC: "F", UUU: "F", UUA: "L",
        UUG: "L", UAC: "Y", UAU: "Y", UAA: "*", UAG: "*", UGC: "C", UGU: "C", UGA: "*", UGG: "W",
      };

      // 处理输入序列
      sequence = sequence.toUpperCase().replace(/\s+/g, "");

      // 如果是DNA，将T转换为U(模拟RNA)
      if (!isRNA) {
        sequence = sequence.replace(/T/g, "U");
      }
      let protein = "";
      // 按3个碱基一组进行翻译
      for (let i = 0; i < sequence.length - 2; i += 3) {
        const codon = sequence.substr(i, 3);
        const aminoAcid = codonTable[codon] || "?"; // 未知密码子用?表示
        protein += aminoAcid;
      }
      return protein;
    },
  },
};
</script>
<style type="text/css">
/* 纵向滚动条样式 */
/* .plasmid-table-scroll {
  max-height: calc(100vh - 250px);
  overflow-y: auto;
} */
/* 加载更多和数据条数一行显示 */
.load-more-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 10px;
}
.data-count {
  color: #909399;
}
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
.dna-container {
  font-family: "Courier New", monospace;
  font-size: 14px;
  line-height: 1.8;
  background: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  max-height: 70vh;
  overflow: auto;
}

.line-number {
  color: #999;
  user-select: none;
  margin-right: 10px;
  display: inline-block;
  width: 60px;
}

/* 可选：添加字母颜色高亮 */
.dna-container span[data-char="A"] {
  color: #e74c3c;
}
.dna-container span[data-char="T"] {
  color: #3498db;
}
.dna-container span[data-char="C"] {
  color: #2ecc71;
}
.dna-container span[data-char="G"] {
  color: #f39c12;
}

.content-highlight {
  position: relative;
  display: inline-block;  
}
.content-highlight:hover::after{
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
}

.cds-highlight {
  background-color: #c0f0c0; /* Light green background */  
}
.cds-highlight:hover::after {
  content: "CDS";
}
.polyA-highlight {
  background-color: #bac3f2; /* Light green background */  
}
.polyA-highlight:hover::after {
  content: "polyA";
}
.utr3-highlight {
  background-color: #eed9bf; /* Light green background */  
}
.utr3-highlight:hover::after {
  content: "3'UTR";
}
.utr5-highlight {
  background-color: #edb5ec; /* Light green background */  
}
.utr5-highlight:hover::after {
  content: "5'UTR";
}
.promoter-highlight {
  background-color: #b5e4ed; /* Light green background */  
}
.promoter-highlight:hover::after {
  content: "Promoter";
}
.resistance-highlight {
  background-color: rgb(230, 240, 192); /* Light green background */  
}
.resistance-highlight:hover::after {
  content: "resistance gene";
}
.import-result-alert .el-message-box {
  width: 60% !important;
  max-width: 90% !important;
}
</style>
