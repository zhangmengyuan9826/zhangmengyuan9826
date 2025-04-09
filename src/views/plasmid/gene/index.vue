<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
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
      <el-form-item label="启动子" prop="promoter">
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
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
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
          v-hasPermi="['ruoyi:plasmid:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['ruoyi:plasmid:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['ruoyi:plasmid:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['ruoyi:plasmid:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="plasmidList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="geneId" align="center" prop="geneId" /> -->
      <el-table-column label="基因名" align="center" prop="geneName" />
      <el-table-column label="质粒载体" align="center" prop="plasmidVector" />
      <el-table-column label="质粒全称" align="center" prop="plasmidFullName" />
      <el-table-column label="线性酶切" align="center" prop="linearDigestion" />
      <el-table-column label="抗性基因" align="center" prop="resistanceGene" />
      <el-table-column label="cds长度(bp)" align="center" prop="cdsLength" />
      <el-table-column label="质粒全长(bp)" align="center" prop="plasmidFullLength" />
      <el-table-column label="3'UTR" align="center" prop="utr3" />
      <el-table-column label="5'UTR" align="center" prop="utr5" />
      <el-table-column label="polyA" align="center" prop="polyA" />
      <el-table-column label="CDS序列" align="center" prop="cdsSeq" />
      <el-table-column label="启动子" align="center" prop="promoter" />
      <el-table-column label="载体类型 I" align="center" prop="vectorType1" />
      <el-table-column label="载体类型 II" align="center" prop="vectorType2" />
      <el-table-column label="标签信息" align="center" prop="tagInfo" />
      <el-table-column label="接头" align="center" prop="linker" />
      <el-table-column label="CDS表达蛋白数量" align="center" prop="cdsProteinNum" />
      <el-table-column label="信号肽" align="center" prop="signalPeptide" />
      <el-table-column label="蛋白类型" align="center" prop="proteinType" />
      <el-table-column label="增强子" align="center" prop="enhancer" />
      <el-table-column label="批次" align="center" prop="batch" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['ruoyi:plasmid:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['ruoyi:plasmid:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改质粒基因管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="90%" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col span="8">
            <el-form-item label="基因名" prop="geneName">
              <el-input v-model="form.geneName" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="质粒载体" prop="plasmidVector">
              <el-select
                v-model="form.plasmidVector"
                filterable
                allow-create
                default-first-option
                placeholder="请选择或输入">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="质粒全长名称" prop="plasmidFullName">
              <el-input v-model="form.plasmidFullName" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col span="8">
            <el-form-item label="线性酶切" prop="linearDigestion">
              <el-input v-model="form.linearDigestion" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="抗性基因" prop="resistanceGene">
              <el-input v-model="form.resistanceGene" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="接头" prop="linker">
              <el-input v-model="form.linker" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col span="8">
            <el-form-item label="cds长度(bp)" prop="cdsLength">
              <el-input v-model="form.cdsLength" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="质粒全长(bp)" prop="plasmidFullLength">
              <el-input v-model="form.plasmidFullLength" placeholder="请输入" />
            </el-form-item>
          </el-col>      
          <el-col span="8">
            <el-form-item label="CDS表达蛋白数量" prop="cdsProteinNum">
              <el-input v-model="form.cdsProteinNum" placeholder="请输入" />
            </el-form-item>
          </el-col>     
        </el-row>
        <el-row>
          <el-col span="24">
            <el-form-item label="3'UTR" prop="utr3">
              <el-input v-model="form.utr3" placeholder="请输入" />
            </el-form-item>
          </el-col>       
        </el-row>
        <el-row>
          <el-col span="24">
            <el-form-item label="5'UTR" prop="utr5">
              <el-input v-model="form.utr5" placeholder="请输入" />
            </el-form-item>
          </el-col>       
        </el-row>
        <el-row>
          <el-col span="24">
            <el-form-item label="polyA" prop="polyA">
              <el-input v-model="form.polyA" placeholder="请输入" />
            </el-form-item>
          </el-col>       
        </el-row>
        <el-row>
          <el-col span="24">
            <el-form-item label="CDS序列" prop="cdsSeq">
              <el-input v-model="form.cdsSeq" placeholder="请输入" />
            </el-form-item>
          </el-col>       
        </el-row>
        <el-row>
          <el-col span="8">
            <el-form-item label="启动子" prop="promoter">
              <el-input v-model="form.promoter" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="增强子" prop="enhancer">
              <el-input v-model="form.enhancer" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="信号肽" prop="signalPeptide">
              <el-input v-model="form.signalPeptide" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col span="8">
            <el-form-item label="载体类型 I" prop="vectorType1">
              <el-input v-model="form.vectorType1" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="载体类型 II" prop="vectorType2">
              <el-input v-model="form.vectorType2" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="标签信息" prop="tagInfo">
              <el-input v-model="form.tagInfo" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>        
        <el-row>
          <el-col span="8">
            <el-form-item label="蛋白类型" prop="proteinType">
              <el-input v-model="form.proteinType" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="批次" prop="batch">
              <el-input v-model="form.batch" placeholder="请输入" />
            </el-form-item>
          </el-col>          
        </el-row>
        <el-row>
          <el-col span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入" />
            </el-form-item>
          </el-col>  
        </el-row>
        
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listGene, getGene, delGene, addGene, updateGene } from "@/api/plasmid/gene";

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
      form: {},
      // 表单校验
      rules: {
        geneName: [
          { required: true, message: "$comment不能为空", trigger: "blur" }
        ],
        plasmidVector: [
          { required: true, message: "$comment不能为空", trigger: "change" }
        ],
      },
      options: [{value: 'plasmid-1', label: '载体1'}, 
                {value: 'plasmid-2', label: '载体2'},
                {value: 'plasmid-3', label: '载体3'},]
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询质粒基因管理列表 */
    getList() {
      this.loading = true;
      listGene(this.queryParams).then(response => {
        this.plasmidList = response.rows;
        this.total = response.total;
        this.loading = false;
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
        polyA: null,
        cdsSeq: null,
        promoter: null,
        vectorType1: null,
        vectorType2: null,
        tagInfo: null,
        linker: null,
        cdsProteinNum: null,
        signalPeptide: null,
        proteinType: null,
        enhancer: null,
        batch: null,
        createTime: null,
        createBy: null,
        updateTime: null,
        updateBy: null,
        delFlag: null,
        remark: null
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
      this.ids = selection.map(item => item.geneId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加质粒基因";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const geneId = row.geneId || this.ids
      getGene(geneId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改质粒基因";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.geneId != null) {
            updateGene(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addGene(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除质粒基因编号为"' + geneIds + '"的数据项？').then(function() {
        return delGene(geneIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('ruoyi/plasmid/export', {
        ...this.queryParams
      }, `plasmid_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
