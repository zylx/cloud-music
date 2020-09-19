// pages/blog-history/blog-history.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blogList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getListByOpenid()
  },

  _getListByOpenid(start = 0) {
    wx.showLoading({
      title: '加载中'
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        start,
        count: 10,
        $url: 'listByOpenid'
      }
    }).then((res) => {
      const result = res.result
      this.setData({
        blogList: this.data.blogList.concat(result)
      })
      wx.hideLoading()
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
    this._getListByOpenid(0)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._getListByOpenid(this.data.blogList.length)
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