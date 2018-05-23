const async = require('async')
const osmosis = require('osmosis')
const jsonfile = require('jsonfile')

const baiduUrl = ({ keyword, limit = 50, skip = 0 }) => `http://news.baidu.com/ns?word=title%3A%28${encodeURIComponent(keyword)}%29&pn=${skip}&cl=2&ct=0&tn=newstitle&rn=50&ie=utf-8&bt=0&et=0&rsv_page=1`
const baseUrl = baiduUrl({ keyword: '黄渤' })

const file = './dataset.json'

osmosis
  .get(baseUrl)
  .find('#header_top_bar .nums')
  .set('total')
  .data(({ total }) => {
    total = parseInt(total.replace(/\W/g, ''))
    const queues = []
    for (let skip = 0; skip <= 200; skip += 50) {
      queues.push(cb => {
        setTimeout(() => {
          console.log('fetching', skip)
          const url = baiduUrl({ keyword: '黄渤', skip })
          osmosis
            .get(url)
            .set([osmosis.find('#content_left .result.title').set({
              title: '.c-title',
              meta: '.c-title-author'
            })])
            .data(set => {
              if (set.length)
              console.log('done', url)
              cb(null, set)
            })
            .error(err => {
              console.log(err)
            })
        }, 500)
      })

    }
    async.series(queues, (err, result) => {
      err && console.log(err)
      jsonfile.writeFile(file, result, { spaces: 2 }, err => {
        err && console.log(err)
        console.log('done')
      })
    })
  })

