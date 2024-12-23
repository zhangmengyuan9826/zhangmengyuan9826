import request from '@/utils/request'

// 查询物料主数据列表
export function listMat(query) {
  return request({
    url: '/pages/stock/stock_in',
    method: 'get',
    params: query
  })
}