import Grid from "./Grid.js";
import Tile from "./Tile.js";
import FillGrid from "./FillGrid.js";

function parse(str) {
    return Function(`'use strict'; return (${str})`)()
  }
  

let playing = true
let lost = false
const gameBoard = document.getElementById("game-board")
const lostMenu = document.getElementById("game-over")
const scoreText = document.getElementById("score")
const bestScoreText = document.getElementById("high-score")
const flagCompletedMenu = document.getElementById("flag-completed")
const shallowFlagCompletedMenu = document.getElementById("shallow-flag-completed")

let score = 0
let bestScore = 0
let highestVal = 1
const grid = new Grid(gameBoard)

const flag_colors = ["--color_grey","--color_white","--color_green","--color_black","--color_red"]
const text_colors = ["--color_grey_text","--color_white_text","--color_green_text","--color_black_text","--color_red_text"]
//["--color_grey","--color_red","--color_green","--color_white","--color_black"]
const light_percents = [[65,100],[85,100],[46,26],[30,0],[62,42]]//[[50,50],[75,50],[35,25],[85,100],[10,0]]
const colors_indices = ["white","green","black","red"]
let color_count = flag_colors.length
// I will change the saturation of the colors from a fixed percentage till a fixed percent.
//Each turn we will move from one color to another.
//for 4 colors, adding a grey block for a start, players will need to reach 2^5 or 32 to finish.
//But if we add one variant for each color, they will need to reach on 2^9 or 512.
// If instead we only use 8 colors, then 2^8 = 256. 
// In this case, two of the low lightness colors would produce one final color block from the flag.

const toHSLObject = hslStr => {
    const [hue, saturation, lightness] = hslStr.match(/\d+/g).map(Number);
    return { hue, saturation, lightness };
  };
const toHSLString = hslObj => `hsl(${hslObj.hue}, ${hslObj.saturation}%, ${hslObj.lightness}%)`

function getValueColorIdx(val){
    //val = Math.log2(val)-1
    val = getValueOrder(val)
    if (val == 0)
        return 0
    if (val >= color_count)
        return val%(color_count) + 1 //subtract 1 and add 1 to skip the first element in flag_colors
    return val
}

function mapValueColor(val){
    let idx = getValueColorIdx(val)
    //console.log(val+":"+idx)
    let color = flag_colors[idx]
    let light = light_percents[idx][getValueOrder(val)>=color_count ? 1:0]
    console.log(color+":"+light)
    //console.log(getComputedStyle(document.documentElement))
    let hls = toHSLObject(getComputedStyle(document.documentElement).getPropertyValue(color))
    hls.lightness = light
    let txt_hls = toHSLObject(getComputedStyle(document.documentElement).getPropertyValue(text_colors[idx]))
    //console.log(typeof(hls))
    return {'bg':toHSLString(hls),'txt':toHSLString(txt_hls)}
}
function mapValueText(val){
    let idx = getValueOrder(val)
    if (idx == 0)
        return '#'
    return colors_indices[(idx-1)%colors_indices.length].charAt(0).toUpperCase()
}

let flag_children = Array.from(document.getElementById("flag").children)//.querySelectorAll("#node > div"))
//console.log(flag_children)
let flags_count = flag_children.length
let ctr = 0
let flag_grids = []

for (var c=0; c<colors_indices.length; c++){
    if (flag_children[c].className.includes(colors_indices[c]))
        continue;
    let nc = 0;
    for (; nc<colors_indices.length; nc++){
        if (flag_children[c].className.includes(colors_indices[nc]))
            break;
    }
    //console.log("swap: "+c+" "+nc)
    let temp = flag_children[c];
    flag_children[c] = flag_children[nc];
    flag_children[nc] = temp;
}

function getStrInsideParentheses(str){
    let p1 = str.indexOf('(')
    let p2 = str.indexOf(')')
    if (p1 == -1 || p2 == -1 || p2-p1 <= 1)
        return str
    let new_str = ''
    for (var i =p1+1;i<p2;i++)
        new_str += str[i]
    return new_str;
}

flag_children.forEach(fg => {
    console.log(fg)
    let width = getComputedStyle(fg).getPropertyValue("--grid-horizontal")
    let height = getComputedStyle(fg).getPropertyValue("--grid-vert")
    width = parse(getStrInsideParentheses(width))
    height = parse(getStrInsideParentheses(height))
    flag_grids.push({'grid':new FillGrid(fg,1,true,width,height),'color':flag_colors[ctr%flags_count]})
});
function mapValueToFlagGrid(val){
    //val = Math.log2(val)-1b  
    console.log(getValueOrder(val)%flags_count)
    return flag_grids[getValueOrder(val)%flags_count];
}

let startTouch = false
let prevX = 0
let prevY = 0
const yMinSwipeTouchDist = 30
const xMinSwipeTouchDist = 30
let handlingEvent = false

updateHighScore()
setupInput()
startGame()

