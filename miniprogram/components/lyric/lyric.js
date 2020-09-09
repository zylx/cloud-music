// components/lyric/lyric.js
let lyricHeight = 0 // 当前歌词行高px
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showLyric: {
      type: Boolean,
      default: false
    },
    lyric: String
  },

  observers: {
    lyric(lrc) {
      if (lrc === '暂无歌词') {
        this.setData({
          lrcList: [{
            lrc,
            time: 0
          }],
          nowLyricIndex: -1
        })
      } else {
        this._parseLyric(lrc)
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lrcList: [],
    nowLyricIndex: -1, // 当前高亮的歌词索引
    scrollTop: 0, // 滚动条高度
  },

  lifetimes: {
    ready() {
      wx.getSystemInfo({
        success(res) {
          let rpx = res.screenWidth / 750 // 1rpx的像素（px）大小
          lyricHeight = rpx * 64 // 歌词的高度为 64rpx
        },
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime) {
      const lrcList = this.data.lrcList
      if (lrcList.length === 0) {
        return
      }
      if (currentTime > lrcList[lrcList.length - 1].time) {
        if (this.data.nowLyricIndex !== -1) {
          this.setData({
            nowLyricIndex: -1,
            scrollTop: lrcList.length * lyricHeight
          })
        }
      }
      for (let i = 0, len = lrcList.length; i < len; i++) {
        if (currentTime <= lrcList[i].time) {
          this.setData({
            nowLyricIndex: i - 1,
            scrollTop: (i - 1) * lyricHeight
          })
          break
        }
      }
    },
    _parseLyric(sLyric) {
      const line = sLyric.split('\n')
      if (line.length > 0) {
        let _lrcList = []
        line.forEach((item) => {
          let time = item.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
          if (time !== null) {
            let lrc = item.split(time)[1]
            let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
            // 把时间转化成秒
            let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
            _lrcList.push({
              lrc,
              time: time2Seconds
            })
            this.setData({
              lrcList: _lrcList
            })
          }
        })
      }
    }
  }
})