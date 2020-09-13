// components/playlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    playlist: {
      type: Object
    },
    marginSpace: { // 歌单图片之间的间隙大小
      type: Number,
      value: 10
    },
    playIndex: Number // 歌单序号，当 playIndex % 3 === 2 时，说明是一行中最右边图片，margin-right 不加 marginSpace，而是设置为0
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  /**
   * 监听播放数量并转化数字格式
   */
  observers: {
    ['playlist.playCount'](count) {
      this.setData({
        _count: this._transNumber(count, 2)
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goToMusiclist() {
      wx.navigateTo({
        url: `../../pages/musiclist/index?playlistId=${this.properties.playlist.id}`
      })
    },
    _transNumber(num, point) {
      // let numStr = num.toString().split('.')[0]
      // let len = numStr.length
      // if (len >= 6 && len <= 8) {
      //   let decimal = numStr.substring(len - 4, len - 4 + point)
      //   numStr = parseFloat(parseInt(numStr / 10000) + '.' + decimal) + '万'
      // } else if (len > 8) {
      //   let decimal = numStr.substring(len - 8, len - 8 + point)
      //   numStr = parseFloat(parseInt(numStr / 100000000) + '.' + decimal) + '亿'
      // }
      // return numStr
      let numVal = parseInt(num)
      if (numVal >= 100000 && numVal <= 100000000) {
        numVal = (numVal / 10000).toFixed(point) + '万'
      } else if (numVal > 100000000) {
        numVal = (numVal / 100000000).toFixed(point) + '亿'
      }
      return numVal
    }
  }
})