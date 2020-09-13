// components/blog-ctrl/blog-ctrl.js
const db = wx.cloud.database()
let ctrlType = 0 // 点赞：0，评论：1
let userInfo = {}
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    showAuthModal: false, // 登录（授权）组件是否显示
    showModal: false, // 评论弹出层是否显示
    content: ''
  },

  externalClasses: [
    'iconfont',
    'icon-zan',
    'icon-comment',
    'icon-share'
  ],

  /**
   * 组件的方法列表
   */
  methods: {
    // 点赞
    onZan() {
      ctrlType = 0
      this._checkAuth()
    },

    // 评论
    onComment() {
      ctrlType = 1
      this._checkAuth()
    },

    // 判断授权
    _checkAuth() {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: (res) => {
                userInfo = res.userInfo
                // 显示评论弹出层
                if (ctrlType === 1) {
                  this.setData({
                    showModal: true
                  })
                } else { // 喜欢、点赞
                  this.sendLike()
                }
              }
            })
          } else {
            this.setData({
              showAuthModal: true
            })
          }
        }
      })
    },

    onInput(event) {
      this.setData({
        content: event.detail.value
      })
    },

    // 评论
    onSend() {
      let content = this.data.content
      if (content.trim().length === 0) {
        wx.showModal({
          title: '提示',
          content: '你还未输入评论内容！',
          showCancel: false
        })
        return
      }
      wx.showLoading({
        title: '评论中',
        mask: true
      })
      db.collection('blog-comment').add({
        data: {
          blogId: this.properties.blogId,
          content,
          createtime: db.serverDate(),
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
          success: () => {
            this.setData({
              showModal: false,
              content: ''
            })
          }
        })
      })
    },

    // 喜欢、点赞
    sendLike() {
      console.log('喜欢')
    },

    // 授权成功
    onAuthSuccess(event) {
      userInfo = event.detail
      // 隐藏授权框，显示评论框
      this.setData({
        showAuthModal: false
      }, () => {
        if (ctrlType === 1) {
          this.setData({
            showModal: true
          })
        } else { // 喜欢、点赞
          this.sendLike()
        }
      })
    },

    // 授权失败
    onAuthFail() {
      wx.showModal({
        title: '提示',
        content: ctrlType === 1 ? '请先授权后再评论哦！' : '请先授权后再点赞哦！',
        showCancel: false
      })
    }

  }

})