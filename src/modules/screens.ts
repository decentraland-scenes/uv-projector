import { Projector } from './projector'


export class Screen extends Entity {

    screenMesh:Entity
    screenPlane:PlaneShape
    isTwoSided:boolean = true
    isCollider:boolean = false
  
    corner00:Vector3 
    corner10:Vector3 
    corner11:Vector3 
    corner01:Vector3   
  
    constructor(_transform:TranformConstructorArgs, _twoSided:boolean, _mat:Material ){
      super()

      this.isTwoSided = _twoSided

      this.screenPlane = new PlaneShape()
      this.screenPlane.withCollisions = this.isCollider  
          
      this.screenMesh = new Entity()
      this.screenMesh.addComponent(new Transform({rotation: Quaternion.Euler(0,0,0)}))
      this.screenMesh.setParent(this)
      this.screenMesh.addComponent(this.screenPlane)
      this.screenMesh.addComponent ( _mat)
      
      this.addComponent(new Transform(_transform))    
  
      //calculate corner positions in world-space
      //bottom left
      this.corner00 = new Vector3(_transform.scale.x/2, -_transform.scale.y/2 , 0)   
      this.corner00.rotate(_transform.rotation)    
      this.corner00.addInPlace(_transform.position)
      
      
      //bottom right
      this.corner10 = new Vector3(-_transform.scale.x/2, -_transform.scale.y/2 , 0)   
      this.corner10.rotate(_transform.rotation)    
      this.corner10.addInPlace(_transform.position)        
      
      //top right
      this.corner11 = new Vector3(-_transform.scale.x/2, _transform.scale.y/2 , 0)   
      this.corner11.rotate(_transform.rotation)    
      this.corner11.addInPlace(_transform.position)        
  
      //top left
      this.corner01 = new Vector3(_transform.scale.x/2, _transform.scale.y/2 , 0)   
      this.corner01.rotate(_transform.rotation)    
      this.corner01.addInPlace(_transform.position)        
   
      engine.addEntity(this)
      
    }
    // normal vector of the screen plane
    getNormal():Vector3{
  
      let normal = Vector3.Forward().rotate(this.getComponent(Transform).rotation) 
      return normal
    }
  
    //update UV coords of the screen plane
    setUVs(_uv00:Vector2, _uv10:Vector2, _uv11:Vector2, _uv01:Vector2 ){
  
      this.screenPlane.uvs = [
        // -- Side A
        _uv00.x,
        _uv00.y,
  
        _uv10.x,
        _uv10.y,
  
        _uv11.x,
        _uv11.y,
  
        _uv01.x,
        _uv01.y,

      // -- Side B
        _uv00.x,
        _uv00.y,
  
        _uv10.x,
        _uv10.y,
  
        _uv11.x,
        _uv11.y,
  
        _uv01.x,
        _uv01.y
      ]    
    }
  
    // in case the screen is transformed, update all corner positions
    updateCorners(){
  
      const transform = this.getComponent(Transform)
  
      this.updateCorner(this.corner00,  new Vector3( transform.scale.x/2, -transform.scale.y/2 , 0) )
      this.updateCorner(this.corner10,  new Vector3(-transform.scale.x/2, -transform.scale.y/2 , 0) )
      this.updateCorner(this.corner11,  new Vector3(-transform.scale.x/2,  transform.scale.y/2 , 0) )
      this.updateCorner(this.corner01,  new Vector3( transform.scale.x/2,  transform.scale.y/2 , 0) )    
    }
  
    // updates the world-space position of a single corner based on the screen's new transformation
    updateCorner(cornerVec:Vector3, offsetVec:Vector3){
      const _transform = this.getComponent(Transform)
  
      cornerVec.copyFrom(offsetVec)
      cornerVec.rotate(_transform.rotation)    
      cornerVec.addInPlace(_transform.position)         
    }
    
