import utils from '../node_modules/decentraland-ecs-utils/index'

import {MushroomComponent} from "./MushroomComponent";
import {Centipede} from "./Centipede";

export class Mushroom extends Entity {
    constructor(x: number, z: number) {
        super()
        engine.addEntity(this)
        const scale = new Vector3(0.4, 0.4, 0.4)
        const position = new Vector3(x, 0.2, z)
        this.addComponent(new Transform({position, scale}))
        this.addComponent(new MushroomComponent())
        this.addComponent(new BoxShape())
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