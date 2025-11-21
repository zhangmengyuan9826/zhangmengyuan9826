import request from '@/utils/request'

// 获取路由
export const getRouters = (subUrlParam) => {
  return request({
    url: '/getRouters',
    method: 'get',
    params: { subUrl: subUrlParam }
  })
}