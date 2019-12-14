const getUrlMatch = (url) => {
  const [
    ,
    urlMatch = 'upload'
  ] = url.match(/\/(.*)/) || []

  return urlMatch
}

const isUploadComponent = ({_type}) => _type === 'upload'
const isUploadCheckPage = ({_type}) => _type === 'page.uploadCheck'
const isUploadSummaryPage = ({_type}) => _type === 'page.uploadSummary'
const isEntryPointStep = (step) => ({steps = []}) => steps.includes(step)

module.exports = {
  getUrlMatch,
  isUploadComponent,
  isUploadCheckPage,
  isUploadSummaryPage,
  isEntryPointStep
}
