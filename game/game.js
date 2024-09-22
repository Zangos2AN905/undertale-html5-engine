
async function start(loadTime){

    console.log(`Engine loaded in ${loadTime}ms`);

    /*
        This method gets once after everything is loaded and prepared to start the game.
        It is responsible for creating game screens etc.

        At this point everything is loaded - following is purely game logic.

        Note: start() gets called *before* the splash screen is closed.
        To know when the splash screen is gone, use the menu activate event.
    */

    let screenCenterX = app.screen.width / 2, screenCenterY = app.screen.height / 2;


    engine.createScreen("splash", self => {
        const logo = new PIXI.Sprite(game.assets.logo);

        let originalWidth = logo.width;
        logo.width = Math.min(app.screen.width - 80, logo.width)
        logo.height = logo.height * (logo.width / originalWidth)
        logo.position.x = screenCenterX - (logo.width / 2)
        logo.position.y = screenCenterY - (logo.height / 2)

        self.add(logo)

        let text = self.text("[ click to enter ]", {
            x: "center",
            textAlign: "center",
            y: app.screen.height - 132,

            scale: 1,

            color: 0x777777,
            font: game.fonts.bitmap.CryptOfNextWeek
        })

        self.onActivated(() => {
            text.hide()
            viewPort.show();

            let clickTimeout = setTimeout(() => {
                text.show()                    
            }, 2500)

            viewPort.onclick = () => {
                clearTimeout(clickTimeout);

                engine.switchScreen("menu")
            }
        })
    })

    engine.createScreen("menu", self => {

        /*
            Create and draw the game menu
            Note: the order of the code matters for the z-index of sprites.
        */

        gradient: {
            const gradient = new PIXI.Sprite(game.assets.menu_gradient);

            gradient.width = app.screen.width
            self.add(gradient)

            self.addTicker((delta) => {
                gradient.alpha = Math.abs(Math.cos(Date.now() / 2500)) + .5                
            })
        }

        stars: {
            const starContainer = new PIXI.Container();

            self.add(starContainer);

            const starCount = 200;

            for (let i = 0; i < starCount; i++) {
                const star = new PIXI.Graphics();
                star.beginFill(0xFFFFFF); // White color
                star.drawCircle(0, 0, Math.random() * 2); // Radius of 2
                star.endFill();

                // Set initial position
                star.x = Math.random() * app.screen.width;
                star.y = Math.random() * app.screen.height - 200;
                
                // Add to the container
                starContainer.addChild(star);
            }

            self.addTicker((delta) => {
                starContainer.children.forEach(star => {
                    // Move stars
                    star.x += Math.sin(Date.now() / 1000 + star.y) * 0.01;
                    star.y += Math.cos(Date.now() / 1000 + star.x) * 0.01;
                    
                    // Blink stars
                    star.alpha = Math.sin(Date.now() / 1000 + star.x);
                });
            });
        }

        mountains: {
            const mountains = [new PIXI.Sprite(game.assets.menu_mountain), new PIXI.Sprite(game.assets.menu_mountain), new PIXI.Sprite(game.assets.menu_mountain), new PIXI.Sprite(game.assets.menu_mountain)];
    
            let i = 0;
            for(let mountain of mountains) {
                mountain.scale = {x: .8, y: .8}
                mountain.position.x = screenCenterX - (mountain.width / 2)
                mountain.position.y = (app.screen.height - 300) + (i * 20)
    
                let filter = new PIXI.ColorMatrixFilter();
                filter.brightness(1 - (i * .3), false);
                mountain.filters = [filter]
    
                self.add(mountain)
                i++
            }

            self.addTicker((delta) => {
                for(let i = 0; i < mountains.length; i++) {
                    mountains[i].position.x += Math.sin(Date.now() / 500 + mountains[i].position.y) * (.1 - (0.015 * i));
                }
            });
        }

        // Create menu UI:

        const menuUI = engine.layer();

        const soul = new PIXI.Sprite(game.assets.soul);
        menuUI.add(soul)

        // Copyright text
        menuUI.text("Fundrtejl V0.1 (c) TheLSTV 2024", {x: "center", textAlign: "center", y: app.screen.height - 32, color: 0xaaaaaa, font: game.fonts.bitmap.CryptOfNextWeek})

        let buttons = [
            menuUI.text("Start", {x: "center", y: screenCenterY - 35, textAlign: "center"}),
            menuUI.text("Settings", {x: "center", y: screenCenterY, textAlign: "center"}),
            menuUI.text("Credits", {x: "center", y: screenCenterY + 35, textAlign: "center"}),
            menuUI.text("Debug mode", {x: "center", y: screenCenterY + 125, textAlign: "center"}),
        ]

        let button = 0;

        function selectButton(id){
            if(id > buttons.length - 1) id = 0;
            if(id < 0) id = buttons.length - 1;

            button = id

            soul.position.x = buttons[id].container.position.x - (soul.width + 15)
            soul.position.y = buttons[id].container.position.y + (soul.height / 2)

            for(let [i, button] of buttons.entries()) button.color(i === id? 0xffff00 : 0xffffff);
        }

        let disabled = false, starting = false;

        self.addTicker((delta) => {
            if(starting) {
                menuUI.container.alpha -= (delta + 0.1) / 100

                if(menuUI.container.alpha < 0){
                    starting = false
                    engine.switchScreen("game")
                }
            }

            
        });

        // Receive key events
        self.keyReceiver = event => {
            if(disabled || starting) return;

            if(event.down && event.isFirst) {

                if(event.direction > -1){

                    selectButton(button + (event.direction === 2? -1: 1))

                } else if (event.main) {
                    
                    switch(button) {
                        case 0: // Start button
                            starting = true
                            break
                        case 1: // Settings button
                            // engine.switchScreen("settings")
                            break
                        case 2: // Credits button
                            engine.switchScreen("credits")
                            break
                        case 3:
                            game.debug = !game.debug
                            break
                    }

                }
            }
        }

        selectButton(0)

        self.onActivated(() => {

            /*
                Menu has opened (perform resets, etc.)
            */

            starting = false
            menuUI.container.alpha = 1

            selectButton(0)
        })

        self.add(menuUI)
    })

    engine.createScreen("credits", self => {

        self.text("Credits", {
            textAlign: "center",
            x: "center",
            y: 32,
            scale: 1.4,
            color: 0xffff00
        })

        self.text("\uAA03Programming, engine:\uAA00 TheLSTV\n\uAA03Sprites:\uAA00 Z3R0, TheLSTV, Toby Fox, PopipopDEV\n\uAA03Sound, music:\uAA00 TheLSTV, Toby Fox\n\uAA03Fonts:\uAA00 Jayvee Enaguas, UnnamedConlanger\n\n\n\uAA01Special thanks to Toby Fox!\n\n\uAA02Website: https://lstv.space", {
            x: 20, y: 100,
            iterator(position, options){
                switch(position.char){
                    case "\uAA00":
                        options.color = 0xeeee00
                    break
                    case "\uAA01":
                        options.color = 0xff54fc
                    break
                    case "\uAA02":
                        options.color = 0x0080ff; options.scale = .8
                    break
                    case "\uAA03":
                        options.color = 0xffffff
                    break
                }
            }
        })

        self.keyReceiver = event => {
            if(event.down && event.main || event.cancel) {
                engine.switchScreen("menu")
            }
        }

    })

    engine.createScreen("game", async self => {

        let world = {
            container: new PIXI.Container(),

            mapSprite: new PIXI.Sprite(),

            rooms: {},

            createRoom(id, options){
                world.rooms[id] = options
            },

            _room: 0,

            get room(){
                return world._room
            },

            changeRoom(value){
                if(!world.rooms[value]) return;

                let room = world.rooms[value];

                world._room = value
                world.container.removeChildren()

                world.mapSprite.texture = room.baseTexture
                world.container.addChild(world.mapSprite)

                player.x = room.defaultSpawn? room.defaultSpawn.x: 0
                player.y = room.defaultSpawn? room.defaultSpawn.y: 0
                // camera.update()
                // world.container.addChild(world.rooms[value].map)
            },

            get currentRoom(){
                return world.rooms[world._room]
            },

            initialize(){
                camera.scale = camera._scale;
                player.setFrame("down0")
                setTimeout(() => {
                    camera.container.visible = true
                }, 0)
            }
        }

        let player = {

            container: new PIXI.Container(),

            baseWidth: 20,
            baseHeight: 30,
            collisionHeight: 11,

            spriteMargin: 3,

            currentFrame: null,

            sprite: new PIXI.Sprite(game.assets.frisk),
            collision: new PIXI.Graphics(),

            frames: {},

            setFrame(id){
                if(id === player.currentFrame || !player.frames[id]) return false;

                player.currentFrame = id
                player.sprite.texture.frame = player.frames[id]
                return true
            },

            _x: 0,
            _y: 0,

            get x(){
                return player._x
            },

            set x(value){
                player._x = value
                camera.updateX()
            },

            get y(){
                return player._y
            },

            set y(value){
                player._y = value
                camera.updateY()
            },

            speed: 2,

            frameTimer: 0,
            frameIndex: 0,

            directions: ["up", "down", "left", "right"],
            keyStates: [false, false, false, false],
            
            direction: 3,
            walking: false

        }

        player.frames = {
            down0:  { x: (player.baseWidth + player.spriteMargin) * 0, y: 0, width: player.baseWidth, height: player.baseHeight },
            down1:  { x: (player.baseWidth + player.spriteMargin) * 1, y: 0, width: player.baseWidth, height: player.baseHeight },
            down2:  { x: (player.baseWidth + player.spriteMargin) * 2, y: 0, width: player.baseWidth, height: player.baseHeight },
            down3:  { x: (player.baseWidth + player.spriteMargin) * 3, y: 0, width: player.baseWidth, height: player.baseHeight },

            up0:    { x: (player.baseWidth + player.spriteMargin) * 0, y: (player.baseHeight * 2), width: player.baseWidth, height: player.baseHeight },
            up1:    { x: (player.baseWidth + player.spriteMargin) * 1, y: (player.baseHeight * 2), width: player.baseWidth, height: player.baseHeight },
            up2:    { x: (player.baseWidth + player.spriteMargin) * 2, y: (player.baseHeight * 2), width: player.baseWidth, height: player.baseHeight },
            up3:    { x: (player.baseWidth + player.spriteMargin) * 3, y: (player.baseHeight * 2), width: player.baseWidth, height: player.baseHeight },

            left0:  { x: (player.baseWidth + player.spriteMargin) * 0, y: player.baseHeight, width: player.baseWidth, height: player.baseHeight },
            left1:  { x: (player.baseWidth + player.spriteMargin) * 1, y: player.baseHeight, width: player.baseWidth, height: player.baseHeight },

            right0: { x: (player.baseWidth + player.spriteMargin) * 2, y: player.baseHeight, width: player.baseWidth, height: player.baseHeight },
            right1: { x: (player.baseWidth + player.spriteMargin) * 3, y: player.baseHeight, width: player.baseWidth, height: player.baseHeight },
        }

        world.rooms = {
            test: {
                baseTexture: game.assets.map_test,

                layers: {
                    
                },

                // "Pixel-perfect" collision
                pixelCollisionMask: await Engine.misc.createCollisionMask("/assets/maps/test/collision.png"),

                defaultSpawn: {x: 100, y: 50},

                // Objects
                objects: [
                    {solid: true, x: 0, y: 0, width: 100, height: 100}
                ]
            },
            test1: {
                baseTexture: game.assets.map_slope,

                layers: {

                },

                objects: [
                    {solid: true, x: 245, y: 132, width: 15, height: 12}
                ]
            }
        }

        let camera = {
            _scale: 2,

            container: new PIXI.Container(),

            get scale(){
                return camera._scale
            },

            set scale(value){
                camera._scale = value
                camera.container.scale = {x: value, y: value}
                // camera.container.position = {x: (screenCenterX * (value -1)) * -1, y: (screenCenterY * (value -1)) * -1}
            },

            _x: 0,
            _y: 0,

            get x(){
                return camera._x
            },

            set x(value){
                camera._x = value
                camera.container.position.x = value
            },

            get y(){
                return camera._y
            },

            set y(value){
                camera._y = value
                camera.container.position.y = value
            },

            updateX(){
                // Update world and player position
                
                const centerX = screenCenterX / camera._scale;

                const mapWidth = world.mapSprite.width;

                // Adjust for player collision
                const playerX = player.x;

                if(playerX < centerX || mapWidth <= screenCenterX){
                    world.container.position.x = 0;
                    player.container.position.x = playerX;
                } else {
                    world.container.position.x = - playerX + centerX;
                    player.container.position.x = centerX;
                }
            },

            updateY(){
                // Update world and player position

                const centerY = screenCenterY / camera._scale;

                const mapHeight = world.mapSprite.height;

                // Adjust for player collision
                const playerY = player.y - (player.baseHeight - player.collisionHeight);

                if(playerY < centerY || mapHeight <= screenCenterY){
                    world.container.position.y = 0;
                    player.container.position.y = playerY;
                } else {
                    world.container.position.y = - playerY + centerY;
                    player.container.position.y = centerY;
                }
            },
        }

        self.addTicker((delta) => {
            const activeDirection = player.keyStates.indexOf(true);

            player.walking = activeDirection > -1;

            if (player.walking) {
                player.direction = activeDirection;

                let incrementX = 0, incrementY = 0;

                // Calculate movement increment
                if(player.keyStates[2]) incrementX -= player.speed * delta; else if(player.keyStates[3]) incrementX += player.speed * delta;
                if(player.keyStates[0]) incrementY -= player.speed * delta; else if(player.keyStates[1]) incrementY += player.speed * delta;

                // Floor movement - Can help achieve more pixel-perfect movement but is less smooth
                // incrementX = Math.floor(incrementX)
                // incrementY = Math.floor(incrementY)

                // Perform collision check
                const collision = engine.collides(world, {
                    x: player.x,
                    y: player.y,
                    width: player.baseWidth,
                    height: player.collisionHeight
                }, incrementX, incrementY)

                // Move player
                if(!collision[0]) player.x += incrementX;
                if(!collision[1]) player.y += incrementY;

                if(player.direction < 2? !collision[1]: !collision[0]){
                    // Animation
                    player.frameTimer += delta;
                    if (player.frameTimer > 15 - (player.speed * 2)) {
                        player.frameTimer = 0;
                        player.frameIndex = (player.frameIndex + 1) % (player.direction < 2? 4: 2); // Loop through the 4 animation frames
                    }
                } else player.frameIndex = 0;

                player.setFrame(player.directions[player.direction] + player.frameIndex);

            } else {

                // Idle frame
                player.setFrame(player.directions[player.direction] + "0");

            }

        });
        
        self.keyReceiver = event => {
            player.keyStates[event.direction] = event.down;
        }

        game.world = { camera, player, world }

        player.container.addChild(player.sprite)

        camera.container.addChild(world.container)
        camera.container.addChild(player.container)

        self.add(camera.container)

        camera.container.visible = false
        
        self.onActivated(() => {
            world.initialize()
        })
    })

    engine.createScreen("fight", self => {
        // Fight
    })

    engine.createScreen("gameover", self => {
        // Game over
    })
}