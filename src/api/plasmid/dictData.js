import request from '@/utils/request'

// 查询质粒字段数据列表
export function listDictData(query) {
  return request({
    url: '/plasmid/dictData/list',
    method: 'get',
    params: query
  })
}

// 查询质粒字段数据列表-不分页
export function listDictDataAll(query) {
  return request({
    url: '/plasmid/dictData/listAll',
    method: 'get',
    params: query
  })
}
// 查询质粒字段数据详细
// export function getDictDataListByDictType(dictType) {
//   return request({
//     url: '/plasmid/dictData/type/' + dictType,
//     method: 'get'
//   })
// }

// 扫描查询入库单
export function getDictDataListByDictType(dictType) {
  return request({
    url: '/plasmid/dictData/m/' + dictType,
    method: 'get'    
  })
}

export function getDictDataSeqListByDictType(dictType) {
  return request({
    url: '/plasmid/dictData/seq/' + dictType,
    method: 'get'    
  })
}

// 查询质粒字段数据详细
export function getDictData(dictId) {
  return request({
    url: '/plasmid/dictData/' + dictId,
    method: 'get'
  })
}

// 新增质粒字段数据
export function addDictData(data) {
  return request({
    url: '/plasmid/dictData',
    method: 'post',
    data: data
  })
}

// 修改质粒字段数据
export function updateDictData(data) {
  return request({
    url: '/plasmid/dictData',
    method: 'put',
    data: data
  })
}

// 删除质粒字段数据
export function delDictData(dictId) {
  return request({
    url: '/plasmid/dictData/' + dictId,
    method: 'delete'
  })
}
