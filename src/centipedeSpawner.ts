import gameSettings from "./constants/gameSettings";
import {Centipede} from "./Centipede";
import Direction from "./constants/Direction";
import {GameState} from "./GameState";

export const centipedeSpawner = {
    MAX_POOL_SIZE: gameSettings.MAX_CENTIPEDES,
    pool: [] as Entity[],

    spawn(gameState: GameState, x: number, z: number, bodyLength: number, previousDirection: Direction, currentDirection: Direction) : Centipede | null {
        return centipedeSpawner.getEntityFromPool(gameState, x, z, bodyLength, previousDirection, currentDirection)
    },

    getEntityFromPool(gameState: GameState, x: number, z: number, bodyLength: number, previousDirection: Direction, currentDirection: Direction): Centipede | null {
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
                centipede.fallingDown = false
                centipede._setPositionFromDirection(1)
                centipede.getComponent(Transform).position.x = centipede.prevX
                centipede.getComponent(Transform).position.z = centipede.prevZ
                centipede.initBodies()
                return centipede
            }
        }
        if (centipedeSpawner.pool.length < centipedeSpawner.MAX_POOL_SIZE) {
            const instance = new Centipede(gameState, x, z, bodyLength, previousDirection, currentDirection)
            centipedeSpawner.pool.push(instance)
            return instance
        }
        return null
    }
}
