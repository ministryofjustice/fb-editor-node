require('@ministryofjustice/module-alias/register')

const chai = require('chai')

const {
  expect
} = chai

const {
  getEntryPointKeys,
  getEntryPointInstances
} = require('~/fb-editor-node/lib/service-data/runtime/entry-points')

const mockEntryPointOne = {
  _id: 'entry-point-one',
  _type: 'page.start',
  steps: [
    'step-one',
    'step-two'
  ]
}

const mockEntryPointTwo = {
  _id: 'entry-point-two',
  _type: 'page.content'
}

const mockSteps = {
  'entry-point-one': mockEntryPointOne,
  'step-one': {
    _id: 'step-one',
    _type: 'page.singlequestion',
    steps: [
      'step-three'
    ]
  },
  'step-two': {
    _id: 'step-two',
    _type: 'page.form'
  },
  'step-three': {
    _id: 'step-three',
    _type: 'page.content'
  },
  'entry-point-two': mockEntryPointTwo
}

describe('~/fb-editor-node/lib/service-data/runtime/entry-points', () => {
  describe('Always', () => {
    describe('`getEntryPointKeys`', () => {
      it('is a function', () => {
        expect(getEntryPointKeys).to.be.a('function')
      })
    })

    describe('`getEntryPointInstances`', () => {
      it('is a function', () => {
        expect(getEntryPointInstances).to.be.a('function')
      })
    })
  })

  describe('`getEntryPointKeys()`', () => {
    it('returns an array of strings (keys for instances which are not a step of other instances)', () => {
      expect(getEntryPointKeys(mockSteps))
        .to.eql(['entry-point-one', 'entry-point-two'])
    })
  })

  describe('`getEntryPointInstances()`', () => {
    it('returns an object', () => {
      expect(getEntryPointInstances(mockSteps))
        .to.eql({'entry-point-one': mockEntryPointOne, 'entry-point-two': mockEntryPointTwo})
    })
  })
})
