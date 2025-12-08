import request from '@/utils/request'

// 查询质粒载体参与构建序列的元数据列表
export function listMeta(query) {
  return request({
    url: '/plasmid/meta/list',
    method: 'get',
    params: query
  })
}
export function listPVNames() {
  return request({
    url: '/plasmid/meta/listPVNames',
    method: 'get'
  })
}

// 查询质粒载体参与构建序列的元数据详细
export function getMeta(metaId) {
  return request({
    url: '/plasmid/meta/' + metaId,
    method: 'get'
  })
}

// 新增质粒载体参与构建序列的元数据
export function addMeta(data) {
  return request({
    url: '/plasmid/meta',
    method: 'post',
    data: data
  })
}

// 修改质粒载体参与构建序列的元数据
export function updateMeta(data) {
  return request({
    url: '/plasmid/meta',
    method: 'put',
    data: data
  })
}

// 删除质粒载体参与构建序列的元数据
export function delMeta(metaId) {
  return request({
    url: '/plasmid/meta/' + metaId,
    method: 'delete'
  })
}

export function getPlasmidVentorByName(pvName){
  return request({
    url: '/plasmid/meta/m/' + pvName,
    method: 'get'
  })
}
