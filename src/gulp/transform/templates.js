require('@ministryofjustice/module-alias/register')

const gulp = require('gulp-all')

const {
  readFile,
  writeFile
} = require('sacred-fs')

const {version} = require('~/package')

const JAVASCRIPTS = /(assets\/javascripts\/.*-)\d+\.\d+\.\d+(.js)/
const STYLESHEETS = /(assets\/stylesheets\/.*-)\d+\.\d+\.\d+(.css)/

const getFileData = async (filePath) => readFile(filePath, 'utf8')
const setFileData = async (filePath, fileData) => writeFile(filePath, fileData, 'utf8')

const getFilePathList = () => new Promise((resolve, reject) => gulp('./templates/**/*/*.html', (e, a) => !e ? resolve(a) : reject(e)))
const setFilePathList = (filePathList) => Promise.all(filePathList.map(async (filePath) => setFileData(filePath, (await getFileData(filePath)).replace(JAVASCRIPTS, `$1${version}$2`).replace(STYLESHEETS, `$1${version}$2`))))

module.exports = async function transform () {
  const filePathList = await getFilePathList()
  await setFilePathList(filePathList)
}
