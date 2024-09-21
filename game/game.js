
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

            let filter = new PIXI.ColorMatrixFilter();
            gradient.filters = [filter]

            self.addTicker((delta) => {
                filter.brightness(Math.max(.5, (Math.cos(Date.now() / 5000) * .5) + .5), false);
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

        const soul = new PIXI.Sprite(game.assets.soul);
        self.add(soul)

        // Copyright text
        self.text("Fundrtejl V0.1 (c) TheLSTV 2024", {x: "center", textAlign: "center", y: app.screen.height - 32, color: 0xaaaaaa, font: game.fonts.bitmap.CryptOfNextWeek})

        let buttons = [
            self.text("Start", {x: "center", y: screenCenterY - 35, textAlign: "center"}),
            self.text("Settings", {x: "center", y: screenCenterY, textAlign: "center"}),
            self.text("Credits", {x: "center", y: screenCenterY + 35, textAlign: "center"}),
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

        // Receive key events
        self.keyReceiver = event => {
            if(event.down && event.isFirst) {

                if(event.direction > -1){

                    selectButton(button + (event.direction === 2? -1: 1))

                } else if (event.main) {
                    
                    switch(button) {
                        case 0: // Start button
                            engine.switchScreen("game")
                            break
                        case 1: // Settings button
                            // engine.switchScreen("settings")
                            break
                        case 2: // Credits button
                            engine.switchScreen("credits")
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

            selectButton(0)
        })
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

        let playerBaseWidth = 20, playerBaseHeight = 30, playerSpriteMargin = 3, playerCurrentFrame;

        let player = {
            sprite: new PIXI.Sprite(game.assets.frisk),

            frames: {
                front0: { x: (playerBaseWidth + playerSpriteMargin) * 0, y: 0, width: playerBaseWidth, height: playerBaseHeight },
                front1: { x: (playerBaseWidth + playerSpriteMargin) * 1, y: 0, width: playerBaseWidth, height: playerBaseHeight },
                front2: { x: (playerBaseWidth + playerSpriteMargin) * 2, y: 0, width: playerBaseWidth, height: playerBaseHeight },
                front3: { x: (playerBaseWidth + playerSpriteMargin) * 3, y: 0, width: playerBaseWidth, height: playerBaseHeight },
                back0:  { x: (playerBaseWidth + playerSpriteMargin) * 0, y: (playerBaseHeight * 2), width: playerBaseWidth, height: playerBaseHeight },
                back1:  { x: (playerBaseWidth + playerSpriteMargin) * 1, y: (playerBaseHeight * 2), width: playerBaseWidth, height: playerBaseHeight },
                back2:  { x: (playerBaseWidth + playerSpriteMargin) * 2, y: (playerBaseHeight * 2), width: playerBaseWidth, height: playerBaseHeight },
                back3:  { x: (playerBaseWidth + playerSpriteMargin) * 3, y: (playerBaseHeight * 2), width: playerBaseWidth, height: playerBaseHeight },
                left0:  { x: (playerBaseWidth + playerSpriteMargin) * 0, y: playerBaseHeight, width: playerBaseWidth, height: playerBaseHeight },
                left1:  { x: (playerBaseWidth + playerSpriteMargin) * 1, y: playerBaseHeight, width: playerBaseWidth, height: playerBaseHeight },
                right0: { x: (playerBaseWidth + playerSpriteMargin) * 2, y: playerBaseHeight, width: playerBaseWidth, height: playerBaseHeight },
                right1: { x: (playerBaseWidth + playerSpriteMargin) * 3, y: playerBaseHeight, width: playerBaseWidth, height: playerBaseHeight },
            },

            setFrame(id, center = true){
                if(id === playerCurrentFrame || !player.frames[id]) return;

                playerCurrentFrame = id
                player.sprite.texture.frame = player.frames[id]
                if(center) player.sprite.position =  {x: screenCenterX - (player.sprite.width / 2), y: screenCenterY - (player.sprite.height / 2)}
            }
        }


        // debug
        // player.sprite.scale = {x: 6, y: 6}

        player.setFrame("front0") // Initial sprite

        let playerDirection = 3, playerWalking = false;

        let keyStates = {
            left: false,
            right: false,
            up: false,
            down: false
        }

        let frameIndex = 0;
        let frameTimer = 0;
        let directions = ["left", "right", "back", "front"];
        
        self.addTicker((delta) => {
            if (playerWalking) {
                frameTimer += delta;
                if (frameTimer > (playerDirection > 1? 10: 5)) {
                    frameTimer = 0;
                    frameIndex = (frameIndex + 1) % (playerDirection > 1? 2: 4); // Loop through the 4 animation frames
                }
                player.setFrame(directions[playerDirection] + frameIndex);
            } else {
                player.setFrame(directions[playerDirection] + "0"); // Idle frame
            }
        });
        
        self.keyReceiver = event => {
            // if(!event.isFirst && event.down) return;
            if (event.direction === 0) keyStates.left = event.down;
            if (event.direction === 1) keyStates.right = event.down;
            if (event.direction === 2) keyStates.up = event.down;
            if (event.direction === 3) keyStates.down = event.down;

            updateDirection()
        }

        function updateDirection(){
            if (keyStates.left) {
                playerDirection = 0; // Left
                playerWalking = true;
            } else if (keyStates.right) {
                playerDirection = 1; // Right
                playerWalking = true;
            } else if (keyStates.up) {
                playerDirection = 2; // Up
                playerWalking = true;
            } else if (keyStates.down) {
                playerDirection = 3; // Down
                playerWalking = true;
            } else {
                playerWalking = false; // No keys pressed, player stops walking
            }
        }


        window.player = player

        self.add(player.sprite)

        self.onActivated(() => {
            self.text("asds", {
                nextDelay: 0
            })
        })
    })

    engine.createScreen("gameover")
}