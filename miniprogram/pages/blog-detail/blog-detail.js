// miniprogram/pages/blog-detail/blog-detail.js
import formatTime from '../../utils/formatTime.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blogId: '',
    blog: {},
    commentList: [],
    likeCount: 0,
    commentCount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      blogId: options.blogId
    })
    this._getBlogDetail()
  },

  // 获取博客详情
  _getBlogDetail() {
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        $url: 'detail',
        blogId: this.data.blogId
      }
    }).then((res) => {
      const result = res.result
      const likeCount = result.like && result.like.length || 0
      let commentList = result.commentList || []
      delete result.like
      delete result.commentList
      if (commentList.length > 0) {
        for (let i = 0, len = commentList.length; i < len; i++) {
          commentList[i].createtime = formatTime(new Date(commentList[i].createtime))
        }
      }
      this.setData({
        likeCount,
        commentList,
        blog: result,
        commentCount: commentList.length,
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
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
    this._getBlogDetail()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})