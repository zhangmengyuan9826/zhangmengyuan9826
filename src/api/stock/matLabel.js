import request from '@/utils/request'

// 查询物料标签列表
export function listMatLabel(query) {
  return request({
    url: '/stock/matLabel/list',
    method: 'get',
    params: query
  })
}

// 查询物料标签列表-所有，统计需要
export function listMatLabelAll(query) {
  return request({
    url: '/stock/matLabel/listAll',
    method: 'get',
    params: query
  })
}

// 查询物料标签列表（弹窗）
export function listMatLabelDialog(query) {
  return request({
    url: '/stock/matLabel/listDialog',
    method: 'get',
    params: query
  })
}
// 查询物料标签列表（弹窗-出库）
export function listMatLabelDialogOut(query) {
  return request({
    url: '/stock/matLabel/listDialogOut',
    method: 'get',
    params: query
  })
}
// 查询物料标签列表（弹窗-调拨单）
export function listMatLabelDialogAllot(query) {
  return request({
    url: '/stock/matLabel/listDialogAllot',
    method: 'get',
    params: query
  })
}
export function checkBatchMat(query) {
  return request({
    url: '/stock/matLabel/listCheckBatchMat',
    method: 'get',
    params: query
  })
}
// 查询物料标签详细
export function getMatLabel(labelId) {
  return request({
    url: '/stock/matLabel/' + labelId,
    method: 'get'
  })
}

// 新增物料标签
export function addMatLabel(data) {
  return request({
    url: '/stock/matLabel',
    method: 'post',
    data: data
  })
}

// 修改物料标签
export function updateMatLabel(data) {
  return request({
    url: '/stock/matLabel',
    method: 'put',
    data: data
  })
}

// 删除物料标签
export function delMatLabel(labelId) {
  return request({
    url: '/stock/matLabel/' + labelId,
    method: 'delete'
  })
}

// 补码
export function printLabel(labelId) {
  return request({
    url: '/stock/matLabel/printLabel/' + labelId,
    method: 'get',
    responseType: 'arraybuffer',
    headers: {
      'Content-Type': 'application/json'
    },
  })
}

// 补码批量
export function printLabelBatch(labelIds) {
  return request({
    url: '/stock/matLabel/printLabelBatch/' + labelIds,
    method: 'get',
    responseType: 'arraybuffer',
    headers: {
      'Content-Type': 'application/json'
    },
  })
}