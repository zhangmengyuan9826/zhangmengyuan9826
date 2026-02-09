import request from '@/utils/request'

// 查询货架变更记录列表
export function listLocation_log(query) {
  return request({
    url: '/base/location_log/list',
    method: 'get',
    params: query
  })
}

// 查询货架变更记录详细
export function getLocation_log(logId) {
  return request({
    url: '/base/location_log/' + logId,
    method: 'get'
  })
}

// 新增货架变更记录
export function addLocation_log(data) {
  return request({
    url: '/base/location_log',
    method: 'post',
    data: data
  })
}

// 修改货架变更记录
export function updateLocation_log(data) {
  return request({
    url: '/base/location_log',
    method: 'put',
    data: data
  })
}

// 删除货架变更记录
export function delLocation_log(logId) {
  return request({
    url: '/base/location_log/' + logId,
    method: 'delete'
  })
}
