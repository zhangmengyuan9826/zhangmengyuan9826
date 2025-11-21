

export function getSystemData() {
  return request({
    url: '/system/stat/',
    method: 'get',
  })
}