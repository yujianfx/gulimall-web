import http from './httpRequest'

export function ossPolicy () {
  return new Promise((resolve, reject) => {
    http({
      url: http.adornUrl('/oss/policy'),
      method: 'GET',
      params: http.adornParams({})
    }).then(({data}) => {
      resolve(data)
    })
  })
}
