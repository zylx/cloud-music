// pages/player/index.js
let musiclist = []
let nowPlayingIndex = 0
// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false, //是否正在播放
    showLyric: false, //是否显示歌词
    isSameSong: false, //是否是同一首歌
    lyric: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    nowPlayingIndex = options.index
    musiclist = wx.getStorageSync('musiclist')
    this._loadMusicDetail(options.musicId)
  },

  _loadMusicDetail(musicId) {
    let isSameSong = (musicId == app.getPlayingMusicId()) ? true : false
    this.setData({
      isSameSong
    })
    if (!isSameSong) {
      backgroundAudioManager.stop() // 每次加载先停止上一首
    }
    let music = musiclist[nowPlayingIndex]
    wx.setNavigationBarTitle({
      title: music.name
    })
    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })

    // 设置全局的正在播放中的歌曲ID
    app.setPlayingMusicId(musicId)

    // 请求歌曲信息
    wx.showLoading({
      title: '歌曲加载中'
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'musicUrl'
      }
    }).then((res) => {
      const result = res.result
      if (result.data[0].url == null) {
        wx.showToast({
          title: '无权限播放',
        })
        return
      }
      if (!isSameSong) {
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name

        // 保存播放记录到缓存
        this.setPlayHistory()
      }
    })
    this.setData({
      isPlaying: true
    })
    wx.hideLoading()

    // 加载歌词
    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'lyric'
      }
    }).then((res) => {
      let lyric = '暂无歌词'
      const lrc = res.result.lrc
      if (lrc) {
        lyric = lrc.lyric
      }
      this.setData({
        lyric
      })
    })
  },

  // 保存播放历史
  setPlayHistory() {
    const playingMusic = musiclist[nowPlayingIndex]
    const openid = app.globalData.openid
    let playHistorylist = wx.getStorageSync(openid)
    let bHave = false
    for (let i = 0, len = playHistorylist.length; i < len; i++) {
      if (playHistorylist[i].id === playingMusic.id) {
        bHave = true
        break;
      }
    }
    if (!bHave) {
      playHistorylist.unshift(playingMusic)
      wx.setStorage({
        key: openid,
        data: playHistorylist
      })
    }
  },

  // 播放/暂停
  togglePlaying() {
    if (this.data.isPlaying) { // 正在播放
      backgroundAudioManager.pause()
    } else {
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },

  // 上一首
  onPrev() {
    nowPlayingIndex--
    if (nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },

  // 下一首
  onNext() {
    nowPlayingIndex++
    if (nowPlayingIndex === musiclist.length) {
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },

  // 显示/隐藏歌词
  onShowLyric() {
    this.setData({
      showLyric: !this.data.showLyric
    })
  },

  timeUpdate(event) {
    this.selectComponent('#lyric').update(event.detail.currentTime)
  },

  // 小程序控制面板联动播放页面播放或暂停
  onPlay() {
    this.setData({
      isPlaying: true
    })
  },

  onPause() {
    this.setData({
      isPlaying: false
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