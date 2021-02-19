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

function random(chance: number) {
    return Math.floor(Math.random() * chance);
}

const gameState = new GameState()
const inputManager = new InputManager(gameState)

const centipedeGroup = engine.getComponentGroup(CentipedeComponent)
const mushroomGroup = engine.getComponentGroup(MushroomComponent)

function initialiseLevel() {
    engine.removeEntity(gameState.hideAvatarsEntity)
    centipedeSpawner.spawn(gameState, 8, 2, gameSettings.MINIMUM_LENGTH + gameState.level, Direction.Down, Direction.Right)

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
    transitionTime: number = 0

    constructor() {
        this.spider = new Spider(gameState)
    }

    update(dt: number): void {
        if (gameState.state === State.NewGame) {

        }
        if (gameState.state === State.Active) {
            if (!this.spider.alive && random(gameSettings.SPIDER_CHANCE) === 0) {
                this.spider.spiderSfx.playing = true
                const x = Camera.instance.position.x < 8 ? gameSettings.RIGHT_BOUNDARY - 1 : 0;
                const z = 8 + random(5);
                this.spider.x = x
                this.spider.z = z
                this.spider.dx = x === 0 ? 0.25 : -0.25
                this.spider.dz = -0.25
                this.spider.maxZ = gameSettings.DOWN_BOUNDARY - 1
                this.spider.minZ = (gameSettings.DOWN_BOUNDARY - 5) + 1
                this.spider.startDx = this.spider.dx
                this.spider.prevX = x - 4 * this.spider.dx
                this.spider.prevZ = z - 4 * this.spider.dz
                /*
                prevX: -1,
                dx: x === 0 ? 0.25 : -0.25,
                maxY: globalSettings.gameBoardHeight -1,
                minY: (globalSettings.gameBoardHeight - globalSettings.playerAreaHeight) + 1,
                dy: -0.25prevX: -1,
                dx: x === 0 ? 0.25 : -0.25,
                maxY: globalSettings.gameBoardHeight -1,
                minY: (globalSettings.gameBoardHeight - globalSettings.playerAreaHeight) + 1,
                dy: -0.25
                 */
                this.spider.getComponent(Transform).position.x = x
                this.spider.getComponent(Transform).position.z = z
                engine.addEntity(this.spider)
                //create(x, y);
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
                    mushroom.mushroomSmall.getComponent(GLTFShape).visible = false
                    mushroom.mushroomLarge.getComponent(GLTFShape).visible = true
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
            }
        }
    }
}

engine.addSystem(new GameManagerService())

const sceneManager = gameState.sceneManager

