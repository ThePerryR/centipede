import utils from "../node_modules/decentraland-ecs-utils/index"

import {SceneManager} from './SceneManager'
import {Tank} from './Tank'

const sceneManager = new SceneManager()
const tank = new Tank()

// attach tank to player
tank.setParent(Attachable.AVATAR)


const hideAvatarsEntity = new Entity()

//
hideAvatarsEntity.addComponent(
    new AvatarModifierArea({
        area: {box: new Vector3(16, 4, 16)},
        modifiers: [AvatarModifiers.HIDE_AVATARS]
    })
)
hideAvatarsEntity.addComponent(new BoxShape())
hideAvatarsEntity.addComponent(
    new Transform({position: new Vector3(8, 2, 8)})
)
engine.addEntity(hideAvatarsEntity)

hideAvatarsEntity.addComponent(
    new utils.TriggerComponent(
        new utils.TriggerBoxShape(new Vector3(16, 4, 11), Vector3.Zero()),
        {
            onCameraEnter: () => {
                tank.getComponent(Transform).scale.setAll(1)
            },
            onCameraExit: () => {
                tank.getComponent(Transform).scale.setAll(0)
            }
        }
    )
)