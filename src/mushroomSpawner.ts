import gameSettings from "./constants/gameSettings";
import {Mushroom} from "./Mushroom";

export const mushroomSpawner = {
    MAX_POOL_SIZE: gameSettings.MAX_MUSHROOMS,
    pool: [] as Entity[],

    spawn(x: number, z: number) {
        const realX = Math.round(x * 40) / 40
        const realZ = Math.round(z * 40) / 40
        const potentialPosition = new Vector3(realX, 0.15, realZ)
        for (const entity of mushroomSpawner.pool) {
            if (entity.alive) {
                const position = entity.getComponent(Transform).position
                if (Vector3.Distance(position, potentialPosition) < 0.39) {
                    return
                }
            }
        }
        const ent = mushroomSpawner.getEntityFromPool(realX, realZ)

        if (!ent) return
    },

    getEntityFromPool(x: number, z: number): Entity | null {
        for (const entity of mushroomSpawner.pool) {
            if (!entity.alive) {
                const mushroom = entity as Mushroom
                mushroom.getComponent(Transform).position.x = x
                mushroom.getComponent(Transform).position.z = z
                mushroom.poisoned = false
                engine.addEntity(mushroom)

                return entity
            }
        }
        if (mushroomSpawner.pool.length < mushroomSpawner.MAX_POOL_SIZE) {
            const instance = new Mushroom(x, z)
            mushroomSpawner.pool.push(instance)
            return instance
        }
        return null
    }
}
