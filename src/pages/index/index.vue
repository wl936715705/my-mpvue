<template>
  <div @click="clickHandle">

    <div class="userinfo" @click="bindViewTap">
      <img class="userinfo-avatar" v-if="userInfo.avatarUrl" :src="userInfo.avatarUrl" background-size="cover" />
      <img class="userinfo-avatar" src="/static/images/user.png" background-size="cover" />

      <div class="userinfo-nickname">
        <card :text="userInfo.nickName"></card>
      </div>
    </div>

    <div class="usermotto">
      <div class="user-motto">
        <card :text="motto"></card>
      </div>
    </div>

    <form class="form-container">
      <input type="text" class="form-control" :value="motto" placeholder="v-model" />
      <input type="text" class="form-control" v-model="motto" placeholder="v-model" />
      <input type="text" class="form-control" v-model.lazy="motto" placeholder="v-model.lazy" />
    </form>

    <div @click="bindToCounter" class="counter">去往Vuex示例页面</div>


    <div @click="bindUpload" class="counter">上传图片</div>

    <div class="all">
      <div class="left">
      </div>
      <div class="right">
      </div>
    </div>

    <canvas canvas-id="myCanvas"></canvas>
  </div>
</template>

<script>
  import {jmwxmp} from '@/api/api'
  import App from '@/App'
  import card from '@/components/card'

  export default {
    data () {
      return {
        motto: 'Hello miniprograme',
        userInfo: {
          nickName: 'mpvue',
          avatarUrl: 'http://mpvue.com/assets/img/logo.0aaccdfd.png'
        }
      }
    },

    components: {
      card
    },

    methods: {
      bindViewTap () {
        const url = '../logs/main'
        if (mpvuePlatform === 'wx') {
          mpvue.switchTab({ url })
        } else {
          mpvue.navigateTo({ url })
        }
      },

      clickHandle (ev) {
        console.log('clickHandle:', ev)
        // throw {message: 'custom test'}
      },

      bindToCounter () {
        const url = '../counter/main?test=yes'
        wx.navigateTo({ url })
      },

      bindUpload () {
        jmwxmp.setCopy('复制中...', 'aaa').then(function (res) {
          console.log('success', res)
        }, function (res) {
          console.log('fail', res)
        })
      }
    },

    created () {
      // let app = getApp()
      // const data = {ver: '1', method: 'getUserToken'}
      // jmwxmp.checkSession(function () {
      //   const data = {imei: '868120128488170', ver: '1', method: 'getBindInfo'}
      //   api.login(data).then(function (res) {
      //
      //   }, function (res) {
      //
      //   })
      // }, data)
    },

    onReady () {
      let text = '测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试'
      const scale = App.globalData.systemInfo.scale
      const ctx = wx.createCanvasContext('myCanvas')
      // let systemInfo = wx.getSystemInfoSync()
      // console.log('1', systemInfo.windowWidth)
      // console.log('2', jmwxmp.getSystemInfo.windowWidth)

      ctx.save()
      ctx.setFillStyle('#000')
      ctx.setFontSize(32 * scale)
      ctx.setTextAlign('left')
      ctx.setTextBaseline('top')
      jmwxmp.setCanvasTextWrap({
        ctx: ctx,
        scale: scale,
        text: text,
        lineHeight: 42,
        x: 0,
        y: 0,
        maxWidth: 200,
        maxLines: 2
      })
      ctx.restore()
      ctx.draw()

      // that.describe = wx.createSelectorQuery();
      // that.describe.select('#describe').boundingClientRect();
      // that.describe.exec(function (res){
      //   if(res[0]){
      //     that.sum = Math.floor(res[0].height / (200*App.globalData.scale));
      //     if (that.sum <= 0) {
      //       that.setData({
      //         moreTextShow: false,
      //         describeShowAll: true,
      //         describeWrapH: res[0].height+'px'
      //       });
      //     } else {
      //       that.setData({
      //         moreTextShow: true,
      //         describeShowAll: false,
      //         describeWrapH: '150rpx'
      //       });
      //     }
      //   }else{
      //     that.setData({
      //       moreTextShow: false,
      //       describeShowAll: true,
      //       describeWrapH: ''
      //     });
      //   }
      // });
      //
      // that.describe = wx.createSelectorQuery();
      // that.describe.select('#describe').boundingClientRect();
      // that.describe.exec(function (res) {
      //   if(!that.data.describeShowAll){
      //     that.setData({
      //       describeWrapH: res[0].height+'px',
      //       describeShowAll: true
      //     });
      //   }else{
      //     that.setData({
      //       describeWrapH: '150rpx',
      //       describeShowAll: false
      //     });
      //   }
      // });
    }
  }
</script>

<style scoped>
  .userinfo {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .userinfo-avatar {
    width: 128rpx;
    height: 128rpx;
    margin: 20rpx;
    border-radius: 50%;
  }

  .userinfo-nickname {
    color: #aaa;
  }

  .usermotto {
    margin-top: 150px;
  }

  .form-control {
    display: block;
    padding: 0 12px;
    margin-bottom: 5px;
    border: 1px solid #ccc;
  }
  .all{
    width:7.5rem;
    height:1rem;
    background-color:blue;
  }
  .all:after{
    display:block;
    content:'';
    clear:both;
  }
  .left{
    float:left;
    width:3rem;
    height:1rem;
    background-color:red;
  }

  .right{
    float:left;
    width:4.5rem;
    height:1rem;
    background-color:green;
  }
</style>
