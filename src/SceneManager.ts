import {Mushroom} from './Mushroom'

export class SceneManager {
    cave: Entity

    constructor() {

        this._initGround()
        this.cave = this._initCave()
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

    _initCave() {
        const cave = new Entity('cave')
        engine.addEntity(cave)

        const transform = new Transform({
            position: new Vector3(3.5, 0, 3.5),
            rotation: new Quaternion(0, 0, 0, 1),
            scale: new Vector3(1, 1, 1)
        })
        cave.addComponentOrReplace(transform)
        const gltfShape = new GLTFShape("models/RockBig_06/RockBig_06.glb")
        gltfShape.withCollisions = true
        gltfShape.isPointerBlocker = true
        gltfShape.visible = true
        cave.addComponentOrReplace(gltfShape)
        return cave
    }
}