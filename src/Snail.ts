import gameSettings from "./constants/gameSettings";
import {SnailComponent} from './SnailComponent'
import utils from "../node_modules/decentraland-ecs-utils/index";
import {GameState} from "./GameState";

export class Snail extends Entity {
    x: number = 0
    z: number = 0
    prevX: number = 0
    prevZ: number = 0
    startDx: number = 0
    dx: number = -0.25
    maxZ: number = 0
    minZ: number = 0
    dz: number = 0
    t: number = 0
    snailSfx: AudioSource
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
        this.addComponent(new SnailComponent())

        const snailSoundEntity = new Entity()
        const snailSoundClip = new AudioClip("sounds/monster-2.wav")
        this.snailSfx = new AudioSource(snailSoundClip)
        this.snailSfx.loop = true
        this.snailSfx.volume = 0.5
        snailSoundEntity.addComponent(this.snailSfx)
        engine.addEntity(snailSoundEntity)
        snailSoundEntity.setParent(this)
        // this.squishSfxEntity = snailSoundEntity

        const triggerShape = new utils.TriggerBoxShape(new Vector3(1, 2,  0.5), new Vector3(0, 1, 0))
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
        model.addComponent(new GLTFShape("models/snail.glb"))
        model.addComponent(new Transform({
            scale: new Vector3(0.01, 0.01, 0.01),
            position: new Vector3(0, -0.5, 0)
        }))
        engine.addEntity(model)
        model.setParent(this)
    }

    update (dt: number) {
        this.t += dt
        if (this.t >= gameSettings.Snail_MOVE_TIME) {
            this.t = 0

            if (this.x < 0) {
                this.snailSfx.playing = false
                engine.removeEntity(this)
                return;
            }

            this.prevX = this.x
            this.x--
            this.gameState.poisonArea(this.x, this.z)
        }

        this.draw()
    }

    draw() {
        this.getComponent(Transform).position = Vector3.Lerp(new Vector3(this.prevX, gameSettings.SCALE, this.prevZ), new Vector3(this.x, gameSettings.SCALE, this.z), this.t * (1 / (gameSettings.Snail_MOVE_TIME)))
    }
}
