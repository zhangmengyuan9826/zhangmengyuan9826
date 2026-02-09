import request from '@/utils/request'

// 查询质粒模块-实验质粒列表
export function listDetail(query) {
  return request({
    url: '/plasmid/detail/list',
    method: 'get',
    params: query
  })
}
export function listDetailAll(query) {
  return request({
    url: '/plasmid/detail/listAll',
    method: 'get',
    params: query
  })
}

// 查询质粒模块-实验质粒详细
export function getDetail(detailId) {
  return request({
    url: '/plasmid/detail/' + detailId,
    method: 'get'
  })
}

// 新增质粒模块-实验质粒
export function addDetail(data) {
  return request({
    url: '/plasmid/detail',
    method: 'post',
    data: data
  })
}

// 修改质粒模块-实验质粒
export function updateDetail(data) {
  return request({
    url: '/plasmid/detail',
    method: 'put',
    data: data
  })
}

// 删除质粒模块-实验质粒
export function delDetail(detailId) {
  return request({
    url: '/plasmid/detail/' + detailId,
    method: 'delete'
  })
}