function startGame(){
    grid.addTileToRandomCell(new Tile(gameBoard,mapValueColor,mapValueText,1)).setText('#')
    grid.addTileToRandomCell(new Tile(gameBoard,mapValueColor,mapValueText,1)).setText('#')
    playing = true
    score = 0
    updateScore();
}

function setupInput(){
    handlingEvent = false
    window.addEventListener("keydown",e=> {
        e.preventDefault();
        handleInput(e.key)
    }, {once: true})
    
}
gameBoard.addEventListener("touchstart",e => {
    if(lost || !playing)
        return;
    e.preventDefault()
    startTouch = true;
    ;[...e.changedTouches].forEach(touch =>{
        prevX = touch.pageX
        prevY = touch.pageY
    })
})
gameBoard.addEventListener("touchmove", e=> {
    if(lost || !playing || handlingEvent)
        return;
    if(!startTouch)
        return
    
    let touch = e.changedTouches[0]
    if(touch === undefined)
        return
    //console.log(touch)
    
},{passive:true});
gameBoard.addEventListener("touchend", e=> {
    if(lost || !playing)
        return;
    if(e.changedTouches.length === 0)
        startTouch = false;
    let touch = e.changedTouches[0]
    if(touch === undefined)
        return
    if(Math.abs(touch.pageY - prevY) >= yMinSwipeTouchDist){
        if(touch.pageY < prevY)
            handleInput("ArrowUp");
        else 
           handleInput("ArrowDown");
    }else if(Math.abs(touch.pageX - prevX) >= xMinSwipeTouchDist){
        if(touch.pageX > prevX)
            handleInput("ArrowRight");
        else 
            handleInput("ArrowLeft");
    }
},{passive:true})


async function handleInput(key){
    handlingEvent = true
    if(!playing){
        if(lost){
            if(key === "Enter"){
                restartGame()
			}
        }
        handlingEvent = false
        return
    }
    let res = {canMove:false}
    switch (key){
        case "ArrowUp":
            /*if(!canMove()){
                setupInput()
                return
            }*/
            
            await moveUp(res)
            if(!res.canMove)
            {
                setupInput()
                return
            }
            break
        case "ArrowDown":
            /*if(!canMove()){
                setupInput()
                return
            }*/
            //let res = {canMove:false}
            await moveDown(res)
            if(!res.canMove)
            {
                setupInput()
                return
            }
            break
        case "ArrowLeft":
            /*if(!canMove()){
                setupInput()
                return
            }*/
            //let res = {canMove:false}
            await moveLeft(res)
            if(!res.canMove)
            {
                setupInput()
                return
            }
            break
        case "ArrowRight":
            /*if(!canMove()){
                setupInput()
                return
            }*/
            //let res = {canMove:false}
            await moveRight(res)
            if(!res.canMove)
            {
                setupInput()
                return
            }
            break
        default:
            await setupInput()
            return
    }
    //handlingEvent = false
    grid.cells.forEach(cell => {
        score += Math.min(1,cell.mergeTiles())
        if(cell.tile != null)
            mapValueColor(cell.tile.value)
    })
    updateScore(score);
	
    const newTile = new Tile(gameBoard,mapValueColor,mapValueText,getRandomTileValue())

    if (getValueOrder(newTile.value) > 0){
        //let fg = mapValueToFlagGrid(newTile.value)
    }
    
    grid.addTileToRandomCell(newTile)
    //grid.tileAdded()
    //console.log(grid.tileCount)
    if(!canMoveAtAll()){
        console.log("Cannot move")
        newTile.waitForTransition(true).then(() => {
            console.log("show lost ui")
            setTimeout(showLoseUI(),3000);
        })
        return
    }
    setupInput()
}
function moveUp(res) {
    return slideTiles(grid.cellsByColumn,res)
}
function moveDown(res) {
    return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()),res)
}
function moveLeft(res) {
    return slideTiles(grid.cellsByRow,res)
}
function moveRight(res) {
    return slideTiles(grid.cellsByRow.map(column => [...column].reverse()),res)
}
function slideTiles(cells, res) {
    return Promise.all(
        //Loop through each column
        cells.flatMap(group => {
            const promises = []
            //For each item, check if it can move.
            for(let i=1; i < group.length; i++){
                const cell = group[i]
                if(cell.tile == null) continue
                let lastValidCell
                for(let j=i-1; j>=0; j--){
                    const moveToCell = group[j]
                    //Cannot move up. break.
                    if(!moveToCell.canAccept(cell.tile)) break
                    lastValidCell = moveToCell
                }
                //Is there a valid cell?
                if(lastValidCell != null){
                    if(!res.canMove)
                        res.canMove = true;
                    promises.push(cell.tile.waitForTransition())
                    //Should it be merged? (If tile is not null, it means we found a cell of the same value)
                    if(lastValidCell.tile != null){
                        lastValidCell.mergeTile = cell.tile
                        grid.tilesMerged(cell.tile, lastValidCell.tile)
                        console.log(lastValidCell.tile.value)
                        let fg = mapValueToFlagGrid(lastValidCell.tile.value)
                        //let ftile = fg.getLastFilledTile()
                        //if (fg.currFills > 0) {
                            
                        if (fg !== undefined && cell.tile.value + lastValidCell.tile.value > fg['grid'].highestValue){
                            addNewTileToFlagGrid(fg,cell.tile.value + lastValidCell.tile.value)
                        }
                        if (allFlagGridsFilled()){
                            flagGridsFilled()
                        }
                        //}
                        //if (!fg.filled || ftile === undefined || cell.tile.value + lastValidCell.tile.value > ftile.value){
                          //  addNewTileToFlagGrid(fg,cell.tile.value + lastValidCell.tile.value)
                        //}
                    }else {
                        lastValidCell.tile = cell.tile
                    }
                    cell.tile = null
                }
            }
            return promises
        })
    )
}
function addNewTileToFlagGrid(fg,val){
    
    let newTile = fg['grid'].fillTile(new Tile(fg['grid'].gridElement,mapValueColor,mapValueText))
    if (newTile !== undefined)
        newTile.value = val
}

