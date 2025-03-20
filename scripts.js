document.addEventListener("DOMContentLoaded", () => {
  const Player = (symbol) => ({ symbol });
  const GameBoard = (() => {
    let board = Array(9).fill("");
    return {
      getBoard: () => board,
      resetBoard: () => board.fill(""),
      placeMark: (index, symbol) =>
        board[index] === "" ? ((board[index] = symbol), true) : false,
    };
  })();

  const GameController = (() => {
    let playerX = Player("X"),
      playerO = Player("O"),
      currentPlayer = playerX,
      gameMode = "PvP";
    const winCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    const cells = document.querySelectorAll(".box");
    const restartBtn = document.querySelector(".restart-btn");
    const winnerMessage = document.querySelector(".winner-message");

    const updateTurnIndicator = () => {
      document.getElementById("turnX").style.backgroundColor =
        currentPlayer.symbol === "X" ? "#2e211a" : "";
      document.getElementById("turnX").style.color =
        currentPlayer.symbol === "X" ? "white" : "";
      document.getElementById("turnO").style.backgroundColor =
        currentPlayer.symbol === "O" ? "#2e211a" : "";
      document.getElementById("turnO").style.color =
        currentPlayer.symbol === "O" ? "white" : "";
    };

    const startGame = () => {
      GameBoard.resetBoard();
      currentPlayer = playerX; // Always start with Player 1 (X)
      updateTurnIndicator();
      winnerMessage.innerText = "";
      cells.forEach((cell) => {
        cell.innerText = "";
        cell.style.backgroundColor = "";
        cell.addEventListener("click", handleMove, { once: true });
      });
      restartBtn.style.display = "none";

      // If it's AI's turn first (should never happen since Player 1 is always X), make AI move
      if (gameMode === "AI" && currentPlayer.symbol === "O") {
        setTimeout(aiMove, 500);
      }
    };

    const handleMove = (e) => {
      let index = e.target.dataset.index;
      if (GameBoard.placeMark(index, currentPlayer.symbol)) {
        e.target.innerText = currentPlayer.symbol;
        if (checkWin(currentPlayer.symbol))
          return gameOver(`${currentPlayer.symbol} Wins!`);
        if (checkTie()) return gameOver("It's a Tie!");
        switchTurn();
        if (gameMode === "AI" && currentPlayer.symbol === "O")
          setTimeout(aiMove, 500);
      }
    };

    const checkWin = (symbol) =>
      winCombos.some((combo) =>
        combo.every((i) => GameBoard.getBoard()[i] === symbol)
      );

    const checkTie = () => GameBoard.getBoard().every((cell) => cell !== "");

    const switchTurn = () => {
      currentPlayer = currentPlayer === playerX ? playerO : playerX;
      updateTurnIndicator();
    };

    const gameOver = (message) => {
      winnerMessage.innerText = message;
      restartBtn.style.display = "block";
    };

    // Minimax Algorithm
    const minimax = (board, depth, isMaximizing) => {
      if (checkWin("X")) return -10 + depth;
      if (checkWin("O")) return 10 - depth;
      if (checkTie()) return 0;

      if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
          if (board[i] === "") {
            board[i] = "O";
            let score = minimax(board, depth + 1, false);
            board[i] = "";
            bestScore = Math.max(score, bestScore);
          }
        }
        return bestScore;
      } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
          if (board[i] === "") {
            board[i] = "X";
            let score = minimax(board, depth + 1, true);
            board[i] = "";
            bestScore = Math.min(score, bestScore);
          }
        }
        return bestScore;
      }
    };

    const aiMove = () => {
      let board = GameBoard.getBoard();
      let bestMove = -1;
      let bestScore = -Infinity;

      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          board[i] = "O";
          let score = minimax(board, 0, false);
          board[i] = "";
          if (score > bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }

      if (bestMove !== -1) {
        handleMove({
          target: document.querySelector(`[data-index='${bestMove}']`),
        });
      }
    };

    document.getElementById("game-mode").addEventListener("change", (e) => {
      gameMode = e.target.value;
      startGame();
    });
    restartBtn.addEventListener("click", startGame);
    startGame();
  })();
});
