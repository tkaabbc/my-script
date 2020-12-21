/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')

const en = require('./en')
const zh = require('./zh')
const both = require('./both')
// 1.输入要拷贝的双语字段,用,号分割
// 2.拿到字段处理好放到数组中
// 3.遍历四个原始文件，返回匹配的数据
// 4.将数据写入目标文件
const main = () => {
  // console.log(en)
  const enObj = {}
  const zhObj = {}
  console.log(process.argv[2]);
  originKeyArr = process.argv[2].split(',')
  originKeyArr.forEach(key => {
    if (!key) {
      return
    }
    console.log(key)
    const zhVal = zh[key] || both.zhLocaleMessage[key]
    const enVal = en[key] || both.enLocaleMessage[key]
    enObj[key] = enVal
    zhObj[key] = zhVal
  })
  let target = 'giftcardPack'
  console.log(originKeyArr)
  
  // const zhPath = '/Users/shao/Desktop/zaihui-dev/storehome-mp/src/i18n/locales/zh.js'
  // const enPath = '/Users/shao/Desktop/zaihui-dev/storehome-mp/src/i18n/locales/en.js'
  // const bothPath = '/Users/shao/Desktop/zaihui-dev/storehome-mp/src/i18n/i18n.wxs'
  const writedPath = '/Users/wtk/Desktop/my-dev/node脚本/my-script/onePiece.ts'
  try {
    const data = fs.readFileSync(writedPath, 'utf8')
    const cnFix = '},'

    let arr = data.split('\n') 
    console.log(arr)

    let enBeginIndex = 0
    let zhBeginIndex = 0

    arr.forEach((item, i) => {
      if (item.indexOf(cnFix) > -1 && !enBeginIndex) {
        enBeginIndex = i
        return
      }
      if (item.indexOf(cnFix) > -1 && !zhBeginIndex) {
        zhBeginIndex = i
      }
    })

    const enKeyArr = Object.keys(enObj)
    const zhKeyArr = Object.keys(zhObj)
    
    const enResTpl = enKeyArr.map(key => getTpl(key, enObj[key]))
    const zhResTpl = zhKeyArr.map(key => getTpl(key, zhObj[key]))
    
    arr.splice.apply(arr, [enBeginIndex, 0, ...enResTpl])
    arr.splice.apply(arr, [zhBeginIndex + enResTpl.length, 0, ...zhResTpl])
    console.log(arr)

    const EXPORTED_PATH = 'onePiece.ts'
    fs.writeFileSync(
      path.join(process.cwd(), EXPORTED_PATH),
      `${arr.join('\n')}\n`,
    )

    // console.log(arr)
    // process.stdout.write(data)
  } catch (err) {
    console.error(err)
  }
}

function getTpl(key, val) {
    return `    ${key}: '${val}',`
}

main()