import request from '@/utils/request'

// 查询质粒基因管理列表
export function listGene(query) {
  return request({
    url: '/plasmid/gene/list',
    method: 'get',
    params: query
  })
}

// 查询质粒基因管理详细
export function getGene(geneId) {
  return request({
    url: '/plasmid/gene/' + geneId,
    method: 'get'
  })
}

// 新增质粒基因管理
export function addGene(data) {
  return request({
    url: '/plasmid/gene',
    method: 'post',
    data: data
  })
}

// 修改质粒基因管理
export function updateGene(data) {
  return request({
    url: '/plasmid/gene',
    method: 'put',
    data: data
  })
}

// 删除质粒基因管理
export function delGene(geneId) {
  return request({
    url: '/plasmid/gene/' + geneId,
    method: 'delete'
  })
}
