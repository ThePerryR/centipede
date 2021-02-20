import gameSettings from "./constants/gameSettings";
import {FleaComponent} from "./FleaComponent";
import utils from "../node_modules/decentraland-ecs-utils/index";
import {GameState} from "./GameState";

export class Flea extends Entity {
    x: number = 0
    z: number = 0
    prevX: number = -1
    prevZ: number = -1
    startDx: number = 0
    dx: number = 0
    maxZ: number = 0
    minZ: number = 0
    dz: number = 0
    t: number = 0
    fleaSfx: AudioSource
    gameState: GameState

    constructor(gameState: GameState) {
        super();
        this.gameState = gameState
        this.addComponent(new Transform({
            position: new Vector3(0, 0, 0),
            scale: new Vector3(0.4, 0.4, 0.4)
        }))
        const targetBox = new BoxShape()
        targetBox.visible = false
        this.addComponent(targetBox)
        this.addComponent(new FleaComponent())

        const fleaSoundEntity = new Entity()
        const fleaSoundClip = new AudioClip("sounds/monster-1.wav")
        this.fleaSfx = new AudioSource(fleaSoundClip)
        this.fleaSfx.loop = true
        this.fleaSfx.volume = 0.5
        fleaSoundEntity.addComponent(this.fleaSfx)
        engine.addEntity(fleaSoundEntity)
        fleaSoundEntity.setParent(this)
        // this.squishSfxEntity = fleaSoundEntity

        const triggerShape = new utils.TriggerBoxShape(new Vector3(0.5, 2,  0.5), new Vector3(0, 1, 0))
        this.addComponent(new utils.TriggerComponent(
            triggerShape,
            {
                layer: 2,
                enableDebug: false,
                onCameraEnter: () => {
                    this.gameState.playerHit()
                }
            }
        ))


        const model = new Entity()
        model.addComponent(new GLTFShape("models/flea.glb"))
        model.addComponent(new Transform({
            scale: new Vector3(0.2, 0.2, 0.2),
            position: new Vector3(0, -0.5, 0)
        }))
        engine.addEntity(model)
        model.setParent(this)
    }

    update (dt: number) {
        this.t += dt
        if (this.t >= gameSettings.FLEA_MOVE_TIME) {
            this.t = 0

            this.prevZ = this.z
            this.z += 1

            if (this.z > gameSettings.DOWN_BOUNDARY) {
                this.fleaSfx.playing = false
                engine.removeEntity(this)
                return;
            }

            if (this.prevZ < gameSettings.DOWN_BOUNDARY - 1) {
                // Not allowed to put a mushroom on the bottom row
                if (Math.floor(Math.random() * 3) === 0) {
                    this.gameState.spawnMushroom(this.x, this.z)
                }
            }
        }

        this.draw()
    }

    draw() {

        this.getComponent(Transform).position = Vector3.Lerp(new Vector3(this.prevX, gameSettings.SCALE, this.prevZ), new Vector3(this.x, gameSettings.SCALE, this.z), this.t * (1 / (gameSettings.FLEA_MOVE_TIME)))
    }
}
