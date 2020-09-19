// pages/play-history/play-history.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    playHistoryList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const openid = app.globalData.openid
    const historyList = wx.getStorageSync(openid)
    // storage里面存储的musiclist替换成播放历史的歌单
    wx.setStorage({
      key: 'musiclist',
      data: historyList
    })
    this.setData({
      playHistoryList: historyList
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