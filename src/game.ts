import {SceneManager} from './SceneManager'
import {CentipedeComponent} from './CentipedeComponent'
import {Centipede} from './Centipede'
import {InputManager} from "./InputManager";

enum Direction {
    Up = 0,
    Down,
    Left,
    Right
}


let currentLevel = 1
let MINIMUM_LENGTH = 8
const gameState = new GameState()
new InputManager(gameState)

const centipedeGroup = engine.getComponentGroup(CentipedeComponent)

class CentipedeService implements ISystem {
    update(dt: number): void {
        for (const centipede of centipedeGroup.entities) {
            const c = centipede as Centipede
            c.update(dt)
        }

    }
}

engine.addSystem(new CentipedeService())

new Centipede(8, 2, MINIMUM_LENGTH + currentLevel, Direction.Down, Direction.Right)

const sceneManager = new SceneManager()

