// miniprogram/pages/blog-edit/blog-edit.js
const app = getApp()
const MAX_WORDS_COUNT = 140 // 最大字数输入限制
const MAX_IMAGES_COUNT = 9 // 可选择图片最大张数

const db = wx.cloud.database()
let userInfo = {}
let content = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordCount: 0,
    footerBottom: 0, // 初始底栏高度，输入框获取焦点后会弹出键盘，这个高度也随着键盘高度上升
    photoSelectShow: true, // 图片选择元素是否显示
    images: [], // 保存已选择图片数组
    marginSpace: 10 // 图片之间的间隙
  },

  onInput(event) {
    const inputValue = event.detail.value.trim()
    let wordCount = inputValue.length
    if (wordCount >= MAX_WORDS_COUNT) {
      wordCount = `允许最大输入${MAX_WORDS_COUNT}字`
    }
    this.setData({
      wordCount
    })
    content = inputValue
  },

  // 获取焦点
  onFocus(event) {
    const detail = event.detail
    this.setData({
      footerBottom: detail.height || 0
    })
  },

  // 失去焦点
  onBlur() {
    this.setData({
      footerBottom: 0
    })
  },

  // 选择图片
  onChooseImages(event) {
    let max = MAX_IMAGES_COUNT - this.data.images.length
    wx.chooseImage({
      count: max,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          images: this.data.images.concat(res.tempFilePaths),
          photoSelectShow: (max - res.tempFilePaths.length) > 0
        })
      }
    })
  },

  // 预览图片
  onPreviewImage(event) {
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgsrc
    })
  },

  // 删除已选择图片
  onPhotoDel(event) {
    let imageIndex = event.target.dataset.index
    let images = this.data.images
    images.splice(imageIndex, 1)
    this.setData({
      images
    })
    // 判断图片选择元素的显示
    if (images.length < MAX_IMAGES_COUNT) {
      this.setData({
        photoSelectShow: true
      })
    }
  },

  // 设置图片显示间隙
  setImageMargin() {
    const screenWidth = app.getScreenWidth()
    const rpx = app.getRpx() // 1rpx的像素（px）大小
    // 25rpx 为图片区域总的左右边距，220rpx 为图片宽高，一排3张
    // marginSpace 为计算所得到图片间隙宽度，一排3张，中间两个间隙，所以还要除以2
    const marginSpace = (screenWidth - rpx * 25 * 2 - rpx * 220 * 3) / rpx / 2
    this.setData({
      marginSpace
    })
  },

  // 发布
  send() {
    // 1、图片 -> 云存储 -> fieldID
    // 2、数据库：openid、内容、fieldID、昵称、头像、发布时间

    if (content.trim() === '') {
      wx.showModal({
        title: '提示',
        content: '分享内容为空，请说点什么吧~',
        showCancel: false
      })
      return
    }

    wx.showLoading({
      title: '发布中',
      mask: true
    })

    // 图片上传
    const images = this.data.images
    let promiseArr = []
    let fieldIds = []
    for (let i = 0, len = images.length; i < len; i++) {
      let item = images[i]
      // 文件扩展名
      const suffix = /\.\w+$/.exec(item)[0]
      let p = new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + i + suffix,
          filePath: item,
          success: (res) => {
            // console.log(res)
            fieldIds = fieldIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            // console.log(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
    }
    // 数据存入云数据库
    Promise.all(promiseArr).then((res) => {
      db.collection('blog').add({
        data: {
          ...userInfo,
          content,
          like: [],
          images: fieldIds,
          createtime: db.serverDate() // 服务端时间
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功'
        })
        // 返回blog首页，并刷新
        wx.navigateBack()
        const pages = getCurrentPages()
        // console.log(pages)
        // 取到上一个页面
        const prevPage = pages[0]
        prevPage.onPullDownRefresh()
      })
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '发布失败'
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userInfo = options
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 设置图片显示间隙
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