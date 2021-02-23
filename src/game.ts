import {getUserData, getUserPublicKey} from "@decentraland/Identity"

import {SceneManager} from './SceneManager'
import {CentipedeComponent} from './CentipedeComponent'
import {Centipede} from './Centipede'
import {InputManager} from "./InputManager";
import {GameState} from "./GameState";
import {MushroomComponent} from "./MushroomComponent";
import Direction from "./constants/Direction";
import State from "./constants/State";
import gameSettings from "./constants/gameSettings";
import {centipedeSpawner} from "./centipedeSpawner";
import {Mushroom} from "./Mushroom";
import {Spider} from "./Spider";
import {Flea} from "./Flea";
import {Snail} from "./Snail";

function random(chance: number) {
    return Math.floor(Math.random() * chance);
}

const gameState = new GameState()
const inputManager = new InputManager(gameState)

const centipedeGroup = engine.getComponentGroup(CentipedeComponent)
const mushroomGroup = engine.getComponentGroup(MushroomComponent)

let firstCentipede: Centipede | null

function initialiseLevel() {
    engine.removeEntity(gameState.hideAvatarsEntity)
    firstCentipede = centipedeSpawner.spawn(gameState, 8, 2, gameSettings.MINIMUM_LENGTH + gameState.level, Direction.Down, Direction.Right)

    for (let i = 1; i < gameState.level && i < gameSettings.MAX_CENTIPEDES; i++) {
        centipedeSpawner.spawn(
            gameState,
            ((i * 2) - 1) * (gameSettings.SCALE * 2),
            2 + gameSettings.SCALE * 2,
            0,
            Direction.Down,
            Direction.Right
        )
    }
}

class GameManagerService implements ISystem {
    spider: Spider
    flea: Flea
    snail: Snail
    transitionTime: number = 0

    constructor() {
        const cacheSpider = new Entity()
        cacheSpider.addComponent(new GLTFShape("models/spider.glb"))
        cacheSpider.addComponent(new Transform({scale: new Vector3(0, 0, 0)}))
        engine.addEntity(cacheSpider)
        this.spider = new Spider(gameState)

        const cacheFlea = new Entity()
        cacheFlea.addComponent(new GLTFShape("models/flea.glb"))
        cacheFlea.addComponent(new Transform({scale: new Vector3(0, 0, 0)}))
        engine.addEntity(cacheFlea)
        this.flea = new Flea(gameState)
        const cacheSnail = new Entity()
        cacheSnail.addComponent(new GLTFShape("models/snail.glb"))
        cacheSnail.addComponent(new Transform({scale: new Vector3(0, 0, 0)}))
        engine.addEntity(cacheSnail)
        this.snail = new Snail(gameState)
    }

    update(dt: number): void {

        if (gameState.state === State.NewGame) {
        }
        if (gameState.state === State.Active) {
            const mushrooms = [...mushroomGroup.entities]
            if (!this.flea.alive && mushrooms.length >= gameSettings.MIN_MUSHROOMS_BEFORE_FLEA && random(gameSettings.FLEA_CHANCE) === 0) {
                this.flea.fleaSfx.playing = true
                const x = random(gameSettings.RIGHT_BOUNDARY - 1) + 1
                const z = 0
                this.flea.x = x
                this.flea.prevX = x
                this.flea.z = z
                this.flea.prevZ = z
                this.flea.dz = 0.5
                this.flea.getComponent(Transform).position.x = x
                this.flea.getComponent(Transform).position.z = z
                engine.addEntity(this.flea)
            }
            if (!this.snail.alive && random(gameSettings.SNAIL_CHANCE) === 0) {
                this.snail.snailSfx.playing = true
                const z = random(gameSettings.DOWN_BOUNDARY - 8) + 2
                const x = 15
                this.snail.x = x
                this.snail.prevX = x
                this.snail.z = z
                this.snail.prevZ = z
                this.snail.getComponent(Transform).position.x = this.snail.x
                this.snail.getComponent(Transform).position.z = z
                engine.addEntity(this.snail)
            }
            if (!this.spider.alive && random(gameSettings.SPIDER_CHANCE) === 0) {
                this.spider.spiderSfx.playing = true
                const x = Camera.instance.position.x < 8 ? gameSettings.RIGHT_BOUNDARY - 1 : 0;
                const z = 8 + random(5);
                this.spider.x = x
                this.spider.z = z
                this.spider.dx = x === 0 ? 0.25 : -0.25
                this.spider.dz = -0.25
                this.spider.maxZ = gameSettings.DOWN_BOUNDARY
                this.spider.minZ = (gameSettings.DOWN_BOUNDARY - 5) + 1
                this.spider.startDx = this.spider.dx
                this.spider.prevX = x - 4 * this.spider.dx
                this.spider.prevZ = z - 4 * this.spider.dz
                this.spider.getComponent(Transform).position.x = x
                this.spider.getComponent(Transform).position.z = z
                engine.addEntity(this.spider)
            }
            const aliveCentipedes = centipedeGroup.entities.filter(entity => entity.alive)
            if (!aliveCentipedes.length) {
                gameState.startLevelTransition()
                return
            }
        }
        if (gameState.state === State.Active || gameState.state === State.LevelTransition) {
            if (this.spider.alive) {
                this.spider.update(dt)
            }
            if (this.flea.alive) {
                this.flea.update(dt)
            }
            if (this.snail.alive) {
                this.snail.update(dt)
            }
            const aliveCentipedes = centipedeGroup.entities.filter(entity => entity.alive)
            for (const centipede of aliveCentipedes) {
                const c = centipede as Centipede
                c.update(dt)
            }
        }
        if (gameState.state === State.LevelTransition) {
            if (this.transitionTime === 0) {
                for (const entity of mushroomGroup.entities) {
                    const mushroom = entity as Mushroom
                    if (mushroom.poisoned) {
                        mushroom.poisonMushroomSmall.getComponent(GLTFShape).visible = false
                        mushroom.poisonMushroomLarge.getComponent(GLTFShape).visible = true
                    } else {
                        mushroom.mushroomSmall.getComponent(GLTFShape).visible = false
                        mushroom.mushroomLarge.getComponent(GLTFShape).visible = true
                    }
                    entity.getComponent(MushroomComponent).health = 2
                }
            }
            this.transitionTime += dt
            if (this.transitionTime >= gameSettings.TRANSITION_TIME) {
                initialiseLevel()
                gameState.state = State.Active
                this.transitionTime = 0
            }
        }
        if (gameState.state === State.PlayerDeathTransition) {
            if (inputManager.shootingSystem.shooting) {
                sceneManager.startSfx.playOnce()
                gameState.state = State.LevelTransition
                gameState.instructions.value = "Click to shoot."
            }
        }
    }
}

engine.addSystem(new GameManagerService())

const sceneManager = gameState.sceneManager
