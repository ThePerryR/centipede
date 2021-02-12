import {SceneManager} from './SceneManager'
import {SpawnManager} from './SpawnManager'
import {InputManager} from './InputManager'
import {CreatureAttack} from "./CreatureAttack";
import {SpawnSystem} from "./SpawnSystem";

engine.addSystem(new CreatureAttack())
const sceneManager = new SceneManager()

engine.addSystem(new SpawnSystem(new SpawnManager(sceneManager.cave.getComponent(Transform).position)))
new InputManager()