import request from '@/utils/request'

// 查询首页头部统计
export function vistaMatStockActivity(query) {
  return request({
    url: '/vista/matActivity',
    method: 'get',
    params: query
  })
}

export function vistaMatWorkshop(query) {
  return request({
    url: '/vista/matWorkshop',
    method: 'get',
    params: query
  })
}
export function vistaMatUser(query) {
  return request({
    url: '/vista/matUser',
    method: 'get',
    params: query
  })
}

export function getVistaChartData(chartNo, query) {
  return request({
    url: `/vista/vistaChart/${chartNo}`,
    method: 'get',
    params: query
  })
}



export function getVistaChartDataPages(query) {
  return request({
    url: `/vista/vistaChartPage`,
    method: 'get',
    params: query
  })
}