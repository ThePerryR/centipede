import {SpawnManager} from "./SpawnManager";

let spiderTimer: number = 5
let mushroomTimer: number = 5

function getRandomPosition() {
    return Math.floor(Math.random() * (15 - 1 + 1)) + 1;
}

function getMushroomSpawn(): { x: number, z: number } {
    const spawnX = getRandomPosition()
    const spawnZ = getRandomPosition()
    if (spawnX < 7 && spawnZ < 7) {
        return getMushroomSpawn()
    }
    return {x: spawnX, z: spawnZ}
}

export class SpawnSystem {
    spawnManager: SpawnManager

    constructor(spawnManager: SpawnManager) {
        this.spawnManager = spawnManager
        for (let i = 0; i < 15; i++) {
            const {x, z} = getMushroomSpawn()

            this.spawnManager.mushroomSpawner.spawn(x, z)
        }
    }

    update(dt: number) {
        if (spiderTimer > 0) {
            spiderTimer -= dt
        } else {
            spiderTimer = 5
            this.spawnManager.spiderSpawner.spawn(this.spawnManager.spawnPos.add(new Vector3(0, 0, 0)))
        }
        if (mushroomTimer > 0) {
            mushroomTimer -= dt
        } else {
            mushroomTimer = 5
            const {x, z} = getMushroomSpawn()
            this.spawnManager.mushroomSpawner.spawn(x, z)
        }
    }
}