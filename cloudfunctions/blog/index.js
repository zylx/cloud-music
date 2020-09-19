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

  const {
    OPENID
  } = cloud.getWXContext()

  // 获取博客列表
  app.router('list', async (ctx, next) => {
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
    // ctx.body = await dbCollection
    //   .where(w)
    //   .skip(event.start)
    //   .limit(event.count)
    //   .orderBy('createtime', 'desc')
    //   .get()
    //   .then((res) => {
    //     return res.data
    //   })
    ctx.body = await dbCollection
      .aggregate()
      .lookup({
        from: 'blog-comment',
        localField: '_id',
        foreignField: 'blogId',
        as: 'commentList',
      })
      .match(w)
      .skip(event.start)
      .limit(event.count)
      .sort({
        createtime: -1
      })
      .end()
      .then((res) => {
        let blogList = res.list || []
        for (let i = 0, len = blogList.length; i < len; i++) {
          blogList[i]['commentCount'] = blogList[i]['commentList'].length
          delete blogList[i]['commentList']
        }
        return blogList
      })
  })

  // 博客详情
  app.router('detail', async (ctx, next) => {
    const blogId = event.blogId
    ctx.body = await dbCollection
      .aggregate()
      .lookup({
        from: 'blog-comment',
        localField: '_id',
        foreignField: 'blogId',
        as: 'commentList',
      })
      .match({
        _id: blogId
      })
      .sort({
        'commentList.createtime': -1
      })
      .end()
      .then((res) => {
        return res.list[0]
      })
  })

  // 喜欢、点赞
  app.router('like', async (ctx, next) => {
    const blogId = event.blogId
    let isLike = false
    let likeList = await dbCollection
      .field({
        like: true
      })
      .where({
        _id: blogId
      })
      .get()
      .then((res) => {
        return res.data[0].like
      })

    const index = likeList.indexOf(OPENID)
    if (index === -1) {
      isLike = true
      likeList = likeList.concat(OPENID)
    } else {
      isLike = false
      likeList.splice(index - 1, 1)
    }

    await dbCollection.where({
      _id: blogId
    }).update({
      data: {
        like: likeList
      },
      success: (res) => {
        console.log(res.data)
      }
    })
    ctx.body = {
      isLike,
      likeCount: likeList.length
    }
  })

  // 获取 我的 博客列表
  app.router('listByOpenid', async (ctx, next) => {
    ctx.body = await dbCollection
      .aggregate()
      .lookup({
        from: 'blog-comment',
        localField: '_id',
        foreignField: 'blogId',
        as: 'commentList',
      })
      .match({
        _openid: OPENID
      })
      .skip(event.start)
      .limit(event.count)
      .sort({
        createtime: -1
      })
      .end()
      .then((res) => {
        let blogList = res.list || []
        for (let i = 0, len = blogList.length; i < len; i++) {
          blogList[i]['commentCount'] = blogList[i]['commentList'].length
          delete blogList[i]['commentList']
        }
        return blogList
      })
  })

  return app.serve()
}