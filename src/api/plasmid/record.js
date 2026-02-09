import request from '@/utils/request'

// 查询质粒模块-质粒实验进展列表
export function listRecord(query) {
  return request({
    url: '/plasmid/record/list',
    method: 'get',
    params: query
  })
}

// 查询质粒模块-质粒实验进展详细
export function getRecord(recordId) {
  return request({
    url: '/plasmid/record/' + recordId,
    method: 'get'
  })
}

// 新增质粒模块-质粒实验进展
export function addRecord(data) {
  return request({
    url: '/plasmid/record',
    method: 'post',
    data: data
  })
}

// 修改质粒模块-质粒实验进展
export function updateRecord(data) {
  return request({
    url: '/plasmid/record',
    method: 'put',
    data: data
  })
}

// 删除质粒模块-质粒实验进展
export function delRecord(recordId) {
  return request({
    url: '/plasmid/record/' + recordId,
    method: 'delete'
  })
}
