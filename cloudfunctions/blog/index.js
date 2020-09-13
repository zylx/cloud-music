// 云函数入口文件
const cloud = require('wx-server-sdk')

const TcbRouter = require('tcb-router')

cloud.init()

const db = cloud.database()
const dbCollection = db.collection('blog')

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  // 获取博客列表
  app.use('list', async (ctx, next) => {
    const keyword = event.keyword
    let w = {}
    if (keyword.trim() != '') {
      w = {
        content: new db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      }
    }
    ctx.body = await dbCollection
      .where(w)
      .skip(event.start)
      .limit(event.count)
      .orderBy('createtime', 'desc')
      .get()
      .then((res) => {
        return res.data
      })
  })

  return app.serve()
}