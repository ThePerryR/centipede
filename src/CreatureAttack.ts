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
            const creature = entity.getComponent(Creature)

            if (!creature.targetMushroom || !creature.targetMushroom.alive) creature.setTarget()
            const {rotationSpeed, movementSpeed, targetMushroom} = creature

            const targetPosition = targetMushroom ? targetMushroom.getComponent(Transform).position : this.player.position

            const lookAtTarget = new Vector3(targetPosition.x, transform.position.y, targetPosition.z)
            const direction = lookAtTarget.subtract(transform.position)
            transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(direction), dt * rotationSpeed)

            const distance = Vector3.DistanceSquared(transform.position, targetPosition)
            if (distance > 0.1) {
                const forwardVector = Vector3.Forward().rotate(transform.rotation)
                const increment = forwardVector.scale(dt * movementSpeed)
                transform.translate(increment)
            } else if (targetMushroom) {
                targetMushroom.die()
                creature.setTarget()
            }
        }
    }
}