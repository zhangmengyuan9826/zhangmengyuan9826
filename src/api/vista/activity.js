import request from '@/utils/request'

// 查询首页头部统计
export function vistaMatStockActivity(query) {
  return request({
    url: '/vista/matActivity',
    method: 'get',
    params: query
  })
}