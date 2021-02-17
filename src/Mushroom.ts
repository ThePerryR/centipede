import utils from '../node_modules/decentraland-ecs-utils/index'

import {MushroomComponent} from "./MushroomComponent";
import {Centipede} from "./Centipede";

function random(chance: number) {
    return Math.floor(Math.random() * chance);
}

export class Mushroom extends Entity {
    mushroomSmall: Entity
    mushroomLarge: Entity
    constructor(x: number, z: number) {
        super()
        engine.addEntity(this)
        const scale = new Vector3(0.4, 8, 0.4)
        const position = new Vector3(x, 4, z)
        const rotation = Quaternion.Euler(0, random(360), 0)
        this.addComponent(new Transform({position, scale}))
        this.addComponent(new MushroomComponent())
        this.addComponent(new BoxShape())
        this.getComponent(BoxShape).visible = false

        const meshSmall = new Entity()
        meshSmall.addComponent(new GLTFShape("models/mushroom-1.glb"))
        meshSmall.setParent(this)
        meshSmall.addComponent(new Transform({rotation, scale: new Vector3(1, 0.05, 1), position: new Vector3(0, -0.5, 0)}))
        this.mushroomSmall = meshSmall
        engine.addEntity(meshSmall)
        meshSmall.getComponent(GLTFShape).visible = false

        const meshLarge = new Entity()
        meshLarge.addComponent(new GLTFShape("models/mushroom-2.glb"))
        meshLarge.addComponent(new Transform({rotation, scale: new Vector3(1, 0.05, 1), position: new Vector3(0, -0.5, 0)}))
        meshLarge.setParent(this)
        this.mushroomLarge = meshLarge

        engine.addEntity(meshLarge)

        const triggerShape = new utils.TriggerBoxShape(scale, Vector3.Zero())
        this.addComponent(new utils.TriggerComponent(
            triggerShape,
            {
                layer: 1,
                triggeredByLayer: 2,
                onTriggerEnter: (entity: Entity) => {
                    const centipede = entity as Centipede
                    centipede.collidingWith = this
                },
                onTriggerExit: (entity: Entity) => {
                    const centipede = entity as Centipede
                    if (centipede.collidingWith === this) {
                        centipede.collidingWith = null
                    }
                },
                enableDebug: false
            }
        ))
    }
}