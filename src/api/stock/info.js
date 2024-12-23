import request from '@/utils/request'

// 查询库存信息列表
export function listInfo(query) {
  return request({
    url: '/stock/info/list',
    method: 'get',
    params: query
  })
}

// 查询库存信息详细
export function getInfo(infoId) {
  return request({
    url: '/stock/info/' + infoId,
    method: 'get'
  })
}

// 新增库存信息
export function addInfo(data) {
  return request({
    url: '/stock/info',
    method: 'post',
    data: data
  })
}

// 修改库存信息
export function updateInfo(data) {
  return request({
    url: '/stock/info',
    method: 'put',
    data: data
  })
}

// 删除库存信息
export function delInfo(infoId) {
  return request({
    url: '/stock/info/' + infoId,
    method: 'delete'
  })
}

// 查询库存汇总列表
export function statsList(query) {
  return request({
    url: '/stock/info/statsList',
    method: 'get',
    params: query
  })
}

// 扫码查询库存信息详细
export function getInfoM(param) {
  return request({
    url: '/stock/info/locationMatList',
    method: 'get',
    params: param
  })
}

// 扫码提交上架信息
export function submitPutOn(data) {
  return request({
    url: '/stock/info/submitPutOn',
    method: 'post',
    data: data
  })
}

// 扫码提交下架信息
export function submitPutOff(data) {
  return request({
    url: '/stock/info/submitPutOff',
    method: 'post',
    data: data
  })
}
// 查询库存信息详细
export function getStockInfoDetail(param) {
  return request({
    url: '/stock/info/detail',
    method: 'post',
    params:param
  })
}

export function handleUpdate(data) {
  return request({
    url: '/stock/info/detail',
    method: 'put',
    data:data
  })
}
