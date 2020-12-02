// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const {
    OPENID
  } = cloud.getWXContext()
  return await cloud.openapi.subscribeMessage.send({
    touser: OPENID,
    page: `/pages/blog-detail/blog-detail?blogId=${event.blogId}`,
    data: {
      thing2: {
        value: event.content
      },
      time1: {
        value: new Date()
      },
      templateId: event.templateId
    }
  })
}