import {SpawnManager} from "./SpawnManager";

let timer: number = 5

export class SpawnSystem {
    spawnManager: SpawnManager

    constructor(spawnManager: SpawnManager) {
        this.spawnManager = spawnManager
    }
    update(dt: number) {
        if (timer > 0) {
            timer -= dt
        } else {
            timer = 5
            this.spawnManager.spiderSpawner.spawn(this.spawnManager.spawnPos.add(new Vector3(0, 0, 0)))
        }
    }
}