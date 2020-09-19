// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const {
    OPENID
  } = cloud.getWXContext()

  const result = await cloud.openapi.wxacode.getUnlimited({
    scene: OPENID,
    // page: "pages/blog/blog"
    lineColor: {
      'r': 52,
      'g': 52,
      'b': 52
    },
    // isHyaline: true
  })
  // console.log(result)
  const upload = await cloud.uploadFile({
    cloudPath: 'qrcode/' + OPENID + '.png',
    fileContent: result.buffer
  })
  return upload
}