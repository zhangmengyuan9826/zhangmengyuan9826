import request from '@/utils/request'

// 查询物料标签列表
export function listTag(query) {
  return request({
    url: '/base/tag/list',
    method: 'get',
    params: query
  })
}

// 查询品牌列表
export function listAllTag(query) {
  return request({
    url: '/base/tag/listAll',
    method: 'get',
    params: query
  })
}

// 查询物料标签详细
export function getTag(tagId) {
  return request({
    url: '/base/tag/' + tagId,
    method: 'get'
  })
}

// 新增物料标签
export function addTag(data) {
  return request({
    url: '/base/tag',
    method: 'post',
    data: data
  })
}

// 修改物料标签
export function updateTag(data) {
  return request({
    url: '/base/tag',
    method: 'put',
    data: data
  })
}

// 删除物料标签
export function delTag(tagId) {
  return request({
    url: '/base/tag/' + tagId,
    method: 'delete'
  })
}
