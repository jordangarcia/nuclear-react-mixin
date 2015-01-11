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
 *       player: ['game', 'players', this.props.playerId],
 *       // can pass it a getter
 *       playerCount: Nuclear.Getter('game.players', function(players) {
 *         return players.size
 *       })
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
    state[key] = reactor.evaluate(data[key])
  }
  return state
}

function each(obj, fn) {
  for (var key in obj) {
    fn(obj[key], key)
  }
}

module.exports = function ReactorMixin(reactor) {

  return {
    getInitialState: function() {
      return getState(reactor, this.getDataBindings())
    },

    componentDidMount: function() {
      var component = this
      var dataBindings = this.getDataBindings()
      component.__unwatchFns = []
      each(this.getDataBindings(), function(getter, key) {
        var unwatchFn = reactor.observe(getter, function(val) {
          var newState = {};
          newState[key] = val;
          component.setState(newState)
        })

        component.__unwatchFns.push(unwatchFn)
      })
    },

    componentWillUnmount: function() {
      while (this.__unwatchFns.length) {
        this.__unwatchFns.shift()()
      }
    }
  }
}
