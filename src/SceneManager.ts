
export class SceneManager {
    constructor() {
        this._initGround()
    }

    _initGround() {
        const ground = new Entity('ground')
        engine.addEntity(ground)

        const gltfShape = new GLTFShape("models/FloorBaseGrass_01/FloorBaseGrass_01.glb")
        gltfShape.withCollisions = true
        gltfShape.isPointerBlocker = true
        gltfShape.visible = true

        ground.addComponentOrReplace(gltfShape)
        const transform = new Transform({
            position: new Vector3(8, 0, 8),
            rotation: new Quaternion(0, 0, 0, 1),
            scale: new Vector3(1, 1, 1)
        })
        ground.addComponentOrReplace(transform)
    }
}