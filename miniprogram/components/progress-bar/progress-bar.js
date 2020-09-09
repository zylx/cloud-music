// components/progress-bar/progress-bar.js
const backgroundAudioManager = wx.getBackgroundAudioManager()
let movableAreaWidth = 0
let movableViewWidth = 0
let currentSec = 0
let duration = 0 // 歌曲时长，单位：s
let isMoving = false // 表示当前进度条是否在拖拽，解决：当进度条拖动时候和updatetime事件有冲突的问题
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00'
    },
    movableDis: 0,
    progress: 0
  },

  lifetimes: {
    ready() {
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event) {
      // 拖动
      if (event.detail.source === 'touch') {
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = event.detail.x
        isMoving = true
      }
    },
    onTouchEnd() {
      const currentTimeFmt = this._timeFotmat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        movableDis: this.data.movableDis,
        progress: this.data.progress,
        'showTime.currentTime': `${currentTimeFmt.min}:${currentTimeFmt.sec}`
      })
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
    },
    _getMovableDis() {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect) => {
        // console.log(rect)
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
        // console.log(movableAreaWidth, movableViewWidth)
      })
    },

    _bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        console.log('onPlay')
        isMoving = false
        this.triggerEvent('musicPlay')
      })

      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })

      backgroundAudioManager.onPause(() => {
        console.log('Pause')
        this.triggerEvent('musicPause')
      })

      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })

      backgroundAudioManager.onCanplay(() => {
        // console.log('onCanplay')
        if (typeof backgroundAudioManager.duration !== 'undefined') {
          this._setTime()
        } else { // 当获取到为 undefined 时，延迟 1000ms 获取
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      })

      backgroundAudioManager.onTimeUpdate(() => {
        // console.log('onTimeUpdate')
        if (!isMoving) {
          const currentTime = backgroundAudioManager.currentTime
          const sec = parseInt(currentTime)
          if (sec !== currentSec) {
            const currentTimeFmt = this._timeFotmat(currentTime)
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              'showTime.currentTime': `${currentTimeFmt.min}:${currentTimeFmt.sec}`
            })
            currentSec = sec
            // 歌词联动
            this.triggerEvent('timeUpdate', {
              currentTime
            })
          }
        }
      })

      backgroundAudioManager.onEnded(() => {
        console.log("onEnded")
        this.triggerEvent('musicEnd') // 触发音乐结束事件，自动播放下一首
      })

      backgroundAudioManager.onError((res) => {
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: '错误:' + res.errCode,
        })
      })
    },

    _setTime() {
      duration = backgroundAudioManager.duration
      const durationFmt = this._timeFotmat(duration)
      this.setData({
        'showTime.totalTime': `${durationFmt.min}:${durationFmt.sec}`
      })
    },

    // 时间格式化
    _timeFotmat(sec) {
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        min: this._parse0(min),
        sec: this._parse0(sec)
      }
    },

    // 补零
    _parse0(sec) {
      return sec < 10 ? '0' + sec : sec
    }
  }
})