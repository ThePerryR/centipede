import {CentipedeComponent} from "./CentipedeComponent";
import {Centipede} from "./Centipede";
import {BodyComponent} from "./BodyComponent";
import {Body} from "./Body";
import {GameState} from "./GameState";
import {MushroomComponent} from "./MushroomComponent";
import Direction from "./constants/Direction";
import {Mushroom} from "./Mushroom";
import State from "./constants/State";
import gameSettings from "./constants/gameSettings";

class ShootingSystem implements ISystem {
    gameState: GameState
    shootSfx: AudioSource
    hitSfx: AudioSource
    hitSfxEntity: Entity
    squishSfx: AudioSource
    squishSfxEntity: Entity
    shooting: Boolean = false
    cooldown: number = 0
    constructor(gameState: GameState) {
        this.gameState = gameState

        const shootSoundEntity = new Entity()
        const shootSoundClip = new AudioClip("sounds/hit-1.wav")
        this.shootSfx = new AudioSource(shootSoundClip)
        this.shootSfx.volume = 0.2
        shootSoundEntity.addComponent(this.shootSfx)
        engine.addEntity(shootSoundEntity)
        shootSoundEntity.setParent(Attachable.AVATAR)

        const hitSoundEntity = new Entity()
        hitSoundEntity.addComponent(new Transform())
        const hitSoundClip = new AudioClip("sounds/hit.wav")
        this.hitSfx = new AudioSource(hitSoundClip)
        this.hitSfx.volume = 1
        hitSoundEntity.addComponent(this.hitSfx)
        engine.addEntity(hitSoundEntity)
        this.hitSfxEntity = hitSoundEntity
        //hitSoundEntity.setParent(Attachable.AVATAR)

        const squishSoundEntity = new Entity()
        squishSoundEntity.addComponent(new Transform())
        const squishSoundClip = new AudioClip("sounds/hit-2.wav")
        this.squishSfx = new AudioSource(squishSoundClip)
        this.squishSfx.volume = 1
        squishSoundEntity.addComponent(this.squishSfx)
        engine.addEntity(squishSoundEntity)
        this.squishSfxEntity = squishSoundEntity
    }
    update(dt: number) {
        if (this.cooldown) {
            this.cooldown -= dt
            if (this.cooldown < 0) this.cooldown = 0
        }
        if (this.gameState.state === State.Active && this.cooldown === 0 && this.shooting) {
            this.cooldown = gameSettings.SHOOT_DELAY
            this.shootSfx.playOnce()


            let physicsCast = PhysicsCast.instance
            let rayFromCamera = physicsCast.getRayFromCamera(1000)
            physicsCast.hitFirst(rayFromCamera, (e) => {
                const hitEntity = engine.entities[e.entity.entityId]
                if (hitEntity) {
                    let collisionScore = 0
                    // Hit Mushroom
                    if (hitEntity.getComponentOrNull(MushroomComponent)) {
                        this.squishSfxEntity.getComponent(Transform).position = hitEntity.getComponent(Transform).position.add(new Vector3(0, 1, 0))
                        this.squishSfx.playOnce()
                        const mushroom = hitEntity as Mushroom
                        const mushroomComponent = hitEntity.getComponent(MushroomComponent)
                        mushroomComponent.health--
                        if (mushroomComponent.health === 0) {
                            engine.removeEntity(hitEntity)
                        } else if (mushroomComponent.health === 1) {
                            mushroom.mushroomSmall.getComponent(GLTFShape).visible = true
                            mushroom.mushroomLarge.getComponent(GLTFShape).visible = false
                        }
                        collisionScore += 10
                    }

                    // Hit head
                    if (hitEntity.getComponentOrNull(CentipedeComponent)) {
                        const centipede = hitEntity as Centipede
                        this.hitSfxEntity.getComponent(Transform).position = hitEntity.getComponent(Transform).position.add(new Vector3(0, 1, 0))
                        this.hitSfx.playOnce()
                        if (!centipede.body.length) {
                            engine.removeEntity(centipede)
                        } else {
                            centipede.x = centipede.body[0].x
                            centipede.z = centipede.body[0].z
                            engine.removeEntity(centipede.body[0])
                            centipede.body.splice(0, 1)
                        }
                        collisionScore += 100
                        this.gameState.spawnMushroom(centipede.x, centipede.z)
                    }

                    // Hit Body
                    if (hitEntity.getComponentOrNull(BodyComponent)) {
                        const body = hitEntity as Body
                        if (body === body.centipede.body[body.centipede.body.length - 1]) {
                            body.centipede.body.pop()
                            engine.removeEntity(body)
                        } else {
                            const i = body.centipede.body.indexOf(body)
                            // TODO use pool
                            const newCentipede = new Centipede(
                                this.gameState,
                                body.centipede.body[i + 1].x,
                                body.centipede.body[i + 1].z,
                                0,
                                (body.centipede.currentDirection === Direction.Down || body.centipede.currentDirection === Direction.Up) ? body.centipede.previousDirection : body.centipede.currentDirection,
                                Direction.Down
                            )

                            if (i < body.centipede.body.length - 2) {
                                newCentipede.body = body.centipede.body.splice(i + 2, body.centipede.body.length - (i + 2))
                                newCentipede.body.forEach(body => {
                                    body.centipede = newCentipede
                                })
                            }

                            engine.removeEntity(body.centipede.body.pop() as Entity)
                        }
                        collisionScore += 100
                        this.gameState.spawnMushroom(body.prevX, body.prevZ)
                        this.hitSfx.playOnce()
                    }

                    if (collisionScore) {
                        this.gameState.incrementScore(collisionScore)
                    }
                }
            })
        }
    }
}

export class InputManager {
    input: Input
    gameState: GameState
    shootingSystem: ShootingSystem

    constructor(gameState: GameState) {
        this.input = Input.instance
        this.gameState = gameState

        this.shootingSystem = new ShootingSystem(gameState)
        engine.addSystem(this.shootingSystem)

        //squishSoundEntity.setParent(Attachable.AVATAR)


        this.input.subscribe('BUTTON_DOWN', ActionButton.POINTER, true, (e) => {
            this.shootingSystem.shooting = true
        })
        this.input.subscribe('BUTTON_UP', ActionButton.POINTER, true, (e) => {
            this.shootingSystem.shooting = false
        })
    }
}
