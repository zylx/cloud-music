// components/bottom-modal/bottom-modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showModal: Boolean
  },

  options: {
    styleIsolation: 'apply-shared',
    multipleSlots: true // 启用多个插槽
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 关闭底部弹出层
    onClose() {
      this.setData({
        showModal: false
      })
    }
  }
})