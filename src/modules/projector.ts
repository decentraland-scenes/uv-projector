

//Projection plane that all other screens are UV projected onto
export class Projector extends Entity {

  planeMesh:Entity
  projectorPlane:PlaneShape 
  normalRoot:Entity
  normalVector:Entity
  aspect:number = 9/16
  originMarker:Entity
  uMarker:Entity
  vMarker:Entity

  constructor(pos:Vector3, scale:Vector3, rot:Quaternion, isVideoFlipped:boolean, mat?:Material ){
    super()
    //separate  plane mesh from root entity
    this.projectorPlane = new PlaneShape()    
    this.projectorPlane.withCollisions = false 
    this.planeMesh = new Entity()
    this.planeMesh.addComponent(new Transform({rotation: Quaternion.Euler(180,0,0)}))
    this.planeMesh.setParent(this)
    this.planeMesh.addComponent(this.projectorPlane)
    if(mat){
      this.planeMesh.addComponent ( mat)
    }
    
    this.planeMesh.getComponent(PlaneShape).visible = false

    

    this.addComponent(new Transform({
      position: new Vector3(pos.x,pos.y,pos.z),
      rotation: new Quaternion(rot.x, rot.y, rot.z, rot.w),
      scale: new Vector3(scale.x, scale.y, scale.z)
    }))   

    //workaround for flipped video UV
    if(isVideoFlipped){
      this.getComponent(Transform).scale.y *= -1
    }
    
    // normal vector 3D display
    this.normalRoot = new Entity()
    this.normalRoot.addComponent(new Transform({
      position:new Vector3(8,6,8),
      scale: new Vector3(1,1,1),
      rotation: Quaternion.Euler(0,0,0),
    }))
    this.normalVector = new Entity()

    this.normalVector.addComponent(new Transform({
      position:new Vector3(0,1,0),
      scale: new Vector3(0.05,2,0.05),
      rotation: Quaternion.Euler(0,0,0),
    }))
    //this.normalVector.addComponent(new BoxShape())
    //this.normalVector.setParent(this.normalRoot)

    this.normalRoot.getComponent(Transform).rotation = Quaternion.FromToRotation(Vector3.Up(), this.getNormalVector())

    //engine.addEntity(this.normalRoot)
    engine.addEntity(this)

    //DEBUG SHAPES

    // this.originMarker = new Entity()
    // this.originMarker.addComponent(new BoxShape())
    // this.originMarker.addComponent(new Transform({scale:new Vector3(0.1,0.1,0.1)}))
    // engine.addEntity(this.originMarker)

    // this.uMarker = new Entity()
    // this.uMarker.addComponent(new BoxShape())
    // this.uMarker.addComponent(new Transform({scale:new Vector3(0.1,0.1,0.1)}))
    // engine.addEntity(this.uMarker)

    // this.vMarker = new Entity()
    // this.vMarker.addComponent(new BoxShape())
    // this.vMarker.addComponent(new Transform({scale:new Vector3(0.1,0.1,0.1)}))
    // engine.addEntity(this.vMarker)
  }

  getNormalVector():Vector3{

    let normal = Vector3.Forward().rotate(this.getComponent(Transform).rotation)
    //this.normalRoot.getComponent(Transform).rotation = Quaternion.FromToRotation(Vector3.Up(), normal)

    //log("NORMAL: " + normal + " \nlength: " + normal.length())
    return normal
    
  }
  getPos():Vector3{
    return this.getComponent(Transform).position
  }

  projectPoint(_point:Vector3):Vector3{

   let normal = this.getNormalVector()
   let vecToPoint = _point.subtract(this.getComponent(Transform).position)
   let scaler = Vector3.Dot(vecToPoint, normal) / Math.pow(normal.length(), 2 )
   let result = normal.scale(scaler)

    return result.scaleInPlace(-1)
  }

  getUVfromCoords(_point:Vector3):Vector2{

    const origin = Vector3.Zero()
    origin.copyFrom(this.getOrigin())

    const U = this.getCorner("10").subtract(origin)
    const V = this.getCorner("01").subtract(origin)
    
    //DEBUG SHAPES

    // this.uMarker.getComponent(Transform).position.copyFrom(U).addInPlace(origin)
    // this.vMarker.getComponent(Transform).position.copyFrom(V).addInPlace(origin)

    let vecToPoint = _point.subtract(origin)

    let uCoord = Vector3.Dot(vecToPoint, U) / Math.pow(U.length(), 2 )     
    let vCoord = Vector3.Dot(vecToPoint, V) / Math.pow(V.length(), 2 )       

    return new Vector2(uCoord, vCoord)
  }

  getOrigin():Vector3{   
    
    let originCorner = this.getCorner("00")      

    // DEBUG SHAPE

    //this.originMarker.getComponent(Transform).position.copyFrom(originCorner)

    return originCorner    
  }

  getCorner(cornerID:string):Vector3{
    const _transform = this.getComponent(Transform)
    let corner = new Vector3(0, 1 , 0)

    switch (cornerID) {
      case "00":
        {
          corner = new Vector3(_transform.scale.x/2, -_transform.scale.y/2 , 0)
          break
        }
      case "10":
        {
          corner = new Vector3(-_transform.scale.x/2, -_transform.scale.y/2 , 0)
          break
        }
      case "11":
        {
          corner = new Vector3(-_transform.scale.x/2, _transform.scale.y/2 , 0)
          break
        }
      case "01":
        {
          corner = new Vector3(_transform.scale.x/2, _transform.scale.y/2 , 0)
          break
        }
    }     

    corner.rotate(_transform.rotation)    
    corner.addInPlace(_transform.position)     
    return corner
  }
  setScaleHorizontal(_scale:number){
    this.getComponent(Transform).scale.set(_scale, _scale*this.aspect, 1)
  }
}
