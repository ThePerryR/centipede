import gameSettings from "./constants/gameSettings";
import {SpiderComponent} from "./SpiderComponent";
import utils from "../node_modules/decentraland-ecs-utils/index";
import {GameState} from "./GameState";

export class Spider extends Entity {
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
    spiderSfx: AudioSource
    gameState: GameState

    constructor(gameState: GameState) {
        super();
        this.gameState = gameState
        this.addComponent(new Transform({
            position: new Vector3(0, 1, 0),
            scale: new Vector3(1, 0.5, 0.5)
        }))
        this.addComponent(new BoxShape())
        this.getComponent(BoxShape).withCollisions = false
        this.addComponent(new SpiderComponent())

        const spiderSoundEntity = new Entity()
        const spiderSoundClip = new AudioClip("sounds/monster-2.wav")
        this.spiderSfx = new AudioSource(spiderSoundClip)
        this.spiderSfx.loop = true
        this.spiderSfx.volume = 0.5
        spiderSoundEntity.addComponent(this.spiderSfx)
        engine.addEntity(spiderSoundEntity)
        spiderSoundEntity.setParent(this)
        // this.squishSfxEntity = spiderSoundEntity

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
    }

    update (dt: number) {
        this.t += dt
        if (this.t >= gameSettings.MOVE_TIME) {
            this.t = 0

            if (this.x < -1 || this.x >= gameSettings.RIGHT_BOUNDARY) {
                this.spiderSfx.playing = false
                engine.removeEntity(this)
                return;
            }

            let changeX = true
            if (this.z >= this.maxZ) {
                this.dz = -0.25;
            } else if (this.z <= this.minZ) {
                this.dz = 0.25;
            } else {
                changeX = false;
            }
            if (changeX) {
                if (Math.floor(Math.random() * 4) === 0) {
                    this.dx = 0;
                } else {
                    this.dx = this.startDx;
                }
            }
            this.prevZ = this.z;
            this.prevX = this.x;

            this.x += (4 * this.dx);
            this.z += (4 * this.dz);
        }

        this.draw()
    }

    draw() {
        this.getComponent(Transform).position = Vector3.Lerp(new Vector3(this.prevX, gameSettings.SCALE, this.prevZ), new Vector3(this.x, gameSettings.SCALE, this.z), this.t * (1 / (gameSettings.MOVE_TIME)))
    }
}
