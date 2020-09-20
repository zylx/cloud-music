// pages/blog/index.js
const app = getApp()
let keyword = '' // 搜索关键字
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModal: false,
    blogList: []
  },

  // 发布
  onPublish() {
    // 判断用户是否授权
    wx.getSetting({
      withSubscriptions: true,
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({ // 获取用户信息
            success: (res) => {
              this.onLoginSuccess({
                detail: res.userInfo
              })
            }
          })
        } else {
          this.setData({
            showModal: true
          })
        }
      }
    })
  },

  // 搜索
  onSearch(event) {
    keyword = event.detail.keyword
    this.setData({
      blogList: []
    })
    this._getBlogList(0)
  },

  onLoginSuccess(event) {
    const detail = event.detail
    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`
    })
  },

  onLoginFail() {
    wx.showModal({
      title: '提示',
      content: '只有授权用户才能发布哦！',
      showCancel: false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getBlogList()
  },

  // 获取博客列表
  _getBlogList(start = 0) {
    wx.showLoading({
      title: '拼命加载中'
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        keyword,
        start,
        count: 10,
        $url: 'list'
      }
    }).then((res) => {
      const curOpenid = app.globalData.openid
      const result = res.result
      for (let i = 0, len = result.length; i < len; i++) {
        result[i].isLike = result[i].like.indexOf(curOpenid) !== -1 ? true : false
      }
      this.setData({
        blogList: this.data.blogList.concat(result)
      })
      wx.hideLoading({
        success: (res) => {
          if (result.length === 0) {
            wx.showToast({
              title: '没有更多数据了'
            })
          }
        }
      })
      wx.stopPullDownRefresh()
    })
  },

  // 跳转至详情页面
  goDetail(event) {
    wx.navigateTo({
      url: `../blog-detail/blog-detail?blogId=${event.target.dataset.blogid}`
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      blogList: []
    })
    this._getBlogList(0)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._getBlogList(this.data.blogList.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    const blogObj = event.target.dataset.blog
    return {
      title: blogObj.content,
      path: `/pages/blog-detail/blog-detail?blogId=${blogObj._id}`,
      imageUrl: blogObj.images[0]
    }
  }
})