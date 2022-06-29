# UV Projector
_demo of the UV Projector scene running in preview._

![demo](https://github.com/decentraland-scenes/uv-projector/blob/main/screenshots/uv.gif)

## Description
UV Projector is a tool that helps you project a large video stretching out onto many smaller screens. You can even reproject the UV cooridantes on every frame, so the video will always face towards the player.

## Instructions

**In the scene**

You can run around and watch as the video on the colums follow you (while the columns themselves don't move or turn). Use your mouse to look around and <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> keys on your keyboard to move forward, left, backward and right respectively. To jump, press the <kbd>Space</kbd> key.

**In the code**

You need to create a projector plane ( Projector ) that is invisible to the player, with a chosen size and orientation. This will project the video onto other screens ( Screen ). 

You need to also create a ScreenGroup for each Projector and assign the Screens you create to that group.

You can project all the Screens' UVs once or on every frame inside a System using:

```
myScreenGroup.updateScreens( myProjectorTargetPosition )

```

## Try it out

**Install the CLI**

Download and install the Decentraland CLI by running the following command:

```
$ npm i -g decentraland
```

**Previewing the scene**

Download this example and navigate to its directory, then run:

```
$  dcl start
```

## Acknowledgements

- _cc_video.mp4_ is a Creative Commons video from https://vimeo.com/58460459 
