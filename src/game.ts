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

class CentipedeService implements ISystem {
    update(dt: number): void {
        if (gameState.state === State.Active) {
            const aliveCentipedes = centipedeGroup.entities.filter(entity => entity.alive)
            if (!aliveCentipedes.length) {
                gameState.startLevelTransition()
                return
            }
            for (const centipede of centipedeGroup.entities) {
                const c = centipede as Centipede
                c.update(dt)
            }
        }
        if (gameState.state === State.LevelTransition) {
            for (const entity of mushroomGroup.entities) {
                entity.getComponent(MushroomComponent).health = 4
            }

            initialiseLevel()
            gameState.state = State.Active
        }
    }
}

initialiseLevel()

engine.addSystem(new CentipedeService())

const sceneManager = new SceneManager()

