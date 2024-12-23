import request from '@/utils/request'

// 查询物料组列表
export function listSubcode(query) {
  return request({
    url: '/base/subcode/list',
    method: 'get',
    params: query
  })
}

// 查询物料组(所有)
export function listAllSubcode(query) {
  return request({
    url: '/base/subcode/listAll',
    method: 'get',
    params: query
  })
}

// 查询物料组详细
export function getSubcode(subcodeId) {
  return request({
    url: '/base/subcode/' + subcodeId,
    method: 'get'
  })
}

// 新增物料组
export function addSubcode(data) {
  return request({
    url: '/base/subcode',
    method: 'post',
    data: data
  })
}

// 修改物料组
export function updateSubcode(data) {
  return request({
    url: '/base/subcode',
    method: 'put',
    data: data
  })
}

// 删除物料组
export function delSubcode(subcodeId) {
  return request({
    url: '/base/subcode/' + subcodeId,
    method: 'delete'
  })
}
