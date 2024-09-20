
![logo](https://github.com/user-attachments/assets/b58d2d97-1eda-449b-98ef-a2b5df78ae51)

![download (1)](https://github.com/user-attachments/assets/5001d623-c373-41a9-941d-92f457b30fd1)

# the-lstv/undertale

A robust Undertale fangame engine, creted entirely from scratch.<br>
Uses WebGL for rendering, and thus is also really fast and flexible.<br><br>
So far its early in development, but features a fast and feature-rich text renderer that can handle basically all of your needs, including custom individual character behavior.<br>
On top of that the engine features all the standard features like scenes, universal event handling, etc.<br>
It makes creating Undertale fangames a lot easier.
<br><br>
Check out /game/game.js to see sample game logic.
<br><br>Written entirely in JS.<br>
Version 1.0 [alpha 2.1]

<br>

### Build instructions
**With Akeno:** Simply clone the repo, add the directory to your Akeno app list and you are done, you can run the game from the local server.<br>
To package/build to export for static platforms (eg. native application), you can use the `akeno bundle -a` command to create a ready-to-use offline package. The "-a" flag is required to keep the original structure and include all assets, otherwise the bundler will ignore them.<br>
**Without Akeno:** you should be able to use a pre-compiled version of index.html and it should just work like a static web app (i think).
