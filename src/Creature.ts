@Component("creature")
export class Creature {
    rotationSpeed: number
    movementSpeed: number
    health: number

    constructor(rotationSpeed = 1, movementSpeed = 1, health = 1) {
        this.rotationSpeed = rotationSpeed
        this.movementSpeed = movementSpeed
        this.health = health
    }
}