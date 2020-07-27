const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const readFile = promisify(fs.readFile)
const write = promisify(fs.write)
const close = promisify(fs.close)
const open = promisify(fs.open)

const handlerFileData = async filePath => {
  const fileData = await readFile(filePath, 'utf-8')
  const name = path.basename(filePath, '.json')

  let data

  try {
    data = JSON.parse(fileData)
  } catch (error) {
    console.log('读取出错', file);
    console.log(error);
  }

  return {
    data,
    name
  }
}

const exists = filePath => fs.existsSync(filePath)
const jsonPath = process.argv[2]
const parallel = process.argv[3] || 2

if (!jsonPath) {
  console.log('没有传 JSON 目录参数')
  process.exit(1)
}

const rootPath = path.join(process.cwd(), jsonPath)

// 遍历所有文件
const walk = (path) => fs.readdirSync(path).reduce((files, file) => {
  const filePath = `${path}/${file}`
  const stat = fs.statSync(filePath) // 获取文件状态

  if (stat.isFile()) {
    if (/.*\.json$/.test(filePath)) {
      return files.concat(filePath)
    }
  }

  return files
}, [])

// 合并文件内容
const mergeFileData = async (files) => {
  const fileDatas = await Promise.all(files.map(handlerFileData))

  return fileDatas.reduce((total, { name, data }) => {

    total[name] = data

    return total
  }, {})
}

const run = async () => {
  const files = walk(rootPath) // 获取所有的 rootPath 下的所有 josn 文件 path

  if (!files.length) process.exit(2)

  const validFiles = files.filter(exists)

  const fd = await open('./data.json', 'w+')

  const mergeLength = Math.ceil(validFiles.length / parallel)

  const data = {}

  for (let i = 0; i < mergeLength; i++) {

    try {
      const parallelData = await mergeFileData(validFiles.slice(parallel * i, parallel * (i + 1)))

      Object.assign(data, parallelData)

    } catch (error) {
      // 出错就直接保存
      await write(fd, JSON.stringify(data, null, 2)).then(() => close(fd))

      console.log(error);
    }
    
  }

  await write(fd, JSON.stringify(data, null, 2))


  close(fd)
}


run()