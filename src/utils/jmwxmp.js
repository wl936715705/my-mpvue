/**
 * @class Jmwxmp
 * @constructor 默认的配置
 * @description 微信小程序api常用方法二次封装
 */
class Jmwxmp {
  /**
   * 自定义参数
   * @param {object} config
   * config.apiHost 服务器请求接口地址公共抬头部分
   * config.login login服务器请求自定义
   * config.login = {url: '', method: '', contentType: '', code: ''}
   * config.showModal = {}
   */
  constructor (config) {
    this.config = config || {}
    this.apiHost = this.apiHost || ''
    this.config.login = this.config.login || {}
    this.config.showModal = this.config.showModal || {}
  }

  /**
   * 服务请求
   * @param {object} obj 请求参数
   * @returns {returns} Promise 接口请求回调函数 resolve: 成功, reject: 失败
   * @use new Jmwxmp().request({url:'接口请求地址', method:'接口请求方式', contentType:'头部数据方式', data: {'传参'}}).then(function(res){}, function(res){})
   */
  request (obj) {
    const that = this
    let json = {
      url: obj.url.indexOf('http') === -1 ? that.config.apiHost + obj.url : obj.url,
      method: obj.method || 'GET',
      contentType: obj.contentType || 'application/json',
      data: obj.data || {}
    }
    let token = wx.getStorageSync('token') // 本地缓存token值
    if (!token) token = ''
    return new Promise(function (resolve, reject) {
      wx.request({
        url: json.url,
        method: json.method,
        header: {'content-type': json.contentType, 'token': token},
        dataType: 'json',
        data: json.data,
        success (res) {
          if (res.statusCode === 200) {
            typeof resolve === 'function' && resolve(res.data)
          } else {
            typeof reject === 'function' && reject(res)
          }
        },
        fail (res) {
          typeof reject === 'function' && reject(res)
        }
      })
    })
  }

