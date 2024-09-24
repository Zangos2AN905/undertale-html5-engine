let app, engine, viewPort, game;

/*
    This is the first file that runs and is responsible for initization of the engine and other game related objects + loading assets.
    No game logic should be found here.
*/

LS.once("body-available", async function () {
    viewPort = O("#viewPort");

    engine = new Engine(viewPort, {
        width: 640, height: 480,
        scale: true
    });
    

    PIXI.settings.ROUND_PIXELS = true;
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    PIXI.settings.MIPMAP_TEXTURES = PIXI.MIPMAP_MODES.OFF; // You dont even know how much time I wasted frustrated with this until I found this setting!!


    app = new PIXI.Application({
        width: engine.width,
        height: engine.height,
        roundPixels: true,
        autoDensity: true,
        resolution: 1,
        // forceCanvas: true,
        antialias: false,
    });

    engine.onAppAvailable()


    let DEBUG_MODE = false;

    game = {
        engine,
        renderer: app,

        assets: {
            DeterminationBitmap: "/assets/fonts/determination/font.png",
            CryptOfNextWeekBitmap: "/assets/fonts/crypt-of-next-week/font.png",

            menu_mountain: "/assets/sprites/menu/mountain.png",
            menu_gradient: "/assets/sprites/menu/gradient.svg",
            soul: "/assets/soul.png",
            logo: "/assets/logo.png",
            
            frisk: "/assets/sprites/player/frisk.png",

            map_test: "/assets/maps/test/map.png",
            map_slope: "/assets/maps/slopetest/map.png",
            map_asd: "/assets/maps/slopetest/asd.png",
        },

        screens: {},

        settings: {
            controls: {
                main: ["z", "enter"],
                cancel: ["x"],
                directions: ["arrowup", "arrowdown", "arrowleft", "arrowright"] // up, down, left, right
            }
        },

        get debug(){
            return DEBUG_MODE
        },

        set debug(value){
            DEBUG_MODE = !!value

            // app.renderer.resolution = DEBUG_MODE? 2: 1;

            O("body").class("debug", DEBUG_MODE)
        }
    }

    game.debug = DEBUG_MODE;

    for(let id in game.assets){
        game.assets[id] = await PIXI.Assets.load(game.assets[id])
    }

    game.fonts = {
        bitmap: {
            Determination: engine.font({texture: game.assets.DeterminationBitmap, data: await engine.loadFontData("/assets/fonts/determination/FontData.csv?cache=4")}),
            CryptOfNextWeek: engine.font({texture: game.assets.CryptOfNextWeekBitmap, data: await engine.loadFontData("/assets/fonts/crypt-of-next-week/FontData.csv?cache=0")})
        }
    }

    viewPort.add(app.view);

    O(app.view).on("wheel", event => {
        if(DEBUG_MODE){
            game.world.camera[event.shiftKey? "x": "y"] -= event.deltaY
            event.preventDefault()
        }
    })

    let loadTime = Date.now() - (window.tsl || Date.now()), delay = Math.max(1000 - loadTime, 0);

    // Move on to game.js
    start(loadTime)

    // Debug
    return engine.switchScreen("game")

    // Start the splash screen
    setTimeout(() => {
        engine.switchScreen("splash")
    }, delay)
})