import Jmwxmp from '../utils/jmwxmp'

// api地址抬头
const baseUrl = 'http://172.17.0.249:8878/'

// cdn加速地址
const cdnUrl = ''

// 实例化JmWxMpApi
const jmwxmp = new Jmwxmp({
  login: {
    url: `${baseUrl}api`,
    method: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    code: 'code'
  },
  showModal: {
    cancelColor: '#a3a3a3',
    confirmColor: '#fd3c37'
  }
})

// 设置公共api地址
const api = {
  login: data => jmwxmp.request(`${baseUrl}api`, 'GET', 'application/x-www-form-urlencoded', data),
  test: data => jmwxmp.request(`${baseUrl}api`, 'GET', 'application/x-www-form-urlencoded', data)
}

export {
  baseUrl,
  cdnUrl,
  jmwxmp,
  api
}
