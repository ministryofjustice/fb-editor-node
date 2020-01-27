require('@ministryofjustice/module-alias/register')

const proxyquire = require('proxyquire')

const chai = require('chai')

const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const {
  expect
} = chai

chai.use(sinonChai)

const lodashGetStub = sinon.stub()
const getServiceSchemaStub = sinon.stub()

const {
  getUrlFromPageData,
  isArray,
  isObject,
  toBoolean,
  isConditionalBoolean,
  getPropertyKey,
  getSchemaProperties,
  transformValueForComparison,
  transformValueToDataType
} = proxyquire('~/fb-editor-node/lib/admin/common', {
  'lodash.get': lodashGetStub,
  '~/fb-editor-node/lib/service-data/service-data': {
    getServiceSchema: getServiceSchemaStub
  }
})

describe('~/fb-editor-node/lib/admin/common', () => {
  it('exports `getUrlFromPageData`', () => expect(getUrlFromPageData).to.be.a('function'))
  it('exports `isArray`', () => expect(isArray).to.be.a('function'))
  it('exports `isObject`', () => expect(isObject).to.be.a('function'))
  it('exports `toBoolean`', () => expect(toBoolean).to.be.a('function'))
  it('exports `isConditionalBoolean`', () => expect(isConditionalBoolean).to.be.a('function'))
  it('exports `getPropertyKey`', () => expect(getPropertyKey).to.be.a('function'))
  it('exports `getSchemaProperties`', () => expect(getSchemaProperties).to.be.a('function'))
  it('exports `transformValueForComparison`', () => expect(transformValueForComparison).to.be.a('function'))
  it('exports `transformValueToDataType`', () => expect(transformValueToDataType).to.be.a('function'))

  describe('`getUrlFromPageData()`', () => {
    describe('A `getUrl` function is defined', () => {
      it('returns the function', () => {
        const mockGetUrl = () => 'mock get url'

        return expect(getUrlFromPageData({ pagesMethods: { getUrl: mockGetUrl } })).to.equal(mockGetUrl)
      })
    })

    describe('A `getUrl` function is not defined', () => {
      it('returns a default function', () => expect(getUrlFromPageData()).to.be.a('function'))

      describe('`getUrl()`', () => {
        const getUrl = getUrlFromPageData()

        it('returns a default url', () => expect(getUrl()).to.equal('/admin'))
      })
    })
  })

  describe('`isArray()`', () => {
    describe('The argument is an array', () => it('returns true', () => expect(isArray([])).to.be.true))

    describe('The argument is not an array', () => {
      describe('The argument is a string', () => it('returns false', () => expect(isArray('1')).to.be.false))

      describe('The argument is a number', () => it('returns false', () => expect(isArray(1)).to.be.false))

      describe('The argument is an object', () => it('returns false', () => expect(isArray({})).to.be.false))

      describe('The argument is null', () => it('returns false', () => expect(isArray(null)).to.be.false))

      describe('The argument is undefined', () => it('returns false', () => expect(isArray()).to.be.false))
    })
  })

  describe('`isObject()`', () => {
    describe('The argument is an object', () => it('returns true', () => expect(isObject({})).to.be.true))

    describe('The argument is not an object', () => {
      describe('The argument is a string', () => it('returns false', () => expect(isObject('1')).to.be.false))

      describe('The argument is a number', () => it('returns false', () => expect(isObject(1)).to.be.false))

      describe('The argument is an array', () => it('returns false', () => expect(isObject([])).to.be.false))

      describe('The argument is null', () => it('returns false', () => expect(isObject(null)).to.be.false))

      describe('The argument is undefined', () => it('returns false', () => expect(isObject()).to.be.false))
    })
  })

  describe('`toBoolean()`', () => {
    describe('The argument is `true`', () => it('returns true', () => expect(toBoolean('true')).to.be.true))

    describe('The argument is not `true`', () => it('returns false', () => expect(toBoolean('false')).to.be.false))
  })

  describe('`isConditionalBoolean()`', () => {
    beforeEach(() => {
      lodashGetStub.reset()
    })

    describe('A property is defined as a conditional boolean', () => {
      let mockProperties
      let mockProperty

      let returnValue

      beforeEach(() => {
        mockProperties = {}
        mockProperty = 'property'

        lodashGetStub.returns('definition.conditional.boolean')

        returnValue = isConditionalBoolean(mockProperties, mockProperty)
      })

      it('calls `lodash.get()`', () => expect(lodashGetStub).to.be.calledWith(mockProperties, mockProperty.concat('.oneOf[0]._name')))

      it('returns true', () => expect(returnValue).to.be.true)
    })

    describe('A property is not defined as a conditional boolean', () => {
      let mockProperties
      let mockProperty

      let returnValue

      beforeEach(() => {
        mockProperties = {}
        mockProperty = 'property'

        lodashGetStub.returns(null)

        returnValue = isConditionalBoolean(mockProperties, mockProperty)
      })

      it('calls `lodash.get()`', () => expect(lodashGetStub).to.be.calledWith(mockProperties, mockProperty.concat('.oneOf[0]._name')))

      it('returns false', () => expect(returnValue).to.be.false)
    })
  })

  describe('`getPropertyKey()`', () => {
    describe('`parentProperty` and `property` are defined', () => it('returns a string', () => expect(getPropertyKey('parentProperty', 'property')).to.equal('parentProperty.property')))

    describe('`parentProperty` is undefined and `property` is defined', () => it('returns a string', () => expect(getPropertyKey(undefined, 'property')).to.equal('property')))
  })

  describe('`getSchemaProperties()`', () => {
    let mockProperties

    beforeEach(() => {
      mockProperties = {}

      getServiceSchemaStub.returns({ properties: mockProperties })
    })

    afterEach(() => {
      getServiceSchemaStub.reset()
    })

    describe('`componentType` and `parentProperty` are defined', () => {
      let mockParentProperties
      let returnValue

      beforeEach(() => {
        mockParentProperties = {}

        lodashGetStub.returns({ properties: mockParentProperties })

        returnValue = getSchemaProperties('mock component type', 'mock parent.property')
      })

      afterEach(() => {
        lodashGetStub.reset()
      })

      it('calls `lodash.get()`', () => expect(lodashGetStub).to.be.calledWith(mockProperties, 'mock parent.properties.property'))

      it('returns an object', () => expect(returnValue).to.equal(mockParentProperties))
    })

    describe('`componentType` is defined and `parentProperty` is undefined', () => {
      let mockParentProperties
      let returnValue

      beforeEach(() => {
        mockParentProperties = {}

        lodashGetStub.returns({ properties: mockParentProperties })

        returnValue = getSchemaProperties('mock component type')
      })

      afterEach(() => {
        lodashGetStub.reset()
      })

      it('does not call `lodash.get()`', () => expect(lodashGetStub).not.to.be.called)

      it('returns an object', () => expect(returnValue).to.equal(mockProperties))
    })
  })

  describe('`transformValueForComparison()`', () => {
    describe('The argument is an array', () => it('serializes to JSON', () => expect(transformValueForComparison([1, 2, 3])).to.equal('[1,2,3]')))

    describe('The argument is an object', () => it('serializes to JSON', () => expect(transformValueForComparison({ a: 1, b: 2, c: 3 })).to.equal('{"a":1,"b":2,"c":3}')))

    describe('The argument is a number', () => it('is transformed to a string', () => expect(transformValueForComparison(1)).to.equal('1')))

    describe('The argument is a boolean', () => it('is transformed to a string', () => expect(transformValueForComparison(true)).to.equal('true')))

    describe('The argument is null', () => it('is transformed to a string', () => expect(transformValueForComparison(null)).to.equal('null')))

    describe('The argument is undefined', () => it('is transformed to a string', () => expect(transformValueForComparison()).to.equal('undefined')))
  })

  describe('`transformValueToDataType()`', () => {
    describe('The property type is `string`', () => {
      describe('The argument is a number', () => {
        describe('1', () => it('is transformed to the string "1"', () => expect(transformValueToDataType(1, { property: { type: 'string' } }, 'property')).to.equal('1')))

        describe('0', () => it('is transformed to the string "0"', () => expect(transformValueToDataType(0, { property: { type: 'string' } }, 'property')).to.equal('0')))
      })
    })

    describe('The property type is `number`', () => {
      describe('The argument is a number', () => {
        describe('"1"', () => it('is transformed to the number 1', () => expect(transformValueToDataType('1', { property: { type: 'number' } }, 'property')).to.equal(1)))

        describe('"0"', () => it('is transformed to the number 0', () => expect(transformValueToDataType('0', { property: { type: 'number' } }, 'property')).to.equal(0)))
      })

      describe('The argument is not a number', () => {
        it('is transformed to NaN', () => expect(isNaN(transformValueToDataType('A', { property: { type: 'number' } }, 'property'))).to.be.true)
      })
    })

    describe('The property type is `boolean`', () => {
      describe('The argument is a string', () => {
        describe('"true"', () => it('is transformed to a boolean true', () => expect(transformValueToDataType('true', { property: { type: 'boolean' } }, 'property')).to.be.true))

        describe('"false"', () => it('is transformed to a boolean false', () => expect(transformValueToDataType('false', { property: { type: 'boolean' } }, 'property')).to.be.false))
      })

      describe('The argument is not a string', () => {
        it('is transformed to false', () => expect(transformValueToDataType({}, { property: { type: 'boolean' } }, 'property')).to.be.false)
      })
    })
  })
})
