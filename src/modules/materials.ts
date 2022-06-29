const myVideoClip1 = new VideoClip('textures/cc_video.mp4')
export const myVideoTexture = new VideoTexture(myVideoClip1)

export let uvMat = new Material()
uvMat.albedoTexture = myVideoTexture
uvMat.emissiveTexture = myVideoTexture
uvMat.transparencyMode = 2
uvMat.emissiveColor = Color3.White()
uvMat.roughness = 1
uvMat.specularIntensity = 0
uvMat.metallic = 0
