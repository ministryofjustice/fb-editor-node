require('@ministryofjustice/module-alias/register')

const chai = require('chai')

const {
  expect
} = chai

const {
  getUrlMatch,
  isMOJUploadComponent,
  isMOJUploadSummaryPage,
  isMOJUploadConfirmationPage
} = require('~/fb-editor-node/admin/common/components/moj-upload')

describe('~/fb-editor-node/admin/common/components/moj-upload', () => {
  it('exports `getUrlMatch`', () => expect(getUrlMatch).to.be.a('function'))
  it('exports `isMOJUploadComponent`', () => expect(isMOJUploadComponent).to.be.a('function'))
  it('exports `isMOJUploadSummaryPage`', () => expect(isMOJUploadSummaryPage).to.be.a('function'))
  it('exports `isMOJUploadConfirmationPage`', () => expect(isMOJUploadConfirmationPage).to.be.a('function'))

  describe('`getUrlMatch()`', () => it('returns a string', () => expect(getUrlMatch('/url-pattern')).to.equal('url-pattern')))

  describe('`isMOJUploadComponent()`', () => {
    describe('The component is a MOJ Upload component', () => it('returns true', () => expect(isMOJUploadComponent({_type: 'mojUpload'}))))

    describe('The component is not a MOJ Upload component', () => it('returns false', () => expect(isMOJUploadComponent({_type: 'mock component type'}))))
  })

  describe('`isMOJUploadSummaryPage()`', () => {
    describe('The page is a MOJ Upload Summary page', () => it('returns true', () => expect(isMOJUploadSummaryPage({_type: 'page.mojUploadSummary'}))))

    describe('The page is not a MOJ Upload Summary page', () => it('returns false', () => expect(isMOJUploadSummaryPage({_type: 'mock page type'}))))
  })

  describe('`isMOJUploadConfirmationPage()`', () => {
    describe('The page is a MOJ Upload Confirmation page', () => it('returns true', () => expect(isMOJUploadConfirmationPage({_type: 'page.mojUploadConfirmation'}))))

    describe('The page is not a MOJ Upload Confirmation page', () => it('returns false', () => expect(isMOJUploadConfirmationPage({_type: 'mock page type'}))))
  })
})
