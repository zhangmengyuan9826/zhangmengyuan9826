import request from '@/utils/request'

// 查询记录库存信息和物料标签数量的修改记录列表
export function listLog(query) {
  return request({
    url: '/stock/log/list',
    method: 'get',
    params: query
  })
}

// 查询记录库存信息和物料标签数量的修改记录详细
export function getLog(logId) {
  return request({
    url: '/stock/log/' + logId,
    method: 'get'
  })
}

// 新增记录库存信息和物料标签数量的修改记录
export function addLog(data) {
  return request({
    url: '/stock/log',
    method: 'post',
    data: data
  })
}

// 修改记录库存信息和物料标签数量的修改记录
export function updateLog(data) {
  return request({
    url: '/stock/log',
    method: 'put',
    data: data
  })
}

// 删除记录库存信息和物料标签数量的修改记录
export function delLog(logId) {
  return request({
    url: '/stock/log/' + logId,
    method: 'delete'
  })
}
