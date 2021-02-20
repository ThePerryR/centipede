import utils from '../node_modules/decentraland-ecs-utils/index'

import {MushroomComponent} from "./MushroomComponent";
import {Centipede} from "./Centipede";

function random(chance: number) {
    return Math.floor(Math.random() * chance);
}

export class Mushroom extends Entity {
    mushroomSmall: Entity
    mushroomLarge: Entity
    poisonMushroomSmall: Entity
    poisonMushroomLarge: Entity
    poisoned: boolean = false


    constructor(x: number, z: number) {
        super()
        engine.addEntity(this)
        const scale = new Vector3(0.2, 0.3, 0.2)
        const position = new Vector3(x, 0.15, z)
        const rotation = Quaternion.Euler(0, random(360), 0)
        this.addComponent(new Transform({position, scale}))
        this.addComponent(new MushroomComponent())
        const targetShape = new BoxShape()
        targetShape.visible = false
        this.addComponent(targetShape)

        this.mushroomSmall = this.addMesh("models/mushroom-1.glb")
        this.mushroomLarge = this.addMesh("models/mushroom-2.glb", true)
        this.poisonMushroomSmall = this.addMesh("models/mushroom-1-p.glb")
        this.poisonMushroomLarge = this.addMesh("models/mushroom-2-p.glb")

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

    addMesh(src: string, visible: boolean = false): Entity {
        const mesh = new Entity()
        mesh.addComponent(new GLTFShape(src))
        mesh.setParent(this)
        mesh.addComponent(new Transform({
            rotation: Quaternion.Euler(0, random(360), 0),
            scale: new Vector3(2, 1, 2),
            position: new Vector3(0, -0.5, 0)
        }))
        engine.addEntity(mesh)
        mesh.getComponent(GLTFShape).visible = visible
        return mesh
    }

    poison() {
        this.poisoned = true
        this.mushroomSmall.getComponent(GLTFShape).visible = false
        this.mushroomLarge.getComponent(GLTFShape).visible = false
        if (this.getComponent(MushroomComponent).health === 1) {
            this.poisonMushroomSmall.getComponent(GLTFShape).visible = true
        } else {
            this.poisonMushroomLarge.getComponent(GLTFShape).visible = true
        }
    }
}
