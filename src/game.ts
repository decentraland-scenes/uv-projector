import { scene } from "./modules/scene";
import { Projector } from "./modules/projector";
import { Screen, ScreenGroup, ColumnScreen } from "./modules/screens";
import { uvMat } from "./modules/materials";

// set up two invisible projector planes, which determine the size and position of the video being projected onto the screens themselves
let projectorColumns = new Projector(
  new Vector3(scene.columnsCenter.x, scene.columnsCenter.y+ 2.5 ,scene.columnsCenter.z), 
  new Vector3(12,12,1), 
  Quaternion.Euler(0,0,0), 
  true)

//make sure this projector's rotation is facing the TV created later on, and that its scale is also big enough to cover the whole stack
let projectorScatterTVs = new Projector(
  new Vector3(scene.tvScreensCenter.x, scene.tvScreensCenter.y ,scene.tvScreensCenter.z), 
  new Vector3(24,9,1), 
  Quaternion.Euler(0,0,0), 
  true)

//assign each projector to a specific group of screens
let ScreenGrpColumns = new ScreenGroup(projectorColumns)
let ScreenGrpScatterTvs = new ScreenGroup(projectorScatterTVs)

// create a stack of TVs in a curved setup, randomized a tiny bit
function addTVScreens(_rows:number, _columns:number, radius:number, center:Vector3){

  let pos = new Vector3(0,0,1) //used as an iterator for each TVs position 
  let screenHeight = 1.8
  let screenWidth = 3.8
  let heightStep = screenHeight*1.1 //vertical distance between rows of TVs
  let angleRange = 75 // angle range spread of the curved TV stack, relative to the centerAngle 
  let centerAngle = 180

  let heightBase = screenHeight/2 // vertical position of the bottom row of TVs
  let height = 0 // iterator for row heights
  let angleStep = angleRange/(_columns-1) // angle increment between TVs in the same row (based on the range set above)
  let angle = centerAngle - angleStep * (_columns/2) + angleStep/2 // starting angle based on the initial rotation
  
  let currentAngle = -125 //iterator for the angle offset for each TV in the same row

  for (let i=0; i< _rows; i++){

    // step higher with each row of TVs
    height = heightBase + i*heightStep 

    for(let j = 0; j < _columns - i%2; j++){

      //rotate each TV in a row around the center point
      currentAngle = angle + j*angleStep      

      //offset the angles of odd rows to create a nice stacked look 
      if(i%2 == 1){
        currentAngle = angle + j * angleStep + angleStep/2
      }

      let offset = Math.random()*0.75

      // calculate the position of each TV (rotate a vector around the center and scale it to the given radius, with a slight random offset)
      pos = center.add(Vector3.Backward().rotate(Quaternion.Euler(0,currentAngle,0) ).scale(radius - offset) )

      //create the actual screen with the above parameters
      let screen = new Screen({
        position: new Vector3(pos.x, center.y + height, pos.z),
        rotation: Quaternion.Euler(0, currentAngle + Math.random()*10 -5, 1),
        scale: new Vector3(screenWidth - Math.random()*0.1, screenHeight - Math.random()*0.1, 1)},
        true, 
        uvMat)

        // assign all TVs to the same screen group
        ScreenGrpScatterTvs.addSCreen(screen)

      // you can parent a mesh to the screen to add a nice frame to it (but never parent the screen itself to anything!!)
      let TVMesh = new Entity()
      TVMesh.addComponent(new Transform({
        position: new Vector3(0,0,0),
        rotation: Quaternion.Euler(0,0,0),
        scale: new Vector3(1,1,1)
      }))
      TVMesh.addComponent( new GLTFShape('models/screen_bg.glb'))
      TVMesh.setParent(screen)
    }
  }
}

// creates a grid of screen columns around a center position
function addColumnGrid(_rows:number, _columns:number, _center:Vector3){

  const columnScale = 0.75
  const columnBaseHeight = 0
  const columnHeight = 10
  const columnSpacing = 2

  let sizeRows = columnSpacing * (_rows - 1)
  let sizeColumnss = columnSpacing * (_columns - 1)
  let origin = new Vector3(_center.x - sizeRows/2, _center.y, _center.z - sizeColumnss/2)

  for(let i=0; i < _rows; i++){
    for (let j=0; j< _columns; j++){

      let column = new ColumnScreen(
        ScreenGrpColumns,  
        new Vector3(
          origin.x + j * columnSpacing + Math.random() - 0.5, 
          columnBaseHeight, 
          origin.z + i * columnSpacing + Math.random()-0.5
          ), 
        columnScale * Math.random() + 0.5, 
        columnHeight,
        false,
        uvMat)
    }
  } 
}

class LiveProjectorSystem {

  player = Camera.instance

  update(dt:number){    
    
    //get the current transformations of the projector planes
    const projectorColumnsTransfrom = projectorColumns.getComponent(Transform)    
  
    //rotate projector planes to face the player
    projectorColumnsTransfrom.lookAt(this.player.position)    

    //reproject all UV coordinates on all planes in both screen groups
    ScreenGrpColumns.updateScreens(this.player.position)    
 
  }
}
engine.addSystem(new LiveProjectorSystem())

// add 3x3 columns
addColumnGrid(3,3, scene.columnsCenter)

//add the TV stack
addTVScreens(4,6, 15, scene.center)

//calculate the UVs for the TV stack only once on startup (no realtime reprojection needed)
ScreenGrpScatterTvs.updateScreens(scene.center) 
