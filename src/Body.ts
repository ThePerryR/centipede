import {Centipede} from "./Centipede";
import {BodyComponent} from "./BodyComponent"

const SCALE = 0.2

export class Body extends Entity {
    prevX: number
    prevZ: number
    x: number
    z: number
    dx: number = 0
    dz: number = 0
    centipede: Centipede

    constructor(prevX: number, prevZ: number, x: number, z: number, centipede: Centipede) {
        super();
        engine.addEntity(this)
        this.centipede = centipede
        this.addComponent(new BodyComponent())

        this.addComponent(new Transform({
            position: new Vector3(prevX, SCALE, prevZ),
            scale: new Vector3(SCALE, SCALE, SCALE)
        }))
        this.addComponent(new SphereShape())

        this.prevX = prevX
        this.prevZ = prevZ
        this.x = x
        this.z = z
        this._setSpeed()
    }

    _setSpeed() {
        this.dx = (this.x - this.prevX);
        this.dz = (this.z - this.prevZ);
    }

    update(x: number, z: number, dt: number) {
        this.prevX = this.x;
        this.prevZ = this.z;
        this.x = x;
        this.z = z
        this.getComponent(Transform).position = Vector3.Lerp(new Vector3(this.prevX, SCALE, this.prevZ), new Vector3(this.x, SCALE, this.z), this.centipede.t * 2)
        this._setSpeed()
    }
    draw() {
        this.getComponent(Transform).position = Vector3.Lerp(new Vector3(this.prevX, SCALE, this.prevZ), new Vector3(this.x, SCALE, this.z), this.centipede.t * 2)
    }
}
