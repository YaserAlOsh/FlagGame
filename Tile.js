const toHSLObject = hslStr => {
    const [hue, saturation, lightness] = hslStr.match(/\d+/g).map(Number);
    return { hue, saturation, lightness };
  };
const toHSLString = hslObj => `hsl(${hslObj.hue}, ${hslObj.saturation}%, ${hslObj.lightness}%)`
export default class Tile{
    #tileElement
    #tileText
    #x
    #y
    #value
    #valColorMap
    #valTextMap
    constructor(tileContainer,valColorMap,valTextMap, value = Math.random() > .5 ? 1 : 2){
        this.#tileElement = document.createElement("div");
        this.#tileText = document.createElement("div");
        this.#tileElement.appendChild(this.#tileText);
        this.#tileElement.classList.add("tile");
        this.#tileText.classList.add("text");
        tileContainer.append(this.#tileElement);
        
        this.#valColorMap = valColorMap;
        this.#valTextMap = valTextMap;
        this.value = value;
    }
    get value() {
        return this.#value
    }
    
    set value(v){
        this.#value = v
        //this.#tileText.textContent = v //.style.setProperty("content", v)
        // How many times this value has been raised by 2
        //const power = Math.log2(v)
        //const backgroundLightness = Math.max(100 - power * 6,0)
        //this.#tileElement.style.setProperty("--background-lightness",`${backgroundLightness}%`)
        //this.#tileElement.style.setProperty("--text-lightness",`${backgroundLightness <= 50 ? 90 : 10}%`)
        //console.log(this.#valColorMap(v))
        let colors = this.#valColorMap(v)
        this.#tileElement.style.background = colors['bg'] 
        let hls = toHSLObject(colors['bg'] )
        let txthls = toHSLObject(colors['txt'])
        txthls.lightness = 100 - hls.lightness
        //hls.hue = (hls.hue + 180) % 360
        this.#tileText.textContent = this.#valTextMap(v)
        console.log(colors['txt'] )
        this.#tileText.style.color = toHSLString(txthls)
    }
    setText(text){
        this.#tileText.textContent = text

        
    }

    set x(value){
        this.#x = value
        this.#tileElement.style.setProperty("--x",value)
    }

    set y(value){
        this.#y = value
        this.#tileElement.style.setProperty("--y",value)
    }
    get tileText(){
        return this.#tileText
    }
    removeAnimation(){
        this.tileText.classList.remove("anim");
    }
    merged(){
        this.#tileText.classList.add("anim");
        /*setTimeout(this.removeAnimation,
            /*function(){
            this.#tileText.classList.remove("anim");
        },
        1000);*/
        this.waitForTextTransition(true).then(() =>{
            this.tileText.classList.remove("anim");
        })
        
        //this.#tileText.style.getProperty("animation-duration"));
    }
    
    remove() {
        this.#tileElement.remove()
    }
    waitForTransition(animation = false){
        return new Promise(resolve =>{
            this.#tileElement.addEventListener(
                animation? "animationend" : "transitionend",
                resolve, {once:true})
        })
    }
    waitForTextTransition(animation = false){
        return new Promise(resolve =>{
            this.#tileText.addEventListener(
                animation? "animationend" : "transitionend",
                resolve, {once:true})
        })
    }
}