import request from '@/utils/request'

// 查询质粒模块-实验管理列表
export function listExperiment(query) {
  return request({
    url: '/plasmid/experiment/list',
    method: 'get',
    params: query
  })
}
export function listProjectRecord(query) {
  return request({
    url: '/plasmid/experiment/expRecordList',
    method: 'get',
    params: query
  })
}
// 查询质粒模块-实验管理详细
export function getExperiment(expId) {
  return request({
    url: '/plasmid/experiment/' + expId,
    method: 'get'
  })
}

// 新增质粒模块-实验管理
export function addExperiment(data) {
  return request({
    url: '/plasmid/experiment',
    method: 'post',
    data: data
  })
}
export function addExpRecord(data) {
  return request({
    url: '/plasmid/experiment/newRecord',
    method: 'post',
    data: data
  })
}

export function updateExperimentProgress(data) {
  return request({
    url: '/plasmid/experiment/progress',
    method: 'post',
    data: data
  })
}

// 新增质粒模块-实验管理
export function checkPermission(data) {
  return request({
    url: '/plasmid/experiment/checkPermission',
    method: 'post',
    data: data
  })
}

// 修改质粒模块-实验管理
export function updateExperiment(data) {
  return request({
    url: '/plasmid/experiment',
    method: 'put',
    data: data
  })
}

// 删除质粒模块-实验管理
export function delExperiment(expId) {
  return request({
    url: '/plasmid/experiment/' + expId,
    method: 'delete'
  })
}
