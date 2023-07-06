class Board {
    ctx;
    ctxNext;
    grid;
    piece;
    next;
    requestId;
    time;

    constructor(ctx, ctxNext, ctxHold) {
        this.ctx = ctx;
        this.ctxNext = ctxNext;
        this.ctxHold = ctxHold;
        this.init();
    }

    init() {
      // Calculate size of canvas from constants.
      this.ctx.canvas.width = COLS * BLOCK_SIZE;
      this.ctx.canvas.height = ROWS * BLOCK_SIZE;

      // Scale so we don't need to give size on every draw.
      this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
    }

    reset() {
      this.grid = this.getEmptyGrid();
      this.piece = new Piece(this.ctx);
      this.piece.setStartingPosition();
      this.getNewPiece();
    }

    getNewPiece() {
      this.next = new Piece(this.ctxNext);
      this.ctxNext.clearRect(
        0,
        0,
        this.ctxNext.canvas.width,
        this.ctxNext.canvas.height
      );
      this.next.draw();
    }

    draw() {
      this.piece.draw();
      this.drawBoard();
    }

    clearHoldBox() {
        const { width, height } = this.ctxHold.canvas;
        this.ctxHold.clearRect(0, 0, width, height);
        this.ctxHold.piece = false;
    }

    drop() {
      let p = moves[KEY.DOWN](this.piece);
      if (this.valid(p)) {
        this.piece.move(p);
      } else {
        this.freeze();
        this.clearLines();
        if (this.piece.y === 0) {
          // Game over
          return false;
        }
        this.piece = this.next;
        this.piece.ctx = this.ctx;
        this.piece.setStartingPosition();
        this.getNewPiece();
      }
      return true;
    }

    clearLines() {
      let lines = 0;

      this.grid.forEach((row, y) => {

        // If every value is greater than 0.
        if (row.every(value => value > 0)) {
          lines++;

          // Remove the row.
          this.grid.splice(y, 1);

          // Add zero filled row at the top.
          this.grid.unshift(Array(COLS).fill(0));
        }
      });

      if (lines > 0) {
        // Calculate points from cleared lines and level.

        account.score += this.getLinesClearedPoints(lines);
        account.lines += lines;

        // If we have reached the lines for next level
        if (account.lines >= LINES_PER_LEVEL) {
          // Goto next level
          account.level++;

          // Remove lines so we start working for the next level
          account.lines -= LINES_PER_LEVEL;

          // Increase speed of game
          time.level = LEVEL[account.level];
        }
      }
    }

    valid(p) {
      return p.shape.every((row, dy) => {
        return row.every((value, dx) => {
          let x = p.x + dx;
          let y = p.y + dy;
          return (
            value === 0 ||
            (this.insideWalls(x) && this.aboveFloor(y) && this.notOccupied(x, y))
          );
        });
      });
    }

    freeze() {
      this.piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            this.grid[y + this.piece.y][x + this.piece.x] = value;
          }
        });
      });
    }

    drawBoard() {
      this.grid.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            this.ctx.fillStyle = COLORS[value];
            this.ctx.fillRect(x, y, 1, 1);
          }
        });
      });
    }

    swapPieces() {
        if (!this.ctxHold.piece) {
            //move current piece to hold and move next piece to current one
            this.ctxHold.piece = this.piece;
            this.piece = this.next;
            this.getNewPiece();
        } else {
            //swap current piece with hold
            let temp = this.piece;
            this.piece = this.ctxHold.piece;
            this.ctxHold.piece = temp;
        }
        this.ctxHold.piece.ctx = this.ctxHold;
        this.piece.ctx = this.ctx;
        this.piece.setStartingPosition();
        this.hold = this.ctxHold.piece;
        const { width, height } = this.ctxHold.canvas;
        this.ctxHold.clearRect(0, 0, width, height);
        this.ctxHold.piece.x = 0;
        this.ctxHold.piece.y = 0;
        this.ctxHold.piece.draw();
    }

    swap() {
        //swap oonly once
        if (this.piece.swapped) {
            return;
        }
        this.swapPieces();
        this.piece.swapped = true;
        return this.piece;
    }

    getEmptyGrid() {
      return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    insideWalls(x) {
      return x >= 0 && x < COLS;
    }

    aboveFloor(y) {
      return y <= ROWS;
    }

    notOccupied(x, y) {
      return this.grid[y] && this.grid[y][x] === 0;
    }

    rotate_right(piece) {
        let p = JSON.parse(JSON.stringify(piece));
        if (!piece.hardDropped) {
            for (let y = 0; y < p.shape.length; y++) {
                for (let x = 0; x < y; x++) {
                    [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
                }
            }
        }
        p.shape.forEach(row => row.reverse());
        return p;
    }

    rotate_left (piece) {
        let p = JSON.parse(JSON.stringify(piece));
        if (!piece.hardDropped) {
            for (let y = 0; y < p.shape.length; y++) {
                for (let x = 0; x < y; x++) {
                    [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
                }
            }
        }
        p.shape.reverse();
        return p;
    }

    getLinesClearedPoints(lines, level) {
      const lineClearPoints =
        lines === 1
          ? POINTS.SINGLE
          : lines === 2
          ? POINTS.DOUBLE
          : lines === 3
          ? POINTS.TRIPLE
          : lines === 4
          ? POINTS.TETRIS
          : 0;

      return (account.level + 1) * lineClearPoints;
    }
  }
