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
      <el-form-item label="需求单号" prop="requireNo">
        <el-input
          v-model="queryParams.requireNo"
          placeholder="请输入入库单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="申请人" prop="requireBy">
        <el-input
          v-model="queryParams.requireBy"
          placeholder="请输入申请人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="物料名称" prop="matName">
        <el-input
          v-model="queryParams.params.matName"
          placeholder="请输入物料名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="PM项目" prop="pmProject">
        <el-select v-model="queryParams.pmProject" placeholder="请选择PM项目号">
          <el-option
            v-for="item in pmProjectList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="requireStatus">
        <el-select v-model="queryParams.requireStatus" placeholder="请选择状态">
          <el-option
            v-for="(value, key) in statusDict"
            :key="key"
            :label="value"
            :value="key"
          ></el-option>
        </el-select>
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
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['stock:matRequire:add']"
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
          v-hasPermi="['stock:matRequire:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          :disabled="multiple"
          @click="handleExport"
          v-hasPermi="['stock:matRequire:export']"
          >导出</el-button
        >
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-printer"
          size="mini"
          :disabled="true"
          @click="handlePrintBatch"
          v-hasPermi="['stock:matRequire:list']"
          >批量打印</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-view"
          size="mini"
          :disabled="multiple"
          @click="handleViewMultiDetail"
          v-hasPermi="['stock:matRequire:list']"
          >物料详情</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-dropdown
          size="mini"
          :disabled="multiple"
          v-hasPermi="['stock:matRequire:editStatusCheck']"
        >
          <el-button type="info" plain size="mini" icon="el-icon-right">
            审核<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="button in statusDictButtonsCheck"
              :key="button.value"
              icon="el-icon-plus"
              size="mini"
              @click.native="handleChangeStatusCheck(button.value)"
            >
              {{ button.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>

      <el-col :span="1.5">
        <el-dropdown
          size="mini"
          :disabled="multiple"
          v-hasPermi="['stock:matRequire:editStatusPurchase']"
        >
          <el-button type="info" plain size="mini" icon="el-icon-right">
            采购<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="button in statusDictButtonsPurchase"
              :key="button.value"
              icon="el-icon-plus"
              size="mini"
              @click.native="handleChangeStatusPurchase(button.value)"
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
      :data="matRequireList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      row-key="requireId"
      :expand-row-keys="expands"
      @row-click="rowClick"
      @header-click="handleHeaderCLick"
      @sort-change="handleTableSort"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column type="expand" width="40">
        <template slot-scope="props">
          <el-table
            :data="allRequireDetailList[props.row.requireId]"
            style="width: 98%"
            max-height="500"
            :header-cell-style="{ background: '#e6f2f8', color: '#606266' }"
          >
            <el-table-column label="序号" align="center" type="index" fixed />

            <el-table-column
              label="物料名称"
              fixed
              align="center"
              prop="matName"
              width="180"
            >
              <template slot-scope="scope">
                <el-popover
                  placement="top"
                  width="300"
                  trigger="hover"
                  :disabled="
                    scope.row.matLink === '' || scope.row.matLink === null
                  "
                >
                  <div>
                    <el-link
                      :href="`${scope.row.matLink}`"
                      :underline="false"
                      target="_blank"
                      ><b>采购链接：</b>{{ scope.row.matLink }}</el-link
                    >
                  </div>
                  <span slot="reference" v-if="scope.row.matLink !== null">
                    <b style="color: red">*</b>{{ scope.row.matName }}
                  </span>
                  <span
                    slot="reference"
                    v-if="
                      scope.row.matLink === '' || scope.row.matLink === null
                    "
                    >{{ scope.row.matName }}</span
                  >
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column
              label="规格"
              align="center"
              prop="figNum"
              width="140"
            />
            <el-table-column
              label="货号"
              align="center"
              prop="artNum"
              width="120"
            />
            <el-table-column
              label="品牌"
              align="center"
              prop="brand"
              width="100"
            />

            <el-table-column
              label="采购单位"
              align="center"
              prop="unitCode"
              width="60"
            >
              <template slot-scope="scope">
                <dict-tag
                  :options="dict.type.base_mat_unit"
                  :value="scope.row.unitCode"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="数量"
              align="center"
              prop="quantity"
              width="60"
            />
            <el-table-column
              label="单价（RMB）"
              align="center"
              prop="unitPrice"
              width="80"
            >
              <template #header>
                <div>
                  <span>单价</span>
                  <br />
                  <span>（RMB）</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="总价（RMB）"
              align="center"
              prop="sumPrice"
              width="110"
            >
              <template #header>
                <div>
                  <span>总价（RMB）</span>
                  <br />
                  <span>{{ getSumSumPriceLabel(props.row.requireId) }}</span>
                </div>
              </template>
              <template slot-scope="scope">
                <span
                  :style="
                    formatSumPriceStyle(scope.row.sumPrice, scope.row.unitPrice)
                  "
                >
                  {{
                    getSumPrice(
                      scope.row.sumPrice,
                      scope.row.unitPrice,
                      scope.row.quantity
                    )
                  }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              label="是否单一"
              align="center"
              prop="isSingle"
              width="50"
            >
              <template slot-scope="scope">
                <el-popover
                  placement="top"
                  width="300"
                  trigger="hover"
                  :disabled="scope.row.isSingle === '0'"
                >
                  <div><b>单一原因：</b>{{ scope.row.singleReason }}</div>
                  <span slot="reference" v-if="scope.row.isSingle === '1'"
                    >{{ formatBoolType(scope.row.isSingle)
                    }}<b style="color: red">*</b></span
                  >
                  <span slot="reference" v-if="scope.row.isSingle === '0'">{{
                    formatBoolType(scope.row.isSingle)
                  }}</span>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column
              label="是否进口"
              align="center"
              prop="isImport"
              width="50"
            >
              <template slot-scope="scope">
                <el-popover
                  placement="top"
                  width="300"
                  trigger="hover"
                  :disabled="scope.row.isImport === '0'"
                >
                  <div><b>进口原因：</b>{{ scope.row.importReason }}</div>
                  <span slot="reference" v-if="scope.row.isImport === '1'"
                    >{{ formatBoolType(scope.row.isImport)
                    }}<b style="color: red">*</b></span
                  >
                  <span slot="reference" v-if="scope.row.isImport === '0'">{{
                    formatBoolType(scope.row.isImport)
                  }}</span>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column
              label="库存"
              align="center"
              prop="stockQuantity"
              width="60"
            />
            <el-table-column
              label="安全库存"
              align="center"
              prop="safetyStock"
              width="60"
            />
            <el-table-column
              label="历史采购数量"
              align="center"
              prop="purchaseCount"
              width="60"
            />
            <el-table-column
              label="用途"
              align="center"
              prop="purpose"
              width="120"
            >
              <template slot-scope="scope">
                <el-popover
                  placement="top"
                  width="300"
                  trigger="hover"
                  :disabled="scope.row.purpose.length < 15"
                >
                  <div><b>用途：</b>{{ scope.row.purpose }}</div>
                  <span slot="reference">
                    {{ formatLongPurpose(scope.row.purpose) }}
                  </span>
                </el-popover>
              </template>
            </el-table-column>

            <el-table-column
              label="物料编码"
              align="center"
              prop="matCode"
              width="180"
            />
            <el-table-column
              label="三级编码"
              align="center"
              prop="subcode"
              width="100"
            />
            <el-table-column
              label="物料分类"
              align="center"
              prop="matClass"
              width="100"
            />
            <el-table-column
              label="物料组"
              align="center"
              prop="matGroup"
              width="100"
            />
            <el-table-column
              label="操作"
              align="center"
              width="80"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="scope">
                <el-button
                  v-if="actionType === 'view'"
                  size="mini"
                  type="text"
                  icon="el-icon-view"
                  @click="
                    handleDetailMatDetail(
                      props.row.requireId,
                      scope.row.detailId
                    )
                  "
                  >详情</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>

      <el-table-column
        label="需求单号"
        align="center"
        prop="requireNo"
        width="160"
        :sort-orders="['descending', 'ascending']"
        sortable="custom"
      />
      <el-table-column
        label="PM项目号"
        align="center"
        prop="pmProject"
        width="180"
        :sort-orders="['descending', 'ascending']"
        sortable="custom"
      >
        <template slot-scope="scope">
          {{ getPmName(scope.row.pmProject) }}
        </template>
      </el-table-column>
      <el-table-column
        label="申请人"
        align="center"
        prop="requireBy"
        :sort-orders="['descending', 'ascending']"
        sortable="custom"
      />
      <el-table-column
        label="创建日期"
        align="center"
        prop="createTime"
        :sort-orders="['descending', 'ascending']"
        sortable="custom"
      >
        <template slot-scope="scope">
          {{ parseTime(formatDate(scope.row.createTime), "{y}-{m}-{d}") }}
        </template>
      </el-table-column>
      <el-table-column
        label="更新时间"
        align="center"
        prop="updateTime"
        :sort-orders="['descending', 'ascending']"
        sortable="custom"
      >
        <template slot-scope="scope">
          {{
            parseTime(formatDate(scope.row.updateTime), "{y}-{m}-{d} {h}:{i}")
          }}
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        align="center"
        prop="requireStatus"
        class-name="small-padding fixed-width"
        :sort-orders="['descending', 'ascending']"
        sortable="custom"
      >
        <template slot-scope="scope">
          <span :style="formatStatusStyle(scope.row.requireStatus)">
            {{ formatStatus(scope.row.requireStatus) }}
          </span>

          <!-- <el-button
            size="mini"
            type="text"
            plain
            icon="el-icon-view"
            @click="handleStatusLog(scope.row.requireId)"
            v-hasPermi="['stock:matRequire:list']"
            ></el-button> -->
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="180"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
            v-hasPermi="['stock:matRequire:list']"
            >详情</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            :disabled="
              (scope.row.requireStatus !== 'created' &&
                scope.row.requireStatus !== 'un_approved' &&
                scope.row.requireStatus !== 'un_purchase') ||
              scope.row.createBy !== currentUser
            "
            @click="handleUpdate(scope.row)"
            v-hasPermi="['stock:matRequire:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            :disabled="
              scope.row.requireStatus !== 'created' ||
              scope.row.createBy !== currentUser
            "
            @click="handleDelete(scope.row)"
            v-hasPermi="['stock:matRequire:remove']"
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

    <!-- 添加或修改物料标签对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="80%"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="申请人" prop="requireBy">
              <el-input v-model="form.requireBy" placeholder="请输入申请人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="PM项目号" prop="pmProject">
              <el-select v-model="form.pmProject" placeholder="请选择PM项目">
                <el-option
                  v-for="item in pmProjectList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="收货人" prop="consignee">
              <el-input v-model="form.consignee" placeholder="请输入收货人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话" prop="phoneNum">
              <el-input v-model="form.phoneNum" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="要求时间" prop="requireDate">
              <el-date-picker
                clearable
                v-model="form.requireDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择最晚到货时间"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="20">
            <el-form-item label="地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <!-- <el-form-item label="状态" prop="isSingle">
            <el-radio-group
              v-model="form.requireStatus"
              v-hasPermi="['stock:matRequire:editStatus']"
            >
              <el-radio label="created">已创建</el-radio>
              <el-radio label="dealed">处理中</el-radio>
              <el-radio label="finished">已完成</el-radio>
              <el-radio label="done">已入库</el-radio>
            </el-radio-group>
          </el-form-item> -->
          <el-form-item label="审批评语" prop="remark">
            <el-input v-model="form.remark" :disabled="true" />
          </el-form-item>
        </el-row>
        <div class="dialog-inner">
          <el-button
            v-if="actionType !== 'view'"
            size="small"
            type="success"
            icon="el-icon-search"
            @click="openAddMatDetailDialog"
            >查询添加物料</el-button
          >
          <el-button
            v-if="actionType !== 'view'"
            size="small"
            type="primary"
            icon="el-icon-search"
            @click="openAddMatDetailSelfDialog"
            >手动添加物料</el-button
          >
        </div>
        <el-table :data="requireDetailList" style="width: 100%">
          <el-table-column
            label="物料编码"
            fixed
            align="center"
            prop="matCode"
            width="120"
          />
          <el-table-column
            label="三级编码"
            align="center"
            prop="subcode"
            width="100"
          />
          <el-table-column
            label="物料名称"
            fixed
            align="center"
            prop="matName"
            width="120"
          />
          <el-table-column
            label="规格"
            align="center"
            prop="figNum"
            width="100"
          />
          <el-table-column
            label="货号"
            align="center"
            prop="artNum"
            width="100"
          />
          <el-table-column
            label="品牌"
            align="center"
            prop="brand"
            width="100"
          />
          <el-table-column
            label="物料分类"
            align="center"
            prop="matClass"
            width="100"
          />
          <el-table-column
            label="物料组"
            align="center"
            prop="matGroup"
            width="100"
          />
          <el-table-column
            label="采购单位"
            align="center"
            prop="unitCode"
            width="80"
          >
            <template slot-scope="scope">
              <dict-tag
                :options="dict.type.base_mat_unit"
                :value="scope.row.unitCode"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="数量"
            align="center"
            prop="quantity"
            width="80"
          />
          <el-table-column
            label="单价（RMB）"
            align="center"
            prop="unitPrice"
            width="80"
          />
          <el-table-column
            label="总价（RMB）"
            align="center"
            prop="sumPrice"
            width="80"
          >
            <template #header>
              <div>
                <span>总价（RMB）</span>
                <br />
                <span v-if="actionType === 'view'">{{
                  getSumSumPriceLabel(form.requireId)
                }}</span>
              </div>
            </template>
            <template slot-scope="scope">
              <span
                :style="
                  formatSumPriceStyle(scope.row.sumPrice, scope.row.unitPrice)
                "
              >
                {{
                  getSumPrice(
                    scope.row.sumPrice,
                    scope.row.unitPrice,
                    scope.row.quantity
                  )
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="是否单一"
            align="center"
            prop="isSingle"
            width="80"
          >
            <template slot-scope="scope">{{
              formatBoolType(scope.row.isSingle)
            }}</template>
          </el-table-column>
          <el-table-column
            label="是否进口"
            align="center"
            prop="isImport"
            width="80"
          >
            <template slot-scope="scope">{{
              formatBoolType(scope.row.isSingle)
            }}</template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="80"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope">
              <el-button
                v-if="actionType !== 'view'"
                size="mini"
                type="text"
                icon="el-icon-scissors"
                @click="handleRemoveMat(scope.$index, scope.row)"
                >去除</el-button
              >
              <el-button
                v-if="actionType !== 'view'"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleEditMat(scope.$index, scope.row)"
                >修改</el-button
              >
              <el-button
                v-if="actionType === 'view'"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleDetailMat(scope.$index, scope.row)"
                >详情</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          v-if="actionType === 'add'"
          type="primary"
          @click="submitForm"
          >确 定</el-button
        >
        <el-button
          v-if="actionType === 'edit'"
          type="primary"
          @click="submitForm"
          >提 交</el-button
        >
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :title="'添加物料'"
      :visible.sync="addMatDetailOpen"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form
        ref="matForm"
        :model="matForm"
        :rules="matRules"
        label-width="100px"
      >
        <el-row>
          <el-col :span="9">
            <el-form-item label="库存数量" prop="warehouseQuantity" width="170">
              <el-input v-model="matForm.warehouseQuantity" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-button
              v-if="isSelect"
              type="primary"
              icon="el-icon-search"
              size="mini"
              style="margin-left:10px"
              @click="handleSwitchAuto"
              >转手动填写</el-button
            >
            <el-button
              v-if="!isSelect"
              type="primary"
              icon="el-icon-search"
              size="mini"
              style="margin-left:10px"
              @click="handleSwitchAuto"
              >转查询</el-button
            >
          </el-col>
          <el-col :span="9">
            <el-form-item v-if="isSelect" label="相同标签物料数量" prop="sameTagQuantity" label-width="160px">
              
              <el-input v-model="matForm.sameTagQuantity" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-button
              type="primary"
              icon="el-icon-search"
              size="mini"
              style="margin-left:10px"
              @click="showTagQueryDialog"
              >标签查询</el-button
            >
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="物料编码" prop="matCode">
              <el-input
                v-model="matForm.matCode"
                readonly
                placeholder="请选择物料"
                :disabled="!isSelect"
              >
                <el-button
                  slot="append"
                  icon="el-icon-search"
                  :disabled="!isSelect"
                  @click="openSelectMatDialog"
                ></el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="物料名称" prop="matName" >
              <el-input
                v-model="matForm.matName"
                placeholder="请输入物料名称"
                :disabled="isSelect"
              />
            </el-form-item>
            
          </el-col>
          <el-col :span="8">
            <el-form-item v-if="isSelect" label="物品标签" prop="subcode">
              <el-select
                v-model="matForm.matTag"
                placeholder=""
                filterable
                clearable
                @blur="getCurVal"
                disabled
              >
                <el-option
                  v-for="item in tagList"
                  :key="item.tagCode"
                  :label="item.tagName"
                  :value="item.tagCode"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="三级编码" prop="subcode">
              <el-select
                v-model="matForm.subcode"
                placeholder="请输入检索内容"
                filterable
                clearable
                @blur="getCurVal"
                :disabled="
                  isSelect && item.subcode !== null && item.subcode !== ''
                "
              >
                <el-option
                  v-for="item in subcodeList"
                  :key="item.subcodeCode"
                  :label="item.subcodeName"
                  :value="item.subcodeCode"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
          <el-form-item label="集团编码" prop="fdCode">
            <el-input v-model="matForm.fdCode" placeholder="请输入集团编码" />
          </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="物料负责人"
              prop="manageBy"
              label-width="100px"
            >
              <el-select
                v-model="matForm.manageBy"
                placeholder="请选择物料负责人"
                :disabled="isSelect"
              >
                <el-option
                  v-for="item in userList"
                  :key="item.userName"
                  :label="item.nickName"
                  :value="item.userName"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="品牌" prop="brand">
              <el-select
                v-model="matForm.brand"
                placeholder="请输入检索内容"
                filterable
                clearable
                @blur="getCurVal_brand"
                :disabled="isSelect && item.brand !== null && item.brand !== ''"
              >
                <el-option
                  v-for="item in brandList"
                  :key="item.brandCode"
                  :label="item.brandName"
                  :value="item.brandName"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="货号" prop="artNum">
              <el-input
                v-model="matForm.artNum"
                placeholder="请输入货号"
                :disabled="
                  isSelect && item.artNum !== null && item.artNum !== ''
                "
              />
            </el-form-item>
          </el-col>
        
          <el-col :span="8">
            <el-form-item label="规格" prop="figNum">
              <el-input
                v-model="matForm.figNum"
                placeholder="请输入规格"
                :disabled="isSelect"
              />
            </el-form-item>
          </el-col>
          
          
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="采购单位" prop="unitCode">
              <el-select
                v-model="matForm.unitCode"
                placeholder="请输入检索内容"
                filterable
                clearable
                @blur="getCurVal_unitCode"
              >
                <el-option
                  v-for="dict in dict.type.base_mat_unit"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="数量" prop="quantity">
              <el-input-number
                v-model="matForm.quantity"
                controls-position="right"
                :min="0"
                :precision="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单价(RMB)" prop="unitPrice">
              <el-input-number
                v-model="matForm.unitPrice"
                controls-position="right"
                :min="0"
                :precision="2"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="总价（RMB）" prop="sumPrice">
              <el-input-number
                v-model="matForm.sumPrice"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="分类" prop="matClass">
              <span slot="label">
                <el-tooltip placement="top">
                  <template #content>
                    <div>
                      <b>非CMC使用的物料：</b>
                      <br />
                      1.化学试剂：用于化学反应的各类化学药品。
                      2.生物试剂：用于生物实验的酶、抗体、核酸等。
                      <br />
                      <b>CMC使用的物料：</b>
                      <br />
                      ·
                      如生物制品生产使用的原辅料；标准品；用于生物制品提取、纯化、灭活的化学试剂；直接接触药品的包装材料；药品包装材料等。
                      <br />
                      <b>非CMC使用耗材：</b>
                      <br />
                      ·
                      辅助实验用物料。如枪头、培养皿、棉球、载玻片、一次性注射器、96孔板、滤芯/膜、离心管、洁净服、手套、口罩、鞋套、垃圾袋、三角瓶、试管架等。
                      <br />
                      <b>CMC使用的耗材：</b>
                      <br />
                      · 检验用试剂、培养基
                    </div>
                  </template>
                  <i class="el-icon-question"><b>分类</b></i>
                </el-tooltip>
              </span>
              <el-select
                v-model="matForm.matClass"
                placeholder="请选择物料分类"
              >
                <el-option
                  v-for="item in classList"
                  :key="item.classCode"
                  :label="item.className"
                  :value="item.classCode"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="物料组" prop="matGroup">
              <el-select v-model="matForm.matGroup" placeholder="请选择物料组">
                <el-option
                  v-for="item in groupList"
                  :key="item.groupCode"
                  :label="item.groupName"
                  :value="item.groupCode"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否单一" prop="isSingle">
              <el-radio-group v-model="matForm.isSingle" @change="valueChange">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="单一原因" prop="singleReason">
              <el-input v-model="matForm.singleReason" placeholder="单一原因" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否进口" prop="isImport">
              <el-radio-group v-model="matForm.isImport" @change="valueChange2">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="进口原因" prop="importReason">
              <el-input
                v-model="matForm.importReason"
                placeholder="进口原因"
                :rules="dynamicRules"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="链接" prop="matLink" :required="!isSelect">
              <el-input v-model="matForm.matLink" placeholder="请输入链接" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="用途" prop="purpose">
              <el-input v-model="matForm.purpose" placeholder="请输入用途" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="是否直接出库至实验室"
              prop="isWorkshop"
              label-width="170px"
            >
              <el-radio-group
                v-model="matForm.isWorkshop"
                @change="valueChange4"
              >
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="实验室" prop="workshopCode">
              <el-select v-model="matForm.workshopCode" placeholder="请选择实验室" :rules="dynamicRules">
                <el-option
                  v-for="item in workshopList"
                  :key="item.workshopCode"
                  :label="item.workshopName"
                  :value="item.workshopCode"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="货位" prop="locationCode">
              <el-select v-model="matForm.locationCode" placeholder="请选择货位" :rules="dynamicRules">
                <el-option
                  v-for="(item, index) in locationList"
                  :key="item.locationCode"
                  :label="formatLocation(item.locationCode)"
                  :value="item.locationCode"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="是否需安全库存提醒"
              prop="stockNotice"
              label-width="170px"
            >
              <el-radio-group
                v-model="matForm.stockNotice"
                @change="valueChange3"
                :disabled="isSelect"
              >
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="安全库存" prop="safetyStock">
              <el-input-number
                v-model="matForm.safetyStock"
                controls-position="right"
                :min="0"
                :precision="0"
                placeholder="请输入安全库存"
                :disabled="isSelect"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <p style="margin-left: -3%; color: red; font-size: 10">
              *安全库存大于0 默认触发提醒！
            </p>
          </el-col>
        </el-row>

        <el-button
          type="primary"
          v-if="actionType !== 'view'"
          @click="confirmAddMatDetail"
          >确 定</el-button
        >
        <div slot="footer" class="dialog-footer">
          <el-button @click="cancelAddMatDetail">取 消</el-button>
        </div>
      </el-form>
    </el-dialog>
    <el-dialog
      :title="'选择物料'"
      :visible.sync="selectMatOpen"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <selectMat @confirmSelect="confirmSelectMat"></selectMat>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSelectMat">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :title="'审核评语'"
      :visible.sync="openUnapprovedReason"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form
        ref="form"
        :model="checkform"
        :rules="approvedRules"
        label-width="120px"
      >
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="checkform.remark" placeholder="请输入备注" />
          </el-form-item>
        </el-col>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitApprovedForm">确 定</el-button>
        <el-button @click="cancelApprovedForm">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog
    :title="'物料详情 —— 到货确认'"
      :visible.sync="viewMultiDoneMatDetail"
      width="90%"
      height="90%"
      append-to-body
      :close-on-click-modal="false"
    >
    <div>
      <el-button type="primary" @click="submitDoneDetails">确 定 到 货</el-button>
      <el-button @click="cancelDoneDialog">取 消</el-button>
    </div>
    <el-table
        v-loading="loading"
        :data="multiDoneDetailList"
        style="width: 100%"
        max-height="700"
        @selection-change="handleSelectionChange2"
      >
        <el-table-column type="selection" width="50" align="center" :selectable="checkSelectable"/>
        <el-table-column
          label="序号"
          fixed
          align="center"
          type="index"
          width="50"
        />
        <el-table-column
          label="需求单号"
          align="center"
          prop="requireNo"
          width="120"
        />
        <el-table-column
          label="申请人"
          align="center"
          prop="requireBy"
          width="80"
        />
        <el-table-column
          label="创建日期"
          align="center"
          prop="createTime"
          width="110"
        >
          <template slot-scope="scope">
            {{ parseTime(formatDate(scope.row.createTime), "{y}-{m}-{d}") }}
          </template>
        </el-table-column>
        <el-table-column
          label="收货人"
          align="center"
          prop="consignee"
          width="80"
        />
        <el-table-column
          label="最晚到货"
          align="center"
          prop="requireDate"
          width="110"
        >
          <template slot-scope="scope">
            {{ parseTime(formatDate(scope.row.requireDate), "{y}-{m}-{d}") }}
          </template>
        </el-table-column>
        
        <el-table-column
          label="物料名称"
          fixed
          align="center"
          prop="matName"
          width="190"
        >
          <template slot-scope="scope">
            <el-popover
              placement="top"
              width="300"
              trigger="hover"
              :disabled="scope.row.matLink === '' || scope.row.matLink === null"
            >
              <div>
                <el-link
                  :href="`${scope.row.matLink}`"
                  :underline="false"
                  target="_blank"
                  ><b>采购链接：</b>{{ scope.row.matLink }}</el-link
                >
              </div>
              <span slot="reference" v-if="scope.row.matLink !== null">
                <b style="color: red">*</b>{{ scope.row.matName }}
              </span>
              <span
                slot="reference"
                v-if="scope.row.matLink === '' || scope.row.matLink === null"
                >{{ scope.row.matName }}</span
              >
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          label="物料编码"
          align="center"
          prop="matCode"
          width="150"
        />
        <el-table-column
          label="规格"
          align="center"
          prop="figNum"
          width="120"
        />
        <el-table-column
          label="货号"
          align="center"
          prop="artNum"
          width="100"
        />
        <el-table-column label="品牌" align="center" prop="brand" width="100" />

        <el-table-column
          label="采购单位"
          align="center"
          prop="unitCode"
          width="55"
        >
          <template slot-scope="scope">
            <dict-tag
              :options="dict.type.base_mat_unit"
              :value="scope.row.unitCode"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="数量"
          align="center"
          prop="quantity"
          width="60"
        />
        <el-table-column
          label="单价（RMB）"
          align="center"
          prop="unitPrice"
          width="80"
        >
          <template #header>
            <div>
              <span>单价</span>
              <br />
              <span>（RMB）</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="总价（RMB）"
          align="center"
          prop="sumPrice"
          width="120"
        >
          <template #header>
            <div>
              <span>总价（RMB）</span>
              <br />
              <span>{{ sumSumPriceLabel }}</span>
            </div>
          </template>

          <template slot-scope="scope">
            <span
              :style="
                formatSumPriceStyle(scope.row.sumPrice, scope.row.unitPrice)
              "
            >
              {{
                getSumPrice(
                  scope.row.sumPrice,
                  scope.row.unitPrice,
                  scope.row.quantity
                )
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="是否单一"
          align="center"
          prop="isSingle"
          width="50"
        >
          <template slot-scope="scope">
            <el-popover
              placement="top"
              width="300"
              trigger="hover"
              :disabled="scope.row.isSingle === '0'"
            >
              <div><b>单一原因：</b>{{ scope.row.singleReason }}</div>
              <span slot="reference" v-if="scope.row.isSingle === '1'"
                >{{ formatBoolType(scope.row.isSingle)
                }}<b style="color: red">*</b></span
              >
              <span slot="reference" v-if="scope.row.isSingle === '0'">{{
                formatBoolType(scope.row.isSingle)
              }}</span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          label="是否进口"
          align="center"
          prop="isImport"
          width="50"
        >
          <template slot-scope="scope">
            <el-popover
              placement="top"
              width="300"
              trigger="hover"
              :disabled="scope.row.isImport === '0'"
            >
              <div><b>进口原因：</b>{{ scope.row.importReason }}</div>
              <span slot="reference" v-if="scope.row.isImport === '1'"
                >{{ formatBoolType(scope.row.isImport)
                }}<b style="color: red">*</b></span
              >
              <span slot="reference" v-if="scope.row.isImport === '0'">{{
                formatBoolType(scope.row.isImport)
              }}</span>
            </el-popover>
          </template>
        </el-table-column>
        
        <el-table-column label="用途" align="center" prop="purpose" width="120">
          <template slot-scope="scope">
            <el-popover
              placement="top"
              width="300"
              trigger="hover"
              :disabled="scope.row.purpose.length < 15"
            >
              <div><b>用途：</b>{{ scope.row.purpose }}</div>
              <span slot="reference">
                {{ formatLongPurpose(scope.row.purpose) }}
              </span>
            </el-popover>
          </template>
        </el-table-column>
        
        
        <el-table-column
          label="三级编码"
          align="center"
          prop="subcode"
          width="100"
        />
        <el-table-column
          label="物料分类"
          align="center"
          prop="matClass"
          width="80"
        />
        <el-table-column
          label="物料组"
          align="center"
          prop="matGroup"
          width="80"
        />

        <el-table-column
          label="状态"
          align="center"
          prop="matStatus"
          width="100"
          fixed="right"
        >
          <template slot-scope="scope">
            <span :style="formatStatusStyle(scope.row.matStatus)">
              {{ formatStatus(scope.row.matStatus) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>


    <el-dialog
      :title="'物料详情'"
      :visible.sync="viewMultiMatDetail"
      width="90%"
      height="90%"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-table
        v-loading="loading"
        :data="multiDetailList"
        style="width: 100%"
        max-height="700"
      >
        <el-table-column
          label="序号"
          fixed
          align="center"
          type="index"
          width="50"
        />

        <el-table-column
          label="物料名称"
          fixed
          align="center"
          prop="matName"
          width="190"
        >
          <template slot-scope="scope">
            <el-popover
              placement="top"
              width="300"
              trigger="hover"
              :disabled="scope.row.matLink === '' || scope.row.matLink === null"
            >
              <div>
                <el-link
                  :href="`${scope.row.matLink}`"
                  :underline="false"
                  target="_blank"
                  ><b>采购链接：</b>{{ scope.row.matLink }}</el-link
                >
              </div>
              <span slot="reference" v-if="scope.row.matLink !== null">
                <b style="color: red">*</b>{{ scope.row.matName }}
              </span>
              <span
                slot="reference"
                v-if="scope.row.matLink === '' || scope.row.matLink === null"
                >{{ scope.row.matName }}</span
              >
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column
          label="规格"
          align="center"
          prop="figNum"
          width="120"
        />
        <el-table-column
          label="货号"
          align="center"
          prop="artNum"
          width="100"
        />
        <el-table-column label="品牌" align="center" prop="brand" width="100" />

        <el-table-column
          label="采购单位"
          align="center"
          prop="unitCode"
          width="55"
        >
          <template slot-scope="scope">
            <dict-tag
              :options="dict.type.base_mat_unit"
              :value="scope.row.unitCode"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="数量"
          align="center"
          prop="quantity"
          width="60"
        />
        <el-table-column
          label="单价（RMB）"
          align="center"
          prop="unitPrice"
          width="80"
        >
          <template #header>
            <div>
              <span>单价</span>
              <br />
              <span>（RMB）</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="总价（RMB）"
          align="center"
          prop="sumPrice"
          width="120"
        >
          <template #header>
            <div>
              <span>总价（RMB）</span>
              <br />
              <span>{{ sumSumPriceLabel }}</span>
            </div>
          </template>

          <template slot-scope="scope">
            <span
              :style="
                formatSumPriceStyle(scope.row.sumPrice, scope.row.unitPrice)
              "
            >
              {{
                getSumPrice(
                  scope.row.sumPrice,
                  scope.row.unitPrice,
                  scope.row.quantity
                )
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="是否单一"
          align="center"
          prop="isSingle"
          width="50"
        >
          <template slot-scope="scope">
            <el-popover
              placement="top"
              width="300"
              trigger="hover"
              :disabled="scope.row.isSingle === '0'"
            >
              <div><b>单一原因：</b>{{ scope.row.singleReason }}</div>
              <span slot="reference" v-if="scope.row.isSingle === '1'"
                >{{ formatBoolType(scope.row.isSingle)
                }}<b style="color: red">*</b></span
              >
              <span slot="reference" v-if="scope.row.isSingle === '0'">{{
                formatBoolType(scope.row.isSingle)
              }}</span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          label="是否进口"
          align="center"
          prop="isImport"
          width="50"
        >
          <template slot-scope="scope">
            <el-popover
              placement="top"
              width="300"
              trigger="hover"
              :disabled="scope.row.isImport === '0'"
            >
              <div><b>进口原因：</b>{{ scope.row.importReason }}</div>
              <span slot="reference" v-if="scope.row.isImport === '1'"
                >{{ formatBoolType(scope.row.isImport)
                }}<b style="color: red">*</b></span
              >
              <span slot="reference" v-if="scope.row.isImport === '0'">{{
                formatBoolType(scope.row.isImport)
              }}</span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          label="库存"
          align="center"
          prop="stockQuantity"
          width="60"
        />
        <el-table-column
          label="安全库存"
          align="center"
          prop="safetyStock"
          width="60"
        />
        <el-table-column
          label="历史采购数量"
          align="center"
          prop="purchaseCount"
          width="60"
        />
        <el-table-column label="用途" align="center" prop="purpose" width="120">
          <template slot-scope="scope">
            <el-popover
              placement="top"
              width="300"
              trigger="hover"
              :disabled="scope.row.purpose.length < 15"
            >
              <div><b>用途：</b>{{ scope.row.purpose }}</div>
              <span slot="reference">
                {{ formatLongPurpose(scope.row.purpose) }}
              </span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          label="申请人"
          align="center"
          prop="requireBy"
          width="80"
        />
        <el-table-column
          label="创建日期"
          align="center"
          prop="createTime"
          width="110"
        >
          <template slot-scope="scope">
            {{ parseTime(formatDate(scope.row.createTime), "{y}-{m}-{d}") }}
          </template>
        </el-table-column>
        <el-table-column
          label="收货人"
          align="center"
          prop="consignee"
          width="80"
        />
        <el-table-column
          label="最晚到货"
          align="center"
          prop="requireDate"
          width="110"
        >
          <template slot-scope="scope">
            {{ parseTime(formatDate(scope.row.requireDate), "{y}-{m}-{d}") }}
          </template>
        </el-table-column>
        <el-table-column
          label="PM项目号"
          align="center"
          prop="pmProject"
          width="140"
        />
        <el-table-column
          label="需求单号"
          align="center"
          prop="requireNo"
          width="120"
        />
        <el-table-column
          label="物料编码"
          align="center"
          prop="matCode"
          width="150"
        />
        <el-table-column
          label="三级编码"
          align="center"
          prop="subcode"
          width="100"
        />
        <el-table-column
          label="物料分类"
          align="center"
          prop="matClass"
          width="80"
        />
        <el-table-column
          label="物料组"
          align="center"
          prop="matGroup"
          width="80"
        />

        <el-table-column
          label="状态"
          align="center"
          prop="requireStatus"
          width="100"
        >
          <template slot-scope="scope">
            <span :style="formatStatusStyle(scope.row.requireStatus)">
              {{ formatStatus(scope.row.requireStatus) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog
      :title="'检测到货号已存在的物料'"
      :visible.sync="existMatDialog"
      width="90%"
      height="90%"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-table
        v-loading="loading"
        :data="existtMatList"
        style="width: 100%"
        max-height="700"
      >
      <el-table-column
          label="物料编码"
          align="center"
          prop="matCode"
          width="150"
        />
        <el-table-column
          label="物料名称"
          fixed
          align="center"
          prop="matName"
          width="190"
        />

        <el-table-column
          label="规格"
          align="center"
          prop="figNum"
          width="120"
        />
        <el-table-column
          label="货号"
          align="center"
          prop="artNum"
          width="100"
        />
        <el-table-column label="品牌" align="center" prop="brand" width="100" />

        <el-table-column
          label="单位"
          align="center"
          prop="unitCode"
          width="55"
        >
          <template slot-scope="scope">
            <dict-tag
              :options="dict.type.base_mat_unit"
              :value="scope.row.unitCode"
            />
          </template>
        </el-table-column>        
        <el-table-column
          label="单价"
          align="center"
          prop="unitPrice"
          width="80"
        >
          
        </el-table-column>
        <el-table-column
          label="三级编码"
          align="center"
          prop="subcode"
          width="100"
        />
        <el-table-column
          label="物料分类"
          align="center"
          prop="matClass"
          width="80"
        />
        <el-table-column
          label="物料组"
          align="center"
          prop="matGroup"
          width="80"
        />        
      </el-table>
      <div slot="footer" class="dialog-footer">
        <!-- <el-button
          type="primary"
          v-if="actionType !== 'view'"
          @click="confirmAddExistMat"
          >保持我的输入</el-button
        > -->
        <el-button 
        @click="cancelAddExistMat">
        返回重新选择</el-button>
      </div>
      
        <div slot="footer" class="dialog-footer">
         
        </div>
    </el-dialog>
    <el-dialog
      :title="'检测到相同物料标签的物料库存'"
      :visible.sync="showTagQuery"
      width="1000px"
      height="90%"
      append-to-body
      :close-on-click-modal="false"
    >
    <el-form :model="tagQueryParams" ref="tagQueryParams" size="small" :inline="true" label-width="68px">
      <el-form-item label="标签名称" prop="matTag">
        <el-select
          v-model="tagQueryParams.matTag"
          placeholder="请输入物品标签检索内容"
          filterable
          clearable
          @blur="getCurVal"
        >
          <el-option
            v-for="(item, index) in tagList"
            :key="item.tagCode"
            :label="item.tagName"
            :value="item.tagCode"
          ></el-option>
        </el-select>
      </el-form-item>
      
      
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="tagHandleQuery">搜索</el-button>
      </el-form-item>
    </el-form>
      <el-table
        v-loading="loading"
        :data="sameTagStockList"
        style="width: 100%"
        max-height="700"
      >
      <el-table-column label="行号" align="center" type="index" />
      <el-table-column
          label="物料编码"
          align="center"
          prop="matCode"
          width="150"
        />
        <el-table-column
          label="物料名称"
          fixed
          align="center"
          prop="matName"
          width="190"
        />

        <el-table-column
          label="规格"
          align="center"
          prop="figNum"
          width="120"
        />       
        <el-table-column
          label="单位"
          align="center"
          prop="unitCode"
          width="55"
        >
          <template slot-scope="scope">
            <dict-tag
              :options="dict.type.base_mat_unit"
              :value="scope.row.unitCode"
            />
          </template>
        </el-table-column>        

       
        <el-table-column
          label="物料分类"
          align="center"
          prop="matClass"
          width="80"
        />
        <el-table-column
          label="物料组"
          align="center"
          prop="matGroup"
          width="80"
        />       
        <el-table-column label="有效时间" align="center" prop="expiredTime" width="120">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.expiredTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
        <el-table-column
          label="货位"
          align="center"
          prop="locationCode"
          width="80"
        />
        <el-table-column
          label="数量"
          align="center"
          prop="quantity"
          width="80"
        />     
      </el-table>
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="tagQueryParams.pageNum"
        :limit.sync="tagQueryParams.pageSize"
        @pagination="tagHandleQuery"
      />
      <div slot="footer" class="dialog-footer">
        <!-- <el-button
          type="primary"
          v-if="actionType !== 'view'"
          @click="confirmAddExistMat"
          >保持我的输入</el-button
        > -->
        <el-button 
        @click="cancelShowTagQuery">
        关闭</el-button>
      </div>
      
        <div slot="footer" class="dialog-footer">
         
        </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listMatRequire,
  getMatRequire,
  delMatRequire,
  addMatRequire,
  updateMatRequire,
  updateMatRequireStatus,
  getMatDetailListbyRequireIds,
  getRequireLogs,
  submitDoneDetailByDetailIds
} from "@/api/stock/matRequire";
import { Message } from "element-ui";
import { listMat } from "@/api/base/mat";
import { listAllGroup } from "@/api/base/group";
import { listAllClass } from "@/api/base/class";
import { listAllTag } from "@/api/base/tag";
import { listAllSubcode } from "@/api/base/subcode";
import { listAllBrand } from "@/api/base/brand";
import { listAllWorkshop } from "@/api/base/workshop";
import { listAllLocation } from "@/api/base/location";
import { listMatLabelAll } from "@/api/stock/matLabel";
import { listInfo} from "@/api/stock/info";
import { getCurrentUser, listUserAll } from "@/api/system/user";
import selectMat from "../../components/select-mat/index";
import selectSupplier from "../../components/select-supplier/index";
import cloneDeep from "lodash/cloneDeep";

export default {
  name: "MatRequire",
  dicts: ["base_mat_unit"],
  components: { selectMat, selectSupplier },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      selectItems: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 物料需求单表格数据
      matRequireList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // openSelf: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        params: { matName: null },
      },
      queryParams2: {
        pageNum: 1,
        pageSize: 10,
      },
      subcodeRequiredInfos: [
        "matName",
        "artNum",
        "brand",
        "figNum",
        "unitCode",
      ],
      dict_1: [
        { label: "是", value: "1" },
        { label: "1", value: "是" },
        { label: "0", value: "否" },
        { label: "否", value: "0" },
      ],
      // 表单参数
      form: {},
      matForm: {},
      // 表单校验
      rules: {
        requireBy: [
          { required: true, message: "申请人不能为空", trigger: "blur" },
        ],
        consignee: [
          { required: true, message: "收货人不能为空", trigger: "blur" },
        ],
        phoneNum: [
          { required: true, message: "电话不能为空", trigger: "blur" },
        ],
        requireDate: [
          { required: true, message: "要求到货时间不能为空", trigger: "blur" },
        ],
        pmProject: [
          { required: true, message: "PM项目不能为空", trigger: "blur" },
        ]
      },
      approvedRules: {
        remark: [{ required: false, message: "备注不能为空", trigger: "blur" }],
      },

      matRules: {
        matCode: [{ required: true, message: "请选择物料", trigger: "blur" }],
        subcode: [
          { required: true, message: "请选择三级分类编码", trigger: "blur" },
        ],
        matName: [
          { required: true, message: "物料名称不能为空", trigger: "blur" },
        ],
        artNum: [{ required: true, message: "货号不能为空", trigger: "blur" }],
        brand: [{ required: true, message: "品牌不能为空", trigger: "blur" }],
        figNum: [{ required: true, message: "规格不能为空", trigger: "blur" }],
        unitCode: [
          { required: true, message: "请选择采购单位", trigger: "blur" },
        ],
        quantity: [{ required: true, message: "请输入数量", trigger: "blur" }],
        unitPrice: [
          { required: true, message: "请输入单价（RMB）", trigger: "blur" },
        ],
        singleReason: [
          { required: false, message: "请输入单一原因", trigger: "blur" },
        ],
        importReason: [
          { required: false, message: "请输入进口原因", trigger: "blur" },
        ],
        isSingle: [
          { required: true, message: "请选择是否单一", trigger: "blur" },
        ],
        isImport: [
          { required: true, message: "请选择是否进口", trigger: "blur" },
        ],
        purpose: [{ required: true, message: "用途不能为空", trigger: "blur" }],
        matClass: [
          { required: true, message: "物料分类不能为空", trigger: "blur" },
        ],
        matGroup: [
          { required: true, message: "物料组不能为空", trigger: "blur" },
        ],
        safetyStock: [
          { required: true, message: "安全库存不能为空", trigger: "blur" },
        ],
        stockNotice: [
          { required: true, message: "请选择是否需要提醒", trigger: "blur" },
        ],
        manageBy: [
          { required: true, message: "物料负责人不能为空", trigger: "blur" },
        ],
        isWorkshop: [
          { required: true, message: "请选择是否直接出库至实验室", trigger: "blur" },
        ],
        workshopCode: [
          { required: false, message: "请选择实验室", trigger: "blur" },
        ],
        locationCode: [
          { required: false, message: "请选择货位", trigger: "blur" },
        ],
      },
      requireDetailList: [],

      //组、分类
      groupList: [],
      classList: [],
      tagList: [],
      subcodeList: [],
      brandList: [],

      //选择物料
      selectMatOpen: false,
      //选择供应商
      selectSupplierOpen: false,
      selectMatDetailOpen: false,
      addMatDetailOpen: false,
      pmProjectList: [
        {
          label: "基于结构的核酸疫苗设计与研发",
          value: "P23Z31900N0001",
        },
        {
          label: "创新呼吸道合胞病毒mRNA疫苗开发与应用",
          value: "P23Z31900N0002",
        },
        {
          label: "新型脂质体研发",
          value: "P23Z31900N0003",
        },
        {
          label: "核酸疫苗工艺开发与技术转移",
          value: "P24Z31900N0004",
        },
        {
          label: "创新水痘-带状疱疹病毒RNA疫苗开发与应用",
          value: "P24Z31900N0005",
        },
      ],

      keyWord: "",
      // 是否编辑
      showEdit: true,
      // 是否选择物料主数据
      isSelect: true,
      // 是否编辑物料
      isEditMat: false,
      // 编辑物料index
      matIndex: null,
      // 物料操作类型
      actionType: "view", //[view,edit,add]
      item: {},
      // 日期范围
      dateRange: [],
      statusDictButtons: [
        { name: "已创建", value: "created", type: "PRIMARY" },
        { name: "审核通过", value: "approved", type: "DANGER" },
        { name: "审核不通过", value: "un_approved", type: "danger" },
        { name: "采购中", value: "processing", type: "warning" },
        { name: "采购不通过", value: "un_purchase", type: "danger" },
        { name: "采购到货", value: "done", type: "PRIMARY" },
      ],
      statusDictButtonsCheck: [
        { name: "审核通过", value: "approved", type: "DANGER" },
        { name: "审核不通过", value: "un_approved", type: "danger" },
      ],
      statusDictButtonsPurchase: [
        { name: "采购中", value: "processing", type: "warning" },
        { name: "采购不通过", value: "un_purchase", type: "danger" },
        { name: "采购到货", value: "done", type: "PRIMARY" },
      ],
      statusDict: {
        created: "已创建",
        approved: "审核通过",
        un_approved: "审核不通过",
        processing: "采购中",
        un_purchase: "采购不通过",
        done: "已入库",
      },
      statusColor: {
        created: "orange",
        approved: "green",
        un_approved: "red",
        processing: "blue",
        un_purchase: "red",
        done: "grey",
        deal: "blue",
        finished: "grey",
      },
      openUnapprovedReason: false,
      approvedReason: null,
      newStatus: null,
      checkform: {},
      isRemark: false,
      viewMultiMatDetail: false,
      multiDetailList: [],
      multiDetailtotal: [],
      currentUser: null,
      sumSumPriceLabel: "",
      expands: [],
      allRequireDetailList: [],
      openStatusLogs: false,
      statusLogs: [],
      userList: [],
      ordersList: [
        {
          orderColumn: "requireId",
          orderState: "descending",
        },
      ],
      defaultSort: true,
      existtMatList: [],
      existMatDialog: false,
      notConfirm: true,
      workshopList: [],
      multiDoneDetailList: [],
      viewMultiDoneMatDetail: false,
      doneDetailIds: [],
      showTagQuery: false,
      sameTagStockList: [],
      tagQueryParams: {
        pageNum: 1,
        pageSize: 10,
        matTag: null,
        },
      locationList: [],
      locationDict: {},
    };
  },
  created() {
    this.getGroupList();
    this.getClassList();
    this.getTagList();
    this.getSubcodeList();
    this.getBrandList();
    this.getUser();
    this.getList();
    this.getUserList();
    this.getWorkshopList();
    this.getBaselocationList();
  },
  change: {},
  computed: {
    fillist() {
      return this.subcodeList.filter((p) => {
        return (
          p.subcodeName.indexOf(this.keyWord) !== -1 ||
          p.subcodeCode.indexOf(this.keyWord) !== -1
        );
      });
    },

    dynamicRules() {
      // 单一
      const _ruleSingle = cloneDeep(this.matRules.singleReason); // 使用cloneDeep进行深拷贝; // 创建一个规则数组的副本
      // 如果 subjectNo 填写了，则将 softName 设置为必填
      if (this.matForm.isSingle === 1) {
        _ruleSingle[0].required = true;
      } else if (this.matForm.isSingle === 0) {
        _ruleSingle[0].required = false;
      }
      this.matRules.singleReason = _ruleSingle;

      // 进口
      const _ruleImport = cloneDeep(this.matRules.importReason); // 使用cloneDeep进行深拷贝; // 创建一个规则数组的副本
      // 如果 subjectNo 填写了，则将 softName 设置为必填
      if (this.matForm.isImport === 1) {
        _ruleImport[0].required = true;
      } else if (this.matForm.isImport === 0) {
        _ruleImport[0].required = false;
      }
      this.matRules.importReason = _ruleImport;

      // 实验室 or 货位
      const _ruleWorkshop = cloneDeep(this.matRules.workshopCode);
      const _ruleLocation = cloneDeep(this.matRules.locationCode);
      if (this.matForm.isWorkshop === 1) {
        _ruleWorkshop[0].required = true;
        _ruleLocation[0].required = false;
      } else if (this.matForm.isWorkshop === 0) {
        _ruleLocation[0].required = true;
        _ruleWorkshop[0].required = false;
      }
      this.matRules.workshopCode = _ruleWorkshop;
      this.matRules.locationCode = _ruleLocation;
      return

    },
  },
  methods: {
    getCurVal(val) {
      this.value = val.target.value;
    },
    submitDoneDetails() {
      console.log(this.doneDetailIds)
      if(!this.doneDetailIds || this.doneDetailIds.length == 0){
        Message.warning("请先选择物料！")
        return
      }
      submitDoneDetailByDetailIds(this.doneDetailIds).then((response) => {
        Message.success("提交成功！")
      }).catch(() => {});
      this.viewMultiDoneMatDetail = false;
      this.getList();
    },
    cancelDoneDialog() {
      this.viewMultiDoneMatDetail = false
    },
    //是否可选
    checkSelectable(row){
      if(row.matStatus === "done"){
        return false;
      }else{
        return true;
      }
    },
    handleSortChange(column) {
      this.queryParams.orderByColumn = column.prop; //查询字段是表格中字段名字
      this.queryParams.isAsc = column.order; //动态取值排序顺序
      this.getList();
    },
    handleHeaderCLick(column) {
      if (column.sortable !== "custom") {
        return;
      }
      if (!column.multiOrder) {
        column.multiOrder = "descending";
      } else if (column.multiOrder === "descending") {
        column.multiOrder = "ascending";
      } else {
        column.multiOrder = "";
      }
      this.handleOrderChange(column.property, column.multiOrder);
    },
    handleOrderChange(orderColumn, orderState) {
      // 首次修改排序时,先将默认的按时间排序删除
      if (this.defaultSort === true) {
        this.ordersList = [];
        this.defaultSort = false;
      }

      let result = this.ordersList.find((e) => e.orderColumn === orderColumn);
      if (result) {
        result.orderState = orderState;
      } else {
        this.ordersList.push({
          orderColumn: orderColumn,
          orderState: orderState,
        });
      }
      // 调接口查询，在传参的时候把ordersList进行处理成后端想要的格式
      this.getList();
    },
    handleTableSort({ column }) {
      // 有些列不需要排序，提前返回
      if (column.sortable !== "custom") {
        return;
      }
      if (!column.multiOrder) {
        column.multiOrder = "descending";
      } else if (column.multiOrder === "descending") {
        column.multiOrder = "ascending";
      } else {
        column.multiOrder = "";
      }
      this.handleOrderChange(column.property, column.multiOrder);
    },
    handleSwitchAuto() {
      this.isSelect = !this.isSelect;
      this.matForm = {};
      this.item = {};
      if (!this.isSelect) {
        this.matForm.matCode = "userSelf_matcode";
      }
      this.$set(this.matForm, "isSingle", 0);
      this.$set(this.matForm, "isImport", 0);
      this.$set(this.matForm, "isWorkshop", 0);
      this.$set(this.matForm, "stockNotice", "0");
    },
    showTagQueryDialog() {
      this.showTagQuery = true
      if(this.matForm.matTag){
        this.tagQueryParams['matTag'] = this.matForm.matTag
      }
      this.tagHandleQuery()
    },
    tagHandleQuery(){      
      listInfo(this.tagQueryParams).then(response => {
        this.sameTagStockList = response.rows;
        this.total = response.total;
        this.loading = false;        
      });
    },
    cancelShowTagQuery(){
      this.showTagQuery = false
      this.tagQueryParams = {
        matCode: null,
      }
      this.resetForm("tagQueryParams")
    },
    formatStatusStyle(requireId) {
      this.openStatusLogs = true;
      getRequireLogs(requireId).then((response) => {
        this.statusLogs = response.rows;
      });
    },
    formatLongPurpose(purpose) {
      if (purpose.length >= 15) {
        return purpose.substring(0, 15) + "...";
      }
      return purpose;
    },
    handleDetailMatDetail(requireId, detailId) {
      var multiDetailList = this.allRequireDetailList[requireId];
      for (let item in multiDetailList) {
        if (multiDetailList[item].detailId === detailId) {
          multiDetailList[item]["warehouseQuantity"] = "";
          this.addMatDetailOpen = true;
          this.matForm = multiDetailList[item];
          break;
        }
      }
    },
    getSumSumPriceLabel(requireId) {
      var multiDetailList = this.allRequireDetailList[requireId];
      if(!multiDetailList){
        return 0.00
      }
      var reuqireSumPrice = multiDetailList
        .map((item) => Number(item.unitPrice) * Number(item.quantity))
        .reduce(
          (accumulator, currentValue) =>
            Number(accumulator) + Number(currentValue),
          0
        );
      return reuqireSumPrice.toFixed(2);
    },
    rowClick(row, event, column) {
      if (this.expands.indexOf(row.requireId) < 0) {
        this.expands.push(row.requireId);
      } else {
        // this.expands.remove(row.requireId);
        this.expands.splice(this.expands.indexOf(row.requireId), 1);
      }
    },
    getPmName(pMCode) {
      for (let item in this.pmProjectList) {
        if (this.pmProjectList[item].value === pMCode) {
          return this.pmProjectList[item].label;
        }
      }
      return pMCode;
    },
    getSumPrice(sumPrice, unitPrice, num) {
      if (sumPrice !== null && sumPrice > 0) {
        return sumPrice;
      } else {
        return (unitPrice * num).toFixed(2);
      }
    },
    formatSumPriceStyle(sP, uP) {
      if ((sP === 0 || sP === "" || sP === "0") && uP > 0) {
        return { color: "#477ca6" };
      } else {
        return {};
      }
    },
    // 获取当前登录用户
    getUser() {
      getCurrentUser().then((response) => {
        this.currentUser = response;
      });
    },
    handleViewMultiDetail() {
      this.multiDetailList = [];
      const requireIds = this.ids;
      getMatDetailListbyRequireIds(requireIds)
        .then((response) => {
          this.multiDetailList = response;
          var sumSumPrice = 0;
          for (let item in this.multiDetailList) {
            sumSumPrice =
              Number(sumSumPrice) +
              Number(
                this.getSumPrice(
                  this.multiDetailList[item].sumPrice,
                  this.multiDetailList[item].unitPrice,
                  this.multiDetailList[item].quantity
                )
              );
          }
          this.sumSumPriceLabel = sumSumPrice.toFixed(2);
          this.viewMultiMatDetail = true;
        })
        .catch(() => {});
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const requireIds = row.requireId || this.ids;
      if (this.ids.length > 0) {
        for (let item in this.selectItems) {
          var createBy = this.selectItems[item].createBy;
          if (this.currentUser !== createBy) {
            Message.warning("无法修改或删除他人的需求单！");
            return;
          }
          if (this.selectItems[item].requireStatus !== "created") {
            Message.warning("无法删除已审核或发起采购的需求单！");
            return;
          }
        }
      } else if (this.currentUser !== row.createBy) {
        Message.warning("无法修改或删除他人的需求单！");
        return;
      }
      this.$modal
        .confirm('是否确认删除需求编号为"' + requireIds + '"的数据项？')
        .then(function () {
          return delMatRequire(requireIds);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    handleChangeStatusCheck(status) {
      var selectStatus = this.selectItems.map((item) => item.requireStatus);
      if (
        selectStatus.indexOf("processing") >= 0 ||
        selectStatus.indexOf("done") >= 0 ||
        selectStatus.indexOf("deal") >= 0 ||
        selectStatus.indexOf("un_purchase") >= 0 ||
        selectStatus.indexOf("finished") >= 0
      ) {
        Message.warning("已发起采购或已入库的物料不可重复审核！");
        return;
      } else if (
        selectStatus.indexOf("approved") >= 0 &&
        status === "approved"
      ) {
        Message.warning("不可重复审核需求单！");
        return;
      }
      this.newStatus = status;
      this.checkform = {};
      this.isRemark = true;
      this.openUnapprovedReason = true;
    },

    handleChangeStatusPurchase(status) {
      var selectStatus = this.selectItems.map((item) => item.requireStatus);
      for (let oldStatus of selectStatus) {
        if (oldStatus === "approved") {
          continue;
        } else if (oldStatus === "created" || oldStatus === "un_approved") {
          Message.warning("未审核通过的需求单不可发起采购！");
          return;
        } else if (oldStatus === "done") {
          Message.warning("需求单物料已全部入库！");
          return;
        } else if (oldStatus === "processing" && status === "processing") {
          Message.warning("需求单已经在采购中！");
          return;
        }
      }
      // 入库最小单位改成物料
      if(status === "done"){
        this.multiDoneDetailList = [];
        const requireIds = this.ids;
        getMatDetailListbyRequireIds(requireIds)
          .then((response) => {
            this.multiDoneDetailList = response;           
            this.viewMultiDoneMatDetail = true;
          })
          .catch(() => {});
      } else {
        this.newStatus = status;
        this.checkform = {};
        this.isRemark = true;
        this.openUnapprovedReason = true;
      }      
    },

    submitApprovedForm() {
      this.openUnapprovedReason = false;
      var request = {
        requireIds: this.ids,
        status: this.newStatus,
        remarkString: this.checkform.remark,
      };
      updateMatRequireStatus(request).then(() => {
        this.getList();
        this.checkform = {};
        this.$modal.msgSuccess("更改成功");
      });
    },
    cancelApprovedForm() {
      this.openUnapprovedReason = false;
    },
    getCurVal(val) {
      this.value = val.target.value;
    },
    getCurVal_brand(val) {
      this.value = val.target.value;
    },
    getCurVal_unitCode(val) {
      this.value = val.target.value;
    },
    openAddMatDetailDialog() {
      this.showEdit = true;
      this.isSelect = true;
      this.addMatDetailOpen = true;
      this.matForm = {};
      this.item = {};
      this.$set(this.matForm, "isSingle", 0);
      this.$set(this.matForm, "isImport", 0);
      // this.$set(this.matForm, "stockNotice", 0);
    },
    openAddMatDetailSelfDialog() {
      this.showEdit = true;
      this.isSelect = false;
      this.matForm = {};
      this.item = {};
      this.matForm.matCode = "userSelf_matcode";
      this.addMatDetailOpen = true;
      this.$set(this.matForm, "isSingle", 0);
      this.$set(this.matForm, "isImport", 0);
      this.$set(this.matForm, "stockNotice", "0");
    },

    /** 查询物料需求列表 */
    setRequireDetailList(matRequireIds) {
      for (let index in matRequireIds) {
        getMatDetailListbyRequireIds(matRequireIds[index])
          .then((response) => {
            var multiDetailList = response;
            var sumSumPrice = 0;
            for (let item in this.multiDetailList) {
              sumSumPrice =
                Number(sumSumPrice) +
                Number(
                  this.getSumPrice(
                    this.multiDetailList[item].sumPrice,
                    this.multiDetailList[item].unitPrice,
                    this.multiDetailList[item].quantity
                  )
                );
            }
            this.sumSumPriceLabel = sumSumPrice.toFixed(2);
            this.allRequireDetailList[matRequireIds[index]] = multiDetailList;
          })
          .catch(() => {});
      }
    },
    getList() {
      this.loading = true;
      listMatRequire(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.matRequireList = response.rows;
          this.setRequireDetailList(
            this.matRequireList.map((item) => item.requireId)
          );
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    valueChange(value) {
      this.$nextTick(() => {});
    },
    valueChange2(value) {
      this.$nextTick(() => {});
    },
    valueChange3(value) {
      this.$nextTick(() => {});
    },
    valueChange4(value) {
      this.$nextTick(() => {});
    },
    valueChangeStatus(value) {
      this.$nextTick(() => {});
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 物料表单重置
    resetMatForm() {
      this.matForm = {
        labelId: null,
        labelType: null,
        matCode: null,
        warehouseQuantity: null,
        sameTagQuantity :null,
        matName: null,
        subcode: null,
        fdCode: null,
        figNum: null,
        artNum: null,
        matGroup: null,
        matClass: null,
        matTag: null,
        unitCode: null,
        batch: null,
        brandCode: null,
        brandName: null,
        prodTime: null,
        quantity: null,
        qualifiedQuantity: null,
        receivedQuantity: null,
        unitPrice: null,
        orderNo: null,
        orderType: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        stockNotice: "0",
        safetyStock: null,
      };
      this.resetForm("matForm");
    },
    // 表单重置
    reset() {
      this.form = {
        requireBy: null,
        pmProject: null,
        consigne: null,
        phoneNum: null,
        requireDate: null,
        matLink: null,
        purpose: null,
        address: null,
      };
      this.detailList = [];
      this.requireDetailList = [];
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
      this.queryParams["params"] = {};
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.requireId);
      this.selectItems = selection;
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    // 多选框选中数据
    handleSelectionChange2(selection) {
      this.doneDetailIds = selection.map((item) => item.detailId);
      console.log(this.doneDetailIds);
    },
    // 未完成
    handleDetail(row) {
      getMatRequire(row.requireId).then((response) => {
        this.form = response.data;
        this.requireDetailList = response.data.detailList;
        this.actionType = "view";
        this.title = "物料需求详情";
        this.open = true;
      });
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.actionType = "add";
      this.title = "添加物料需求单";
      this.$set(
        this.form,
        "address",
        "深圳市盐田区海山街道田东社区深盐路2028号大百汇生命健康产业园1栋一单元6楼"
      );
      this.$set(this.form, "requireStatus", "created");
    },
    handleUpdate(row) {
      if (this.currentUser !== row.createBy) {
        Message.warning("无法修改或删除他人的需求单！");
        return;
      }
      this.reset();
      const requireId = row.requireId || this.ids;
      getMatRequire(requireId).then((response) => {
        this.form = response.data;
        this.requireDetailList = response.data.detailList;
        this.open = true;
        this.actionType = "edit";
        this.title = "修改物料需求";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let that = this;
          if (!that.requireDetailList) {
            Message.warning("物料清单列表为空！");
            return;
          }
          if (that.actionType == "edit") {
            that.$modal.confirm("是否提交该需求单信息？").then(function () {
              that.form.detailList = that.requireDetailList;
              that.form["requireStatus"] = "created";
              updateMatRequire(that.form)
                .then(() => {
                  that.$modal.msgSuccess("更新成功");
                  that.open = false;
                  that.getList();
                })
                .catch(() => {});
            });
          } else {
            
            that.$modal
              .confirm("是否提交该需求单信息？")
              .then(function () {
                that.form.detailList = that.requireDetailList;
                addMatRequire(that.form);
              })
              .then(() => {
                that.$modal.msgSuccess("新增成功");
                that.open = false;
                that.getList();
              })
              .catch(() => {});
          }
        }
      });
    },

    /** 导出按钮操作 */
    handleExport(row) {
      const requireIds = row.requireId || this.ids;
      let params = { requireIds: requireIds };
      this.download(
        "stock/matRequire/export",
        {
          ...params
        },
        `matRequire_${new Date().getTime()}.xlsx`
      );
    },
    /** 批量打印 */
    handlePrintBatch(row) {
      const labelIds = row.labelId || this.ids;
      printRequireBatch(labelIds).then((response) => {
        const binaryData = [];
        binaryData.push(response);
        let pdfUrl = window.URL.createObjectURL(
          new Blob(binaryData, { type: "application/pdf" })
        );
        window.open(pdfUrl);
      });
    },
    /** 查询组、分类 */
    getGroupList() {
      listAllGroup().then((response) => {
        this.groupList = response;
      });
    },
    getClassList() {
      listAllClass().then((response) => {
        this.classList = response;
      });
    },
    getTagList() {
      listAllTag().then((response) => {
        this.tagList = response;
      });
    },
    getSubcodeList() {
      listAllSubcode().then((response) => {
        this.subcodeList = response;
      });
    },
    getBrandList() {
      listAllBrand().then((response) => {
        this.brandList = response;
      });
    },
    getUserList() {
      listUserAll().then((response) => {
        this.userList = response;
        console.log(this.userList);
      });
    },
    getWorkshopList(){
      listAllWorkshop().then(response => {
        this.workshopList = response;
      });
    },
    //选择物料
    openSelectMatDialog() {
      this.selectMatOpen = true;
      this.isEditMat = false;
    },
    cancelSelectMat() {
      this.selectMatOpen = false;
    },
    checkExistMatByArtnum(artNum){
      if(!artNum || artNum === null || artNum.length < 4){
        return false;
      }
      var matObj = {"artNum":artNum}
      listMat(matObj).then((response) => {
        this.existtMatList = response.rows;
      });
      if(this.existtMatList.length === 0){
        return false
      }
      return true

    },
    confirmAddExistMat(){
      this.existMatDialog = false
      this.confirmSecAddMatDetail()
    },
    cancelAddExistMat(){
      this.existMatDialog = false
    },
    confirmSecAddMatDetail(){
      this.$refs["matForm"].validate((valid) => {
        if (valid) {
          this.matForm['matSource'] = this.isSelect ? "1" : "0"
          let _matForm = this.matForm;
          if (this.isEditMat) {
            this.requireDetailList[this.matIndex] = JSON.parse(
              JSON.stringify(_matForm)
            );
            this.$set(
              this.requireDetailList,
              this.matIndex,
              this.requireDetailList[this.matIndex]
            );
          } else {
            this.requireDetailList.unshift(
              JSON.parse(JSON.stringify(_matForm))
            );
          }
          this.addMatDetailOpen = false;
          this.resetMatForm();
        }
      });
    },

    confirmAddMatDetail() {
      if(!this.isSelect && this.checkExistMatByArtnum(this.matForm.artNum)){        
          this.existMatDialog = true  
      } else{
        this.confirmSecAddMatDetail();        
      }
      
    },
    cancelAddMatDetail() {
      this.matForm.reset();
      this.addMatDetailOpen = false;
    },
    confirmSelectMat(_item) {
      this.item = _item;
      this.matForm.matCode = this.item.matCode;
      this.matForm.matName = this.item.matName;
      this.matForm.fdCode = this.item.fdCode;
      this.matForm.figNum = this.item.figNum;
      if (this.item.artNum) {
        this.matForm.artNum = this.item.artNum;
      }
      this.matForm.matGroup = this.item.matGroup;
      this.matForm.matClass = this.item.matClass;
      if (this.item.matTag) {
        this.matForm.matTag = this.item.matTag;
      }
      if (this.item.brand) {
        this.matForm.brand = this.item.brand;
      }
      if (this.item.subcode) {
        this.matForm.subcode = this.item.subcode;
      }
      this.matForm.batch = "CG" + this.$moment().format("YYYYMMDDHHmmss");
      if (
        !this.item.safetyStock ||
        !this.item.manageBy
      ) {
        Message.warning(
          "请联系仓库负责人完善安全库存信息！物料编码：" + this.item.matCode
        );
        return;
      }

      this.matForm.stockNotice = this.item.stockNotice;
      this.matForm.safetyStock = this.item.safetyStock;

      this.matForm.manageBy = this.item.manageBy;
      console.log(this.item);
      // 获取库存
      var matlabel_quantity = 0;
      var label_query_param_1 = { matCode: this.item.matCode, matTag: this.item.matTag };
      listMatLabelAll(label_query_param_1).then((rows) => {
        var matLabelList = rows;
        matlabel_quantity = matLabelList
          .map((item) => item.usableQuantity - item.receivedQuantity)
          .reduce((acc, num) => acc + num, 0);
        this.matForm.warehouseQuantity = matlabel_quantity;
      });
      this.$set(this.matForm, "warehouseQuantity", matlabel_quantity);

      var sameTagQuantity = 0;
      var label_query_param_2 = { matTag: this.item.matTag };
      if(this.item.matTag){
        listMatLabelAll(label_query_param_2).then((rows) => {
        var matLabelList = rows;
        sameTagQuantity = matLabelList
          .map((item) => item.usableQuantity - item.receivedQuantity)
          .reduce((acc, num) => acc + num, 0);
        this.matForm.sameTagQuantity = sameTagQuantity;
      });
      this.$set(this.matForm, "sameTagQuantity", sameTagQuantity);
      } else {
        this.$set(this.matForm, "sameTagQuantity", 0)
      }    
      this.selectMatOpen = false;
    },
    cancelSelectMat() {
      this.selectMatOpen = false;
    },
    handleRemoveMat(index, row) {
      this.requireDetailList.splice(index, 1);
    },
    handleEditMat(index, row) {
      this.isEditMat = true;
      this.addMatDetailOpen = true;
      this.matIndex = index;
      this.matForm = this.requireDetailList[index];
      this.isSelect = this.matForm['matSource']=="1" ? true :false
      console.log(this.isSelect)
    },
    handleDetailMat(index, row) {
      this.addMatDetailOpen = true;
      this.matForm = this.requireDetailList[index];
    },
    formatDate(dateString) {
      // 尝试将字符串转换为日期对象
      if (dateString === "") {
        return dateString;
      }
      if (!dateString) {
        return dateString;
      }
      const date = new Date(dateString);
      // 如果无效的日期字符串，返回原始字符串
      if (isNaN(date)) {
        return dateString;
      }
      // 如果是有效的日期，进行格式化
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    },
    formatStatus(statusCode) {
      return this.statusDict[statusCode];
    },
    formatStatusStyle(statusCode) {
      return { color: this.statusColor[statusCode] };
    },
    formatBoolType(boolType) {
      if (boolType === "1" || boolType === 1) {
        return "是";
      } else if (boolType === "0" || boolType === 0) {
        return "否";
      }
      return boolType;
    },
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
    
  },
};
</script>
