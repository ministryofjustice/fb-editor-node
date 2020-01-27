require('@ministryofjustice/module-alias/register')

const chai = require('chai')

const {
  expect
} = chai

const {
  getUrlMatch,
  isUploadComponent,
  isUploadSummaryPage,
  isUploadCheckPage
} = require('~/fb-editor-node/lib/admin/common/components/upload')

describe('~/fb-editor-node/lib/admin/common/components/upload', () => {
  it('exports `getUrlMatch`', () => expect(getUrlMatch).to.be.a('function'))
  it('exports `isUploadComponent`', () => expect(isUploadComponent).to.be.a('function'))
  it('exports `isUploadCheckPage`', () => expect(isUploadCheckPage).to.be.a('function'))
  it('exports `isUploadSummaryPage`', () => expect(isUploadSummaryPage).to.be.a('function'))

  describe('`getUrlMatch()`', () => it('returns a string', () => expect(getUrlMatch('/url-pattern')).to.equal('url-pattern')))

  describe('`isUploadComponent()`', () => {
    describe('The component is an Upload component', () => it('returns true', () => expect(isUploadComponent({ _type: 'upload' }))))

    describe('The component is not an Upload component', () => it('returns false', () => expect(isUploadComponent({ _type: 'mock component type' }))))
  })

  describe('`isUploadCheckPage()`', () => {
    describe('The page is an Upload Check page', () => it('returns true', () => expect(isUploadCheckPage({ _type: 'page.uploadCheck' }))))

    describe('The page is not an Upload Check page', () => it('returns false', () => expect(isUploadCheckPage({ _type: 'mock page type' }))))
  })

  describe('`isUploadSummaryPage()`', () => {
    describe('The page is an Upload Summary page', () => it('returns true', () => expect(isUploadSummaryPage({ _type: 'page.uploadSummary' }))))

    describe('The page is not an Upload Summary page', () => it('returns false', () => expect(isUploadSummaryPage({ _type: 'mock page type' }))))
  })
})
