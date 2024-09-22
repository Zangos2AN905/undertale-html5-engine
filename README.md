# the-lstv/undertale

A robust Undertale fangame engine, creted entirely from scratch, pure code, no WYSIWYG.<br>
Uses WebGL for rendering, and thus is also really fast and flexible.<br><br>
So far its pretty early in development, but it already has a bunch to offer.<br>
The engine features a fast and feature-rich text renderer that can handle basically all of your needs, including custom individual character behavior.<br>
On top of that, it features all the standard features like scenes, rooms, fast collisions (pixel-perfect and rectangle modes), universal event handling, etc.<br>
It makes creating Undertale fangames a lot easier.
<br><br>
Check out /game/game.js to see sample game logic and /engine/engine.js for the engine logic.
<br><br>Written entirely in JS and GLSL.<br>
Version 1.0 [alpha 2.1]<br>

## Pixel-Perfect
<img width="139" alt="Frisk Sprite" src="https://github.com/user-attachments/assets/9a1d0051-34d9-43dd-b1c9-7fbd8055e324"><br>
We made absolutely sure that the engine renders the game pixel-perfect, precisely as the original. This gives it a genuine and high-quality feeling, even though they use completely different engines.<br>
The renderer is specifically configured for pixelart and uses the same pixel scaling and resolution as Undertale does.<br>
I think that for a web-based Undertale engine, this does pretty good! Performance-wise it is also not bad, the only major bottleneck now is the painfully slow DOM keyboard/mouse events.

## Light-weight
The entire engine is under 0.5MB (excluding assets) and an entire fully functional game can be set up in less than 550kB - without compression.<br>
This makes it a pretty light-weight solution. This is more than 5x smaller than my previous engine used to make OG FanTale while having an insane performance and quality boost.<br>
Thanks to this, it is simple to run this game from the web or on low-power devices like mobile phones.<br>
The engine uses PIXI.js v7 as the renderer. (Not v8 at this moment since it is a bit more complicated to set up correctly and uses esm). PIXI is one of the, if not the fastest web rendering engines on the market.


<br>

### Build instructions
- **With Akeno:** Simply clone the repo, add the directory to your Akeno app list and you are done, you can run the game from the local server.<br>
To package/build to export for static platforms (eg. native application), you can use the `akeno bundle -a` command to create a ready-to-use offline package. The "-a" flag is required to keep the original structure and include all assets, otherwise the bundler will ignore them.<br>
- **Without Akeno:** you should be able to use a pre-compiled version of index.html and it should just work like a static web app (i think).

### Can you guess which screenshot is from the actual game and which is from this engine? They are nearly indistinguishible
![Group 356](https://github.com/user-attachments/assets/93a93b12-443e-4def-99e3-ac1e35584aba)


![download (1)](https://github.com/user-attachments/assets/5001d623-c373-41a9-941d-92f457b30fd1)
