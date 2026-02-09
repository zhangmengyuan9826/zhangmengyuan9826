import request from '@/utils/request'

// 查询物料采购流转记录列表
export function listStockRequireRecord(query) {
  return request({
    url: '/stock/requireRecord/list',
    method: 'get',
    params: query
  })
}

// 查询物料采购流转记录详细
export function getStockRequireRecord(recordId) {
  return request({
    url: '/stock/requireRecord/' + recordId,
    method: 'get'
  })
}

// 新增物料采购流转记录
export function addStockRequireRecord(data) {
  return request({
    url: '/stock/requireRecord',
    method: 'post',
    data: data
  })
}

// 修改物料采购流转记录
export function updateStockRequireRecord(data) {
  return request({
    url: '/stock/requireRecord',
    method: 'put',
    data: data
  })
}

// 删除物料采购流转记录
export function delStockRequireRecord(recordId) {
  return request({
    url: '/stock/requireRecord/' + recordId,
    method: 'delete'
  })
}
