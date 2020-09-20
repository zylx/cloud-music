// miniprogram/pages/blog-detail/blog-detail.js
const app = getApp()
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
      result.isLike = result.like.indexOf(app.globalData.openid) !== -1 ? true : false
      let commentList = result.commentList
      for (let i = 0, len = commentList.length; i < len; i++) {
        commentList[i].createtime = formatTime(new Date(commentList[i].createtime))
      }
      this.setData({
        commentList,
        blog: result
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 获取别卡片高度，用于设置卡片固定定位时的高度，而评论列表可滚动
    // let query = wx.createSelectorQuery();
    // query.select('.blog-card').boundingClientRect(rect => {
    //   let clientHeight = rect.height;
    //   let clientWidth = rect.width;
    //   let ratio = 750 / clientWidth;
    //   let height = clientHeight * ratio;
    //   console.log(height);
    // }).exec();
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
    const blog = this.data.blog
    return {
      title: blog.content,
      path: `/pages/blog-detail/blog-detail?blogId=${blog._id}`
    }
  }
})