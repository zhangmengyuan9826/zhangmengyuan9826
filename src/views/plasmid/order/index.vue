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
      <el-form-item label="订单编码" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单编码"
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
        <el-select
          v-model="queryParams.serviceProvider"
          filterable
          allow-create
          placeholder="请选择服务商"
        >
          <el-option
            v-for="item in fieldDataDict['serviceProvider']"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="常规合成" prop="isSynthesis">
        <el-radio-group v-model="queryParams.isSynthesis">
          <el-radio
            v-for="item in fieldDataDict['isSynthesis']"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            >{{ item.label }}</el-radio
          >
        </el-radio-group>
      </el-form-item>
      <el-form-item label="管线" prop="pipeline">
        <el-select v-model="queryParams.pipeline" placeholder="请选择管线">
          <el-option
            v-for="item in fieldDataDict['pipeline']"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="管线编号" prop="pipelineNo">
        <el-select
          v-model="queryParams.pipelineNo"
          placeholder="请选择管线编号"
        >
          <el-option
            v-for="item in fieldDataDict['pipelineNo']"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
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
              v-for="button in statusDictButtons"
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
      <el-table-column
        label="订单编码"
        width="100"
        align="center"
        prop="orderNo"
      />
      <el-table-column label="客户" width="100" align="center" prop="client" />
      <el-table-column
        label="服务商"
        width="100"
        align="center"
        prop="serviceProvider"
      />
      <el-table-column
        label="常规合成"
        width="80"
        align="center"
        prop="isSynthesis"
      />
      <el-table-column label="管线" width="80" align="center" prop="pipeline" />
      <el-table-column
        label="管线编号"
        width="80"
        align="center"
        prop="pipelineNo"
      />
      <el-table-column
        label="下单日期"
        align="center"
        prop="orderDate"
        width="140"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.orderDate, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="到货日期"
        align="center"
        prop="arrivalDate"
        width="140"
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
        width="80"
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
            @click="handleDetail(scope.row)"
            >详情</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            :disabled="scope.row.orderStatus != 'status2'"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['plasmid:order:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            :disabled="scope.row.orderStatus != 'status2'"
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
          <el-col :span="8">
            <el-form-item label="订单编码" prop="orderNo">
              <el-input
                v-model="form.orderNo"
                disabled
                placeholder="由系统生成编码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="客户" prop="client">
              <el-input v-model="form.client" placeholder="请输入客户" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="服务商" prop="serviceProvider">
              <el-select
                v-model="form.serviceProvider"
                default-first-option
                placeholder="请选择或输入"
              >
                <el-option
                  v-for="item in fieldDataDict['serviceProvider']"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="是否常规合成"
              prop="isSynthesis"
              label-width="100"
            >
              <el-radio-group v-model="form.isSynthesis">
                <el-radio
                  v-for="item in fieldDataDict['isSynthesis']"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  >{{ item.label }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="管线" prop="pipeline">
              <el-select
                v-model="form.pipeline"
                default-first-option
                placeholder="请选择或输入"
              >
                <el-option
                  v-for="item in fieldDataDict['pipeline']"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="管线编号" prop="pipelineNo">
              <el-select
                v-model="form.pipelineNo"
                default-first-option
                placeholder="请选择或输入"
              >
                <el-option
                  v-for="item in fieldDataDict['pipelineNo']"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
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
          <el-col :span="8">
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

          <el-col :span="8">
            <el-form-item label="周期" prop="period">
              <el-input v-model="form.period" placeholder="请输入周期" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
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
        <el-table-column
          type="selection"
          :selectable="checkSelectable"
          width="55"
          align="center"
        />
        <el-table-column
          label="序号"
          type="index"
          width="60"
          align="center"
          :index="(index) => index + 1" />
        <el-table-column
          label="订单号"
          align="center"
          prop="geneNo"
          resizable
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
              v-if="scope.row.plasmidFullName != null"
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
        <el-table-column label="启动子" align="center" prop="promoter" />
        <el-table-column label="信号肽" align="center" prop="signalPeptide" />
        <el-table-column
          label="预测蛋白类型"
          align="center"
          prop="proteinType"
        />
        <el-table-column label="增强子" align="center" prop="enhancer" />
        <el-table-column label="批次" align="center" prop="batch" />
        <el-table-column label="备注" align="center" prop="remark" resizable>
          <template slot-scope="scope">
            <el-tooltip
              v-if="scope.row.remark != null"
              effect="light"
              placement="top"
            >
              <div
                class="content"
                slot="content"
                v-html="scope.row.remark"
              ></div>
              <div class="oneLine">{{ scope.row.remark }}</div>
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
      <div v-if="operType != 'view'" slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          v-if="
            (form.orderStatus == 'status1') |
              (form.orderStatus == 'status2') |
              (operType == 'add')
          "
          @click="submitForm"
          >确 定</el-button
        >
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
      :title="'质粒详情 —— 下单确认'"
      :visible.sync="openOrderIng"
      width="90%"
      height="90%"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form
        ref="orderIngForm"
        :model="orderIngForm"
        :rules="orderIngRules"
        label-width="80px"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item label="订单编码" prop="orderNo">
              <el-input v-model="orderIngForm.orderNo" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="客户" prop="client">
              <el-input v-model="orderIngForm.client" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="下单日期" prop="orderDate">
              <el-date-picker
                clearable
                v-model="orderIngForm.orderDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择下单日期"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-table
        :data="orderIngForm.geneList"
        style="width: 100%"
        max-height="700"
      >
        <el-table-column
          label="订单编号"
          align="center"
          prop="geneNo"
          width="140"
          resizable
        >
          <template #header>
            <div>
              <span>订单编号 &nbsp;</span>
              <el-button
                v-if="true"
                size="mini"
                type="primary"
                @click="generateGeneNos()"
                >生成</el-button
              >
            </div>
          </template>
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.geneNo"
              @blur="validateEmpty(row, 'geneNo')"
            ></el-input>
          </template>
        </el-table-column>
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
              v-if="scope.row.plasmidFullName != null"
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
        <el-table-column label="CDS序列" align="center" prop="cdsSeq">
          <template slot-scope="scope">
            <el-tooltip
              v-if="scope.row.cdsSeq != null"
              effect="light"
              placement="top"
            >
              <div
                class="content"
                slot="content"
                v-html="scope.row.cdsSeq"
              ></div>
              <div class="oneLine">{{ scope.row.cdsSeq }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormOrderIng">确 定</el-button>
        <el-button @click="cancelOrderIng">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :title="'质粒详情 —— 到货确认'"
      :visible.sync="openOrderDone"
      width="90%"
      height="90%"
      append-to-body
      :close-on-click-modal="false"
    >
      <div>
        <el-form
          ref="doneGeneForm"
          :model="doneGeneForm"
          label-width="80px">
          <el-col :span="8">
          <el-form-item label="到货日期" prop="receiveDate" required>
            <el-date-picker
              clearable
              v-model="doneGeneForm.receiveDate"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="请选择到货日期"
            >
            </el-date-picker>
          </el-form-item>
          </el-col>
          <el-col :span="8">
          <el-button type="primary" @click="submitDoneGenes"
          >确 定 到 货</el-button
        ></el-col>
        <el-col :span="8">
        <el-button @click="cancelDoneDialog">取 消</el-button></el-col>
        </el-form>

        
      </div>
      <el-table
        :data="multiDoneGeneList"
        style="width: 100%"
        max-height="700"
        @selection-change="handleSelectionChange2"
      >
        <el-table-column
          type="selection"
          width="50"
          align="center"
          :selectable="checkSelectableDone"
        />
        <el-table-column label="订单号" prop="geneNo" align="center" />
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
        <el-table-column label="加帽" align="center" prop="cap" resizable />
        <el-table-column label="批次" align="center" prop="batch" resizable />
        <el-table-column label="状态" align="center" prop="status" resizable>
          <template slot-scope="scope">
            <span :style="formatStatusStyle(scope.row.status)">
              {{ formatStatus(scope.row.status) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog
      :title="'状态回退'"
      :visible.sync="openReset"
      width="80%"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form
        ref="resetStatusForm"
        :model="resetStatusForm"
        label-width="120px"
      >
        <el-col>
          <el-form-item label="状态回退" prop="orderStatus" required>
            <el-select
              v-model="resetStatusForm.orderStatus"
              placeholder="请选择回退的状态"
              filterable
              clearable
            >
              <el-option
                v-for="button in resetStatusDicts"
                :key="button.value"
                :label="button.name"
                :value="button.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark" required>
            <el-input
              type="textarea"
              v-model="resetStatusForm.remark"
              :autosize="{ minRows: 1, maxRows: 6 }"
              resize="none"
              placeholder="请输入备注"
            >
            </el-input>
          </el-form-item>
        </el-col>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitResetStatus">确 定</el-button>
        <el-button @click="cancelResetStatus">取 消</el-button>
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
  updateOrderOrdeIng,
  listGenesByIds,
} from "@/api/plasmid/order";
import { listGene, submitDoneGeneByGeneIds } from "@/api/plasmid/gene";
import { getDictDataListByDictType } from "@/api/plasmid/dictData";
import selectPlasmidGene from "../../components/select-plasmid-gene/index";
import { getDicts } from "@/api/system/dict/data";
import { Message } from "element-ui";
export default {
  name: "Order",
  components: { selectPlasmidGene },
  dicts: ["plasmid_field"],
  data() {
    return {
      // 遮罩层
      loading: true,
      loading2: true,
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
        client: [{ required: true, message: "客户不能为空", trigger: "blur" }],
        serviceProvider: [
          { required: true, message: "服务商不能为空", trigger: "blur" },
        ],
        pipeline: [
          { required: true, message: "管线不能为空", trigger: "blur" },
        ],
      },
      orderIngRules: {
        // orderNo: [{required: true, message: "订单号不能为空", trigger: "blur"},
        // ],
        orderDate: [
          { required: true, message: "下单日期不能为空", trigger: "blur" },
        ],
      },
      selectPlasmidGeneOpen: false,
      plasmidGeneList: [],
      geneIdArr: [],
      statusDictButtons: [
        // { name: "草稿", value: "status1"},
        // { name: "已创建", value: "status2", type: "info" },
        { name: "已下单", value: "status3", type: "PRIMARY" },
        { name: "已到货", value: "status4", type: "success" },
        { name: "实验中", value: "status5", type: "warning" },
        { name: "实验完成", value: "status6", type: "success" },
        { name: "状态异常", value: "status7", type: "danger" },
        { name: "状态回退", value: "status8", type: "warning" },
      ],
      allStatusDicts: [
        // { name: "草稿", value: "status1"},
        { name: "已创建", value: "status2", type: "info" },
        { name: "已下单", value: "status3", type: "PRIMARY" },
        { name: "已到货", value: "status4", type: "success" },
        { name: "实验中", value: "status5", type: "warning" },
        { name: "实验完成", value: "status6", type: "success" },
        { name: "状态异常", value: "status7", type: "danger" },
        { name: "状态回退", value: "status8", type: "warning" },
      ],
      resetStatusDicts: [
        { name: "已创建", value: "status2", index: 1 },
        { name: "已下单", value: "status3", index: 2 },
        { name: "已到货", value: "status4", index: 3 },
        { name: "实验中", value: "status5", index: 4 },
        { name: "实验完成", value: "status6", index: 5 },
        { name: "状态异常", value: "status7", index: 6 },
      ],
      statusDictButtonsCheck: [
        { name: "中间过程-1", value: "approved", type: "warning" },
        { name: "中间过程-2", value: "un_approved", type: "danger" },
        { name: "已到货", value: "done", type: "PRIMARY" },
        { name: "实验中", value: "done2", type: "PRIMARY" },
      ],
      statusDict: {
        status1: "草稿",
        status2: "已创建",
        status3: "已下单",
        status4: "已到货",
        status5: "实验中",
        status6: "实验完成",
        status7: "状态异常",
        status8: "状态回退",
      },
      statusColor: {
        status1: "grey",
        status2: "black",
        status3: "blue",
        status4: "green",
        status5: "orange",
        status6: "green",
        status7: "red",
      },
      fieldList: [],
      _dicts: {},
      fieldDataDict: {},
      openOrderIng: false,
      orderIngForm: {},
      operType: "",
      selectItems: [],
      multiDoneGeneList: [],
      openOrderDone: false,
      doneGeneIds: [],
      openReset: false,
      resetStatusForm: {},
      doneGeneForm: {
        receiveDate: null,
      }
    };
  },
  created() {
    this.showSearch = false;
    this.initData();
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
      this.geneIdArr = [];
      this.geneIdList = [];
      this.geneList = [];
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
      this.selectItems = selection;
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.operType = "add";
      this.open = true;
      this.plasmidGeneList = [];
      this.title = "添加质粒订单";
    },
    handleDetail(row) {
      getOrder(row.orderId).then((response) => {
        this.operType = "view";
        this.form = response.data;
        this.plasmidGeneList = response.data.geneList;
        this.geneIdArr = this.plasmidGeneList.map((item) => item["geneId"]);
        this.open = true;
        this.title = "质粒订单详情";
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.operType = "update";
      const orderId = row.orderId || this.ids;
      getOrder(orderId).then((response) => {
        this.form = response.data;
        this.plasmidGeneList = response.data.geneList;
        this.geneIdArr = this.plasmidGeneList.map((item) => item["geneId"]);
        this.open = true;
        this.title = "修改质粒订单";
      });
    },
    /** 提交按钮-新增 */
    submitFormAdd() {
      let that = this;
      if (!that.geneIdList || that.geneIdList.length === 0) {
        that.$modal.msgError("请选择至少一个质粒");
        return;
      }
      that.$modal.confirm("是否确认创建订单？").then(function () {
        that.form.geneIdList = this.geneIdArr;
        that.form.geneList = [];
        addOrder(this.form).then((response) => {
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
    submitFormUpdate() {},
    submitForm() {
      let that = this;
      if (!that.geneIdArr || that.geneIdArr.length === 0) {
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
            that.$modal.confirm("是否确认创建订单？").then(function () {
              addOrder(that.form).then((response) => {
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
    handleChangeStatusOrderIng() {
      if (this.ids.length > 1) {
        Message.warning("单次只可下单一条订单！");
        return;
      }
      getOrder(this.ids[0]).then((response) => {
        this.orderIngForm = response.data;
        this.orderIngForm["geneList"] = response.data.geneList;
        console.log(this.orderIngForm);
        if (this.orderIngForm.orderStatus !== "status2") {
          console.log(this.orderIngForm.orderStatus);
          Message.warning("不可重复下单！");
          return;
        }
        this.openOrderIng = true;
      });
    },

    submitFormOrderIng() {
      this.$refs["orderIngForm"].validate((valid) => {
        if (valid) {
          for (let i = 0; i < this.orderIngForm.geneList.length; i++) {
            if (
              !this.orderIngForm.geneList[i]["geneNo"] |
              (this.orderIngForm.geneList[i]["geneNo"] == "")
            ) {
              Message.warning("基因订单号不可为空");
              return;
            }
          }
          this.orderIngForm["orderStatus"] = "status3";
          updateOrderOrdeIng(this.orderIngForm).then((response) => {
            Message.success("已成功更新！");
            this.openOrderIng = false;
            this.getList();
          });
        }
      });
    },
    cancelOrderIng() {
      this.openOrderIng = false;
    },
    handleChangeStatus(status) {
      this.newStatus = status;
      console.log(status);
      var selectStatus = this.selectItems.map((item) => item.orderStatus);
      if (status == "status8" && selectStatus.indexOf("status2") >= 0) {
        Message.warning("‘已创建’状态的订单无法回退");
      } else if (
        status == "status3" &&
        (selectStatus.indexOf("status3") >= 0 ||
          selectStatus.indexOf("status4") >= 0 ||
          selectStatus.indexOf("status5") >= 0 ||
          selectStatus.indexOf("status6") >= 0)
      ) {
        Message.warning("已下单或实验的订单不可重复下单！");
        return;
      } else if (
        (status == "status3" && selectStatus.indexOf("status1") >= 0) ||
        selectStatus.indexOf("status7") >= 0
      ) {
        Message.warning("请完善信息后再下单！");
        return;
      } else if (
        status == "status4" &&
        (selectStatus.indexOf("status1") >= 0 ||
          selectStatus.indexOf("status7") >= 0 ||
          selectStatus.indexOf("status4") >= 0 ||
          selectStatus.indexOf("status5") >= 0 ||
          selectStatus.indexOf("status6") >= 0)
      ) {
        Message.warning("状态错误！非已下单的订单不可到货处理");
        return;
      }

      // 下单需要补充订单号
      else if (this.newStatus == "status3") {
        this.handleChangeStatusOrderIng();
      } else if (this.newStatus == "status4") {
        const orderIds = this.ids;
        listGenesByIds(orderIds).then((response) => {
          this.multiDoneGeneList = response;
          this.openOrderDone = true;
        });
      } else if (this.newStatus == "status8") {
        this.openReset = true;
      } else {
        var request = {
          orderIds: this.ids,
          orderStatus: this.newStatus,
        };
        updateOrderStatus(request).then(() => {
          this.getList();
          // this.checkform = {};
          this.$modal.msgSuccess("更改成功");
        });
      }
    },
    getMultiGenesByOrderNos(ids) {},
    submitResetStatus() {
      this.$refs["resetStatusForm"].validate((valid) => {
        if (valid) {
          var newStatus = this.resetStatusForm.orderStatus;
          console.log(newStatus);
          var newIndex = this.resetStatusDicts
            .map((item) => (item.value === newStatus ? item.index : undefined))
            .filter((val) => val !== undefined)[0];
          for (let i = 0; i < this.selectItems.length; i++) {
            var selectItem = this.selectItems[i];

            var oldIndex = this.resetStatusDicts
              .map((item) =>
                item.value === selectItem.orderStatus ? item.index : undefined
              )
              .filter((val) => val !== undefined)[0];
            console.log(newIndex);
            console.log(oldIndex);
            if (oldIndex < newIndex) {
              Message.warning("订单状态只可回退！");
              return;
            }
          }
          // var request = {
          //   orderIds: this.ids,
          //   orderStatus: this.newStatus,
          // };
          //   console.log(this.resetStatusForm)
          // updateOrderStatus(request).then(() => {
          //     Message.success("已成功更新！")
          //  })
          for (let i = 0; i < this.selectItems.length; i++) {
            this.resetStatusForm["orderNo"] = this.selectItems[i].orderNo;
            this.resetStatusForm["orderId"] = this.selectItems[i].orderId;
            // var request = {
            //   orderId: this.selectItems[i].orderId,
            //   orderNo: this.selectItems[i].orderNo,
            //   orderStatus: this.newStatus,
            // };
            console.log(this.resetStatusForm);
            updateOrderStatus(this.resetStatusForm).then(() => {
              Message.success("已成功更新！");
            });
          }
          this.openReset = false;
          this.getList();
        }
      });
    },
    cancelResetStatus() {
      this.openReset = false;
    },
    //是否可选
    checkSelectable(row, index) {
      if (this.geneIdArr.indexOf(row.geneId) >= 0) {
        return false;
      } else {
        return true;
      }
    },
    validateEmpty(row, prop) {
      if (!row[prop] || row[prop].trim() === "") {
        this.$message.error("此项不能为空");
        // 可以在这里添加其他逻辑，比如自动聚焦等
      }
    },
    handleSelectionChange2(selection) {
      this.doneGeneIds = selection.map((item) => item.geneId);
    },
    checkSelectableDone(row) {
      if (row.status != "status3") {
        return false;
      } else {
        return true;
      }
    },
    submitDoneGenes() {
      if (!this.doneGeneIds || this.doneGeneIds.length == 0) {
        Message.warning("请先选择质粒！");
        return;
      }
      var params = {
        receiveDate: this.doneGeneForm.receiveDate,
        geneIds: this.doneGeneIds,
      };
      submitDoneGeneByGeneIds(params)
        .then((response) => {
          Message.success("提交成功！");
        })
        .catch(() => {});
      this.openOrderDone = false;
      this.getList();
    },
    cancelDoneDialog() {
      this.openOrderDone = false;
    },
    handleAutoFill(index, value) {
      if (!value || !value.match(/\d+/i)) return;

      // 提取数字部分并递增
      const prefix = value.replace(/\d+$/, "");
      const numStr = value.match(/\d+$/)?.[0] || "0";
      const currentNum = parseInt(numStr, 10);
      // 填充后续行
      for (let i = index + 1; i < this.orderIngForm.geneList.length; i++) {
        this.orderIngForm.geneList[i]["geneNo"] = `${prefix}${String(
          currentNum + i - index
        ).padStart(numStr.length, "0")}`;
      }
      console.log(this.orderIngForm.geneList);
      return;
    },
    generateGeneNos() {
      // Message.success("click")
      var startIndex = 0;
      for (let i = 0; i < this.orderIngForm.geneList.length; i++) {
        var geneInfo = this.orderIngForm.geneList[i];
        console.log(geneInfo["geneNo"]);
        if (!geneInfo["geneNo"]) {
          continue;
        }
        startIndex = i;
        break;
      }
      return this.handleAutoFill(
        startIndex,
        this.orderIngForm.geneList[startIndex]["geneNo"]
      );
      // return true
    },
  },
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
