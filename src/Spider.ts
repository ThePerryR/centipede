export class Spider extends Entity {
    x: number = 0
    z: number = 0
    prevX: number = -1
    prevZ: number = -1
    startDx: number = 0
    dx: number = 0
    maxZ: number = 0
    minZ: number = 0
    dz: number = 0

    constructor() {
        super();
        this.addComponent(new Transform({
            position: new Vector3(0, 1, 0),
            scale: new Vector3(1, 0.5, 0.5)
        }))
        this.addComponent(new BoxShape())
    }
}
