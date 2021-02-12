import {Spider} from "./Spider";


class SpiderSpawner {
    MAX_POOL_SIZE = 20
    pool = [] as Entity[]
    constructor() {
    }
    spawn(spawnPosition: Vector3) {
        const spider = this.getSpiderFromPool()

        if (!spider) return
        spider.getComponent(Transform).position = spawnPosition
        engine.addEntity(spider)
    }

    getSpiderFromPool(): Entity | null {
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].alive) {
                return this.pool[i]
            }
        }
        if (this.pool.length < this.MAX_POOL_SIZE) {
            const instance = new Spider(new Vector3(0, 0, 0))
            this.pool.push(instance)
            return instance
        }
        return null
    }
}

export class SpawnManager {
    spiderSpawner:SpiderSpawner
    spawnPos: Vector3

    constructor(spawnPos: Vector3) {
        this.spiderSpawner = new SpiderSpawner()
        this.spawnPos = spawnPos
    }
}
