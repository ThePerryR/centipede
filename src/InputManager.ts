import {Creature} from "./Creature";

export class InputManager {
    input: Input

    constructor() {
        this.input = Input.instance

        this.input.subscribe('BUTTON_DOWN', ActionButton.POINTER, true, (e) => {
            if (e.hit && engine.entities[e.hit.entityId] != undefined) {
                const hitEntity = engine.entities[e.hit.entityId]
                const creatureComponent = hitEntity.getComponentOrNull(Creature)
                if (creatureComponent) {
                    creatureComponent.health -= 1
                    if (creatureComponent.health < 0) {
                        engine.removeEntity(hitEntity)
                    }
                }
            }
        })
    }
}