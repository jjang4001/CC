var canvas;
var originalCanvasPos;
var constrainedCanvasWidth = 800;
var constrainedCanvasHeight = 800;
var board; // [][]
var numOfPlayers = 2;

var Color = {
    RED : "RED",
    BLUE : "BLUE",
    GREEN : "GREEN",
    YELLOW: "YELLOW",
    BLACK: "BLACK",
    WHITE: "WHITE"
}

class BoardPiece {
  constructor(row, col) {
    this.position = [row, col];
    this.color = null; // change this later
    this.button = null; // left and top styles
  }
}

function setup() {
  canvas = createCanvas(constrainedCanvasWidth, constrainedCanvasHeight);
  canvas.parent('gameCanvasContainer');
  originalCanvasPos = canvas.position();
  background(100, 100, 100);
  createBoard();
  drawBoard();
}

function draw() {

}

function createBoard() {
  // board can be seen as a 13x17 grid
  board = [];
  actualRowWidths = [
    1, 2, 3, 4, 13, 12, 11, 10, 9, 10, 11, 12, 13, 4, 3, 2, 1
  ];
  var width = 13;
  var height = 17;
  var currRowWidth;
  for (var i = 0; i < height; i++) {
    currRowWidth = actualRowWidths[i];
    board[i] = []
    for (var j = 0; j < width; j++) {
      if (j < currRowWidth) {
        board[i][j] = new BoardPiece(i, j);
        if (i < 4) {
          board[i][j].color = Color.RED;
        } else if (i < 8) {
          if ((i == 4 && j < 4) || (i == 5 && j < 3) || (i == 6 && j < 2) || (i == 7 && j < 1)) {
            board[i][j].color = Color.BLUE;
          } else if ((i == 4 || i == 5 || i == 6 || i == 7) && j > 8) {
            board[i][j].color = Color.GREEN;
          }
        } else if (i < 13) {
          if ((i == 9 && j < 1) || (i == 10 && j < 2) || (i == 11 && j < 3) || (i == 12 && j < 4)) {
            board[i][j].color = Color.YELLOW;
          } else if ((i == 9 || i == 10 || i == 11 || i == 12) && j > 8) {
            board[i][j].color = Color.BLACK;
          }
        } else {
          board[i][j].color = Color.WHITE;
        }
      } else {
        board[i][j] = null; // null is good to keep track of neighbors
      }
    }
  }

  console.log(board);

}

function drawBoard() {
  var width = board[0].length; // 13
  var height = board.length; // 17
  var offsetX = 55; // can't put in array because its mutating
  var offsetY = 44;
  var startingPosX = constrainedCanvasWidth/2 - 20;
  var startingPosY = 30;
  var currentOffset = [startingPosX, startingPosY];
  var gridOffsets = [
    0, offsetX/2, (offsetX/2) * 2, (offsetX/2) * 3,
    (offsetX/2) * 12, (offsetX/2) * 11, (offsetX/2) * 10, (offsetX/2) * 9,
    (offsetX/2) * 8,
    (offsetX/2) * 9, (offsetX/2) * 10, (offsetX/2) * 11, (offsetX/2) * 12,
    (offsetX/2) * 3, (offsetX/2) * 2, (offsetX/2), 0,
  ];

  // draw the board pieces
  for (var i = 0; i < height; i++) {
    currentOffset[0] = startingPosX - gridOffsets[i];
    for (var j = 0; j < width; j++) {
      if (board[i][j] != null) {
        // Have to offset the buttons based on the position of the canvas
        var newButton = createButton('');
        newButton.id("node" + board[i][j].color);
        newButton.mousePressed(nodeSelected.bind(this, {x: i, y: j}));
        newButton.position(currentOffset[0], currentOffset[1]);
        changeButtonPosition(newButton, canvas.position().x, canvas.position().y);
        board[i][j].button = newButton;
        currentOffset[0] += offsetX;
      }
    }
    currentOffset[1] +=offsetY;
  }
}

function nodeSelected(pos) { // pos = [i, j] to 2D board array
  board[pos.x][pos.y].button.id("selectednode");
}

function changeButtonPosition(button, offsetX, offsetY) {
  var leftStr = button.style("left");
  var leftFloat = parseFloat(leftStr.substring(0, leftStr.length - 2));
  var topStr = button.style("top");
  var topFloat = parseFloat(topStr.substring(0, topStr.length - 2));
  leftFloat += offsetX;
  topFloat += offsetY;
  button.style("left", leftFloat.toString() + "px");
  button.style("top", topFloat.toString() + "px");
  return button;
}

function windowResized() {
  // Resize buttons to fit new window size
  var offset = [canvas.position().x - originalCanvasPos.x, canvas.position().y - originalCanvasPos.y]; // offset from original canvas size
  originalCanvasPos.x = canvas.position().x;
  originalCanvasPos.y = canvas.position().y;
  var width = board[0].length; // 13
  var height = board.length; // 17
  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      if (board[i][j] != null) {
        changeButtonPosition(board[i][j].button, offset[0], offset[1]);
      }
    }
  }
}
