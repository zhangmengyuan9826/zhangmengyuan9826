import request from '@/utils/request'

// 查询出库单列表
export function listOutOrder(query) {
  return request({
    url: '/stock/outOrder/list',
    method: 'get',
    params: query
  })
}

// 查询出库单详细
export function getOutOrder(orderId) {
  return request({
    url: '/stock/outOrder/' + orderId,
    method: 'get'
  })
}

// 新增出库单
export function addOutOrder(data) {
  return request({
    url: '/stock/outOrder',
    method: 'post',
    data: data
  })
}

// 修改出库单
export function updateOutOrder(data) {
  return request({
    url: '/stock/outOrder',
    method: 'put',
    data: data
  })
}

// 删除出库单
export function delOutOrder(orderId) {
  return request({
    url: '/stock/outOrder/' + orderId,
    method: 'delete'
  })
}

//查询入库单所需物料
export function listOutOrderMatBomList(query) {
  return request({
    url: '/stock/outOrder/matBomList',
    method: 'get',
    params: query
  })
}

// 打印出库单
export function printOutOrder(orderId) {
  return request({
    url: '/stock/outOrder/printOutOrder/' + orderId,
    method: 'get',
    responseType: 'arraybuffer',
    headers: {
      'Content-Type': 'application/json'
    },
  })
}
// 扫描查询入库单
export function getInfoO(orderId) {
   return request({
    url: '/stock/outOrder/m/' + orderId,
    method: 'get'
    
   })
  }
  
  // 扫码提交入库信息
  export function submitStockOut(data) {
   return request({
    url: '/stock/outOrder/submitStockOut',
    method: 'post',
    data: data
   })
  }

  export function getHistoryExpiredMatCodeList(){
    return request({
      url: '/stock/outOrder/expiredMatList',
      method: 'get'
    })
  }
  // checkExpiredMat
  export function checkExpiredMat(matCode){
    return request({
      url: '/stock/outOrder/checkExpiredMat/',
      method: 'post',
      data: { matCode: matCode }
    })
  }