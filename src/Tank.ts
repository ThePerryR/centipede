export class Tank extends Entity {
    constructor() {
        super()
        engine.addEntity(this)


        const transform = new Transform({
            position: new Vector3(0, 0, 0),
            rotation: new Quaternion(0, 0, 0, 1),
            scale: new Vector3(1, 1, 2)
        })

        this.addComponent(transform)
        this.addComponent(new BoxShape())
    }
}