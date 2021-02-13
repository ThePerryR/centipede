import { Target } from './Target'
export class Mushroom extends Entity {
    constructor(x: number, z: number) {
        super()
        engine.addEntity(this)

        this.addComponent(new Target())

        // add a transform component
        const transform = new Transform({
            position: new Vector3(x, 0, z),
            rotation: new Quaternion(0, 0, 0, 1),
            scale: new Vector3(1, 1, 1)
        })
        this.addComponentOrReplace(transform)

        // add a model component
        const gltfShape = new GLTFShape("models/mushroom_red.glb")
        gltfShape.isPointerBlocker = true
        gltfShape.visible = true
        this.addComponentOrReplace(gltfShape)
    }

    die () {
        engine.removeEntity(this)
    }
}