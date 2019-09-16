import Jmwxmp from '../utils/jmwxmp'

// 实例化JmWxMpApi
const jmwxmp = new Jmwxmp({
  apiHost: 'http://172.17.0.249:8878/',
  login: {
    url: 'api',
    method: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    code: 'code'
  }
})

export {
  jmwxmp
}
