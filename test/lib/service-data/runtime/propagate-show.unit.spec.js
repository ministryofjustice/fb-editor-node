require('@ministryofjustice/module-alias/register')

const chai = require('chai')

const {
  expect
} = chai

const {
  propagate
} = require('~/fb-editor-node/lib/service-data/runtime/propagate-show')

const mockInstances = require('~/fb-editor-node/mock/service-data/runtime/propagate')
const mockExpectedInstances = require('./propagate')

describe('~/fb-editor-node/lib/service-data/runtime/propagate-show', () => {
  describe('Always', () => {
    describe('`propagate`', () => {
      it('is a function', () => {
        expect(propagate).to.be.a('function')
      })
    })
  })

  describe('`propagate()`', () => {
    it('Propagates the `show` properties to the instances', () => {
      expect(propagate(mockInstances))
        .to.eql(mockExpectedInstances)
    })
  })
})
