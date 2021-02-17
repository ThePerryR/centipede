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
new InputManager(gameState)

const centipedeGroup = engine.getComponentGroup(CentipedeComponent)
const mushroomGroup = engine.getComponentGroup(MushroomComponent)

function initialiseLevel() {
    centipedeSpawner.spawn(8, 2, gameSettings.MINIMUM_LENGTH + gameState.level, Direction.Down, Direction.Right)

    for (let i = 1; i < gameState.level && i < gameSettings.MAX_CENTIPEDES; i++) {
        centipedeSpawner.spawn(
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
    constructor() {
        this.spider = new Spider()
    }
    update(dt: number): void {
        if (gameState.state === State.Active) {
            if (!this.spider.alive && random(gameSettings.SPIDER_CHANCE) === 0) {
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
            if (this.spider.alive) {
                let changeX = true
                if (this.spider.z >= this.spider.maxZ) {
                    this.spider.dz = -0.25;
                } else if (this.spider.z <= this.spider.minZ) {
                    this.spider.dz = 0.25;
                } else {
                    changeX = false;
                }
                if (changeX) {
                    if (Math.floor(Math.random() * 4) === 0) {
                        this.spider.dx = 0;
                    } else {
                        this.spider.dx = this.spider.startDx;
                    }
                }
                this.spider.prevZ = this.spider.z;
                this.spider.prevX = this.spider.x;

                this.spider.x += (4 * this.spider.dx);
                this.spider.z += (4 * this.spider.dz);
            }
            const aliveCentipedes = centipedeGroup.entities.filter(entity => entity.alive)
            if (!aliveCentipedes.length) {
                gameState.startLevelTransition()
                return
            }
            for (const centipede of aliveCentipedes) {
                const c = centipede as Centipede
                c.update(dt)
            }
        }
        if (gameState.state === State.LevelTransition) {
            for (const entity of mushroomGroup.entities) {
                const mushroom = entity as Mushroom
                mushroom.mushroomSmall.getComponent(GLTFShape).visible = false
                mushroom.mushroomLarge.getComponent(GLTFShape).visible = true
                entity.getComponent(MushroomComponent).health = 2
            }

            initialiseLevel()
            gameState.state = State.Active
        }
    }
}

initialiseLevel()

engine.addSystem(new GameManagerService())

const sceneManager = new SceneManager()

