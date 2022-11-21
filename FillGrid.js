import Grid from "./Grid.js";
export default class FillGrid extends Grid{
    currX
    currY
    rowFirst
    fillCount
    #filledSoFar
    #lastFilledTile
    currFills
    #filled
    highestValue
    constructor(gridElement,fillCount=1,fillRow=true,GRID_WIDTH=4,GRID_HEIGHT=4,CELL_SIZE=10,CELL_GAP=2){
        super(gridElement,GRID_WIDTH,GRID_HEIGHT,CELL_SIZE,CELL_GAP)
        this.currX = 0
        this.currY = 0
        this.fillCount = fillCount
        this.rowFirst = fillRow
        this.#filledSoFar = 0
        this.currFills=0
        this.#filled=false
        this.highestValue = 0
    }

    fillTile(tile){
        //if (this.#filled)
          //  return
        if (this.tileCount == this.grid_size){
            this.currFills++
            if (this.currFills == this.fillCount){
                this.#filled=true
                this.highestValue = this.#lastFilledTile.value
                return
            }
        }
        //console.log(this.currX + this.currY)
        //console.log(this.grid_width)
        let index = this.currX + this.currY*this.grid_width
        if (this.cells[index].tile !== undefined){
            this.cells[index].tile.remove()
            this.cells[index].tile = tile
        }
        else 
            this.cells[index].tile = tile
        
        super.tileAdded()
        if (this.rowFirst){
            this.currX = (this.currX + 1) % this.grid_width
            if (this.currX == 0)
                this.currY = (this.currY + 1) % this.grid_height  
        }else {
            this.currY = (this.currY + 1) % this.grid_height
            if (this.currY == 0)
                this.currX = (this.currY + 1) % this.grid_width
        } 
        this.#lastFilledTile = tile
        this.#filledSoFar++
        if(this.#filledSoFar == this.fillCount)
            this.#filledSoFar = 0
        return tile
    }
    getLastFilledTile(){
        return this.#lastFilledTile
    }
    canAddNewTile(){
        return this.#filledSoFar < this.fillCount
    }
    shouldFillExistingTile(){
        return this.#filledSoFar > 0 && this.canAddNewTile()
    }
    emptyGrid(){
        this.currX = 0
        this.currY = 0
        this.#filled=false
        this.currFills = 0
        super.emptyGrid()
    }
}