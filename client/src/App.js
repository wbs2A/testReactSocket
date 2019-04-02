import React, { Component } from 'react';
import { Widget, addResponseMessage } from 'react-chat-widget';

import 'react-chat-widget/lib/styles.css';

import './App.css';

import socket from './socket'
import avatar from './user.svg';


function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

class Square extends Component {
  render() {
    return (
      <button className="square" onClick={()=>this.props.onClick()}>
        {this.props.value}
      </button>
    );
  }
}

class Board extends Component {
  constructor(props){
    super(props);
    this.state = {
      squares: [Array(9).fill(null)],
      xIsNext: true
    };
    this.text = "";
  }
  
  update(b){
    this.setState({squares:b[0], xIsNext:b[1]});
  }

  handleClick(i) {
    const squares = this.state.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({squares: squares, xIsNext: !this.state.xIsNext});
    socket.emit('sqchange', [squares,!this.state.xIsNext]);
  }

  renderSquare(i) {
    return <Square value={this.state.squares[i]} onClick={() => this.handleClick(i)} />;
  }

  render() {
    const winner = calculateWinner(this.state.squares);
    let status;
    if (winner) {
      status = 'Vencendor é: ' + winner;
    } else {
      status = 'Próximo jogador: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div>
        <div className="status">{status}</div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends Component {
  constructor(props){
    super(props);
    this.board = React.createRef();
  }
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board ref={this.board}/>
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }

  update(sq){
    this.board.current.update(sq);
  }

}


class App extends Component {
  constructor(props){
    super(props);
    this.handleNewUserMessage = this.handleNewUserMessage.bind(this);
    this.handleNewResponse = this.handleNewResponse.bind(this);
    this.handleSquareChange = this.handleSquareChange.bind(this);
    this.child = React.createRef()
    this.state={
      mensagem: null,
      docId:'doc1'
    }

    socket.emit('enter room', this.state.docId);
    socket.on('user Message', this.handleNewResponse);
    socket.on('square change', this.handleSquareChange);
  }

  componentDidMount(){

  }
  onClick = () => {
    this.child.current.getAlert();
  };

  handleSquareChange =(sq)=>{
    console.log(sq)
    this.child.current.update(sq)
    
  }

  handleNewUserMessage = (newMessage) =>{
    socket.emit('msg', newMessage, this.state.docId);
  }

  handleNewResponse = (message) =>{
    addResponseMessage(message);
  }

  render() {
    return (
      <div className="App">
        <Game ref={this.child}/>
        <button onClick={this.onClick}>Click</button>
        <Widget 
            title="Bem vindo"
            subtitle=""
            handleNewUserMessage={ this.handleNewUserMessage}
            profileAvatar= {avatar}
          />
      </div>
    );
  }
}

export default App;
