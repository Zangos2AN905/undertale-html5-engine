function Engine(element, options){

    let _this;

    new class {

        constructor(){
            _this = this;

            _this.element = element;

            _this.options = LS.Util.defaults({}, options)

            _this.applyOptions(options)
            _this.setResolution()

            M.on("resize", this.fixResolution);

            let upFired = true;

            M.on("keyup", "keydown", (event => {
                
                let isFirst = false;
                if(event.type === "keyup") upFired = true; else if (upFired) {
                    isFirst = true
                    upFired = false
                }

                if(game.keyReceiver) game.keyReceiver({
                    down: event.type === "keydown",
                    isFirst,
                    key: event.key,
                    direction: game.settings.controls.directions.indexOf(event.key.toLowerCase()),
                    main: game.settings.controls.main.includes(event.key.toLowerCase()),
                    cancel: game.settings.controls.cancel.includes(event.key.toLowerCase()),
                    domEvent: event
                })
            }))
        }

        applyOptions(options){
            _this.width = options.width || _this.width || 640
            _this.height = options.height || _this.height || 480
        }
    
        fixResolution(){
            let element = _this.element,
        
            scale = Math.min(
                (_this.options.containerWidth || Number(window.innerWidth)) / _this.width,    
                (_this.options.containerHeight || Number(window.innerHeight)) / _this.height
            );

            _this.scale = scale

            element.style.transform = `translate(-50%, -50%)` + (_this.options.scale? ` scale(${scale})`: "");
        }
    
        setResolution(w, h){
            if(typeof w === "undefined" && typeof h === "undefined") {
                w = _this.width;
                h = _this.height;
            }
            
            let aspectRatio = _this.width / _this.height;
            if(typeof w === "undefined") w = Math.round(h * aspectRatio);
            if(typeof h === "undefined") h = Math.round(w / aspectRatio);
            
            _this.width = w;
            _this.height = h;
            
            _this.element.applyStyle({width: w +"px", height: h +"px"});
            _this.fixResolution()
    
           if(_this.invoke) _this.invoke("resolution-changed", w, h, aspectRatio)
        }

        async loadFontData(source){
            let csv = await (await fetch(source)).text()
            
            let lines = csv.replaceAll("\r", "").split("\n").map(line => line.split(",")), chars = {}, fontData = {};

            for(let line of lines){
                line = line.map(cell => cell.trim());

                if(line[0].startsWith("Char")){
                    let char = line[0].split(" "), value = +line[1], key = char[2].toLowerCase();

                    if(!chars[char[1]]) chars[char[1]] = {};

                    chars[char[1]][{base: "baseWidth", width: "widthOffset", y: "yOffset", x: "xOffset"}[key] || key] = value
                    continue
                }

                fontData[{
                    "Image Width": "imageWidth",
                    "Image Height": "imageHeight",
                    "Cell Width": "cellWidth",
                    "Cell Height": "cellHeight",
                    "Start Char": "startChar"
                }[line[0]] || line[0]] = line[0] === "Font Name"? line[1] : +line[1]
            }

            fontData.charData = chars;
            return fontData
        }

        font({texture, data}, options = {}){

            // Preloads whatever is needed for optimization

            let characterTextures = {}

            if(!options.vectorFont) texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

            for(let character in data.charData){
                character = +character;

                characterTextures[character] = new PIXI.Texture(texture, new PIXI.Rectangle(
                    Math.floor(character % (data.imageWidth / data.cellWidth)) * data.cellWidth,
                    Math.floor(character / (data.imageWidth / data.cellWidth)) * data.cellHeight,
                    data.cellWidth,
                    data.cellHeight
                ))
            }

            return {
                characterTextures,
                texture, data
            }
        }

        screenExists(id){
            return !!game.screens[id]
        }

        createScreen(id, selfCallback){
            let container = new PIXI.Container(), events = {
                activate: []
            };

            game.screens[id] = {
                container,

                events,

                isScreenObject: true,

                add(item){
                    container.addChild(item)
                },

                onActivated(callback){
                    events.activate.push(callback)
                },

                text(text, options = {}){
                    options.target = container
                    return _this.text(text, options)
                }
            }

            if(selfCallback) selfCallback(game.screens[id])

            return game.screens[id]
        }

        switchScreen(id) {
            app.stage.removeChildren();
            app.stage.addChild(game.screens[id].container);
            game.keyReceiver = game.screens[id].keyReceiver || null

            for(let listener of game.screens[id].events.activate) listener(game.screens[id])
        }

        clearAll(){
            app.stage.removeChildren();
        }

        screen(id){
            return game.screens[id]
        }

        text(text, options = {}){

            options = LS.Util.defaults({
                x: 0,
                y: 0,
                nextDelay: 0,
                letterSpacing: 4,
                lineHeight: 4,
                size: null,
                font: game.fonts.bitmap.Determination,
                wrap: true,
                wrapRect: null,
                color: 0xffffff,
                target: app.stage,
                textAlign: "left",
                scale: 1
            }, options)

            if(options.x === "center") options.x = app.screen.width / 2;
            if(options.y === "center") options.y = app.screen.height / 2;

            if(options.target.isScreenObject) options.target = options.target.container;

            let xPos = 0, yPos = 0, i = -1, doneCallback, sprites = [], container = new PIXI.Container();

            container.position.x = options.x;
            container.position.y = options.y;

            function drawNextChar(){
                i++;

                let spriteCallback;
                
                let char = text[i];

                if(options.iterator){                    
                    options.iterator({
                        i, char: text[i], text, xPos, yPos, escape: char === "\x1B", container,

                        onSprite(callback){
                            spriteCallback = callback
                        },

                        drawNextChar
                    }, options)
                }

                if(options.break) return;

                const charCode = text.charCodeAt(i) - options.font.data.startChar; // Get the character's index in the spritesheet
                const charMetrics = options.font.data.charData[charCode];

                options.target.addChild(container)

                if ((charMetrics && !options.skip) || [" ", "\n"].includes(char)) {

                    let sprite;

                    if(charMetrics){
                        sprite = new PIXI.Sprite(options.font.characterTextures[charCode]);
    
                        sprite.position.x = xPos + charMetrics.xOffset;
                        sprite.position.y = yPos + charMetrics.yOffset;

                        sprite.scale = {x: options.scale, y: options.scale};
    
                        if(char !== "\x81") sprite.tint = options.color;

                        if(spriteCallback) spriteCallback(sprite)

                        // charSprite.width = charMetrics.baseWidth + charMetrics.widthOffset; // Adjust width with offset
                        // charSprite.height = options.font.data.cellHeight;

                        if(sprite && !sprite.destroyed) {

                            container.addChild(sprite)
                            sprites.push(sprite)
                            
                            xPos += ((charMetrics.baseWidth || sprite.width) + options.letterSpacing) * options.scale;

                        } else sprite = null;
                    }

                    if(options.space) xPos += options.space, options.space = null;

                    if((options.wrap && xPos > _this.width) || char === "\n" || options.lineBreak){
                        xPos = 0
                        yPos += options.font.data.cellHeight + options.lineHeight
                    }
                }

                if(options.textAlign === "center") {
                    container.position.x = options.x - (container.width / 2)
                }

                if(i === text.length - 1) {
                    if(doneCallback) doneCallback()
                } else {
                    if(options.nextDelay < 1) drawNextChar(); else {
                        setTimeout(() => drawNextChar(), options.nextDelay)
                    }
                }
            }

            drawNextChar()

            function swap(index, charCode){
                if(!sprites[index]) return false
                sprites[index].texture = options.font.characterTextures[charCode];
                return true
            }

            return {
                done(callback){
                    doneCallback = callback
                },

                sprites,

                container,

                color(color){
                    for(let sprite of sprites){
                        sprite.tint = color
                    }
                },

                update(newText, from = 0, to = -1){
                    let j = -1
                    for(let i = from; i < (to < 0? newText.length: to); i++){
                        j++                        
                        swap(i, i >= newText.length? 0: (newText.charCodeAt(j) - options.font.data.startChar));
                    }
                },

                moveBy(x, y){
                    container.position.x += x
                    container.position.y += y
                },

                swap(index, charCode){
                    return swap(index, charCode)
                },

                hide(){
                    for(let sprite of sprites){
                        sprite.visible = false
                    }
                },

                show(){
                    for(let sprite of sprites){
                        sprite.visible = true
                    }
                },

                destroy(){
                    options.break = true;
                    container.destroy({ children: true, texture: false })
                }
            }
        }
    }

    return _this

}
