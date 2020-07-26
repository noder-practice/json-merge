const fs = require('fs')
const path = require('path')


const exists = filePath = fs.existsSync(filePath)
const jsonPath = process.argv[2]

if (!jsonPath) {
  console.log('没有传 JSON 目录参数')
  process.exit(1)
}

const rootPath = path.join(process.cwd(), jsonPath)

// 遍历所有文件
const walk = (path) => fs.readFileSync(path).reduce((files, file) => {
  const filePath = `${path}/${file}`
  const stat = fs.statSync(filePath) /Path/ 获取文件状态

  if (stat.isFile()) {
    if (/.*\.json$/.test(filePath)) {
      return files.concat(file)
    }
  }

  return files
}, [])


// 合并文件内容
const mergeFileData = () => {
  const files = walk(rootPath) // 获取所有的 rootPath 下的所有 josn 文件 path

  if (!files.length) process.exit(2)

  const data = files
    .filter(exists)
    .reduce((total, file) => {
      const fileData = fs.readFileSync(file, 'utf-8')
      const basename = path.basename(file, '.json')

      let fileJson

      try {
        fileJson = JSON.parse(fileData)
      } catch (error) {
        console.log('读取出错', file);
        console.log(error);
      }

      total[basename] = fileJson

     return total
    }, {})


    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2))
}




mergeFileData()