import {Body} from "./Body";
import {CentipedeComponent} from "./CentipedeComponent";
import {MushroomComponent} from "./MushroomComponent";
import {Mushroom} from "./Mushroom";
import utils from "../node_modules/decentraland-ecs-utils/index";
import gameSettings from "./constants/gameSettings";
import Direction from "./constants/Direction";

const mushroomGroup = engine.getComponentGroup(MushroomComponent)

export class Centipede extends Entity {
    x: number
    z: number
    prevX: number
    prevZ: number
    bodyLength: number
    previousDirection: Direction
    currentDirection: Direction
    body: Body[] = []
    dx: number = 0
    dz: number = 0
    t: number = 0
    collidingWith: Mushroom | null = null

    constructor(x: number, z: number, bodyLength: number, previousDirection: Direction, currentDirection: Direction) {
        super();

        engine.addEntity(this)
        this.addComponent(new CentipedeComponent())
        this.x = x // width / 2
        this.z = z // 0
        this.prevX = x
        this.prevZ = z
        this.bodyLength = bodyLength
        this.previousDirection = previousDirection
        this.currentDirection = currentDirection


        this._setPositionFromDirection(1)

        this.addComponent(new Transform({
            position: new Vector3(this.prevX, gameSettings.SCALE, this.prevZ),
            scale: new Vector3(gameSettings.SCALE, gameSettings.SCALE, gameSettings.SCALE)
        }))

        this.addComponent(new BoxShape())

        this.initBodies()

        const triggerShape = new utils.TriggerBoxShape(new Vector3(gameSettings.SCALE, gameSettings.SCALE, gameSettings.SCALE), Vector3.Zero())
        this.addComponent(new utils.TriggerComponent(
            triggerShape,
            {
                layer: 2,
                enableDebug: true
            }
        ))
    }

    initBodies () {
        let xBody = this.x
        let zBody = this.z

        const zDiff = this.z - this.prevZ
        const xDiff = this.x - this.prevX

        this.body = []
        for (let i = 0; i < this.bodyLength; i++) {
            xBody -= xDiff;
            zBody -= zDiff;

            const body = new Body(xBody + xDiff, this.z, xBody, zBody, this)
            this.body.push(body)
        }
    }

    _setPositionFromDirection(dt: number) {
        this.prevX = this.x;
        this.prevZ = this.z

        switch (this.currentDirection) {
            case Direction.Down:
                this.z += gameSettings.SCALE * 2;
                break;
            case Direction.Up:
                this.z -= gameSettings.SCALE * 2;
                break;
            case Direction.Right:
                this.x += gameSettings.SCALE * 2;
                break;
            case Direction.Left:
                this.x -= gameSettings.SCALE * 2;
                break;
        }
    }

    _setSpeed() {
        this.dx = (this.x - this.prevX)
        this.dz = (this.z - this.prevZ)
    }

    _setVerticalDirection() {
        if (this.previousDirection === Direction.Down && this.z >= gameSettings.DOWN_BOUNDARY) {
            this.currentDirection = Direction.Up;
        } else if (this.previousDirection === Direction.Up && this.z <= gameSettings.UP_BOUNDARY) {
            this.currentDirection = Direction.Down;
        } else {
            this.currentDirection = this.previousDirection;
        }
    }

    update(dt: number) {
        // if falling down or collision with poison mushroom
        this.t += dt
        if (this.t >= gameSettings.MOVE_TIME) {
            this.t = 0

            // todo !this.fallingStraightDown
            if (true) {
                if (this.currentDirection === Direction.Right) {
                    if (this.x >= gameSettings.RIGHT_BOUNDARY || this.collidingWith) {
                        this._setVerticalDirection()
                        this.previousDirection = Direction.Right
                    }
                } else if (this.currentDirection === Direction.Left) {
                    if (this.x <= gameSettings.LEFT_BOUNDARY || this.collidingWith) {
                        this._setVerticalDirection();
                        this.previousDirection = Direction.Left;
                    }
                } else {
                    let nowDirection = this.currentDirection
                    if (this.previousDirection === Direction.Right) {
                        this.currentDirection = Direction.Left;
                    } else {
                        this.currentDirection = Direction.Right;
                    }
                    this.previousDirection = nowDirection;

                    if (this.currentDirection === Direction.Right && this.x >= gameSettings.RIGHT_BOUNDARY) {
                        this.currentDirection = Direction.Left;
                    } else if (this.currentDirection === Direction.Left && this.x <= gameSettings.LEFT_BOUNDARY) {
                        this.currentDirection = Direction.Right;
                    }
                }
            }
            this._setPositionFromDirection(dt)

            let prevBodyX = this.prevX;
            let prevBodyZ = this.prevZ;
            for (const centipedeBody of this.body) {
                centipedeBody.update(prevBodyX, prevBodyZ, dt)

                prevBodyX = centipedeBody.prevX;
                prevBodyZ = centipedeBody.prevZ;
            }

            this._setSpeed();
        }

        this.draw()

        for (const centipedeBody of this.body) {
            centipedeBody.draw()
        }
    }

    draw() {
        this.getComponent(Transform).position = Vector3.Lerp(new Vector3(this.prevX, gameSettings.SCALE, this.prevZ), new Vector3(this.x, gameSettings.SCALE, this.z), this.t * (1 / gameSettings.MOVE_TIME))
    }
}
