const getUrlFromPageData = ({
  pagesMethods: {
    getUrl = () => '/admin'
  } = {}
} = {}) => getUrl

module.exports = {
  getUrlFromPageData
}
