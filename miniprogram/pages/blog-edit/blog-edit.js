// miniprogram/pages/blog-edit/blog-edit.js
const MAX_WORDS_COUNT = 140 // 最大字数输入限制
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordCount: 0
  },

  onInput(event) {
    let wordCount = event.detail.value.length
    if (wordCount >= MAX_WORDS_COUNT) {
      wordCount = `允许最大输入${MAX_WORDS_COUNT}字`
    }
    this.setData({
      wordCount
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
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