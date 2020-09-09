// 云函数入口文件
const cloud = require('wx-server-sdk')

const TcbRouter = require('tcb-router')

const rp = require('request-promise')

const BASE_URL = 'http://musicapi.leanapp.cn'

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.use('playlist', async (ctx, next) => {
    ctx.body = await cloud.database().collection('playlist')
      .skip(event.start)
      .limit(event.count)
      .orderBy('createTime', 'desc')
      .get()
      .then((res) => {
        return res
      })
  })

  app.use('musiclist', async (ctx, next) => {
    ctx.body = await rp(BASE_URL + '/playlist/detail?id=' + parseInt(event.playlistId))
      .then((res) => {
        return JSON.parse(res)
      })
  })

  app.use('musicUrl', async (ctx, next) => {
    ctx.body = await rp(`${BASE_URL}/music/url?id=${event.musicId}`)
      .then((res) => {
        return JSON.parse(res)
      })
  })

  app.use('lyric', async (ctx, next) => {
    // ctx.body = await rp(`${BASE_URL}/lyric?id=${event.musicId}`)
    ctx.body = await rp(`http://music.163.com/api/song/lyric?lv=1&kv=1&tv=-1&id=${event.musicId}`)
      .then((res) => {
        return JSON.parse(res)
      })
  })

  return app.serve()

}