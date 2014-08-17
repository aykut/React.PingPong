/** @jsx React.DOM **/


var Circle = React.createClass({
  getDefaultProps: function() {
    return {color: "white"}
  },
  draw: function() {
    return {
      width: this.props.radius * 2,
      height: this.props.radius * 2,
      backgroundColor: this.props.color,
      left: this.props.x,
      top: this.props.y
    }
  },
  render: function() {
    return (
      <div className="circle" style={this.draw()}>
      </div>
    );
  }
});



var Rectangle = React.createClass({
  getDefaultProps: function() {
    return {color: "white"}
  },
  draw: function() {
    return {
      width: this.props.width,
      height: this.props.height,
      backgroundColor: this.props.color,
      left: this.props.x,
      top: this.props.y
    }
  },
  render: function() {
    return (
      <div className="rectangle" style={this.draw()}>
      </div>
    );
  }
});


var Player = React.createClass({
  draw: function() {
    return {top: this.props.top};
  },
  renderScore: function() {
    return (
      <span className="score" style={this.draw()}>Score: {this.props.score}</span>
    );
  },
  render: function() {
    return (
      <div className="player">
        {this.renderScore()}
        <Rectangle x={this.props.rectX} y={this.props.rectY}
          width={this.props.rectWidth} height={this.props.rectHeight} />
      </div>
    );
  }
});


var PingPong = React.createClass({
  getCircleState: function(canvasWidth, canvasHeight) {
    var x = Math.round((canvasWidth / 2));
    var y = Math.round((canvasHeight / 2));
    var xVelocity = [-1, 1][Math.floor(Math.random() * 2)] * (Math.floor(Math.random() * 4) + 2);
    var yVelocity = [-1, 1][Math.floor(Math.random() * 2)] * (Math.floor(Math.random() * 4) + 2);
    return {circleX: x, circleY: y, circleXVelocity: xVelocity, circleYVelocity: yVelocity}
  },
  getRectangleState: function(canvasWidth) {
    var x = Math.round(canvasWidth / 2) - Math.round((this.props.rectWidth / 2));
    return {rectX: x}
  },
  getCanvasState: function(windowWidth, windowHeight) {
    var width = Math.round((innerWidth / 3));
    var height = Math.round((innerHeight * 0.75));
    var x = width;

    return {width: width, height: height, x: x};
  },
  getDefaultProps: function() {
    // rectangle props
    var rectWidth= 150;
    var rectHeight= 5;
    var northRectY= 1;
    var canvasHeight = Math.round((window.innerHeight * 0.75));
    var southRectY= canvasHeight - rectHeight - 1;
    // circle props
    var circleRadius = 5;
    // players' score position
    var northTop = 20;
    var southTop = canvasHeight - 30;
    return {rectWidth: rectWidth, rectHeight: rectHeight,
            northRectY: northRectY, southRectY: southRectY,
            circleRadius: circleRadius, northTop: northTop,
            southTop: southTop}
  },
  getInitialState: function() {
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var state = this.getCanvasState(windowWidth, windowHeight);
    $.extend(state, this.getCircleState(state['width'], state['height']));
    $.extend(state, this.getRectangleState(state['width']));
    state['northScore'] = 0;
    state['southScore'] = 0;
    return state;
  },
  handleMouseMove: function(e) {
    this.setState({rectX: e.offsetX - Math.round(this.props.rectWidth / 2)});
  },
  playSound: function() {
    var collide = this.refs.collideSound.getDOMNode();
    collide.load();
    collide.play();
  },
  moveCircle: function() {
    var x = this.state.circleX;
    var y = this.state.circleY;
    var topY = 1 + this.props.rectHeight;
    var bottomY = this.state.height - this.props.rectHeight - 1;
    var leftX = 0;
    var rightX = this.state.width - this.props.circleRadius * 2;
    if (y <= topY || y >= bottomY) {
      if (x >= this.state.rectX && x <= this.state.rectX + this.props.rectWidth) {
        var newYVelocity = -this.state.circleYVelocity;
        var newY = y + newYVelocity;
        var newX = x + this.state.circleXVelocity;
        this.setState({circleX: newX, circleY: newY, circleYVelocity: newYVelocity});
        this.playSound();
      } else {
        if (y <= topY) this.setState({southScore: this.state.southScore + 1});
        else if (y >= bottomY) this.setState({northScore: this.state.northScore + 1});
        else console.log("An error occured!");
        this.setState(this.getCircleState(this.state.width, this.state.height));
        this.setState(this.getRectangleState(this.state.width));
      }
    } else if (x <= leftX || x >= rightX) {
      var newXVelocity = -this.state.circleXVelocity;
      var newX = x + newXVelocity;
      var newY = y + this.state.circleYVelocity;
      this.setState({circleX: newX, circleY: newY, circleXVelocity: newXVelocity});
    } else {
      var newX = x + this.state.circleXVelocity;
      var newY = y + this.state.circleYVelocity;
      this.setState({circleX: newX, circleY: newY});
    }
  },
  componentDidMount: function() {
    setInterval(this.moveCircle, 10);
    var canvas = document.getElementsByClassName('canvas')[0];
    canvas.addEventListener('mousemove', this.handleMouseMove);
  },
  drawCanvas: function() {
    return {
      left: this.state.x,
      width: this.state.width,
      height: this.state.height
    }
  },
  render: function() {
    return (
      <div className="canvas" style={this.drawCanvas()}>
        <Circle x={this.state.circleX} y={this.state.circleY} radius={this.props.circleRadius} />
        <Player rectX={this.state.rectX} rectY={this.props.northRectY}
          rectWidth={this.props.rectWidth} rectHeight={this.props.rectHeight}
          score={this.state.northScore} top={this.props.northTop} />
        <Player rectX={this.state.rectX} rectY={this.props.southRectY}
          rectWidth={this.props.rectWidth} rectHeight={this.props.rectHeight}
          score={this.state.southScore} top={this.props.southTop} />
        <audio ref="collideSound" src="assets/collide.wav" preload="auto"></audio>
      </div>
    );
  }
});


React.renderComponent(<PingPong />, document.body);
