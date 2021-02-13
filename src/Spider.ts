import {Creature} from "./Creature";

export class Spider extends Entity {
    constructor(spawnPos: Vector3) {
        super()
        engine.addEntity(this)

        this.addComponent(new Creature(4))

        // add a transform component
        const transform = new Transform({
            position: spawnPos,
            rotation: new Quaternion(0, 0, 0, 1),
            scale: new Vector3(0.1, 0.1, 0.2)
        })
        this.addComponentOrReplace(transform)

        const testShape = new BoxShape()
        this.addComponent(testShape)
    }
}
