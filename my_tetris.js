// get a random integer between the range of [min,max]
function getRandomInt(min, max) {
    const range = max - min + 1;
    return Math.floor(Math.random() * range) + min;
  }
  
  // generate a new tetromino sequence
  function generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  
    while (sequence.length !== 0) {
      const rand = getRandomInt(0, sequence.length - 1);
      const name = sequence.splice(rand, 1)[0];
      tetrominoSequence.push(name);
    }
  }
  
  // get the next tetromino in the sequence
  function getNextTetromino() {
    if (tetrominoSequence.length === 0) {
      generateSequence();
    }
  
    const name = tetrominoSequence.pop();
    const matrix = tetrominos[name];
  
    // I and O spawn in the middle columns, the rest spawn in the left-middle columns
    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
  
    // I starts on row 21 (-1), all others start on row 22 (-2)
    const row = name === 'I' ? -1 : -2;
  
    return {
      name: name,      
      matrix: matrix,  
      row: row,       
      col: col         
    };
  }
  
  // rotate an NxN matrix 90deg
  function rotate(matrix) {
    const size = matrix.length;
    const rotated = [];
  
    for (let i = 0; i < size; i++) {
      rotated.push([]);
  
      for (let j = 0; j < size; j++) {
        rotated[i].push(matrix[size - j - 1][i]);
      }
    }
  
    return rotated;
  }
  
  // check to see if the new matrix/row/col is valid
  function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        
        if (matrix[row][col] &&
          (cellCol + col < 0 || cellCol + col >= playfield[0].length ||
           cellRow + row >= playfield.length || playfield[cellRow + row][cellCol + col])) {
          return false;
        }
      }
    }
  
    return true;
  }
  
  
  function placeTetromino() {
  // Loop through every block in the tetromino matrix
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      // If the block is not empty, place it on the playfield
      if (tetromino.matrix[row][col]) {
        // If any part of the piece is offscreen, it's game over
        if (tetromino.row + row < 0) {
          return showGameOver();
        }
        playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
      }
    }
  }

  // Check for line clears starting from the bottom and working our way up
  for (let row = playfield.length - 1; row >= 0; row--) {
    if (playfield[row].every(cell => !!cell)) {
      // Drop every row above this one
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          playfield[r][c] = playfield[r - 1][c];
        }
      }
      row++;
    }
  }

  // Get the next tetromino and assign it to the current tetromino
  tetromino = getNextTetromino();
}

  // show the game over screen
  function showGameOver() {
    cancelAnimationFrame(rAF);
    gameOver = true;
  
    context.fillStyle = 'rgba(0, 0, 0, 0.75)';
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
  
    context.fillStyle = 'white';
    context.font = '36px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
  }
  const canvas = document.getElementById('game');
  const context = canvas.getContext('2d');
  const grid = 32;
  const tetrominoSequence = [];
  
  // 2D array playfield that keeps track of what is in every cell of the game.
  // The tetris playfield is 10x20, with a few rows offscreen.
  const playfield = [];
  
  // Populate the playfield with an empty state.
  for (let row = -2; row < 20; row++) {
    playfield[row] = Array.from({ length: 10 }, () => 0);
  }
  const tetrominos = {
    'I': [
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0]
    ],
    'J': [
      [1,0,0],
      [1,1,1],
      [0,0,0],
    ],
    'L': [
      [0,0,1],
      [1,1,1],
      [0,0,0],
    ],
    'O': [
      [1,1],
      [1,1],
    ],
    'S': [
      [0,1,1],
      [1,1,0],
      [0,0,0],
    ],
    'Z': [
      [1,1,0],
      [0,1,1],
      [0,0,0],
    ],
    'T': [
      [0,1,0],
      [1,1,1],
      [0,0,0],
    ]
  };
  
  // tetromino color
  const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
  };
  
  
  let count = 0;
  let tetromino = getNextTetromino();
  let rAF = null;  
  let gameOver = false;
  
  // game loop
  function loop() {
    rAF = requestAnimationFrame(loop);
    context.clearRect(0,0,canvas.width,canvas.height);
  
    // playfield drawn
      playfield.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          const name = cell;
          context.fillStyle = colors[name];
      
          // drawing 1 px smaller than the grid creates a grid effect
          context.fillRect(colIndex * grid, rowIndex * grid, grid - 1, grid - 1);
        }
      });
    });

    
    
    // active tetromino drawn
    if (tetromino) {


      count++;
    if (count > 35) {
      tetromino.row++;
      count = 0;

  // place piece if it runs into anything
    if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
    tetromino.row--;
    placeTetromino();
    }
    }      

      context.fillStyle = colors[tetromino.name];

      tetromino.matrix.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell) {
      
            // drawing 1 px smaller than the grid creates a grid effect
            context.fillRect((tetromino.col + colIndex) * grid, (tetromino.row + rowIndex) * grid, grid - 1, grid - 1);
          }
        });
      });
      }
  }
  
  // listen to keyboard events to move the active tetromino
  document.addEventListener('keydown', function(e) {
    if (gameOver) return;
  
    // left and right arrow keys (move)
  
    if (e.which === 37 || e.which === 39) {
      const colOffset = e.which === 37 ? -1 : 1;
      const col = tetromino.col + colOffset;
    
      if (isValidMove(tetromino.matrix, tetromino.row, col)) {
        tetromino.col = col;
      }
    }
  
    // up arrow key (rotate)
    if (e.which === 38) {
      const rotatedMatrix = rotate(tetromino.matrix);
    
      if (isValidMove(rotatedMatrix, tetromino.row, tetromino.col)) {
        tetromino.matrix = rotatedMatrix;
      }
    }
  
    // down arrow key (drop)
    if (e.which === 40) {
      const row = tetromino.row + 1;
    
      if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
        placeTetromino();
        return;
      }
    
      tetromino.row = row;
    }

    
  });
  
  
  
  // game start
  rAF = requestAnimationFrame(loop);
