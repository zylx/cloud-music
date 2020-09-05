// 云函数入口文件
const cloud = require('wx-server-sdk')

const rp = require('request-promise')

const URL = 'http://musicapi.leanapp.cn/personalized'

cloud.init()

const db = cloud.database()
const dbCollection = db.collection('playlist')
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  // const dbPlaylist = await dbCollection.get()
  // 突破云函数每次只能获取100限制
  const {
    total
  } = await dbCollection.count()
  console.log('total: ', total)
  const batchTimes = Math.ceil(total / MAX_LIMIT) || 1
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    let promise = await dbCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  
  let dbPlaylist = {
    data: []
  }
  if (tasks.length > 0) {
    dbPlaylist = (await Promise.all(tasks)).reduce((pre, cur) => {
      return {
        data: pre.data.concat(cur.data)
      }
    })
  }
  // console.log('dbPlaylist: ', dbPlaylist)

  const playlist = await rp(URL).then((res) => {
    return JSON.parse(res).result
  })
  // console.log(playlist)

  // 歌单去重处理
  const newPlaylist = []
  for (let i = 0; i < playlist.length; i++) {
    let flag = true
    if (dbPlaylist.data.length) {
      for (let j = 0; j < dbPlaylist.data.length; j++) {
        if (playlist[i].id === dbPlaylist.data[j].id) {
          flag = false
          break
        }
      }
    }
    if (flag) {
      newPlaylist.push(playlist[i])
    }
  }

  for (let i = 0, len = newPlaylist.length; i < len; i++) {
    await dbCollection.add({
      data: {
        ...newPlaylist[i],
        createTime: db.serverDate()
      }
    }).then((res) => {
      console.log('插入成功')
    }).catch((err) => {
      console.error('插入失败')
    })
  }
  return newPlaylist.length
}