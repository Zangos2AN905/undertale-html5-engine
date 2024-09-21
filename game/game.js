
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

        self.text("=== Credits ===\n\nProgramming, engine: TheLSTV\nSprites: Z3R0, TheLSTV, Toby Fox\nSound: TheLSTV, Toby Fox\nFont: Jayvee Enaguas\nIdeas: Toby Fox\nU logo: \x81\n\nSpecial thanks: Toby Fox")

        self.keyReceiver = event => {
            if(event.down && event.main || event.cancel) {
                engine.switchScreen("menu")
            }
        }
    })

    engine.createScreen("game", self => {

        // Player - Frisk texture

        let playerBaseWidth = 20, playerBaseHeight = 30, playerSpriteMargin = 3, playerCurrentFrame, playerCollisionHeight = 11;

        let world = {
            container: new PIXI.Container(),
            map: new PIXI.Sprite(game.assets.map_test)
        }

        // Test!
        world.container.addChild(world.map)

        let player = {

            container: new PIXI.Container(),

            sprite: new PIXI.Sprite(game.assets.frisk),
            collision: new PIXI.Graphics(),

            frames: {
                down0:  { x: (playerBaseWidth + playerSpriteMargin) * 0, y: 0, width: playerBaseWidth, height: playerBaseHeight },
                down1:  { x: (playerBaseWidth + playerSpriteMargin) * 1, y: 0, width: playerBaseWidth, height: playerBaseHeight },
                down2:  { x: (playerBaseWidth + playerSpriteMargin) * 2, y: 0, width: playerBaseWidth, height: playerBaseHeight },
                down3:  { x: (playerBaseWidth + playerSpriteMargin) * 3, y: 0, width: playerBaseWidth, height: playerBaseHeight },
                up0:    { x: (playerBaseWidth + playerSpriteMargin) * 0, y: (playerBaseHeight * 2), width: playerBaseWidth, height: playerBaseHeight },
                up1:    { x: (playerBaseWidth + playerSpriteMargin) * 1, y: (playerBaseHeight * 2), width: playerBaseWidth, height: playerBaseHeight },
                up2:    { x: (playerBaseWidth + playerSpriteMargin) * 2, y: (playerBaseHeight * 2), width: playerBaseWidth, height: playerBaseHeight },
                up3:    { x: (playerBaseWidth + playerSpriteMargin) * 3, y: (playerBaseHeight * 2), width: playerBaseWidth, height: playerBaseHeight },
                left0:  { x: (playerBaseWidth + playerSpriteMargin) * 0, y: playerBaseHeight, width: playerBaseWidth, height: playerBaseHeight },
                left1:  { x: (playerBaseWidth + playerSpriteMargin) * 1, y: playerBaseHeight, width: playerBaseWidth, height: playerBaseHeight },
                right0: { x: (playerBaseWidth + playerSpriteMargin) * 2, y: playerBaseHeight, width: playerBaseWidth, height: playerBaseHeight },
                right1: { x: (playerBaseWidth + playerSpriteMargin) * 3, y: playerBaseHeight, width: playerBaseWidth, height: playerBaseHeight },
            },

            setFrame(id, center = true){
                if(id === playerCurrentFrame || !player.frames[id]) return;

                playerCurrentFrame = id
                player.sprite.texture.frame = player.frames[id]

                if(center) player.container.position =  {x: screenCenterX - (player.sprite.width / 2), y: screenCenterY - (player.sprite.height / 2)}
            },

            get x(){
                return (world.container.position.x * -1) + (screenCenterX - (player.sprite.width / 2));
            },

            get y(){
                return (world.container.position.y * -1) + (screenCenterY - (player.sprite.height / 2)) + (playerBaseHeight - playerCollisionHeight);
            }

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

        let playerDirection = 3, playerWalking = false;

        let frameIndex = 0;
        let frameTimer = 0;
        let directions = ["left", "right", "up", "down"];
        let keyStates = [false, false, false, false];

        let playerSpeed = 2;

        self.addTicker((delta) => {
            let activeDirection = keyStates.indexOf(true);

            playerWalking = activeDirection > -1;

            if (playerWalking) {

                playerDirection = activeDirection

                let incrementX = 0, incrementY = 0;

                // Calculate movement increment
                if(keyStates[0]) incrementX += playerSpeed * delta; else if(keyStates[1]) incrementX -= playerSpeed * delta;
                if(keyStates[2]) incrementY += playerSpeed * delta; else if(keyStates[3]) incrementY -= playerSpeed * delta;
                
                // Pre-calculate the value since it doesnt change
                const playerX = player.x;
                const playerY = player.y;

                incrementX = Math.floor(incrementX)
                incrementY = Math.floor(incrementY)

                // Perform collision check

                function collidesAt(playerX, playerY){
                    for(let y = Math.floor(playerY); y < Math.ceil(playerY) + playerCollisionHeight; y++){
                        if(window.mask[y]){
                            for (const [startX, endX] of window.mask[y]) {
                                if(
                                    playerX < endX &&
                                    playerX + playerBaseWidth > startX &&
                                    y >= playerY &&
                                    y < playerY + playerBaseHeight
                                ) return true
                            }
                        }
                    }
                    return false
                }
                
                // Perform final actions
                if(!collidesAt(playerX, playerY + (incrementY * -1))) world.container.position.y += incrementY
                if(!collidesAt(playerX + (incrementX * -1), playerY)) world.container.position.x += incrementX  


                // Animation
                frameTimer += delta;
                if (frameTimer > (playerDirection > 1? 10: 5)) {
                    frameTimer = 0;
                    frameIndex = (frameIndex + 1) % (playerDirection > 1? 2: 4); // Loop through the 4 animation frames
                }

                player.setFrame(directions[playerDirection] + frameIndex);

            } else {

                // Idle frame
                player.setFrame(directions[playerDirection] + "0");

            }
        });

        // window.checkCollision = function checkCollision(mask) {
        //     const playerX = (world.container.position.x * -1) + (screenCenterX - (player.sprite.width / 2));
        //     const playerY = (world.container.position.y * -1) + (screenCenterY - (player.sprite.height / 2)) + (playerBaseHeight - playerCollisionHeight);

        //     console.log(playerX, playerY);
            

        //     const playerWidth = playerBaseWidth;
        //     const playerHeight = playerCollisionHeight;
        
        //     // Loop through the mask rows that overlap with the player's vertical position
        //     for (let y = Math.floor(playerY); y < Math.ceil(playerY + playerHeight); y++) {
        //         if (mask[y]) {
        //             for (const [startX, endX] of mask[y]) {
        //                 // Check if the player's rectangle overlaps with this segment
        //                 if (
        //                     playerX < endX &&             // Player's left is before segment's end
        //                     playerX + playerWidth > startX && // Player's right is after segment's start
        //                     y >= playerY &&                // Player's top is at or below the segment's row
        //                     y < playerY + playerHeight    // Player's bottom is above the segment's row
        //                 ) {
        //                     return true; // Collision detected
        //                 }
        //             }
        //         }
        //     }

        //     return false; // No collision detected
        // }
        
        self.keyReceiver = event => {
            keyStates[event.direction] = event.down;
        }

        game.world = { camera, player, world }

        player.container.addChild(player.sprite)

        camera.container.addChild(world.container)
        camera.container.addChild(player.container)

        self.add(camera.container)

        camera.container.visible = false
        
        self.onActivated(() => {
            camera.scale = camera._scale;
            player.setFrame("front0")

            // Fixes a PIXI.js bug somehow
            setTimeout(() => {
                camera.container.visible = true
            }, 0)
        })
    })

    engine.createScreen("gameover")
}