function allFlagGridsFilled(){
    let flag = true
    flag_grids.forEach(fg => {
        if (fg['grid'].currFills == 0)
            flag = false
    })
    return flag
}
let filledTimes=0
let completedOnce = false
function flagGridsFilled(){
    filledTimes++
    
    if (filledTimes == 2)
        showWinUI();
    else if (!completedOnce)
        ShowSmallWin();
    completedOnce = true
}

function ShowSmallWin(){
    shallowFlagCompletedMenu.classList.add("active");
    setTimeout( function() { 
        shallowFlagCompletedMenu.classList.remove("active");
     }, 5000);
}
function showWinUI(){
    flagCompletedMenu.classList.add("active");
    showLoseUI();
}
function showLoseUI(){
    //lostMenu.style.setProperty("display","block");
    lostMenu.classList.add("active");
	let endScoreText = lostMenu.getElementsByClassName("score")[0]
	endScoreText.textContent = score
    if(score > bestScore){
        bestScore = score
        localStorage.setItem("best-score-2048",bestScore);
        
        triggerElement(lostMenu.getElementsByClassName("high-score-alert")[0])
        updateHighScore()
    }
	if(score < 25){
		lostMenu.getElementsByClassName("low-points")[0].classList.add("active");
		
		if(lostMenu.getElementsByClassName("good-points")[0].classList.contains("active"))
			lostMenu.getElementsByClassName("good-points")[0].classList.remove("active");
	}else {
		if(lostMenu.getElementsByClassName("low-points")[0].classList.contains("active"))
			lostMenu.getElementsByClassName("low-points")[0].classList.remove("active");
		
		lostMenu.getElementsByClassName("good-points")[0].classList.add("active");
	}
    new Promise(resolve => lostMenu.addEventListener(
       "animationend",
        resolve, {once:true})).then(() => {
            playing = false
            lost = true
            
            window.addEventListener("click",restartGame, {once: true})
			window.addEventListener("keydown",e=> {handleInput(e.key)}, {once: true})
        })
}
function restartGame(){
    if(!lost)
        return
    lostMenu.classList.remove("active");
    flagCompletedMenu.classList.remove("active");
    lost = false
    highestVal = 1
    filledTimes = 0
    grid.emptyGrid()
    flag_grids.forEach(fg => {
        fg['grid'].emptyGrid()
    });
    startGame()
    setupInput()
}



function canMoveAtAll(){
    if(!grid.isFull()){
        return true
    }
    return  canMove(grid.cellsByColumn) ||
            canMove(grid.cellsByColumn.map(column => [...column].reverse())) ||
            canMove(grid.cellsByRow) ||
            canMove(grid.cellsByRow.map(row => [...row].reverse()))
}
function canMove(cells){
    return cells.some(group => {
        return group.some((cell,index) => {
            if (index === 0) return false
            if(cell.tile == null) return false
            const moveToCell = group[index - 1]
            return moveToCell.canAccept(cell.tile)
        })
    })
}

function updateScore(){
    scoreText.textContent = score
}

function getRandomTileValue(){
    //return 1;
	let r = Math.random()
    if (highestVal > 4)
	    r = r > 0.5 ? 4 : 8;
    else 
        r = r >  0.5 ? 2 : 4;
    if (r > highestVal)
        highestVal = r
    return r
	//return r > 0.25 ? (r < 0.5 ? 4 : 2) : 1;
}
function getValueOrder(val){
    //return val-1;
    return Math.floor(Math.log2(val));
}
function updateHighScore(){
    
    if(localStorage.getItem("best-score-2048") !== undefined){
        
        bestScore = localStorage.getItem("best-score-2048")
        console.log(bestScoreText)
        bestScoreText.textContent = bestScore
        /*for(i in bestScoreTexts){
            i.textContent = bestScore
        }*/
    }
}

function triggerElement(element){
    if(element.classList.contains("active"))
        element.classList.remove("active")
    else
        element.classList.add("active")
}