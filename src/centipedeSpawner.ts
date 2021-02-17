import gameSettings from "./constants/gameSettings";
import {Centipede} from "./Centipede";
import Direction from "./constants/Direction";

export const centipedeSpawner = {
    MAX_POOL_SIZE: gameSettings.MAX_CENTIPEDES,
    pool: [] as Entity[],

    spawn(x: number, z: number, bodyLength: number, previousDirection: Direction, currentDirection: Direction) {
        const ent = centipedeSpawner.getEntityFromPool(x, z, bodyLength, previousDirection, currentDirection)

        if (!ent) return
    },

    getEntityFromPool(x: number, z: number, bodyLength: number, previousDirection: Direction, currentDirection: Direction): Entity | null {
        for (const entity of centipedeSpawner.pool) {
            if (!entity.alive) {
                const centipede = entity as Centipede
                engine.addEntity(centipede)
                centipede.x = x
                centipede.z = z
                centipede.prevX = x
                centipede.prevZ = z
                centipede.bodyLength = bodyLength
                centipede.previousDirection = previousDirection
                centipede.currentDirection = currentDirection
                centipede._setPositionFromDirection(1)
                centipede.getComponent(Transform).position.x = centipede.prevX
                centipede.getComponent(Transform).position.z = centipede.prevZ
                centipede.initBodies()
                return entity
            }
        }
        if (centipedeSpawner.pool.length < centipedeSpawner.MAX_POOL_SIZE) {
            const instance = new Centipede(x, z, bodyLength, previousDirection, currentDirection)
            centipedeSpawner.pool.push(instance)
            return instance
        }
        return null
    }
}