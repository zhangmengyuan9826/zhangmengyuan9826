import request from '@/utils/request'

// 查询仪器设备列表
export function listEquipment(query) {
  return request({
    url: '/lab/equipment/list',
    method: 'get',
    params: query
  })
}

// 查询仪器设备详细
export function getEquipment(eqId) {
  return request({
    url: '/lab/equipment/' + eqId,
    method: 'get'
  })
}

// 新增仪器设备
export function addEquipment(data) {
  return request({
    url: '/lab/equipment',
    method: 'post',
    data: data
  })
}

// 修改仪器设备
export function updateEquipment(data) {
  return request({
    url: '/lab/equipment',
    method: 'put',
    data: data
  })
}
// 变更仪器设备
export function changeEquipment(data) {
  return request({
    url: '/lab/equipment/change',
    method: 'put',
    data: data
  })
}
// 删除仪器设备
export function delEquipment(eqId) {
  return request({
    url: '/lab/equipment/' + eqId,
    method: 'delete'
  })
}

export function statLabEquipmentData() {
  return request({
    url: '/lab/equipment/stat',
    method: 'get'
  })
}