    // project all 4 corners of the screen onto the projector plane (defined by its center and its normal vector)
    projectPoints(projNormal:Vector3, projPlanePos:Vector3){
      
      this.updateCorners()
      this.getProjectedCorner("00", projNormal, projPlanePos)
      this.getProjectedCorner("10", projNormal, projPlanePos)
      this.getProjectedCorner("11", projNormal, projPlanePos)
      this.getProjectedCorner("01", projNormal, projPlanePos)        
    }
    // calculate where a specific corner of the screen is projected on the projector plane (defined by its center and its normal vector)
    getProjectedCorner(cornerID:string, projNormal:Vector3, projPlanePos:Vector3):Vector3{
  
      const transform = this.getComponent(Transform)
  
      let cornerVec = Vector3.Up()     
      let offsetVec = Vector3.Zero()
  
      switch (cornerID) {
        case "00": {
            offsetVec = new Vector3(transform.scale.x/2, -transform.scale.y/2 , 0)            
            break
          }
        case "10": {
            offsetVec = new Vector3(-transform.scale.x/2, -transform.scale.y/2 , 0)            
            break
          }
        case "11": {
            offsetVec = new Vector3(-transform.scale.x/2, transform.scale.y/2 , 0)            
            break
          }
        case "01": {
            offsetVec = new Vector3(transform.scale.x/2, transform.scale.y/2 , 0)            
            break
          }
      }
  
      // world-space position of the chosen corner
      cornerVec.copyFrom(offsetVec)
      cornerVec.rotate(transform.rotation)    
      cornerVec.addInPlace(transform.position)
  
      // math to do the projection onto the projector plane
      let vecToPoint = cornerVec.subtract(projPlanePos)
      let scaler = Vector3.Dot(vecToPoint, projNormal) / Math.pow(projNormal.length(), 2 )     
      let result = projNormal.scale(scaler)   
      result.scaleInPlace(-1)    
  
      return new Vector3(cornerVec.x+ result.x, cornerVec.y + result.y, cornerVec.z + result.z)
    }  
  }

  // groups the Screens that use the same projector, and stores a reference to that projector
  export class ScreenGroup {
    screens:Screen[] = []
    projectorReference:Projector 
  
    constructor(_projector:Projector){
      this.projectorReference = _projector
    }
  
    addSCreen(_screen:Screen){
      this.screens.push(_screen)
  
    }
    updateScreens(_targetPos:Vector3){
      const projectorTransfrom = this.projectorReference.getComponent(Transform)
      const projectorPos = this.projectorReference.getPos()        
      const projectorNormal = this.projectorReference.getNormalVector()     
  
      for(let i=0; i< this.screens.length; i++){
        
        if(!this.screens[i].isTwoSided){

          // check whether the player's camera is looking at the screen from the front side
            let facingPLayerFactor = Vector3.Dot(this.screens[i].getNormal(), _targetPos.subtract(this.screens[i].getComponent(Transform).position)) 
  
            //only update the screens that are facing the player's view
            if(facingPLayerFactor >= 0){
                this.screens[i].screenPlane.visible = true
                this.screens[i].projectPoints(this.projectorReference.getNormalVector(), this.projectorReference.getPos())      
                this.screens[i].setUVs(
                  this.projectorReference.getUVfromCoords(this.screens[i].getProjectedCorner("00", projectorNormal, projectorPos)),
                  this.projectorReference.getUVfromCoords(this.screens[i].getProjectedCorner("10", projectorNormal, projectorPos)),
                  this.projectorReference.getUVfromCoords(this.screens[i].getProjectedCorner("11", projectorNormal, projectorPos)),
                  this.projectorReference.getUVfromCoords(this.screens[i].getProjectedCorner("01", projectorNormal, projectorPos))
              )
            }else{
                this.screens[i].screenPlane.visible = false
            }
        // if the screen is set to two-sided then update it regardless of the player's view    
        }else{
            this.screens[i].projectPoints(this.projectorReference.getNormalVector(), this.projectorReference.getPos())      
            this.screens[i].setUVs(
              this.projectorReference.getUVfromCoords(this.screens[i].getProjectedCorner("00", projectorNormal, projectorPos)),
              this.projectorReference.getUVfromCoords(this.screens[i].getProjectedCorner("10", projectorNormal, projectorPos)),
              this.projectorReference.getUVfromCoords(this.screens[i].getProjectedCorner("11", projectorNormal, projectorPos)),
              this.projectorReference.getUVfromCoords(this.screens[i].getProjectedCorner("01", projectorNormal, projectorPos))
            )
        }
        
        
        
        
      }
    }
  }

  export class ColumnScreen {
    screens:Screen[] = []  
  
    constructor(group:ScreenGroup, _pos:Vector3, _radius:number, _height:number, _isTwoSided:boolean, _mat:Material){
  
      let screen1 = new Screen({
        position: new Vector3(_pos.x + _radius/2, _pos.y + _height/2, _pos.z),
        rotation: Quaternion.Euler(0,90,0),
        scale: new Vector3(_radius, _height,1)},
        _isTwoSided, 
        _mat)
  
      let screen2 = new Screen({
        position: new Vector3(_pos.x - _radius/2, _pos.y + _height/2, _pos.z),
        rotation: Quaternion.Euler(0,270,0),
        scale: new Vector3(_radius, _height,1)},
        _isTwoSided, 
        _mat)
  
      let screen3 = new Screen({
        position: new Vector3(_pos.x, _pos.y + _height/2, _pos.z + _radius/2),
        rotation: Quaternion.Euler(0,0,0),
        scale: new Vector3(_radius, _height,1)},
        _isTwoSided, 
        _mat)
  
      let screen4 = new Screen({
        position: new Vector3(_pos.x, _pos.y + _height/2, _pos.z - _radius/2),
        rotation: Quaternion.Euler(0,180,0),
        scale: new Vector3(_radius, _height,1)},
        _isTwoSided, 
        _mat)    
  
        //add all sides of the column to the same screenGroup
        group.addSCreen(screen1)
        group.addSCreen(screen2)
        group.addSCreen(screen3)
        group.addSCreen(screen4)
  
        this.screens.push(screen1)
        this.screens.push(screen2)
        this.screens.push(screen3)
        this.screens.push(screen4)
      }
  
    }