// components/blog-ctrl/blog-ctrl.js
const db = wx.cloud.database()
let ctrlType = 0 // 点赞：0，评论：1
let userInfo = {}
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object,
    isLike: Boolean, // 当前用户是否已经点过赞
    likeCount: Number, // 用户点赞数量
    commentCount: Number // 用户评论数量
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
    'icon-zan0',
    'icon-zan1',
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
      // this.subscribeMsg()
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

    // 评论
    onSend(event) {
      let content = event.detail.value.content
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
              content: '',
              commentCount: this.data.commentCount + 1
            })
            // 父元素刷新评论页面
            this.triggerEvent('refreshCommentList')
          }
        })
      })
    },

    // 喜欢、点赞
    sendLike() {
      wx.cloud.callFunction({
        name: 'blog',
        data: {
          $url: 'like',
          blogId: this.properties.blogId,
        }
      }).then((res) => {
        const result = res.result
        this.setData({
          isLike: result.isLike,
          likeCount: result.likeCount
        })
      })
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
    },

    // 消息订阅
    subscribeMsg() {
      let templateId = 'E-4hKx5IIUxB2pDyijAQjYjD2p_pjRSeKxZy1S2dU18'
      wx.requestSubscribeMessage({
        tmplIds: [templateId],
        success: (res) => {
          // 如果用户点击允许
          if (res[templateId] == 'accept') {
            wx.cloud.callFunction({
              name: 'sendMessage',
              data: {
                templateId,
                content: '我是测试内容',
                blogId: this.properties.blogId,
              }
            }).then(res => {
              this.setData({
                content: ''
              })
            })
          } else {
            console.log('点击了取消')
          }
        },
        fail: (res) => {
          console.log(res)
        }
      })
    }

  }

})