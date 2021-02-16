import {CentipedeComponent} from "./CentipedeComponent";
import {Centipede} from "./Centipede";
import {BodyComponent} from "./BodyComponent";
import {Body} from "./Body";

export class InputManager {
    input: Input

    constructor() {
        this.input = Input.instance

        this.input.subscribe('BUTTON_DOWN', ActionButton.POINTER, true, (e) => {
            if (e.hit && engine.entities[e.hit.entityId] != undefined) {
                const hitEntity = engine.entities[e.hit.entityId]
                if (hitEntity.getComponentOrNull(CentipedeComponent)) {
                    const centipede = hitEntity as Centipede
                    if (!centipede.body.length) {
                        engine.removeEntity(centipede)
                    } else {
                        centipede.x = centipede.body[0].x
                        centipede.z = centipede.body[0].z
                        engine.removeEntity(centipede.body[0])
                        centipede.body.splice(0, 1)
                    }
                }

                if (hitEntity.getComponentOrNull(BodyComponent)) {
                    const body = hitEntity as Body
                    if (body === body.centipede.body[body.centipede.body.length - 1]) {
                        body.centipede.body.pop()
                        engine.removeEntity(body)
                    }
                }
                log(hitEntity)
            }
        })
    }
}
