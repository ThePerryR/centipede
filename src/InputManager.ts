import {CentipedeComponent} from "./CentipedeComponent";
import {Centipede} from "./Centipede";
import {BodyComponent} from "./BodyComponent";
import {Body} from "./Body";
import {GameState} from "./GameState";
import {MushroomComponent} from "./MushroomComponent";
import Direction from "./constants/Direction";

export class InputManager {
    input: Input
    gameState: GameState
    shootSfx: AudioSource
    hitSfx: AudioSource

    constructor(gameState: GameState) {
        this.input = Input.instance
        this.gameState = gameState

        const shootSoundEntity = new Entity()
        const shootSoundClip = new AudioClip("sounds/hit-1.wav")
        this.shootSfx = new AudioSource(shootSoundClip)
        this.shootSfx.volume = 0.2
        shootSoundEntity.addComponent(this.shootSfx)
        engine.addEntity(shootSoundEntity)
        shootSoundEntity.setParent(Attachable.AVATAR)

        const hitSoundEntity = new Entity()
        const hitSoundClip = new AudioClip("sounds/hit.wav")
        this.hitSfx = new AudioSource(hitSoundClip)
        this.hitSfx.volume = 0.2
        hitSoundEntity.addComponent(this.hitSfx)
        engine.addEntity(hitSoundEntity)
        hitSoundEntity.setParent(Attachable.AVATAR)


        this.input.subscribe('BUTTON_DOWN', ActionButton.POINTER, true, (e) => {
            this.shootSfx.playOnce()
            if (e.hit && engine.entities[e.hit.entityId] != undefined) {
                const hitEntity = engine.entities[e.hit.entityId]
                let collisionScore = 0

                // Hit Mushroom
                if (hitEntity.getComponentOrNull(MushroomComponent)) {
                    const mushroomComponent = hitEntity.getComponent(MushroomComponent)
                    mushroomComponent.health--
                    if (mushroomComponent.health === 0) {
                        engine.removeEntity(hitEntity)
                    }
                    collisionScore += 10
                }

                // Hit head
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
                    collisionScore += 100
                    this.gameState.spawnMushroom(centipede.x, centipede.z)

                    this.hitSfx.playOnce()
                }

                // Hit Body
                if (hitEntity.getComponentOrNull(BodyComponent)) {
                    const body = hitEntity as Body
                    if (body === body.centipede.body[body.centipede.body.length - 1]) {
                        body.centipede.body.pop()
                        engine.removeEntity(body)
                    } else {
                        const i = body.centipede.body.indexOf(body)
                        const newCentipede = new Centipede(
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

                /*
                gameStateService.incrementScore(collisionScore);
                scoreMarkerService.create(x, y, collisionScore);
                 */
            }
        })
    }
}
