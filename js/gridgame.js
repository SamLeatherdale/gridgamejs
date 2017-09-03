var Board = (function () {
    function Board(rows, columns, cell_size, canvas) {
        this.duration = 0;
        this.moves = 0;
        this.state = GameState.Initial;
        Cell.initialize();
        this.rows = rows;
        this.columns = columns;
        this.cell_size = cell_size;
        this.bounds = new Point(columns * cell_size, rows * cell_size);
        this.cells = [];
        this.canvas = canvas;
        this.canvas.attr({ width: this.columns * this.cell_size + 1, height: this.rows * this.cell_size + 1 });
        this.context = canvas.get(0).getContext("2d");
        for (var x = 0; x < rows; x++) {
            var row = [];
            for (var y = 0; y < columns; y++) {
                row.push(new Cell(x, y, this));
            }
            this.cells.push(row);
        }
        var winner_x = getRandomInt(0, this.rows);
        var winner_y = getRandomInt(0, this.columns);
        this.winning_cell = this.cells[winner_x][winner_y];
        this.winning_cell.state = CellState.Winner;
        this.context.strokeStyle = "#000000";
        this.context.font = (this.cell_size - 4).toString() + "px sans-serif";
        this.context.textBaseline = "bottom";
        this.context.textAlign = "center";
        this.redraw();
    }
    Board.prototype.redraw = function () {
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var row = _a[_i];
            for (var _b = 0, row_1 = row; _b < row_1.length; _b++) {
                var cell = row_1[_b];
                cell.draw();
            }
        }
    };
    Board.prototype.startTimer = function () {
        this.timer = setInterval(gameTimer, 1000);
    };
    Board.prototype.stopTimer = function () {
        clearInterval(this.timer);
    };
    Board.prototype.addMove = function () {
        this.moves += 1;
        $("#moves_value").text(this.moves);
    };
    return Board;
}());
var Cell = (function () {
    function Cell(row, column, board) {
        this.state = CellState.Unknown;
        this.shown = false;
        this.row = row;
        this.column = column;
        this.board = board;
    }
    Cell.initialize = function () {
        this.drawData[CellState.Unknown] = new CellDrawData("#FFFFFF", "#000000", "?");
        this.drawData[CellState.Up] = new CellDrawData("#FFC107", "#000000", "🡩");
        this.drawData[CellState.Down] = new CellDrawData("#17A2B8", "#000000", "🡫");
        this.drawData[CellState.Left] = new CellDrawData("#28A745", "#000000", "🡨");
        this.drawData[CellState.Right] = new CellDrawData("#DC3545", "#FFFFFF", "🡪");
        this.drawData[CellState.Winner] = new CellDrawData("#000000", "#FFD700", "✖");
    };
    Cell.prototype.draw = function () {
        var ctx = this.board.context;
        var size = this.board.cell_size;
        var x = this.column * size;
        var y = this.row * size;
        var data;
        if (this.shown) {
            data = Cell.drawData[this.state];
        }
        else {
            data = Cell.drawData[CellState.Unknown];
        }
        ctx.strokeRect(x + 0.5, y + 0.5, size, size);
        ctx.fillStyle = data.backgroundColor;
        ctx.fillRect(x + 1, y + 1, size - 1, size - 1);
        ctx.fillStyle = data.textColor;
        ctx.fillText(data.text, x + (size / 2), y + size + 2);
    };
    Cell.prototype.click = function () {
        if (this.board.state == GameState.Initial) {
            this.board.startTimer();
            this.board.state = GameState.Active;
        }
        if (!this.shown && this.board.state == GameState.Active) {
            if (this.state == CellState.Unknown) {
                var options = [];
                if (this.row < this.board.winning_cell.row) {
                    options.push(CellState.Down);
                }
                else if (this.row > this.board.winning_cell.row) {
                    options.push(CellState.Up);
                }
                if (this.column < this.board.winning_cell.column) {
                    options.push(CellState.Right);
                }
                else if (this.column > this.board.winning_cell.column) {
                    options.push(CellState.Left);
                }
                if (options.length == 1) {
                    this.state = options[0];
                }
                else {
                    this.state = options[getRandomInt(0, options.length)];
                }
            }
            this.board.addMove();
            this.shown = true;
            this.draw();
            if (this.state == CellState.Winner) {
                alert("Congratulations! Press 'Start' to play again.");
                this.board.stopTimer();
                this.board.state = GameState.Complete;
            }
        }
    };
    Cell.drawData = [];
    return Cell;
}());
var CellDrawData = (function () {
    function CellDrawData(backgroundColor, textColor, text) {
        this.backgroundColor = backgroundColor;
        this.textColor = textColor;
        this.text = text;
    }
    return CellDrawData;
}());
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
var CellState;
(function (CellState) {
    CellState[CellState["Unknown"] = 0] = "Unknown";
    CellState[CellState["Up"] = 1] = "Up";
    CellState[CellState["Down"] = 2] = "Down";
    CellState[CellState["Left"] = 3] = "Left";
    CellState[CellState["Right"] = 4] = "Right";
    CellState[CellState["Winner"] = 5] = "Winner";
})(CellState || (CellState = {}));
var GameState;
(function (GameState) {
    GameState[GameState["Initial"] = 0] = "Initial";
    GameState[GameState["Active"] = 1] = "Active";
    GameState[GameState["Complete"] = 2] = "Complete";
})(GameState || (GameState = {}));
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
function gameTimer() {
    board.duration += 1;
    var duration = board.duration;
    var minutes = Math.floor(duration / 60).toString();
    if (minutes.length == 1) {
        minutes = "0" + minutes;
    }
    var seconds = (duration % 60).toString();
    if (seconds.length == 1) {
        seconds = "0" + seconds;
    }
    $("#timer_value").text(minutes + ":" + seconds);
}
function CreateBoard() {
    $("#timer_value").text("00:00");
    $("#moves_value").text("0");
    board = new Board(parseInt($("#board_rows").val()), parseInt($("#board_columns").val()), parseInt($("#cell_size").val()), $("#board"));
}
function CellClickHandler(e) {
    var click = new Point(e.offsetX, e.offsetY);
    var row = Math.floor(click.y / board.cell_size);
    var column = Math.floor(click.x / board.cell_size);
    var target_cell = board.cells[row][column];
    target_cell.click();
}
var board;
$(function () {
    $("#game_controls").submit(function (e) {
        e.preventDefault();
        CreateBoard();
    });
    $("#board").click(CellClickHandler);
    $("#game_controls").submit();
});
