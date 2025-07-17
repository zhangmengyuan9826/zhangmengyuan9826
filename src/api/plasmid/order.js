import request from '@/utils/request'

// 查询质粒订单列表
export function listOrder(query) {
  return request({
    url: '/plasmid/order/list',
    method: 'get',
    params: query
  })
}

// 查询质粒订单列表
export function listGenesByIds(ids) {
  return request({
    url: '/plasmid/order/listGenesByIds/'+ids,
    method: 'get',
  })
}


// 查询质粒订单详细
export function getOrder(orderId) {
  return request({
    url: '/plasmid/order/' + orderId,
    method: 'get'
  })
}

// 新增质粒订单
export function addOrder(data) {
  return request({
    url: '/plasmid/order',
    method: 'post',
    data: data
    
  })
}

// 修改质粒订单
export function updateOrder(data) {
  return request({
    url: '/plasmid/order',
    method: 'put',
    data: data
  })
}

// 修改质粒订单状态
export function updateOrderStatus(data) {
  return request({
    url: '/plasmid/order/changeStatus',
    method: 'post',
    data: data
  })
}

// 修改质粒订单状态
export function updateOrderOrdeIng(data) {
  return request({
    url: '/plasmid/order/submitOrderIng',
    method: 'post',
    data: data
  })
}

// 删除质粒订单
export function delOrder(orderId) {
  return request({
    url: '/plasmid/order/' + orderId,
    method: 'delete'
  })
}
