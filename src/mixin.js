/**
 * Automatically keeps a React component in sync with some data
 * from a Nuclear reactor
 *
 * Usage:
 * var reactor = require('./reactor')
 * var ReactorMixin = require('./reactor-mixin')
 *
 * Reactor.createClass({
 *   mixins: [ReactorMixin(reactor)],
 *
 *   getDataBindings() {
 *     return {
 *       board: 'game.board',
 *       player: ['game', 'players', this.props.playerId]
 *     }
 *   }
 * })
 */
/**
 * Returns a mapping of the getDataBinding keys to
 * the reactor values
 */
function getState(reactor, data) {
  var state = {}
  for (var key in data) {
    state[key] = reactor.getImmutable(data[key])
  }
  return state
}

/**
 * Gets the values for an object
 */
function objectValues(obj) {
  var values = []
  for (var prop in obj) {
    values.push(obj[prop])
  }
  return values
}

module.exports = function ReactorMixin(reactor) {

  return {
    getInitialState() {
      return getState(reactor, this.getDataBindings())
    },

    componentDidMount() {
      var dataBindings = this.getDataBindings()
      var deps = objectValues(dataBindings)
      this.__changeObserver = reactor.createChangeObserver()
      this.__changeObserver.onChange(deps, () => {
        this.setState(getState(reactor, dataBindings))
      })
    },

    componentWillUnmount() {
      this.__changeObserver.destroy()
    }
  }
}
