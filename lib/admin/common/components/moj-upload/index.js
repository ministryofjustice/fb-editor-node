const getUrlMatch = (url) => {
  const [
    ,
    urlMatch = 'mojUpload'
  ] = url.match(/\/(.*)/) || []

  return urlMatch
}

const isMOJUploadComponent = ({_type}) => _type === 'mojUpload'
const isMOJUploadSummaryPage = ({_type}) => _type === 'page.mojUploadSummary'
const isMOJUploadConfirmationPage = ({_type}) => _type === 'page.mojUploadConfirmation'

module.exports = {
  getUrlMatch,
  isMOJUploadComponent,
  isMOJUploadSummaryPage,
  isMOJUploadConfirmationPage
}
