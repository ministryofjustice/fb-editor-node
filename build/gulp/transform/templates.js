const glob = require('glob-all')

const {
  readFile,
  writeFile
} = require('sacred-fs')

const {version} = require('~/fb-editor-node/package')

const JAVASCRIPTS = /(assets\/javascripts\/.*-)\d+\.\d+\.\d+(.js)/g
const STYLESHEETS = /(assets\/stylesheets\/.*-)\d+\.\d+\.\d+(.css)/g

const getFileData = async (filePath) => readFile(filePath, 'utf8')
const setFileData = async (filePath, fileData) => writeFile(filePath, fileData, 'utf8')

const getFilePathList = () => new Promise((resolve, reject) => glob(['./templates/**/*/*.njk', './templates/**/*/*.html'], (e, a) => !e ? resolve(a) : reject(e)))
const setFilePathList = (filePathList) => Promise.all(filePathList.map(async (filePath) => setFileData(filePath, (await getFileData(filePath)).replace(JAVASCRIPTS, `$1${version}$2`).replace(STYLESHEETS, `$1${version}$2`))))

async function transform () {
  const filePathList = await getFilePathList()
  await setFilePathList(filePathList)
}

module.exports = transform
