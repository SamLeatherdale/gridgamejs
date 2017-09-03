class Board {
    readonly rows: number;
    readonly columns: number;
    cell_size: number;
    bounds: Point;
    cells: Cell[][];
    winning_cell: Cell;
    canvas: JQuery;
    context: CanvasRenderingContext2D;
    duration = 0;
    moves = 0;
    timer: number;
    state = GameState.Initial;

    constructor(rows: number, columns: number, cell_size: number, canvas: JQuery) {
        Cell.initialize();

        this.rows = rows;
        this.columns = columns;
        this.cell_size = cell_size;
        this.bounds = new Point(columns * cell_size, rows * cell_size);
        this.cells = [];
        this.canvas = canvas;
        //Set board to correct size
        this.canvas.attr({ width: this.columns * this.cell_size + 1, height: this.rows * this.cell_size + 1 });
        this.context = (canvas.get(0) as HTMLCanvasElement).getContext("2d");

        //Populate cells
        for (let x = 0; x < rows; x++) {
            let row: Cell[] = [];
            for (let y = 0; y < columns; y++) {
                row.push(new Cell(x, y, this));
            }
            this.cells.push(row);
        }

        //Pick winning cell
        let winner_x = getRandomInt(0, this.rows);
        let winner_y = getRandomInt(0, this.columns);
        this.winning_cell = this.cells[winner_x][winner_y];
        this.winning_cell.state = CellState.Winner;


        //Set default styles for canvas
        this.context.strokeStyle = "#000000";
        //this.context.font = "16px sans-serif";
        this.context.font = (this.cell_size - 4).toString() + "px sans-serif";
        this.context.textBaseline = "bottom";
        this.context.textAlign = "center";
        this.redraw();
    }
    redraw() {
        for (let row of this.cells) {
            for (let cell of row) {
                cell.draw();
            }
        }
    }
    startTimer() {
        this.timer = setInterval(gameTimer, 1000);
    }
    stopTimer() {
        clearInterval(this.timer);
    }
    addMove() {
        this.moves += 1;
        $("#moves_value").text(this.moves);
    }
}
class Cell {
    readonly row: number;
    readonly column: number;
    board: Board;
    state: CellState = CellState.Unknown;
    static drawData: CellDrawData[] = [];
    shown: boolean = false;

    static initialize() {
        this.drawData[CellState.Unknown] = new CellDrawData("#FFFFFF", "#000000", "?");
        this.drawData[CellState.Up] = new CellDrawData("#FFC107", "#000000", "🡩");
        this.drawData[CellState.Down] = new CellDrawData("#17A2B8", "#000000", "🡫");
        this.drawData[CellState.Left] = new CellDrawData("#28A745", "#000000", "🡨");
        this.drawData[CellState.Right] = new CellDrawData("#DC3545", "#FFFFFF", "🡪");
        this.drawData[CellState.Winner] = new CellDrawData("#000000", "#FFD700", "✖");
    }

    constructor(row: number, column: number, board: Board) {
        this.row = row;
        this.column = column;
        this.board = board;
    }
    draw() {
        let ctx = this.board.context;
        let size = this.board.cell_size;

        let x = this.column * size;
        let y = this.row * size;

        //Get draw data
        let data: CellDrawData;
        if (this.shown) {
            data = Cell.drawData[this.state];
        }
        else {
            data = Cell.drawData[CellState.Unknown];
        }
        //Draw bounding box
        //+0.5 is required to make browser correctly draw lines, see http://diveintohtml5.info/canvas.html#paths for more info
        ctx.strokeRect(x + 0.5, y + 0.5, size, size);
        //Fill box
        ctx.fillStyle = data.backgroundColor;
        ctx.fillRect(x + 1, y + 1, size - 1, size - 1);
        //Draw text inside
        ctx.fillStyle = data.textColor;
        ctx.fillText(data.text, x + (size / 2), y + size + 2);

    }
    click() {
        if (this.board.state == GameState.Initial) {
            this.board.startTimer();
            this.board.state = GameState.Active;
        }
        if (!this.shown && this.board.state == GameState.Active) {
            if (this.state == CellState.Unknown) {
                let options: CellState[] = []

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
    }
}
class CellDrawData {
    backgroundColor: string;
    textColor: string;
    text: string;
    constructor(backgroundColor: string, textColor: string, text: string) {
        this.backgroundColor = backgroundColor;
        this.textColor = textColor;
        this.text = text;
    }
}
class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
enum CellState {
    Unknown, Up, Down, Left, Right, Winner
}
enum GameState {
    Initial, Active, Complete
}
function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
function gameTimer() {
    board.duration += 1;
    let duration = board.duration;
    let minutes = Math.floor(duration / 60).toString();
    if (minutes.length == 1) {
        minutes = "0" + minutes;
    }
    let seconds = (duration % 60).toString();
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
    let click = new Point(e.offsetX, e.offsetY);
    let row = Math.floor(click.y / board.cell_size);
    let column = Math.floor(click.x / board.cell_size);
    let target_cell = board.cells[row][column];
    target_cell.click();
}

var board: Board;

$(function() {
    $("#game_controls").submit(function(e) {
        e.preventDefault();
        CreateBoard();
    });

    $("#board").click(CellClickHandler);

    $("#game_controls").submit();
});
