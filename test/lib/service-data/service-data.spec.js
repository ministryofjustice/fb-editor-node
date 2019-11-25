require('@ministryofjustice/module-alias/register')

const proxyquire = require('proxyquire')

const chai = require('chai')

const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const {
  expect
} = chai

chai.use(sinonChai)

const loadServiceDataStub = sinon.stub()
const getServiceSchemaStub = sinon.stub()
const getServiceSchemasStub = sinon.stub()
const getInstancePropertyStub = sinon.stub()
const getServiceInstancesStub = sinon.stub()

const initRoutesStub = sinon.stub()

const queryStub = sinon.stub()

const mockServiceData = {
  loadServiceData: loadServiceDataStub,
  getServiceSchema: getServiceSchemaStub,
  getServiceSchemas: getServiceSchemasStub,
  getInstanceProperty: getInstancePropertyStub,
  getServiceInstances: getServiceInstancesStub
}

const serviceData = proxyquire('~/fb-editor-node/service-data/service-data', {
  jsonpath: {
    query: queryStub
  },
  '@ministryofjustice/fb-runner-node/lib/service-data/service-data': mockServiceData,
  '@ministryofjustice/fb-runner-node/lib/middleware/routes-metadata/routes-metadata': {
    initRoutes: initRoutesStub
  }
})