  /**
   * 检查小程序是否有版本更新
   * @param {object} obj
   * @use new Jmwxmp().checkUpdate({updateReady () {}, updateFailed () {}, updateWX () {}})
   */
  checkUpdate (obj) {
    let json = {
      updateReady: obj.updateReady || function () {}, // 发现新版本
      updateFailed: obj.updateFailed || function () {}, // 更新失败
      updateWX: obj.updateWX || function () {} // 当前微信版本过低
    }
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            // 提示发现新版本 根据需求触发更新 updateManager.applyUpdate()
            json.updateReady.call(updateManager)
          })
          updateManager.onUpdateFailed(function () {
            // 提示更新失败 删除当前小程序，重新搜索进入
            json.updateFailed.call(updateManager)
          })
        }
      })
    } else {
      // 当前微信版本过低 升级到最新微信版本后重试
      json.updateWX.call(this)
    }
  }

  /**
   * 检查session是否失效
   * @param {function} callback session_key失效回调
   * @param {object} param login请求服务器时携带除code之外的数据
   * @use new Jmwxmp().checkSession(function(){}, {})
   */
  checkSession (callback, param) {
    const that = this
    let token = wx.getStorageSync('token')
    if (!token) {
      wx.checkSession({
        success () {
          typeof callback === 'function' && callback() // session_key 未过期，并且在本生命周期一直有效
        },
        fail () {
          that.login(callback, param) // 用户长期未使用或者清除缓存 session_key 已经失效，需要重新执行登录流程
        }
      })
    } else {
      typeof callback === 'function' && callback()
    }
  }

  /**
   * 小程序注册
   * @param {function} callback 设置本地缓存成功回调
   * @param {object} param 请求服务器时携带除code之外的数据
   * @use new Jmwxmp().login(function(){}, {})
   */
  login (callback, param) {
    const that = this
    let json = {
      url: that.config.login.url || '',
      method: that.config.login.method || 'GET',
      contentType: that.config.login.contentType || 'application/x-www-form-urlencoded',
      code: that.config.login.code || 'code'
    }
    wx.login({
      success: function (res) {
        if (res.code) {
          // 发起网络请求
          let data = {[json.code]: res.code}
          if (param) {
            Object.assign(data, param)
          }
          that.request({
            url: json.url,
            method: json.method,
            contentType: json.contentType,
            data: data
          }).then(function (res) {
            if (res.code === 0) {
              wx.setStorage({
                key: 'token',
                data: res.data.token,
                success: function (e) {
                  if (e.errMsg === 'setStorage:ok') {
                    typeof callback === 'function' && callback()
                  }
                }
              })
            }
          }, function (res) {})
        }
      },
      fail: function (res) {
      }
    })
  }

  /**
   * 选择图片
   * @param {object} obj 参数
   * @returns {function} Promise 回调函数 resolve: 成功, reject: 失败
   * @use new Jmwxmp().chooseImage({count: 选择图片数量, sizeType: ['图片尺寸: 原图, 压缩图'], sourceType: ['图片来源: 相册, 相机']}).then(function(res){}, function(res){})
   */
  chooseImage (obj) {
    let json = {
      count: obj.count || 9,
      sizeType: obj.sizeType || ['original', 'compressed'],
      sourceType: obj.sourceType || ['album', 'camera']
    }
    return new Promise(function (resolve, reject) {
      wx.chooseImage({
        count: json.count, // 默认: 9
        sizeType: json.sizeType,
        sourceType: json.sourceType,
        success (res) {
          typeof resolve === 'function' && resolve(res)
        },
        fail (res) {
          typeof reject === 'function' && reject(res)
        }
      })
    })
  }

  /**
   * 选择视频
   * @param {object} obj 参数
   * @returns {function} Promise 回调函数 resolve: 成功, reject: 失败
   * @use new Jmwxmp().chooseVideo({sourceType: ['视频来源: 相册, 相机'], compressed: 是否压缩, maxDuration: 拍摄时长 最多60 单位秒, camera: '摄像头'}).then(function(res){}, function(res){})
   */
  chooseVideo (obj) {
    let json = {
      sourceType: obj.sourceType || ['album', 'camera'],
      compressed: obj.compressed || true,
      maxDuration: obj.maxDuration || 60,
      camera: obj.camera || 'back'
    }
    return new Promise(function (resolve, reject) {
      wx.chooseVideo({
        sourceType: json.sourceType,
        compressed: json.compressed,
        maxDuration: json.maxDuration,
        camera: json.camera,
        success (res) {
          typeof resolve === 'function' && resolve(res)
        },
        fail (res) {
          typeof reject === 'function' && reject(res)
        }
      })
    })
  }

  /**
   * 上传文件
   * @param {object} obj 参数
   * @returns {function} Promise 回调函数 resolve: 成功, reject: 失败
   * @use new Jmwxmp().uploadFile({url: '服务器地址', filePath: '文件资源路径', name: '文件对应的 key', contentType: 'HTTP Header contentType', formData: {'其他form data'}}).then(function(res){}, function(res){})
   */
  uploadFile (obj) {
    const that = this
    let json = {
      url: that.config.apiHost + obj.url || that.config.apiHost + '',
      filePath: obj.filePath,
      name: obj.name,
      contentType: obj.contentType || 'multipart/form-data',
      formData: obj.formData || {}
    }
    let token = wx.getStorageSync('token')
    if (!token) token = ''
    return new Promise(function (resolve, reject) {
      wx.uploadFile({
        url: json.url,
        filePath: json.filePath,
        name: json.name,
        header: {'content-type': json.contentType, 'token': token},
        formData: json.formData,
        success (res) {
          if (res.statusCode === 200) {
            typeof resolve === 'function' && resolve(res.data)
          } else {
            typeof reject === 'function' && reject(res)
          }
        },
        fail (res) {
          typeof reject === 'function' && reject(res)
        }
      })
    })
  }

  /**
   * 模态窗口提示
   * @param {object} obj
   * @returns {function} Promise  回调函数 resolve: 成功, reject: 失败
   * @use new Jmwxmp().showModal({title: '', content: '', showCancel: false, cancelText: '', cancelColor: '', confirmText: '', confirmColor: ''}).then(function () {}, function () {})
   */
  showModal (obj) {
    const that = this
    let json = {
      title: obj.title || '',
      content: obj.content || '',
      showCancel: obj.showCancel,
      cancelText: obj.cancelText || '取消',
      cancelColor: obj.cancelColor || (that.config.showModal.cancelColor ? that.config.showModal.cancelColor : '#000'),
      confirmText: obj.confirmText || '确定',
      confirmColor: obj.confirmColor || (that.config.showModal.confirmColor ? that.config.showModal.confirmColor : '#576B95')
    }
    return new Promise(function (resolve, reject) {
      wx.showModal({
        title: json.title,
        content: json.content,
        showCancel: json.showCancel,
        cancelText: json.cancelText,
        cancelColor: json.cancelColor,
        confirmText: json.confirmText,
        confirmColor: json.confirmColor,
        success (res) {
          if (res.confirm) {
            typeof resolve === 'function' && resolve(res)
          } else if (res.cancel) {
            typeof reject === 'function' && reject(res)
          }
        },
        fail (res) {
          typeof reject === 'function' && reject(res)
        }
      })
    })
  }

  /**
   * 设置系统剪贴板的内容
   * @param {string} tips 正在复制的文字提示
   * @param {string} content 复制的内容
   * @returns {function} Promise  回调函数 resolve: 成功, reject: 失败
   * @use new Jmwxmp().setCopy('tips', 'content').then(function () {}, function () {})
   */
  setCopy (tips, content) {
    return new Promise(function (resolve, reject) {
      wx.showLoading({
        title: tips || '复制中...',
        mask: true
      })
      wx.setClipboardData({
        data: content,
        success (res) {
          wx.hideLoading()
          typeof resolve === 'function' && resolve(res)
        },
        fail (res) {
          wx.hideLoading()
          typeof reject === 'function' && reject(res)
        }
      })
    })
  }

  /**
   * 设置canvas绘制文本超出规定宽度自动换行
   * @param {object} obj
   * @use new Jmwxmp().setCanvasTextWrap({})
   */
  setCanvasTextWrap (obj) {
    let json = {
      ctx: obj.ctx, // canvas 的绘图上下文 CanvasContext 对象
      scale: obj.scale || 1, // 设备窗口与设计图比例
      text: obj.text || '', // 绘制的文本内容
      lineHeight: obj.lineHeight || 30, // 文本行高
      x: obj.x || 0, // 绘制文本在画布上的x坐标
      y: obj.y || 0, // 绘制文本在画布上的y坐标
      maxWidth: obj.maxWidth || 100, // 设置绘制文本最大宽度 超出宽度换行
      maxLines: obj.maxLines || 1 // 设置可最多换行数，超出末尾用...截取显示
    }
    let textVal = Math.ceil(json.ctx.measureText(json.text).width / (json.maxWidth * json.scale))
    let count = textVal >= json.maxLines ? json.maxLines : textVal
    let endPos = 0
    for (let i = 0; i < count; i++) {
      let nowStr = json.text.slice(endPos)
      let currW = 0
      if (json.ctx.measureText(nowStr).width > json.maxWidth * json.scale) {
        for (let j = 0; j < nowStr.length; j++) {
          currW += json.ctx.measureText(nowStr[j]).width
          if (currW > json.maxWidth * json.scale) {
            if (i === json.maxLines - 1) {
              json.ctx.fillText(nowStr.slice(0, j - 1) + '...', json.x * json.scale, (json.y + (i + 1) * json.lineHeight) * json.scale)
            } else {
              json.ctx.fillText(nowStr.slice(0, j), json.x * json.scale, json.y * json.scale + (i + 1) * json.lineHeight * json.scale)
            }
            endPos += j
            break
          }
        }
      } else {
        json.ctx.fillText(nowStr.slice(0), json.x * json.scale, json.y * json.scale + (i + 1) * json.lineHeight * json.scale)
      }
    }
  }

  /**
   * 异步快速获取设备系统信息
   * @use new Jmwxmp().setSystemInfo.brand
   */
  getSystemInfo = {
    brand: this.setSystemInfo().brand,
    model: this.setSystemInfo().model,
    pixelRatio: this.setSystemInfo().pixelRatio,
    screenWidth: this.setSystemInfo().screenWidth,
    screenHeight: this.setSystemInfo().screenHeight,
    windowWidth: this.setSystemInfo().windowWidth,
    windowHeight: this.setSystemInfo().windowHeight,
    statusBarHeight: this.setSystemInfo().statusBarHeight,
    language: this.setSystemInfo().language,
    version: this.setSystemInfo().version,
    system: this.setSystemInfo().system,
    platform: this.setSystemInfo().platform,
    fontSizeSetting: this.setSystemInfo().fontSizeSetting,
    SDKVersion: this.setSystemInfo().SDKVersion,
    benchmarkLevel: this.setSystemInfo().benchmarkLevel,
    albumAuthorized: this.setSystemInfo().albumAuthorized,
    cameraAuthorized: this.setSystemInfo().cameraAuthorized,
    locationAuthorized: this.setSystemInfo().locationAuthorized,
    microphoneAuthorized: this.setSystemInfo().microphoneAuthorized,
    notificationAuthorized: this.setSystemInfo().notificationAuthorized,
    notificationAlertAuthorized: this.setSystemInfo().notificationAlertAuthorized,
    notificationBadgeAuthorized: this.setSystemInfo().notificationBadgeAuthorized,
    notificationSoundAuthorized: this.setSystemInfo().notificationSoundAuthorized,
    bluetoothEnabled: this.setSystemInfo().bluetoothEnabled,
    locationEnabled: this.setSystemInfo().locationEnabled,
    wifiEnabled: this.setSystemInfo().wifiEnabled,
    safeArea: this.setSystemInfo().safeArea
  }
  setSystemInfo () {
    let json = {}
    wx.getSystemInfo({
      success (res) {
        json.brand = res.brand
        json.model = res.model
        json.pixelRatio = res.pixelRatio
        json.screenWidth = res.screenWidth
        json.screenHeight = res.screenHeight
        json.windowWidth = res.windowWidth
        json.windowHeight = res.windowHeight
        json.statusBarHeight = res.statusBarHeight
        json.language = res.language
        json.version = res.version
        json.system = res.system
        json.platform = res.platform
        json.fontSizeSetting = res.fontSizeSetting
        json.SDKVersion = res.SDKVersion
        json.benchmarkLevel = res.benchmarkLevel
        json.albumAuthorized = res.albumAuthorized
        json.cameraAuthorized = res.cameraAuthorized
        json.locationAuthorized = res.locationAuthorized
        json.microphoneAuthorized = res.microphoneAuthorized
        json.notificationAuthorized = res.notificationAuthorized
        json.notificationAlertAuthorized = res.notificationAlertAuthorized
        json.notificationBadgeAuthorized = res.notificationBadgeAuthorized
        json.notificationSoundAuthorized = res.notificationSoundAuthorized
        json.bluetoothEnabled = res.bluetoothEnabled
        json.locationEnabled = res.locationEnabled
        json.wifiEnabled = res.wifiEnabled
        json.safeArea = res.safeArea
      },
      fail (res) {
        // console.log(res)
      }
    })
    return json
  }
}

export default Jmwxmp
