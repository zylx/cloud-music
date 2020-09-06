// components/musiclist/musiclist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: {
      type: Array,
      default: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event) {
      const ds = event.currentTarget.dataset
      const musicId = ds.musicid
      this.setData({
        playingId: musicId
      })
    }
  }
})