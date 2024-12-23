import request from '@/utils/request'

// 查询实验室列表
export function listWorkshop(query) {
  return request({
    url: '/base/workshop/list',
    method: 'get',
    params: query
  })
}

// 查询实验室列表(所有)
export function listAllWorkshop(query) {
  return request({
    url: '/base/workshop/listAll',
    method: 'get',
    params: query
  })
}

// 查询实验室详细
export function getWorkshop(workshopId) {
  return request({
    url: '/base/workshop/' + workshopId,
    method: 'get'
  })
}

// 新增实验室
export function addWorkshop(data) {
  return request({
    url: '/base/workshop',
    method: 'post',
    data: data
  })
}

// 修改实验室
export function updateWorkshop(data) {
  return request({
    url: '/base/workshop',
    method: 'put',
    data: data
  })
}

// 删除实验室
export function delWorkshop(workshopId) {
  return request({
    url: '/base/workshop/' + workshopId,
    method: 'delete'
  })
}
