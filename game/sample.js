
// A minimal example setup with a basic test game.

async function start() {

    // Create a "menu" screen
    engine.createScreen("menu", self => {
        self.text("Press Z to continue")
    
        self.keyReceiver = event => {
            if(event.down && event.main){
                engine.switchScreen("game")
            }
        }
    })

    engine.createScreen("game", async self => {
    
        // Create a game world
        let { world, player, camera } = engine.createWorld()

        self.add(camera)
    
        // Create a room
        world.createRoom("test", {
            baseTexture: game.assets.map_test,
    
            // You might need to include misc.js for this function - Normally, the mask should be pre-computed
            pixelCollisionMask: await Engine.misc.createCollisionMask("/assets/maps/test/collision.png"),
    
            defaultSpawn: {x: 100, y: 50},
        })

        self.addTicker(world.defaultTicker);

        self.keyReceiver = event => player.keyStates[event.direction] = event.down;

        self.onActivated(() => {
            world.initialize()
    
            world.changeRoom("test") // Switch to our room
        })
    
    })


    engine.switchScreen("menu")
}