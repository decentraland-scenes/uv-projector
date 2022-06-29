// stores global values for the whole scene
export class Scene {   
    sizeX: number = 2*16
    sizeZ: number = 2*16 
    groundElevation: number = 0    
    center: Vector3 = new Vector3(this.sizeX/2, this.groundElevation, this.sizeZ/2)
    columnsCenter: Vector3 = new Vector3(this.center.x, this.groundElevation + 2, this.center.z)
    tvScreensCenter: Vector3 = new Vector3(this.center.x, this.groundElevation + 4, this.center.z)
}

export let scene = new Scene()
   