<template>
<div>
  <el-row :gutter="40" class="scan-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <!-- <div class="card-panel-icon-wrapper icon-1">
          <svg-icon icon-class="documentation" class-name="card-panel-icon" />
        </div> -->
        <div class="card-panel-description">
          <div @click="jumpPage('stock/scan_stock_in')">
            <div class="card-panel-text">入库单</div>
          </div>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <!-- <div class="card-panel-icon-wrapper icon-2">
          <svg-icon icon-class="documentation" class-name="card-panel-icon" />
        </div> -->
        <div class="card-panel-description">
          <div @click="jumpPage('stock/scan_stock_out')">
            <div class="card-panel-text">出库单</div>
          </div>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <!-- <div class="card-panel-icon-wrapper icon-3">
          <svg-icon icon-class="documentation" class-name="card-panel-icon" />
        </div> -->
        <div class="card-panel-description">
          <div @click="jumpPage('stock/scan_put_on')">
            <div class="card-panel-text">上架</div>
          </div>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <!-- <div class="card-panel-icon-wrapper icon-4">
          <svg-icon icon-class="documentation" class-name="card-panel-icon" />
        </div> -->
        <div class="card-panel-description">
          <div @click="jumpPage('stock/scan_put_off')">
            <div class="card-panel-text">下架</div>
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
  <el-row :gutter="40" class="scan-group">
  <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <!-- <div class="card-panel-icon-wrapper icon-5">
          <svg-icon icon-class="documentation" class-name="card-panel-icon" />
        </div> -->
        <div class="card-panel-description">
          <div @click="jumpPage('stock/scan_stock_in_return')">
            <div class="card-panel-text">入库退货</div>
          </div>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <!-- <div class="card-panel-icon-wrapper icon-6">
          <svg-icon icon-class="documentation" class-name="card-panel-icon" />
        </div> -->
        <div class="card-panel-description">
          <div @click="jumpPage('stock/scan_stock_out_return')">
            <div class="card-panel-text">出库退货</div>
          </div>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <!-- <div class="card-panel-icon-wrapper icon-7">
          <svg-icon icon-class="documentation" class-name="card-panel-icon" />
        </div> -->
        <div class="card-panel-description">
          <div @click="jumpPage('stock/scan_location_stock')">
            <div class="card-panel-text">货位库存</div>
          </div>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <!-- <div class="card-panel-icon-wrapper icon-8">
          <svg-icon icon-class="documentation" class-name="card-panel-icon" />
        </div> -->
        <div class="card-panel-description">
          <div @click="jumpPage('stock/scan_allocation')">
            <div class="card-panel-text">调拨单</div>
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
  </div>
</template>

<script>
import CountTo from 'vue-count-to'
import { statsIndexUpper } from "@/api/stats/index";

export default {
  data() {
    return {
      panelGroupData: {},
    }
  },
  components: { CountTo },
  created() {
    this.getData();
  },
  methods: {
    getData(){
      statsIndexUpper().then(response => {
        this.panelGroupData = response.data;
      });
    },
    jumpPage(pageUrl){
      this.$router.push({path: pageUrl});
    },
  }
}
</script>

<style lang="scss" scoped>
.scan-group {
  // margin-top: 18px;

  .card-panel-col {
    margin-bottom: 10px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #ffc000;
      }

      .icon-shopping {
        background: #34bfa3
      }
    }

    .icon-1 {
      color: #40c9c6;
    }

    .icon-2 {
      color: #36a3f7;
    }

    .icon-3 {
      color: #ffc000;
    }

    .icon-4 {
      color: #34bfa3
    }
    .icon-5 {
      color: #ff6f61
    }
    .icon-6 {
      color: #8767de
    }
    .icon-7 {
      color: #f387c4
    }
    .icon-8 {
      color: #4caf50
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;
      display: flex;
      justify-content: flex-end;
      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
        display: flex;
        justify-content: center;
        text-decoration: underline;
      }
      .return-div{
        margin-left: 40px;
        color: red;
      }
      .panel-return{
        color: red;
      }
    }
    
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
