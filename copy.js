/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const fs = require('fs')

const en = require('./en')
const zh = require('./zh')
const both = require('./both')
const config = require('./config')

// 1.输入要拷贝的双语字段
// 2.拿到字段处理好放到数组中
// 3.遍历四个原始文件，返回匹配的数据
// 4.将数据写入目标文件
const main = () => {
  const inputEnKeyValArr = {}
  const inputZhKeyValArr = {}
  // console.log(process.argv[2]);
  // let inputKeyArr = process.argv[2].split(',')
  let inputKeyArr = config.keys
  const EXPORTED_PATH = config.outPutPath
  const data = fs.readFileSync(EXPORTED_PATH, 'utf8')
  const divider = '},'

  let arr = data.split('\n') 
  
  const existKeys = []
  
  console.log(`\n输入：${inputKeyArr.length}个\n`)
  
  // 把已经存在的翻译给剔除
  inputKeyArr = inputKeyArr.filter(key => {
    const existIndex = arr.findIndex(item => {
      return item.indexOf(getPrefixTpl(key)) > -1
    })
    if (existIndex > -1) {
      existKeys.push(key)
      console.warn('已存在：', key)
      return false
    } else {
      return true
    }
  })

  inputKeyArr.forEach(key => {
    if (!key) {
      return
    }
    const zhVal = zh[key] || both.zhLocaleMessage[key]
    const enVal = en[key] || both.enLocaleMessage[key]
    if (zhVal === undefined || enVal === undefined) {
      throw new Error(`不存在‘${key}’的翻译，请检查`)
    }
    inputEnKeyValArr[key] = enVal
    inputZhKeyValArr[key] = zhVal
  })

  let enBeginIndex = 0
  let zhBeginIndex = 0

  arr.forEach((item, i) => {
    if (item.indexOf(divider) > -1 && !enBeginIndex) {
      enBeginIndex = i
      return
    }
    if (item.indexOf(divider) > -1 && !zhBeginIndex) {
      zhBeginIndex = i
    }
  })

  const enKeyArr = Object.keys(inputEnKeyValArr)
  const zhKeyArr = Object.keys(inputZhKeyValArr)
  
  const enResTpl = enKeyArr.map(key => getTpl(key, inputEnKeyValArr[key]))
  const zhResTpl = zhKeyArr.map(key => getTpl(key, inputZhKeyValArr[key]))
  
  arr.splice.apply(arr, [enBeginIndex, 0, ...enResTpl])
  arr.splice.apply(arr, [zhBeginIndex + enResTpl.length, 0, ...zhResTpl])

  fs.writeFileSync(
    EXPORTED_PATH,
    `${arr.join('\n')}`,
  )
  console.log(`\n新增：${enKeyArr.length}个\n`, enKeyArr.join('\n '))
}

// 输出模版
function getTpl(key, val) {
  if (val.indexOf("'") > -1) {
    return `    ${key}: "${val}",`
  } else {
    return `    ${key}: '${val}',`
  }
}

// 根据前缀判断输出文件中是否已经存在相同key
function getPrefixTpl(key) {
    return `    ${key}:`
}

main()
