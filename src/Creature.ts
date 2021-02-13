import {Mushroom} from "./Mushroom";
import {Target} from "./Target";

const targets = engine.getComponentGroup(Target)

@Component("creature")
export class Creature {
    rotationSpeed: number
    movementSpeed: number
    health: number
    targetMushroom: Mushroom | null = null

    constructor(rotationSpeed = 1, movementSpeed = 1, health = 1) {
        this.rotationSpeed = rotationSpeed
        this.movementSpeed = movementSpeed
        this.health = health
        this.setTarget()
    }

    setTarget() {
        const aliveMushrooms = targets.entities.filter(entity => entity.alive)
        const target = aliveMushrooms[Math.floor(Math.random() * aliveMushrooms.length)] as Mushroom
        if (target) {
            this.targetMushroom = target
        } else {
            this.targetMushroom = null
        }
    }
}