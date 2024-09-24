
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

        const mountains = [new PIXI.Sprite(game.assets.menu_mountain), new PIXI.Sprite(game.assets.menu_mountain), new PIXI.Sprite(game.assets.menu_mountain), new PIXI.Sprite(game.assets.menu_mountain)];

        mountains: {
            let i = 0;
            
            for(let mountain of mountains) {
                mountain.scale = {x: .8, y: .8}
    
                let filter = new PIXI.ColorMatrixFilter();
                filter.brightness(1 - (i * .3), false);
                mountain.filters = [filter]
    
                self.add(mountain)
                i++
            }

            self.addTicker((delta) => {
                if(!starting) for(let i = 0; i < mountains.length; i++) {
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
            menuUI.text("Extras", {x: "center", y: screenCenterY + 125, textAlign: "center"}),
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
                self.container.alpha -= (delta + 0.1) / 140
                menuUI.container.alpha -= (delta + 0.1) / 80

                let i = 1
                for(let mountain of mountains){
                    mountain.position.y += (((mountains.length - i) * .1) * delta) - .2
                    i++
                }

                if(self.container.alpha < 0){
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

                    selectButton(button + (event.direction === 0? -1: 1))

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
                            open("https://youtu.be/dQw4w9WgXcQ")
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

            let i = -1
            for(let mountain of mountains) {
                mountain.position.x = screenCenterX - (mountain.width / 2)
                mountain.position.y = (app.screen.height - 300) + (i * 20)
                i++
            }

            selectButton(0)
        })

        self.add(menuUI)
    })

    engine.createScreen("credits", self => {

        self.text("Credits", {
            textAlign: "center",
            x: "center",
            y: 32,
            scale: 1.4,
            color: 0xffff00
        })

        self.text("\uAA03Programming, engine:\uAA00 TheLSTV\n\uAA03Sprites:\uAA00 Z3R0, TheLSTV, Toby Fox, PopipopDEV\n\uAA03Sound, music:\uAA00 TheLSTV, Toby Fox\n\uAA03Fonts:\uAA00 Jayvee Enaguas, UnnamedConlanger\n\n\n\uAA01Special thanks to Toby Fox!\n\n\uAA02Website: https://lstv.space", {
            x: 20, y: 100,
            iterator(position, options){
                switch(position.char){
                    case "\uAA00":
                        options.color = 0xeeee00
                    break
                    case "\uAA01":
                        options.color = 0xff54fc
                    break
                    case "\uAA02":
                        options.color = 0x0080ff; options.scale = .8
                    break
                    case "\uAA03":
                        options.color = 0xffffff
                    break
                }
            }
        })

        self.keyReceiver = event => {
            if(event.down && event.main || event.cancel) {
                engine.switchScreen("menu")
            }
        }

    })

    engine.createScreen("game", async self => {

        let { world, player, camera, undertale } = engine.createWorld()

        world.createRoom("test1", {
            baseTexture: game.assets.map_slope,

            defaultSpawn: {x: 200, y: 150},

            pixelCollisionMask: {"0":[[0,319]],"1":[[0,319]],"2":[[0,319]],"3":[[0,319]],"4":[[0,319]],"5":[[0,319]],"6":[[0,319]],"7":[[0,319]],"8":[[0,319]],"9":[[0,319]],"10":[[0,319]],"11":[[0,319]],"12":[[0,319]],"13":[[0,319]],"14":[[0,319]],"15":[[0,319]],"16":[[0,319]],"17":[[0,319]],"18":[[0,319]],"19":[[0,319]],"20":[[0,319]],"21":[[0,319]],"22":[[0,319]],"23":[[0,319]],"24":[[0,319]],"25":[[0,28],[298,319]],"26":[[0,28],[298,319]],"27":[[0,28],[298,319]],"28":[[0,28],[298,319]],"29":[[0,28],[298,319]],"30":[[0,28],[298,319]],"31":[[0,28],[298,319]],"32":[[0,28],[298,319]],"33":[[0,28],[298,319]],"34":[[0,28],[298,319]],"35":[[0,28],[298,319]],"36":[[0,28],[298,319]],"37":[[0,28],[298,319]],"38":[[0,28],[298,319]],"39":[[0,28],[39,163],[298,319]],"40":[[0,28],[39,163],[298,319]],"41":[[0,28],[39,163],[298,319]],"42":[[0,28],[39,163],[298,319]],"43":[[0,28],[39,163],[298,319]],"44":[[0,28],[39,163],[298,319]],"45":[[0,28],[298,319]],"46":[[0,28],[298,319]],"47":[[0,28],[298,319]],"48":[[0,28],[298,319]],"49":[[0,28],[298,319]],"50":[[0,28],[40,216],[298,319]],"51":[[0,28],[40,216],[298,319]],"52":[[0,28],[40,216],[298,319]],"53":[[0,28],[40,216],[298,319]],"54":[[0,28],[40,216],[298,319]],"55":[[0,28],[40,216],[298,319]],"56":[[0,28],[40,216],[298,319]],"57":[[0,28],[40,129],[298,319]],"58":[[0,28],[40,129],[298,319]],"59":[[0,28],[40,129],[298,319]],"60":[[0,28],[40,129],[298,319]],"61":[[0,28],[40,129],[298,319]],"62":[[0,28],[40,129],[298,319]],"63":[[0,28],[298,319]],"64":[[0,28],[298,319]],"65":[[0,28],[298,319]],"66":[[0,28],[298,319]],"67":[[0,28],[298,319]],"68":[[0,28],[39,94],[298,319]],"69":[[0,28],[39,94],[298,319]],"70":[[0,28],[39,94],[298,319]],"71":[[0,28],[39,94],[298,319]],"72":[[0,28],[39,94],[298,319]],"73":[[0,28],[39,94],[298,319]],"74":[[0,28],[39,94],[298,319]],"75":[[0,28],[39,94],[298,319]],"76":[[0,28],[298,319]],"77":[[0,28],[298,319]],"78":[[0,28],[298,319]],"79":[[0,28],[298,319]],"80":[[0,28],[298,319]],"81":[[0,28],[298,319]],"82":[[0,28],[298,319]],"83":[[0,28],[298,319]],"84":[[0,28],[298,319]],"85":[[0,28],[298,319]],"86":[[0,28],[298,319]],"87":[[0,28],[298,319]],"88":[[0,28],[298,319]],"89":[[0,28],[298,319]],"90":[[0,28],[298,319]],"91":[[0,28],[298,319]],"92":[[0,28],[298,319]],"93":[[0,28],[298,319]],"94":[[0,28],[298,319]],"95":[[0,28],[298,319]],"96":[[0,28],[298,319]],"97":[[0,28],[298,319]],"98":[[0,28],[298,319]],"99":[[0,28],[298,319]],"100":[[0,28],[298,319]],"101":[[0,28],[298,319]],"102":[[0,28],[298,319]],"103":[[0,28],[298,319]],"104":[[0,28],[298,319]],"105":[[0,28],[298,319]],"106":[[0,28],[298,319]],"107":[[0,28],[298,319]],"108":[[0,28],[298,319]],"109":[[0,28],[298,319]],"110":[[0,28],[298,319]],"111":[[0,28],[298,319]],"112":[[0,28],[298,319]],"113":[[0,28],[298,319]],"114":[[0,28],[298,319]],"115":[[0,28],[298,319]],"116":[[0,28],[298,319]],"117":[[0,28],[298,319]],"118":[[0,28],[298,319]],"119":[[0,28],[298,319]],"120":[[0,28],[298,319]],"121":[[0,28],[298,319]],"122":[[0,28],[298,319]],"123":[[0,28],[298,319]],"124":[[0,28],[298,319]],"125":[[0,28],[298,319]],"126":[[0,28],[298,319]],"127":[[0,28],[298,319]],"128":[[0,28],[298,319]],"129":[[0,28],[298,319]],"130":[[0,28],[298,319]],"131":[[0,28],[298,319]],"132":[[0,28],[245,258],[298,319]],"133":[[0,28],[245,258],[298,319]],"134":[[0,28],[245,258],[298,319]],"135":[[0,28],[245,258],[298,319]],"136":[[0,28],[245,258],[298,319]],"137":[[0,28],[245,258],[298,319]],"138":[[0,28],[245,258],[298,319]],"139":[[0,28],[245,258],[298,319]],"140":[[0,28],[245,258],[298,319]],"141":[[0,28],[245,258],[298,319]],"142":[[0,28],[298,319]],"143":[[0,28],[298,319]],"144":[[0,28],[298,319]],"145":[[0,28],[298,319]],"146":[[0,28],[298,319]],"147":[[0,28],[298,319]],"148":[[0,28],[298,319]],"149":[[0,28],[298,319]],"150":[[0,28],[298,319]],"151":[[0,28],[298,319]],"152":[[0,28],[298,319]],"153":[[0,28],[298,319]],"154":[[0,28],[298,319]],"155":[[0,28],[298,319]],"156":[[0,28],[298,319]],"157":[[0,28],[298,319]],"158":[[0,28],[298,319]],"159":[[0,28],[298,319]],"160":[[0,28],[298,319]],"161":[[0,28],[298,319]],"162":[[0,28],[298,319]],"163":[[0,28],[298,319]],"164":[[0,28],[298,319]],"165":[[0,28],[298,319]],"166":[[0,28],[298,319]],"167":[[0,28],[298,319]],"168":[[0,28],[298,319]],"169":[[0,28],[298,319]],"170":[[0,28],[298,319]],"171":[[0,28],[298,319]],"172":[[0,28],[298,319]],"173":[[0,28],[298,319]],"174":[[0,28],[298,319]],"175":[[0,28],[298,319]],"176":[[0,28],[298,319]],"177":[[0,28],[298,319]],"178":[[0,28],[298,319]],"179":[[0,28],[298,319]],"180":[[0,28],[298,319]],"181":[[0,28],[298,319]],"182":[[0,28],[298,319]],"183":[[0,28],[298,319]],"184":[[0,28],[298,319]],"185":[[0,28],[298,319]],"186":[[0,28],[298,319]],"187":[[0,28],[298,319]],"188":[[0,28],[298,319]],"189":[[0,28],[298,319]],"190":[[0,28],[298,319]],"191":[[0,28],[298,319]],"192":[[0,28],[298,319]],"193":[[0,28],[298,319]],"194":[[0,28],[298,319]],"195":[[0,28],[298,319]],"196":[[0,28],[298,319]],"197":[[0,28],[298,319]],"198":[[0,28],[298,319]],"199":[[0,28],[298,319]],"200":[[0,28],[298,319]],"201":[[0,28],[298,319]],"202":[[0,28],[298,319]],"203":[[0,28],[298,319]],"204":[[0,28],[298,319]],"205":[[0,28],[298,319]],"206":[[0,28],[298,319]],"207":[[0,28],[298,319]],"208":[[0,28],[298,319]],"209":[[0,28],[298,319]],"210":[[0,28],[298,319]],"211":[[0,28],[298,319]],"212":[[0,28],[298,319]],"213":[[0,28],[298,319]],"214":[[0,28],[298,319]],"215":[[0,28],[298,319]],"216":[[0,28],[298,319]],"217":[[0,28],[298,319]],"218":[[0,28],[298,319]],"219":[[0,28],[298,319]],"220":[[0,319]],"221":[[0,319]],"222":[[0,319]],"223":[[0,319]],"224":[[0,319]],"225":[[0,319]],"226":[[0,319]],"227":[[0,319]],"228":[[0,319]],"229":[[0,319]],"230":[[0,319]],"231":[[0,319]],"232":[[0,319]],"233":[[0,319]],"234":[[0,319]],"235":[[0,319]],"236":[[0,319]],"237":[[0,319]],"238":[[0,319]],"239":[[0,319]]},

            layers: {

            },

            objects: [
                {solid: true, x: 245, y: 132, width: 15, height: 12},

                {
                    x: 251,y: 26, width: 46, height: 46,

                    slope: true,
                    angle: -45,
                    side: "bottom",
                },

                {
                    x: 29, y: 126, width: 93, height: 93,

                    slope: true,
                    angle: -45,
                    side: "top",
                },

                {
                    x: 162, y: 129, width: 20, height: 20,

                    slope: true,
                    angle: 45,
                    side: "bottom",
                },

                {
                    x: 256, y: 178, width: 41, height: 41,

                    slope: true,
                    angle: 45,
                    side: "top",
                }
            ]
        })

        self.addTicker(world.defaultTicker);
        
        self.keyReceiver = event => player.keyStates[event.direction] = event.down;

        game.world = { camera, player, world }

        self.add(camera)
        
        self.onActivated(() => {
            world.initialize()
            
            world.changeRoom("test1")

            engine.animation.fadeIn(camera.container, 750)
        })
    })

    engine.createScreen("fight", self => {
        // Fight
    })

    engine.createScreen("gameover", self => {
        // Game over
    })
}