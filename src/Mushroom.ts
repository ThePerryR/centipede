export class Mushroom {
    entity: Entity
    constructor(x: number, y: number) {
        this.entity = new Entity('mushroomRed')
        engine.addEntity(this.entity)

        // add a transform component
        const transform = new Transform({
            position: new Vector3(x, 0, y),
            rotation: new Quaternion(0, 0, 0, 1),
            scale: new Vector3(1, 1, 1)
        })
        this.entity.addComponentOrReplace(transform)

        // add a model component
        const gltfShape = new GLTFShape("models/mushroom_red.glb")
        gltfShape.isPointerBlocker = true
        gltfShape.visible = true
        this.entity.addComponentOrReplace(gltfShape)
    }
}