var _ = require('lodash')
var sinon = require('sinon')
var expect = require('chai').expect
var ReactorMixin = require('../src/mixin')
var Nuclear = require('nuclear-js')
var Immutable = Nuclear.Immutable

var reactor = Nuclear.Reactor({
  stores: {
    items: Nuclear.Store({
      getInitialState: function() {
        return []
      },
      initialize: function() {
        this.on('addItem', function(state, item) {
          return state.push(Immutable.Map(item))
        })
      }
    })
  }
})

var getItemCount = Nuclear.Getter('items', function(items) {
  return items.size
})

describe('nuclear-react-mixin', function() {
  var component
  var setStateSpy

  beforeEach(function() {
    setStateSpy = sinon.spy()
    var componentMock = {
      getDataBindings: function() {
        return {
          items: 'items',
          itemCount: getItemCount
        }
      },
      setState: setStateSpy
    }

    component = _.extend(componentMock, ReactorMixin(reactor))
  })

  afterEach(function() {
    reactor.reset()
  })

  it('should correctly getInitialState', function() {
    var expectedItems = Immutable.List()
    var expectedCount = 0

    var state = component.getInitialState()

    expect(Immutable.is(state.items, expectedItems))
    expect(state.itemCount).to.equal(expectedCount)
  })

  it('should call set state when any of the data binding values change', function() {
    component.componentDidMount()

    reactor.dispatch('addItem', { id: 1 })

    var expectedItems = Immutable.List([Immutable.Map({ id: 1 })])
    var expectedCount = 1


    expect(setStateSpy.calledWithExactly({
      items: expectedItems
    }))

    expect(setStateSpy.calledWithExactly({
      itemCount: expectedCount
    }))
  })

  describe('componentWillUnmount', function() {
    var unwatchFn
    beforeEach(function() {
      unwatchFn = sinon.spy()
      sinon.stub(reactor, 'observe').returns(unwatchFn)
    })

    afterEach(function() {
      reactor.observe.restore()
    })

    it('should unregister all the `observe`s', function() {
      component.componentDidMount()

      expect(unwatchFn.callCount).to.equal(0)

      component.componentWillUnmount()

      expect(unwatchFn.callCount).to.equal(2)
    })
  })
})
