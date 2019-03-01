const fs = require('fs')
const path = require('path')

const createString = (arr) => {
  let str = ''
  arr.forEach(e => {
    if (typeof e === 'object') {
      return str = str.concat(`${e.join(' ')} \n`)
    }
    str = str.concat(`${e} \n`)
  })
  return str
}

const processFile = url => {
    const ext = path.extname(url)
    const filename = path.basename(url, ext)
    const fd = fs.readFileSync(url, 'utf8')
    const [config, ...data] = fd.split('\n')
    let matrix = data.map(e => e.split(' ')).map((e, i) => ({
      orientation: e[0],
      numOfTags: e[1],
      id: i,
      tags: e.slice(2)
    }))
    matrix = matrix.slice(0, matrix.length - 1)

    const dataForAnalytics = {
      orientation: {
        'H': [],
        'V': []
      },
      tags: {},
      photos: []
    }

    matrix.forEach(item => {
      const {orientation, numOfTags, id, tags} = item
      if (orientation === 'H') {
        dataForAnalytics.orientation.H.push(id)
      } else {
        dataForAnalytics.orientation.V.push(id)
      }

      tags.forEach(tag => {
        if (dataForAnalytics.tags[tag]) {
          dataForAnalytics.tags[tag].push(id)
        } else {
          dataForAnalytics.tags[tag] = [id]
        }
      })

      dataForAnalytics.photos[id] = item
    })

    const uniqueTags = Object.keys(dataForAnalytics.tags)
    
    let slidesCount = 0
    let results = []

    function loopThroughTag(tag, photoId) {
      if (!results.length) {
        slidesCount++
        results.push(photoId)
        deleteCurrentPhotoFromTags(photoId)
      }
      for (let i = 0; i < dataForAnalytics.tags[tag].length; i++) {
        const item = dataForAnalytics.tags[tag][i]
        if (item !== photoId) {
          if (dataForAnalytics.photos[item].tags.length > 1) {
            const photo = dataForAnalytics.photos[item]
            if (photo.orientation === 'H') {
              slidesCount++
              results.push(photo.id)
              dataForAnalytics.photos[item].tags.forEach(t => {
                if (t !== tag) {
                  if (dataForAnalytics.tags[t].length > 1) {
                    const requiredId = dataForAnalytics.tags[t].find(id => id !== photoId)
                    deleteCurrentPhotoFromTags(photo.id)
                    loopThroughTag(t, item)
                  }
                }
              })
            } else {
              dataForAnalytics.photos[item].tags.forEach(t => {
                dataForAnalytics.tags[t].forEach(id => {
                  if (id !== photo.id && id !== photoId) {
                    if (dataForAnalytics.photos[id].orientation === 'H') {
                      slidesCount++
                      results.push(photo.id)
                      dataForAnalytics.photos[item].tags.forEach(t => {
                        if (t !== tag) {
                          if (dataForAnalytics.tags[t].length > 1) {
                            const requiredId = dataForAnalytics.tags[t].find(id => id !== photoId)
                            deleteCurrentPhotoFromTags(photo.id)
                            loopThroughTag(t, item)
                          }
                        }
                      })
                    } else {
                      slidesCount++
                      results.push([id, photo.id])
                      deleteCurrentPhotoFromTags(id)
                      deleteCurrentPhotoFromTags(photo.id)
                      loopThroughTag(t, item)
                    }
                  }
                })
              })
            }
          }
        }
      }
    }

    function deleteCurrentPhotoFromTags (photoId) {
      dataForAnalytics.photos[photoId].tags.forEach(tag => {
        dataForAnalytics.tags[tag] = dataForAnalytics.tags[tag].filter(id => id !== photoId)
      })
    }

    loopThroughTag(uniqueTags[0], 1)

    let outputFile = [slidesCount]
    outputFile = [...outputFile, ...results]
    fs.writeFileSync(`${filename}${ext}`, createString(outputFile))
}

// processFile('./assets/a_example.txt')
// processFile('./assets/b_lovely_landscapes.txt')
processFile('./assets/c_memorable_moments.txt')
// processFile('./assets/d_pet_pictures.txt')
// processFile('./assets/e_shiny_selfies.txt')
