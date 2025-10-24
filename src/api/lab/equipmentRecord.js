import request from '@/utils/request'

// 查询仪器变更记录列表
export function listRecord(query) {
  return request({
    url: '/lab/equipmentRecord/list',
    method: 'get',
    params: query
  })
}

// 查询仪器变更记录详细
export function getRecord(recordId) {
  return request({
    url: '/lab/equipmentRecord/' + recordId,
    method: 'get'
  })
}

// 新增仪器变更记录
export function addRecord(data) {
  return request({
    url: '/equipmentRecord/record',
    method: 'post',
    data: data
  })
}

// 修改仪器变更记录
export function updateRecord(data) {
  return request({
    url: '/equipmentRecord/record',
    method: 'put',
    data: data
  })
}

// 删除仪器变更记录
export function delRecord(recordId) {
  return request({
    url: '/lab/equipmentRecord/' + recordId,
    method: 'delete'
  })
}
