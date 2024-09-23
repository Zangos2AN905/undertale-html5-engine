# Undertale Engine (sample documentation)

This documentation is not entirely complete.<br>
The engine uses a highly-optimized WebGL renderer for its graphics, allowing you to experiment with advanced shaders etc., but in this sample we'll mainly talk about the core game loop.

- Initization
    -
    Start by going to /game/game.js - if its not empty you can clear it. This file contains all of your game logic. (Or use any other file where you put the "start" function").<br>
    This function is called in the constructor.js file at the end, after the engine and all assets are loaded.
    ```js
    async function start(){
        // We initialize the game logic, eg. create screens.
    }
    ```
    ### Creating your first screen
    ```js
    let screen = engine.createScreen("screen_name")
    // Here, the screen should be constructed.
    ```
    Alternatively: The createScreen function also accepts a callback which provides the screen instance directly:
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
    Let's go over some basics:<br><br>
    Print simple text
    ```js
    engine.text("Hi")
    ```

    Basic options
    ```js
    engine.text("Hello world!", {
        textAlign: "center",
        x: "center",
        y: 100,
        scale: 1.2,
        nextDelay: 50 // Delay between characters
    })
    ```

    Advanced effects - do something on every character
    ```js
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
    ```

    Editing text after creation
    ```js
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
<br>

- Rooms
    -
    Now that we can create screens and reder text, let's actually make a game.
    ```js
    // Start by making a screen for your world
    engine.createScreen("game", self => {
        
        // Create a game world
        let { world, player, camera } = engine.createWorld()

        // Add the world camera to your screen 
        self.add(camera)

        // Create a room
        world.createRoom("test", {
            // Base texture for your map
            baseTexture: game.assets.map_test,

            // "Pixel-perfect" collision
            // pixelCollisionMask: yourPixelCollisionMask,

            defaultSpawn: {x: 100, y: 50},

            // Objects. More in the "Room objects" section
            objects: [],

            // Note: By default, objcets are only a rect, and do not have any visuals.

            // ... and more options ...
        })



        // A default ticker function to keep things simple. You can create your own ticker for more flexibility.
        self.addTicker(world.defaultTicker);

        // Simplest setup to pass movement controls to the engine
        self.keyReceiver = event => player.keyStates[event.direction] = event.down;


        self.onActivated(() => {
            world.initialize()

            world.changeRoom("test") // Switch to our room
        })

    })

    ```
    This should setup a simple world where you can move around.

- Room objects
    -
    Lets take a closer look at all of the options you can have in a room object:
    ```js
    {
        solid: true, // If false, the player can walk through the object

        slope: false, // Makes the object behave like a slope

        x: 0,
        y: 0,
        width: 100,
        height: 100,

        onEnter(rect, incrementX, incrementY, colidesX, colidesY){
            // Called when the player enters/touches the object
        },

        onMovement(rect, incrementX, incrementY, colidesX, colidesY){
            // Called when the player moves within or along the object
        },

        onEnter(rect, incrementX, incrementY, colidesX, colidesY){
            // Called when the player leaves the object
        }

        // For events, "rect" is the rect of the player *before* moving. Increment x and y tell you the direction in pixels the player is about to make and colides x/y tell you which direction the player is going from (both will be true if the player is inside).
    }
    ```
    Note that objects have no visual or sprite attached by default, they only exist as an independent rectangle.
    
    ### To attach a visual sprite to the object
    This is impossible with regular objects, but can be achieved with:
    ```js
    let myObject = engine.createVisualObject(room, {
        // ... same options as a regular object ...

        baseTexture: texture, // Optional

        followDimension: false // Copy the object width and height to the visual
    })

    // To add the object, simply push it
    room.objects.push(myObject)
    ```

- Collisions
    -
    The engine offers three main collision mechanisms out of the box.<br>
    You can combine them all at once depending on your needs. <br>


    ### 1. Pixel-perfect collisions
    A highly optimized, fast and accurate collision checking.<br>
    It works by pre-computing rows of a collision mask (image of the same resolution as the map, where non-transparent pixels are solid) and creating arrays of where a collision starts and ends.<br><br>
    Advantages:
    - Very fast, simple to create
    - Pixel accuracy (can be any shape)
    - Spatial filtering (filters which rows or columns to proccess based on position)

    Disadvantages:
    - Static (cannot be dynamically changed, and there can only be one)
    - Requires pre-computation, more difficult to manage
    - Very basic

    How to pre-compute:<br>
    Use the "createCollisionMask" function from /engine/misc.js, passing it the URL of your collision mask as an image.<br>
    Warning: precomputing is a very expensive task, you should always ship an already computed mask and pass it directly, don't do it on each run.
    
    ### 2. AABB (Rectangle) collisions
    Collisions that compare an AABB (box/object/rectangle) to the AABB of the player's collision. <br>
    This method may be faster or slower than pixel collisions, depending on the amount of objects you have - currently, the engine has to iterate and check every single object.<br><br>
    Advantages:
    - Fully dynamic, can be modified at runtime
    - Allows events (enter, move, leave)
    - Custom behavior supported

    Disadvantages:
    - Shape can only be a rectangle
    - Requires a special program to create
    - Slower if you have lots of objects

    ### 3. Bounding box
    This is the same as the previous (AABB), but is a special inverse check to limit the player from leaving bounds.