import { myVideoTexture } from "./materials";
import { uiInstruction } from "./ui";

// CONTROLS TO START VIDEO/ HIDE INSTRUCTIONS
const input = Input.instance
input.subscribe("BUTTON_DOWN", ActionButton.POINTER, true, e => { 

  myVideoTexture.loop = true
  myVideoTexture.playing = true

  uiInstruction.visible = false  
})