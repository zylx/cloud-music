// pages/palylist/index.js
const app = getApp()
const MAX_LIMIT = 15
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperImgUrls: [{
        url: 'http://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg',
      },
      {
        url: 'http://p1.music.126.net/xhWAaHI-SIYP8ZMzL9NOqg==/109951164167032995.jpg',
      },
      {
        url: 'http://p1.music.126.net/Yo-FjrJTQ9clkDkuUCTtUg==/109951164169441928.jpg',
      }
    ],
    playlist: [],
    marginSpace: 10, // 歌单图片之间的间隙
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getPlaylist()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setImageMargin()
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
      playlist: []
    })
    this._getPlaylist()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._getPlaylist()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 获取歌单列表
   */
  _getPlaylist() {
    wx.showLoading({
      title: '加载中'
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        $url: 'playlist',
        start: this.data.playlist.length,
        count: MAX_LIMIT
      }
    }).then((res) => {
      let responseData = res.result.data
      this.setData({
        playlist: this.data.playlist.concat(responseData)
      })
      wx.hideLoading({
        success: (res) => {
          if (responseData.length === 0) {
            wx.showToast({
              title: '没有更多数据了'
            })
          }
        }
      })
      wx.stopPullDownRefresh() // 下拉数据更新完时关闭下拉刷新的加载小点
    })
  },
  setImageMargin() { // 设置歌单图片之间间隙
    const screenWidth = app.getScreenWidth()
    const rpx = app.getRpx() // 1rpx的像素（px）大小
    // 20rpx 为歌单图片区域总的左右边距，220rpx 为图片宽高，一排3张
    // marginSpace 为计算所得到图片间隙宽度，一排3张，中间两个间隙，所以还要除以2
    const marginSpace = (screenWidth - rpx * 20 * 2 - rpx * 220 * 3) / rpx / 2
    this.setData({
      marginSpace
    })
  }
})