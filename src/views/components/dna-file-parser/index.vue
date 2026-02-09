<!-- components/DnaFileParser.vue -->
<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="visible"
    width="70%"
    top="5vh"
    @close="handleClose"
    custom-class="dna-parser-dialog"
  >
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-progress
        :percentage="loadProgress"
        :status="loadStatus"
        :show-text="false"
        style="width: 300px;"
      />
      <p class="loading-text">{{ loadMessage }}</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-alert
        :title="errorTitle"
        :description="error"
        type="error"
        show-icon
        :closable="false"
      />
      <div class="error-actions">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="retryLoad">重试</el-button>
      </div>
    </div>

    <!-- 解析成功 -->
    <div v-else-if="parsedData" class="content-container">
      <!-- 基本信息卡片 -->
      <el-row :gutter="20" class="info-cards">
        <el-col :span="8">
          <el-card class="info-card">
            <div slot="header" class="clearfix">
              <span>基本信息</span>
            </div>
            <div class="card-content">
              <div class="info-item">
                <span class="label">基因名称:</span>
                <span class="value">{{ geneData.geneName }}</span>
              </div>
              <div class="info-item">
                <span class="label">文件名:</span>
                <span class="value">{{ geneData.originalFilename }}</span>
              </div>
              <div class="info-item">
                <span class="label">序列长度:</span>
                <el-tag type="success">{{ parsedData.sequence.length }} bp</el-tag>
              </div>
              <div class="info-item">
                <span class="label">AT含量:</span>
                <el-tag>{{ atContent }}%</el-tag>
              </div>
              <div class="info-item">
                <span class="label">GC含量:</span>
                <el-tag type="warning">{{ gcContent }}%</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="info-card">
            <div slot="header" class="clearfix">
              <span>特征统计</span>
            </div>
            <div class="card-content">
              <div class="info-item">
                <span class="label">特征总数:</span>
                <el-tag>{{ featureCount }}</el-tag>
              </div>
              <div class="info-item" v-for="(count, type) in featureTypeCount" :key="type">
                <span class="label">{{ type }}:</span>
                <span class="value">{{ count }}</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="info-card">
            <div slot="header" class="clearfix">
              <span>序列信息</span>
            </div>
            <div class="card-content">
              <div class="info-item">
                <span class="label">拓扑结构:</span>
                <el-tag type="info">{{ topology }}</el-tag>
              </div>
              <div class="info-item">
                <span class="label">分子类型:</span>
                <el-tag>{{ moleculeType }}</el-tag>
              </div>
              <div class="info-item">
                <span class="label">创建时间:</span>
                <span class="value">{{ creationDate }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 特征列表 -->
      <el-card class="features-card">
        <div slot="header" class="clearfix">
          <span>特征列表 ({{ featureCount }})</span>
          <el-button 
            style="float: right; padding: 3px 0" 
            type="text"
            @click="exportFeatures"
          >
            导出CSV
          </el-button>
        </div>
        
        <el-table
          :data="features"
          height="300"
          style="width: 100%"
          @row-click="showFeatureDetails"
        >
          <el-table-column
            prop="name"
            label="名称"
            width="180"
          >
            <template slot-scope="scope">
              <el-tag
                :type="getFeatureTagType(scope.row.type)"
                size="small"
              >
                {{ scope.row.name || '未命名' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="type"
            label="类型"
            width="120"
            :filters="typeFilters"
            :filter-method="filterType"
          />
          <el-table-column
            label="位置"
            width="140"
          >
            <template slot-scope="scope">
              {{ formatPosition(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            label="长度"
            width="100"
          >
            <template slot-scope="scope">
              {{ scope.row.end - scope.row.start }} bp
            </template>
          </el-table-column>
          <el-table-column
            prop="strand"
            label="链"
            width="80"
          >
            <template slot-scope="scope">
              <span :class="scope.row.strand === 1 ? 'positive' : 'negative'">
                {{ scope.row.strand === 1 ? '+' : '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="notes"
            label="备注"
            show-overflow-tooltip
          />
        </el-table>
      </el-card>

      <!-- 序列预览 -->
      <el-card class="sequence-card">
        <div slot="header" class="clearfix">
          <span>DNA序列 (前500bp预览)</span>
          <el-button-group style="float: right;">
            <el-button 
              size="mini" 
              @click="copySequence"
              :loading="copying"
            >
              复制序列
            </el-button>
            <el-button 
              size="mini" 
              @click="downloadFullSequence"
              :loading="downloading"
            >
              下载完整序列
            </el-button>
          </el-button-group>
        </div>
        
        <div class="sequence-container">
          <pre class="sequence-preview" ref="sequencePreview">
            {{ sequencePreview }}
          </pre>
          <div class="sequence-stats">
            <span>显示: 1-{{ Math.min(parsedData.sequence.length, 500) }} / {{ parsedData.sequence.length }} bp</span>
            <el-button 
              v-if="parsedData.sequence.length > 500"
              type="text"
              size="mini"
              @click="toggleFullSequence"
            >
              {{ showFullSequence ? '显示部分' : '显示完整序列' }}
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 原始数据 -->
      <el-card class="raw-data-card" v-if="showRawData">
        <div slot="header" class="clearfix">
          <span>原始JSON数据</span>
          <el-button 
            style="float: right; padding: 3px 0" 
            type="text"
            @click="toggleRawData"
          >
            隐藏
          </el-button>
        </div>
        <pre class="json-preview">{{ formattedJson }}</pre>
      </el-card>
    </div>

    <!-- 底部操作栏 -->
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button 
        type="primary" 
        @click="toggleRawData"
        v-if="parsedData"
      >
        {{ showRawData ? '隐藏原始数据' : '显示原始数据' }}
      </el-button>
      <el-button 
        type="success" 
        @click="exportAllData"
        :loading="exporting"
        v-if="parsedData"
      >
        导出所有数据
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { snapgeneToJson } from '@teselagen/bio-parsers';
import axios from 'axios';
import { downloadDnaFile } from "@/api/plasmid/gene";

export default {
  name: 'DnaFileParser',
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    geneData: {
      type: Object,
      default: () => ({})
    }
  },
  
  data() {
    return {
      // 加载状态
      loading: false,
      loadProgress: 0,
      loadMessage: '正在解析DNA文件...',
      loadStatus: '',
      
      // 错误信息
      error: '',
      errorTitle: '解析失败',
      
      // 解析数据
      parsedData: null,
      
      // 显示控制
      showFullSequence: false,
      showRawData: false,
      
      // 操作状态
      copying: false,
      downloading: false,
      exporting: false
    };
  },
  
  computed: {
    dialogTitle() {
      if (this.geneData && this.geneData.geneName) {
        return `DNA文件解析 - ${this.geneData.geneName}`;
      }
      return 'DNA文件解析';
    },
    
    // 序列统计
    atContent() {
      if (!this.parsedData?.sequence) return 0;
      const seq = this.parsedData.sequence.toUpperCase();
      const atCount = (seq.match(/[AT]/g) || []).length;
      return ((atCount / seq.length) * 100).toFixed(1);
    },
    
    gcContent() {
      if (!this.parsedData?.sequence) return 0;
      const seq = this.parsedData.sequence.toUpperCase();
      const gcCount = (seq.match(/[GC]/g) || []).length;
      return ((gcCount / seq.length) * 100).toFixed(1);
    },
    
    // 特征相关
    features() {
      if (!this.parsedData?.features) return [];
      return this.parsedData.features.map(f => ({
        ...f,
        name: f.name || '未命名',
        type: f.type || '未知',
        notes: f.notes || ''
      }));
    },
    
    featureCount() {
      return this.features.length;
    },
    
    featureTypeCount() {
      const counts = {};
      this.features.forEach(f => {
        counts[f.type] = (counts[f.type] || 0) + 1;
      });
      return counts;
    },
    
    typeFilters() {
      const types = [...new Set(this.features.map(f => f.type))];
      return types.map(type => ({ text: type, value: type }));
    },
    
    // 序列预览
    sequencePreview() {
      if (!this.parsedData?.sequence) return '';
      
      const seq = this.parsedData.sequence;
      
      if (this.showFullSequence) {
        return this.formatSequence(seq, 100);
      } else {
        return this.formatSequence(seq.substring(0, 500), 100);
      }
    },
    
    // 其他信息
    topology() {
      return this.parsedData?.topology || 'circular';
    },
    
    moleculeType() {
      return this.parsedData?.moleculeType || 'DNA';
    },
    
    creationDate() {
      if (!this.parsedData) return '未知';
      if (this.parsedData.created) {
        return new Date(this.parsedData.created).toLocaleString();
      }
      return '未知';
    },
    
    // JSON格式化
    formattedJson() {
      if (!this.parsedData) return '';
      return JSON.stringify(this.parsedData, null, 2);
    }
  },
  
  watch: {
    visible(val) {
      if (val) {
        this.parseDnaFile();
      } else {
        this.reset();
      }
    }
  },
  
  methods: {
    // 解析DNA文件
    async parseDnaFile() {
      if (!this.geneData || !this.geneData.geneId) {
        this.error = '缺少基因信息';
        this.errorTitle = '参数错误';
        return;
      }
      
      this.loading = true;
      this.error = '';
      this.loadProgress = 0;
      this.loadStatus = '';
      
      // 模拟加载进度
      const progressTimer = setInterval(() => {
        if (this.loadProgress < 90) {
          this.loadProgress += 10;
        }
      }, 200);
      
      try {
        // 1. 获取文件数据
        this.loadMessage = '正在获取文件...';
        const response = await this.fetchDnaFile();
        
        // 2. 解析文件
        this.loadMessage = '正在解析DNA文件...';
        const arrayBuffer = await response;
        console.log("arrayBuffer", arrayBuffer);
        this.parsedData = await snapgeneToJson(arrayBuffer);
        
        // 3. 标记成功
        this.loadProgress = 100;
        this.loadStatus = 'success';
        
        // 延迟关闭加载状态
        setTimeout(() => {
          this.loading = false;
          this.$message.success('DNA文件解析成功');
        }, 500);
        
      } catch (error) {
        console.error('解析DNA文件失败:', error);
        this.handleParseError(error);
      } finally {
        clearInterval(progressTimer);
      }
    },
    
    // 获取DNA文件
    async fetchDnaFile() {
      var geneId  = this.geneData.geneId;
      console.log("geneId", geneId);
      console.log("geneData", this.geneData);
      // 调用后端API获取文件
      // 假设API：GET /api/plasmid/gene/{id}/dna-file
    //   return await this.$http.get(`plasmid/gene/download/${geneId}`, {
    //     responseType: 'arraybuffer'
    //   });
        return await downloadDnaFile(geneId);
    },
    
    // 处理解析错误
    handleParseError(error) {
      this.loading = false;
      
    //   if (error.response) {
    //     console.error('服务器响应错误:', error.response);
    //     switch (error.response.status) {
    //       case 404:
    //         this.error = 'DNA文件不存在';
    //         this.errorTitle = '文件未找到';
    //         break;
    //       case 403:
    //         this.error = '没有权限访问该文件';
    //         this.errorTitle = '权限不足';
    //         break;
    //       case 415:
    //         this.error = '文件格式不支持，请确保是.dna格式的SnapGene文件';
    //         this.errorTitle = '格式错误';
    //         break;
    //       default:
    //         this.error = `服务器错误: ${error.response.statusText}`;
    //         this.errorTitle = '服务器错误';
    //     }
    //   } else if (error.message.includes('Network Error')) {
    //     this.error = '网络连接失败，请检查网络设置';
    //     this.errorTitle = '网络错误';
    //   } else if (error.message.includes('Invalid SnapGene')) {
    //     this.error = '文件不是有效的SnapGene格式';
    //     this.errorTitle = '文件格式错误';
    //   } else {
    //     this.error = `解析失败: ${error.message}`;
    //     this.errorTitle = '解析错误';
    //   }
    },
    
    // 重试
    retryLoad() {
      this.error = '';
      this.parseDnaFile();
    },
    
    // 格式化序列
    formatSequence(sequence, lineLength = 100) {
      const lines = [];
      for (let i = 0; i < sequence.length; i += lineLength) {
        const lineNumber = (i / lineLength) * lineLength + 1;
        const lineContent = sequence.substr(i, lineLength);
        lines.push(`${lineNumber.toString().padStart(6, ' ')} ${lineContent}`);
      }
      return lines.join('\n');
    },
    
    // 格式化位置
    formatPosition(feature) {
      return `${feature.start + 1} - ${feature.end}`;
    },
    
    // 获取特征标签类型
    getFeatureTagType(featureType) {
      const typeMap = {
        'gene': 'success',
        'CDS': 'primary',
        'promoter': 'danger',
        'terminator': 'warning',
        'origin': 'info',
        'primer': '',
        'default': 'info'
      };
      return typeMap[featureType] || typeMap.default;
    },
    
    // 特征类型过滤
    filterType(value, row) {
      return row.type === value;
    },
    
    // 显示特征详情
    showFeatureDetails(row) {
      this.$alert(`
        <div class="feature-detail">
          <p><strong>名称:</strong> ${row.name || '未命名'}</p>
          <p><strong>类型:</strong> ${row.type}</p>
          <p><strong>位置:</strong> ${row.start + 1} - ${row.end} (${row.end - row.start} bp)</p>
          <p><strong>链:</strong> ${row.strand === 1 ? '+' : '-'}</p>
          ${row.notes ? `<p><strong>备注:</strong> ${row.notes}</p>` : ''}
        </div>
      `, '特征详情', {
        dangerouslyUseHTMLString: true,
        customClass: 'feature-detail-modal'
      });
    },
    
    // 复制序列
    async copySequence() {
      if (!this.parsedData?.sequence) return;
      
      this.copying = true;
      try {
        await navigator.clipboard.writeText(this.parsedData.sequence);
        this.$message.success('序列已复制到剪贴板');
      } catch (error) {
        console.error('复制失败:', error);
        this.$message.error('复制失败');
      } finally {
        this.copying = false;
      }
    },
    
    // 下载完整序列
    async downloadFullSequence() {
      if (!this.parsedData?.sequence) return;
      
      this.downloading = true;
      try {
        const sequence = this.parsedData.sequence;
        const filename = `${this.geneData.geneName || 'sequence'}.fasta`;
        const header = `>${this.geneData.geneName || 'Unknown'}|${this.parsedData.sequence.length}bp\n`;
        const content = header + this.formatSequence(sequence, 80);
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.$message.success('序列文件下载成功');
      } catch (error) {
        console.error('下载失败:', error);
        this.$message.error('下载失败');
      } finally {
        this.downloading = false;
      }
    },
    
    // 导出特征为CSV
    exportFeatures() {
      if (!this.features.length) return;
      
      const headers = ['名称', '类型', '起始位置', '结束位置', '长度', '链', '备注'];
      const rows = this.features.map(f => [
        f.name,
        f.type,
        f.start + 1,
        f.end,
        f.end - f.start,
        f.strand === 1 ? '+' : '-',
        f.notes || ''
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.geneData.geneName}_features.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      this.$message.success('特征数据已导出');
    },
    
    // 导出所有数据
    exportAllData() {
      this.exporting = true;
      try {
        const data = {
          geneInfo: this.geneData,
          dnaInfo: {
            sequenceLength: this.parsedData.sequence.length,
            atContent: this.atContent,
            gcContent: this.gcContent,
            topology: this.topology,
            moleculeType: this.moleculeType
          },
          features: this.features,
          sequence: this.parsedData.sequence
        };
        
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.geneData.geneName}_dna_analysis.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.$message.success('所有数据已导出');
      } catch (error) {
        console.error('导出失败:', error);
        this.$message.error('导出失败');
      } finally {
        this.exporting = false;
      }
    },
    
    // 切换显示完整序列
    toggleFullSequence() {
      this.showFullSequence = !this.showFullSequence;
    },
    
    // 切换原始数据
    toggleRawData() {
      this.showRawData = !this.showRawData;
    },
    
    // 重置状态
    reset() {
      this.parsedData = null;
      this.error = '';
      this.showFullSequence = false;
      this.showRawData = false;
      this.copying = false;
      this.downloading = false;
      this.exporting = false;
    },
    
    // 关闭对话框
    handleClose() {
      this.reset();
      this.$emit('close');
    }
  },
  
  mounted() {
    // 可以在这里添加一些初始化逻辑
  }
};
</script>

<style scoped>
.dna-parser-dialog .el-dialog__body {
  padding: 15px 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 20px;
}

.loading-text {
  color: #606266;
  font-size: 14px;
}

.error-container {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.error-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

/* 信息卡片样式 */
.info-cards {
  margin-bottom: 20px;
}

.info-card {
  height: 100%;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.info-item .label {
  color: #909399;
  font-size: 13px;
}

.info-item .value {
  font-weight: 500;
  color: #303133;
}

/* 特征表格样式 */
.positive {
  color: #67c23a;
  font-weight: bold;
}

.negative {
  color: #f56c6c;
  font-weight: bold;
}

/* 序列预览样式 */
.sequence-card {
  margin-top: 20px;
}

.sequence-container {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 15px;
}

.sequence-preview {
  margin: 0;
  padding: 10px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}

.sequence-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 12px;
  color: #6c757d;
}

/* 原始数据样式 */
.raw-data-card {
  margin-top: 20px;
}

.json-preview {
  margin: 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 400px;
  overflow-y: auto;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .info-cards .el-col {
    margin-bottom: 15px;
  }
}
</style>