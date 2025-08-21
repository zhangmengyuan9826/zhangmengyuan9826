import request from '@/utils/request'

// 查询物料需求单列表
export function listMatRequire(query) {
  return request({
    url: '/stock/matRequire/list',
    method: 'get',
    params: query
  })
}
export function listMatRequireDetailDialog(query) {
  return request({
    url: '/stock/matRequire/listDialog',
    method: 'get',
    params: query
  })
}

// 查询物料需求单列表（弹窗）
export function listMatRequireDialog(query) {
  return request({
    url: '/stock/matRequire/listDialog',
    method: 'get',
    params: query
  })
}

// 查询物料需求单详细
export function getMatRequire(requireId) {
  return request({
    url: '/stock/matRequire/' + requireId,
    method: 'get'
  })
}

// 新增物料需求单
export function addMatRequire(data) {
  return request({
    url: '/stock/matRequire',
    method: 'post',
    data: data
  })
}

// 修改物料需求单
export function updateMatRequire(data) {
  return request({
    url: '/stock/matRequire',
    method: 'put',
    data: data
  })
}
// 修改物料需求单状态
export function updateMatRequireStatus(data) {
  return request({
    url: '/stock/matRequire/changeStatus',
    method: 'post',
    data: data
  })
}

// 修改物料需求单状态_物料到货
export function submitDoneDetailByDetailIds(detailIds) {
  return request({
    url: '/stock/matRequire/changeStatusDone/' + detailIds,
    method: 'get'
  })
}

// 删除物料需求单
export function delMatRequire(requireId) {
  return request({
    url: '/stock/matRequire/' + requireId,
    method: 'delete'
  })
}

// 查询物料需求单详细
export function getMatDetailListbyRequireIds(requireIds) {
  return request({
    url: '/stock/matRequire/detailList/' + requireIds,
    method: 'get'
  })
}


// 查询物料需求单详细
export function getRequireLogs(requireId) {
  return request({
    url: '/stock/matRequire/statusLogs/' + requireId,
    method: 'get'
  })
}
export function getRecordPeriods(data) {
  return request({
    url: '/stock/matRequire/periods/',
    data: data,
    method: 'post'
  })
}
