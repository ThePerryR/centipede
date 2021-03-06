import {Centipede} from "./Centipede";
import {BodyComponent} from "./BodyComponent"
import gameSettings from "./constants/gameSettings";

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
            position: new Vector3(prevX, gameSettings.SCALE, prevZ),
            scale: new Vector3(gameSettings.SCALE, gameSettings.SCALE, gameSettings.SCALE)
        }))
        this.addComponent(new SphereShape())

        this.prevX = prevX
        this.prevZ = prevZ
        this.x = x
        this.z = z
        this._setSpeed()

        const material = new Material()
        material.albedoColor = new Color3(0.208, 0.407, 0.216)
        material.metallic = 0.1
        material.roughness = 0.7
        this.addComponent(material)
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
        this.getComponent(Transform).position = Vector3.Lerp(new Vector3(this.prevX, gameSettings.SCALE, this.prevZ), new Vector3(this.x, gameSettings.SCALE, this.z), this.centipede.t * (1 / gameSettings.MOVE_TIME))
        this._setSpeed()
    }

    draw() {
        this.getComponent(Transform).position = Vector3.Lerp(new Vector3(this.prevX, gameSettings.SCALE, this.prevZ), new Vector3(this.x, gameSettings.SCALE, this.z), this.centipede.t * (1 / gameSettings.MOVE_TIME))
    }
}
