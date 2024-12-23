import request from '@/utils/request'

// 查询品牌列表
export function listBrand(query) {
  return request({
    url: '/base/brand/list',
    method: 'get',
    params: query
  })
}
// 查询品牌列表
export function listAllBrand(query) {
  return request({
    url: '/base/brand/listAll',
    method: 'get',
    params: query
  })
}

// 查询品牌详细
export function getBrand(brandId) {
  return request({
    url: '/base/brand/' + brandId,
    method: 'get'
  })
}

// 新增品牌
export function addBrand(data) {
  return request({
    url: '/base/brand',
    method: 'post',
    data: data
  })
}

// 修改品牌
export function updateBrand(data) {
  return request({
    url: '/base/brand',
    method: 'put',
    data: data
  })
}

// 删除品牌
export function delBrand(brandId) {
  return request({
    url: '/base/brand/' + brandId,
    method: 'delete'
  })
}
