import request from '@/utils/request'

// 查询质粒载体参数设置列表
export function listVector(query) {
  return request({
    url: '/plasmid/vector/list',
    method: 'get',
    params: query
  })
}

// 查询质粒载体参数设置详细
export function getVector(vectorId) {
  return request({
    url: '/plasmid/vector/' + vectorId,
    method: 'get'
  })
}

// 新增质粒载体参数设置
export function addVector(data) {
  return request({
    url: '/plasmid/vector',
    method: 'post',
    data: data
  })
}

// 修改质粒载体参数设置
export function updateVector(data) {
  return request({
    url: '/plasmid/vector',
    method: 'put',
    data: data
  })
}

// 删除质粒载体参数设置
export function delVector(vectorId) {
  return request({
    url: '/plasmid/vector/' + vectorId,
    method: 'delete'
  })
}
