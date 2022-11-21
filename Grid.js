/*const GRID_SIZE = 4
const CELL_SIZE = 10
const CELL_GAP = 2*/


export default class Grid{
    cells
    tilecount
    grid_width
    grid_height
    grid_size
    gridElement
    constructor(gridElement,GRID_WIDTH=4,GRID_HEIGHT=4,CELL_SIZE=10,CELL_GAP=2){
        this.gridElement = gridElement
        gridElement.style.setProperty("--grid-horizontal",GRID_WIDTH);
        gridElement.style.setProperty("--grid-vertical",GRID_HEIGHT);
        this.grid_width = GRID_WIDTH;
        this.grid_height = GRID_HEIGHT;
        this.grid_size = GRID_HEIGHT * GRID_WIDTH
        //gridElement.style.setProperty("--cell-size",`${CELL_SIZE}vmin`);
        //gridElement.style.setProperty("--cell-gap",`${CELL_GAP}vmin`);
        // cells makes it a private field
        this.cells = createCellElements(gridElement,this.grid_size)
        .map((cellElement,index) =>{
            return new Cell(cellElement,
                  index % this.grid_width,
                  Math.floor(index/this.grid_width));
        });
        this.tilecount = 0
    }
    get cells() {
        return this.cells
    }
    get cellsByColumn() {
        return this.cells.reduce((cellGrid, cell) => {
            cellGrid[cell.x] = cellGrid[cell.x] || [] //this creates the array in the first iteration
            cellGrid[cell.x][cell.y] = cell
            return cellGrid
        },[])
    }
    get cellsByRow() {
        return this.cells.reduce((cellGrid, cell) => {
            cellGrid[cell.y] = cellGrid[cell.y] || [] //this creates the array in the first iteration
            cellGrid[cell.y][cell.x] = cell
            return cellGrid
        },[])
    }

    get #emptyCells(){
        return this.cells.filter(cell => cell.tile == null);
    }
    get tileCount(){
        return this.tilecount
    }
    setTileCount(value){
        this.tileCount = value
    }
    randomEmptyCell(){
        const randomIndex = Math.floor(Math.random() * this.#emptyCells.length);
        return this.#emptyCells[randomIndex];
    }
    addTileToRandomCell(tile){
        this.randomEmptyCell().tile = tile
        //console.log(this.randomEmptyCell())
        this.tilecount++
        return tile
    }
    tileAdded(){
        this.tilecount++
    }
    isFull(){
        return this.tilecount === this.grid_size
    }
    tilesMerged(oldTile, mergedTile){
        this.tilecount--
    }
    emptyGrid(){
        this.cells.forEach(cell => { 
            if(cell.tile != null){ 
                cell.tile.remove()
                cell.tile = null
            }
        })
        this.tilecount = 0
    }

}

class Cell{
    #cellElement
    #x
    #y
    #tile
    #mergeTile

    constructor(cellElement, x, y){
        this.#cellElement = cellElement;
        this.#x = x;
        this.#y = y;
    }
    get x() {
        return this.#x
    }
    get y(){
        return this.#y
    }
    get tile(){
        return this.#tile;
    }

    set tile(value){
        this.#tile = value;
        if (value == null) return;
        this.#tile.x = this.#x;
        this.#tile.y = this.#y;
    }

    get mergeTile(){
        return this.#mergeTile
    }

    set mergeTile(value){
        this.#mergeTile = value
        if(value == null) return
        this.#tile.merged()
        this.#mergeTile.x = this.#x
        this.#mergeTile.y = this.#y
    }

    canAccept(tile){
        return (this.tile == null ||
            //(cannot merge more than once in the same turn) 
            (this.mergeTile == null && this.tile.value === tile.value))
    }

    mergeTiles(callback){
        if(this.#tile == null || this.mergeTile == null) return 0
        this.tile.value = this.tile.value + this.mergeTile.value
        this.mergeTile.remove()
        this.mergeTile = null
        return this.tile.value
    }

}

function createCellElements(gridElement,count){
    const cells = []
    for(let i=0; i<count;i++){
        const cell = document.createElement("div");
        cell.classList.add("cell"); 
        cells.push(cell);
        gridElement.append(cell);
    }
    return cells;
}