describe('~/fb-editor-node/service-data/service-data', () => {
  describe('`loadServiceData()`', () => {
    let thenStub

    const {
      loadServiceData
    } = serviceData

    let returnValue

    beforeEach(() => {
      thenStub = sinon.stub().returns(mockServiceData)

      loadServiceDataStub.returns({then: thenStub})

      returnValue = loadServiceData()
    })

    it('calls `loadServiceData`', () => expect(loadServiceDataStub).to.be.called)

    it('calls `then`', () => expect(thenStub).to.be.calledWith(sinon.match.typeOf('function')))

    it('returns the service data', () => expect(returnValue).to.equal(mockServiceData))
  })

  describe('`getServiceSchemaCategories()`', () => {
    const {
      getServiceSchemaCategories
    } = serviceData

    let returnValue
    const mockSchemas = {}
    let forEachStub
    let keysStub

    beforeEach(() => {
      forEachStub = sinon.stub()

      keysStub = sinon.stub(global.Object, 'keys').returns({forEach: forEachStub})

      getServiceSchemasStub.returns(mockSchemas)

      returnValue = getServiceSchemaCategories()
    })

    afterEach(() => {
      keysStub.restore()
    })

    it('calls `getServiceSchemas`', () => expect(getServiceSchemasStub).to.be.called)

    it('calls `Object.keys()`', () => expect(keysStub).to.be.calledWith(mockSchemas))

    it('iterates over the keys`', () => expect(forEachStub).to.be.calledWith(sinon.match.typeOf('function')))

    it('returns an array', () => expect(returnValue).to.be.an('array'))
  })

  describe('`getSchemaTitle()`', () => {
    const {
      getSchemaTitle
    } = serviceData

    let returnValue

    beforeEach(() => {
      getServiceSchemaStub.returns({title: 'mock service schema title'})

      returnValue = getSchemaTitle('mock type')
    })

    it('calls `getServiceSchema`', () => expect(getServiceSchemaStub).to.be.calledWith('mock type'))

    it('returns the instance type', () => expect(returnValue).to.equal('mock service schema title'))
  })

  describe('`getInstanceType()`', () => {
    const {
      getInstanceType
    } = serviceData

    let returnValue

    beforeEach(() => {
      getInstancePropertyStub.returns('mock instance property')

      returnValue = getInstanceType('mock id')
    })

    it('calls `getInstanceProperty`', () => expect(getInstancePropertyStub).to.be.calledWith('mock id', '_type'))

    it('returns the instance type', () => expect(returnValue).to.equal('mock instance property'))
  })

  /**
   *  This is a horrible function and I can't see a simple way to test it
   */
  describe('`getInstancesByType()`', () => {
    const {
      getInstancesByType
    } = serviceData

    describe('`nested` is provided as a parameter', () => {
      let mockKeys
      let keysStub

      beforeEach(() => {
        getServiceInstancesStub.reset()

        mockKeys = {}
      })

      describe('`query` parameter is a string', () => {
        let forEachStub

        const filterStub = sinon.stub()
        let mockServiceInstances
        let mockInstanceKeys
        let mockInstances

        beforeEach(() => {
          forEachStub = sinon.stub()

          queryStub.reset()

          queryStub.returns({
            forEach: forEachStub
          })

          mockInstanceKeys = {
            filter: filterStub
          }

          mockServiceInstances = {}
          getServiceInstancesStub.returns(mockServiceInstances)

          keysStub = sinon.stub(global.Object, 'keys')

          keysStub.onCall(0).returns(mockKeys)
          keysStub.onCall(1).returns(mockInstanceKeys)

          mockInstances = {
            filter: filterStub,
            length: 'mock length'
          }

          filterStub.returns(mockInstances)
        })

        afterEach(() => {
          keysStub.restore()
        })

        describe('`count` is provided as a parameter', () => {
          let returnValue

          beforeEach(() => {
            const mockOptions = {
              nested: true,
              count: true
            }

            returnValue = getInstancesByType('mock query', mockOptions)
          })

          it('calls `getServiceInstances`', () => expect(getServiceInstancesStub).to.be.called)

          it('calls `Object.keys()`', () => expect(keysStub.getCall(0)).to.be.calledWith(mockServiceInstances))

          it('calls `jsonpath.query()`', () => expect(queryStub).to.be.calledWith(mockServiceInstances, '$..[?(@._id)]'))

          it('iterates over the keys of the return from `jsonpath.query()`', () => expect(forEachStub).to.be.calledWith(sinon.match.typeOf('function')))

          it('calls `Object.keys()`', () => expect(keysStub.getCall(1)).to.be.calledWith(sinon.match.typeOf('object')))

          it('filters the keys', () => expect(filterStub.getCall(0)).to.be.calledWith(sinon.match.typeOf('function')))

          it('filters the keys', () => expect(filterStub.getCall(1)).to.be.calledWith(sinon.match.typeOf('function')))

          it('returns the number of instances', () => expect(returnValue).to.equal('mock length'))
        })

        describe('`count` is not provided as a parameter', () => {
          let returnValue

          beforeEach(() => {
            const mockOptions = {
              nested: true,
              count: false
            }

            returnValue = getInstancesByType('mock query', mockOptions)
          })

          it('calls `getServiceInstances`', () => expect(getServiceInstancesStub).to.be.called)

          it('calls `Object.keys()`', () => expect(keysStub).to.be.calledWith(mockServiceInstances))

          it('calls `jsonpath.query()`', () => expect(queryStub.getCall(0)).to.be.calledWith(mockServiceInstances, '$..[?(@._id)]'))

          it('iterates over the keys of the return from `jsonpath.query()`', () => expect(forEachStub).to.be.calledWith(sinon.match.typeOf('function')))

          it('calls `Object.keys()`', () => expect(keysStub.getCall(1)).to.be.calledWith(sinon.match.typeOf('object')))

          it('filters the keys', () => expect(filterStub.getCall(0)).to.be.calledWith(sinon.match.typeOf('function')))

          it('filters the keys', () => expect(filterStub.getCall(1)).to.be.calledWith(sinon.match.typeOf('function')))

          it('returns the instances', () => expect(returnValue).to.equal(mockInstances))
        })
      })

      describe('`query` parameter is not a string', () => {
        let forEachStub

        const filterStub = sinon.stub()
        let mockServiceInstances
        let mockInstanceKeys
        let mockInstances

        beforeEach(() => {
          forEachStub = sinon.stub()

          queryStub.reset()

          queryStub.returns({
            forEach: forEachStub
          })

          mockInstanceKeys = {
            filter: filterStub
          }

          mockServiceInstances = {}
          getServiceInstancesStub.returns(mockServiceInstances)

          mockInstances = {
            filter: filterStub,
            length: 'mock length'
          }

          filterStub.returns(mockInstances)
        })

        describe('`count` is provided as a parameter', () => {
          let returnValue

          beforeEach(() => {
            keysStub = sinon.stub(global.Object, 'keys')

            keysStub.onCall(0).returns(mockKeys)
            keysStub.onCall(1).returns(mockInstanceKeys)

            const mockOptions = {
              nested: true,
              count: true
            }

            returnValue = getInstancesByType('mock query', mockOptions)
          })

          afterEach(() => {
            keysStub.restore()
          })

          it('calls `getServiceInstances`', () => expect(getServiceInstancesStub).to.be.called)

          it('calls `Object.keys()`', () => expect(keysStub.getCall(0)).to.be.calledWith(mockServiceInstances))

          it('calls `jsonpath.query()`', () => expect(queryStub.getCall(0)).to.be.calledWith(mockServiceInstances, '$..[?(@._id)]'))

          it('iterates over the keys of the return from `jsonpath.query()`', () => expect(forEachStub).to.be.calledWith(sinon.match.typeOf('function')))

          it('calls `Object.keys()`', () => expect(keysStub.getCall(1)).to.be.calledWith(sinon.match.typeOf('object')))

          it('filters the keys', () => expect(filterStub.getCall(0)).to.be.calledWith(sinon.match.typeOf('function')))

          it('filters the keys', () => expect(filterStub.getCall(1)).to.be.calledWith(sinon.match.typeOf('function')))

          it('returns the number of instances', () => expect(returnValue).to.equal('mock length'))
        })

        describe('`count` is not provided as a parameter', () => {
          let returnValue

          beforeEach(() => {
            keysStub = sinon.stub(global.Object, 'keys')

            keysStub.onCall(0).returns(mockKeys)
            keysStub.onCall(1).returns(mockInstanceKeys)

            const mockOptions = {
              nested: true,
              count: false
            }

            returnValue = getInstancesByType('mock query', mockOptions)
          })

          afterEach(() => {
            keysStub.restore()
          })

          it('calls `getServiceInstances`', () => expect(getServiceInstancesStub).to.be.called)

          it('calls `Object.keys()`', () => expect(keysStub.getCall(0)).to.be.calledWith(mockServiceInstances))

          it('calls `jsonpath.query()`', () => expect(queryStub.getCall(0)).to.be.calledWith(mockServiceInstances, '$..[?(@._id)]'))

          it('iterates over the keys of the return from `jsonpath.query()`', () => expect(forEachStub).to.be.calledWith(sinon.match.typeOf('function')))

          it('calls `Object.keys()`', () => expect(keysStub.getCall(1)).to.be.calledWith(sinon.match.typeOf('object')))

          it('filters the keys', () => expect(filterStub.getCall(0)).to.be.calledWith(sinon.match.typeOf('function')))

          it('filters the keys', () => expect(filterStub.getCall(1)).to.be.calledWith(sinon.match.typeOf('function')))

          it('returns the instances', () => expect(returnValue).to.equal(mockInstances))
        })
      })
    })

    describe('`nested` is not provided as a parameter', () => {
      let keysStub

      beforeEach(() => {
        getServiceInstancesStub.reset()
      })

      describe('`query` parameter is a string', () => {
        let forEachStub

        const filterStub = sinon.stub()
        let mockServiceInstances
        let mockInstanceKeys
        let mockInstances

        beforeEach(() => {
          forEachStub = sinon.stub()

          queryStub.reset()

          queryStub.returns({
            forEach: forEachStub
          })

          mockInstanceKeys = {
            filter: filterStub
          }

          mockServiceInstances = {}
          getServiceInstancesStub.returns(mockServiceInstances)

          keysStub = sinon.stub(global.Object, 'keys').returns(mockInstanceKeys)

          mockInstances = {
            filter: filterStub,
            length: 'mock length'
          }

          filterStub.returns(mockInstances)
        })

        afterEach(() => {
          keysStub.restore()
        })

        describe('`count` is provided as a parameter', () => {
          let returnValue

          beforeEach(() => {
            const mockOptions = {
              nested: false,
              count: true
            }

            returnValue = getInstancesByType('mock query', mockOptions)
          })

          it('calls `getServiceInstances`', () => expect(getServiceInstancesStub).to.be.called)

          it('does not call `jsonpath.query()`', () => expect(queryStub).not.to.be.called)

          it('calls `Object.keys()`', () => expect(keysStub.getCall(0)).to.be.calledWith(sinon.match.typeOf('object')))

          it('filters the keys', () => expect(filterStub.getCall(0)).to.be.calledWith(sinon.match.typeOf('function')))

          it('filters the keys', () => expect(filterStub.getCall(1)).to.be.calledWith(sinon.match.typeOf('function')))

          it('returns the number of instances', () => expect(returnValue).to.equal('mock length'))
        })

        describe('`count` is not provided as a parameter', () => {
          let returnValue

          beforeEach(() => {
            const mockOptions = {
              nested: false,
              count: false
            }

            returnValue = getInstancesByType('mock query', mockOptions)
          })

          it('calls `getServiceInstances`', () => expect(getServiceInstancesStub).to.be.called)

          it('does not call `jsonpath.query()`', () => expect(queryStub).not.to.be.called)

          it('calls `Object.keys()`', () => expect(keysStub.getCall(0)).to.be.calledWith(sinon.match.typeOf('object')))

          it('filters the keys', () => expect(filterStub.getCall(0)).to.be.calledWith(sinon.match.typeOf('function')))

          it('filters the keys', () => expect(filterStub.getCall(1)).to.be.calledWith(sinon.match.typeOf('function')))

          it('returns the instances', () => expect(returnValue).to.equal(mockInstances))
        })
      })

      describe('`query` parameter is not a string', () => {
        let forEachStub

        const filterStub = sinon.stub()
        let mockServiceInstances
        let mockInstanceKeys
        let mockInstances

        beforeEach(() => {
          forEachStub = sinon.stub()

          queryStub.returns({
            forEach: forEachStub
          })

          mockInstanceKeys = {
            filter: filterStub
          }

          mockServiceInstances = {}
          getServiceInstancesStub.returns(mockServiceInstances)

          mockInstances = {
            filter: filterStub,
            length: 'mock length'
          }

          filterStub.returns(mockInstances)
        })

        describe('`count` is provided as a parameter', () => {
          let returnValue

          beforeEach(() => {
            keysStub = sinon.stub(global.Object, 'keys').returns(mockInstanceKeys)

            const mockOptions = {
              nested: false,
              count: true
            }

            returnValue = getInstancesByType('mock query', mockOptions)
          })

          afterEach(() => {
            keysStub.restore()
          })

          it('calls `getServiceInstances`', () => expect(getServiceInstancesStub).to.be.called)

          it('does not call `jsonpath.query()`', () => expect(queryStub).not.to.be.called)

          it('calls `Object.keys()`', () => expect(keysStub.getCall(0)).to.be.calledWith(sinon.match.typeOf('object')))

          it('filters the keys', () => expect(filterStub.getCall(0)).to.be.calledWith(sinon.match.typeOf('function')))

          it('filters the keys', () => expect(filterStub.getCall(1)).to.be.calledWith(sinon.match.typeOf('function')))

          it('returns the number of instances', () => expect(returnValue).to.equal('mock length'))
        })

        describe('`count` is not provided as a parameter', () => {
          let returnValue

          beforeEach(() => {
            keysStub = sinon.stub(global.Object, 'keys').returns(mockInstanceKeys)

            const mockOptions = {
              nested: false,
              count: false
            }

            returnValue = getInstancesByType('mock query', mockOptions)
          })

          afterEach(() => {
            keysStub.restore()
          })

          it('calls `getServiceInstances`', () => expect(getServiceInstancesStub).to.be.called)

          it('does not call `jsonpath.query()`', () => expect(queryStub).not.to.be.called)

          it('calls `Object.keys()`', () => expect(keysStub.getCall(0)).to.be.calledWith(sinon.match.typeOf('object')))

          it('filters the keys', () => expect(filterStub.getCall(0)).to.be.calledWith(sinon.match.typeOf('function')))

          it('filters the keys', () => expect(filterStub.getCall(1)).to.be.calledWith(sinon.match.typeOf('function')))

          it('returns the instances', () => expect(returnValue).to.equal(mockInstances))
        })
      })
    })
  })
})
