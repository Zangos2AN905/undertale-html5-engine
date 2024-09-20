# Undertale Engine (sample documentation)

This documentation is not entirely complete.<br>
The engine uses a highly-optimized WebGL renderer for its graphics, allowing you to experiment with advanced shaders etc., but in this sample we'll mainly talk about the core game loop.

- Initization
    -
    Start by adding a start function somewhere in your code.<br>
    This function is called in the constructor.js file at the end, after the engine and all assets are loaded.
    ```js
    async function start(){
        // We initialize the game logic, eg. create screens.
    }
    ```
    ### Creating your first screen
    ```js
    let screen = engine.createScreen("screen_name")
    ```
    The createScreen function also accepts a callback which provides the screen instance directly:
    ```js
    engine.createScreen("screen_name", self => {
        // Here, the screen should be constructed.
    })
    ```
    ### Add something to your screen
    Let's add some text:
    ```js
    engine.createScreen("screen_name", self => {
        self.text("Hello world")
    })
    ```
    ### Switch to your screen
    Cool, you have a screen, but you can't see it yet. Switch to it using
    ```js
    engine.switchScreen("screen_name")
    ```
    ### Do something when the screen activates
    ```js
    engine.createScreen("screen_name", self => {
        let text = self.text("Hello world")

        self.onActivated(() => {
            // Change text color to a random color
            text.color(Math.random() * 0xffffff)
        })
    })
    ```
- Text rendering
    -
    There is an advanced text renderer.
    Let's go over some basics:
    ```js
    // Print simple text
    engine.text("Hi")

    // Basic options
    engine.text("Hello world!", {
        textAlign: "center",
        x: "center",
        y: 100,
        scale: 1.2,
        nextDelay: 50 // Delay between characters
    })

    // Advanced effects - do something on every char
    engine.text("Hello world!", {
        textAlign: "center",
        x: "center",
        y: 0,

        font: game.fonts.bitmap.Determination, // Font
        
        iterator(position, options){
            // "position" contains information about the current position
            // "options" is the options object, that you can dynamically edit

            // Example: Every character will have a random color
            options.color = Math.random() * 0xffffff

            // And if you need even more control, you can capture the actual character sprite:
            position.onSprite(sprite => {
                sprite.position.x += 10
            })

            // How long to wait till next character
            options.nextDelay += 10

            // ... and many more options ...

            // Here you can also attach a ticker with self.addTicker to make animations
        }
    })

    // Editing text after creation
    let text = engine.text("Hi", {y: 32})

    text.color(0xff0000) // set color to red (replaces all!)
    text.hide()
    text.show()
    text.update(":)") // swap characters
    text.moveBy(10, 10)

    text.container // Text container
    text.sprites // Sprite array

    // Do this after you no longer need it
    text.destroy()

    ```