# Nuclear React Mixin

A React mixin to bind component state to a [NuclearJS](http://github.com/optimizely/nuclear-js) reactor.

## Usage

```js
/* @jsx React.DOM */
var React = require('react')
// instance of a Nuclear Reactor
var reactor = require('./reactor')
var ReactorMixin = require('nuclear-react-mixin')

var PlayerCard = React.createClass({
  mixins: [ReactorMixin(reactor)],

  getDataBindings: function() {
    return {
      playerInfo: ['players', this.props.id],
      // can lookup by array or string
      avatarSize: 'displayOptions.avatarSize'
    }
  }

  render: function() {
    var avatarSize = this.state.avatarSize

    return (
      <div>
        <img
          src={this.state.playerInfo.avatarUrl}
          width={avatarSize}
          height={avatarSize}
        />
        <h3>{this.state.playerInfo.name}</h3>
      </div>
    )
  }
})

module.exports = PlayerCard
```

#### What is it doing?

It is keeping the React component in sync with the Nuclear Reactor.  It does this by implementing
`getInitialState()`.

```js
// The mixin is actually doing:
getInitialState: function() {
  return {
    playerInfo: reactor.getImmutable(['players', this.props.id]),
    avatarSize: reactor.getImmutable('displayOptions.avatarSize'),
  }
}
```

Also whenever any of the bound data values change on the Nuclear Reactor it will call 
`this.setState(state)` with the updated state values.  It does this in a very efficient manner
since it only has to do `prevState.getIn(keyPath) === nextState.getIn(keyPath)` to check if the
value has changed (Immutability FTW)

The mixin also provides all the logic to destroy the Reactor ChangeObservers on unmounting so you don't have to!
