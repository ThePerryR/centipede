import {Creature} from "./Creature";

export class CreatureAttack implements ISystem {
    creatures: ComponentGroup
    player: Camera

    constructor() {
        this.creatures = engine.getComponentGroup(Creature)
        this.player = Camera.instance
    }

    update(dt: number) {
        for (const entity of this.creatures.entities) {
            const transform = entity.getComponent(Transform)
            const lookAtTarget = new Vector3(this.player.position.x, transform.position.y, this.player.position.z)
            const direction = lookAtTarget.subtract(transform.position)
            const {rotationSpeed, movementSpeed} = entity.getComponent(Creature)
            transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(direction), dt * rotationSpeed)

            const distance = Vector3.DistanceSquared(transform.position, this.player.position)
            if (distance > 1) {
                const forwardVector = Vector3.Forward().rotate(transform.rotation)
                const increment = forwardVector.scale(dt * movementSpeed)
                transform.translate(increment)
            }
        }
    }
}