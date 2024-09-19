
async function start(loadTime){

    console.log(`Engine loaded in ${loadTime}ms`);

    /*
        This method gets once after everything is loaded and prepared to start the game.
        It is responsible for creating game screens etc.

        At this point everything is loaded - following is purely game logic.

        Note: start() gets called *before* the splash screen is closed.
        To know when the splash screen is gone, use the menu activate event.
    */

    engine.createScreen("menu", self => {

        /*
            Create and draw the game menu
            Note: the order of the code matters for the z-index of sprites.
        */

        self.add(new PIXI.Sprite(game.assets.menu_mountain))

        let buttons = [
            self.text("Start", {x: 0, y: 100}),
            self.text("Settings", {x: 0, y: 200}),
            self.text("Credits", {x: 0, y: 300})
        ]

        let button = 0;

        function selectButton(id){
            if(id > buttons.length - 1) id = 0;
            if(id < 0) id = buttons.length - 1;

            button = id

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