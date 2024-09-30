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


    app = await engine.initApp();


    let DEBUG_MODE = false;

    game = {
        engine,

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

            battle_button_fight: "/assets/sprites/buttons/fight.png",
            battle_button_act: "/assets/sprites/buttons/act.png",
            battle_button_item: "/assets/sprites/buttons/item.png",
            battle_button_mercy: "/assets/sprites/buttons/mercy.png",
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
        game.assets[id] = await PIXI.Assets.load({src: game.assets[id]})
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