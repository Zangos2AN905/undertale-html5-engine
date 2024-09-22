
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

    // Splash screen
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

        self.text("Credits\n\nProgramming, engine: TheLSTV\nSprites: Z3R0, TheLSTV, Toby Fox, PopipopDEV\nSound: TheLSTV, Toby Fox\nFont: Jayvee Enaguas\nIdeas: Toby Fox\nU logo: \x81\n\nSpecial thanks: Toby Fox")

        self.keyReceiver = event => {
            if(event.down && event.main || event.cancel) {
                engine.switchScreen("menu")
            }
        }
    })

    engine.createScreen("game", async self => {

        let world = {
            container: new PIXI.Container(),

            rooms: {
                test: {
                    map: new PIXI.Sprite(game.assets.map_test),

                    // "Pixel-perfect" collision
                    pixelCollisionMask: await Engine.misc.createCollisionMask("/assets/maps/test/collision.png"),

                    rectangleCollisions: [
                        {x: 0, y: 0, width: 100, height: 100}
                    ]
                }
            },

            _room: 0,

            get room(){
                return world._room
            },

            set room(value){
                if(!world.rooms[value]) return;

                world._room = value
                world.container.removeChildren()
                world.container.addChild(world.rooms[value].map)
            },

            get currentRoom(){
                return world.rooms[world._room]
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

            setFrame(id, center = true){
                if(id === player.currentFrame || !player.frames[id]) return false;

                player.currentFrame = id
                player.sprite.texture.frame = player.frames[id]

                if(center) player.container.position =  {x: screenCenterX - (player.sprite.width / 2), y: screenCenterY - (player.sprite.height / 2)}
                return true
            },

            get x(){
                return (world.container.position.x * -1) + (screenCenterX - (player.sprite.width / 2));
            },

            get y(){
                return (world.container.position.y * -1) + (screenCenterY - (player.sprite.height / 2)) + (player.baseHeight - player.collisionHeight);
            },

            speed: 2,

            frameTimer: 0,
            frameIndex: 0,

            directions: ["left", "right", "up", "down"],
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

        let camera = {
            _scale: 2,

            _worldX: 0,
            _worldY: 0,

            container: new PIXI.Container(),

            get scale(){
                return camera._scale
            },

            set scale(value){
                camera._scale = value
                camera.container.scale = {x: value, y: value}
                camera.container.position = {x: (screenCenterX * (value -1)) * -1, y: (screenCenterY * (value -1)) * -1}
            }
        }

        function collidesAt(playerX, playerY){
            
            // Pixel-Perfect collision mask
            if(world.currentRoom.pixelCollisionMask) for(let y = Math.floor(playerY); y < Math.ceil(playerY) + player.collisionHeight; y++){
                if(world.currentRoom.pixelCollisionMask[y]){
                    for (const [startX, endX] of world.currentRoom.pixelCollisionMask[y]) {
                        if(
                            playerX < endX &&
                            playerX + player.baseWidth > startX &&
                            y >= playerY &&
                            y < playerY + player.baseHeight
                        ) return true
                    }
                }
            }

            return false
        }

        self.addTicker((delta) => {
            const activeDirection = player.keyStates.indexOf(true);

            player.walking = activeDirection > -1;

            if (player.walking) {
                player.direction = activeDirection;

                let incrementX = 0, incrementY = 0;

                // Calculate movement increment
                if(player.keyStates[0]) incrementX += player.speed * delta; else if(player.keyStates[1]) incrementX -= player.speed * delta;
                if(player.keyStates[2]) incrementY += player.speed * delta; else if(player.keyStates[3]) incrementY -= player.speed * delta;
                
                // Pre-calculate the value since it doesnt change
                const playerX = player.x;
                const playerY = player.y;

                incrementX = Math.floor(incrementX)
                incrementY = Math.floor(incrementY)

                // Perform collision check - "Pixel-perfect" collisions

                // Perform final actions
                if(!collidesAt(playerX, playerY + (incrementY * -1))) world.container.position.y += incrementY
                if(!collidesAt(playerX + (incrementX * -1), playerY)) world.container.position.x += incrementX  

                // Animation
                player.frameTimer += delta;
                if (player.frameTimer > (player.direction > 1? 10: 5)) {
                    player.frameTimer = 0;
                    player.frameIndex = (player.frameIndex + 1) % (player.direction > 1? 2: 4); // Loop through the 4 animation frames
                }

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
            camera.scale = camera._scale;
            player.setFrame("down0")

            world.room = "test"

            // Fixes a PIXI.js bug somehow
            setTimeout(() => {
                camera.container.visible = true
            }, 0)
        })
    })

    engine.createScreen("gameover")
}