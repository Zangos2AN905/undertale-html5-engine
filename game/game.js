
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

    engine.createScreen("menu", self => {

        /*
            Create and draw the game menu
            Note: the order of the code matters for the z-index of sprites.
        */

        gradient: {
            const gradient = new PIXI.Sprite(game.assets.menu_gradient);

            gradient.width = app.screen.width
            self.add(gradient)
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
            
            app.ticker.add((delta) => {
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
        }

        const soul = new PIXI.Sprite(game.assets.soul);
        self.add(soul)

        // Copyright text
        self.text("Fundrtejl V0.1 (c) TheLSTV 2024", {x: "center", textAlign: "center", y: app.screen.height - 32, color: 0xaaaaaa, scale: .5})

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
                            engine.switchScreen("credits")
                            break
                        case 1: // Settings button
                            engine.switchScreen("credits")
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
    })

    engine.createScreen("gameover")
}