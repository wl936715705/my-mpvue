<script>
import {jmwxmp} from '@/api/api'

export default {
  globalData () {
    return {
      systemInfo: {}
    }
  },

  created () {
    // 调用API从本地缓存中获取数据
    /*
     * 平台 api 差异的处理方式:  api 方法统一挂载到 mpvue 名称空间, 平台判断通过 mpvuePlatform 特征字符串
     * 微信：mpvue === wx, mpvuePlatform === 'wx'
     * 头条：mpvue === tt, mpvuePlatform === 'tt'
     * 百度：mpvue === swan, mpvuePlatform === 'swan'
     * 支付宝(蚂蚁)：mpvue === my, mpvuePlatform === 'my'
     */

    let logs
    if (mpvuePlatform === 'my') {
      logs = mpvue.getStorageSync({key: 'logs'}).data || []
      logs.unshift(Date.now())
      mpvue.setStorageSync({
        key: 'logs',
        data: logs
      })
    } else {
      logs = mpvue.getStorageSync('logs') || []
      logs.unshift(Date.now())
      mpvue.setStorageSync('logs', logs)
    }
  },
  log () {
    console.log(`log at:${Date.now()}`)
  },
  onLaunch (options) {
    const that = this
    // jmwxmp.showModal({title: '提示', content: '当前微信版本过低，请升级到最新微信版本后重试。', showCancel: false})
    jmwxmp.checkUpdate({
      updateReady () {
        jmwxmp.showModal({content: '发现新版本', showCancel: false, confirmText: '立即更新'}).then(function () {
          this.applyUpdate()
        })
      },
      updateFailed () {
        jmwxmp.showModal({content: '更新失败，请您删除当前小程序，重新搜索“亿体育”进入', showCancel: false})
      },
      updateWX () {
        jmwxmp.showModal({title: '提示', content: '当前微信版本过低，请升级到最新微信版本后重试。', showCancel: false})
      }
    })

    // let systemInfo = wx.getSystemInfoSync()
    that.$options.globalData.systemInfo = {
      scale: jmwxmp.getSystemInfo.windowWidth / 750
    }
  }
}
</script>

<style>
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 200rpx 0;
  box-sizing: border-box;
}
/* this rule will be remove */
* {
  transition: width 2s;
  -moz-transition: width 2s;
  -webkit-transition: width 2s;
  -o-transition: width 2s;
}
</style>
