import {Body} from "./Body";
import {CentipedeComponent} from "./CentipedeComponent";

enum Direction {
    Up = 0,
    Down,
    Left,
    Right
}

const SCALE = 0.2

var upBoundary = 1;
var downBoundary = 15;
var leftBoundary = 1;
var rightBoundary = 15;

export class Centipede extends Entity {
    x: number
    z: number
    prevX: number
    prevZ: number
    bodyLength: number
    previousDirection: Direction
    currentDirection: Direction
    body: Body[]
    dx: number = 0
    dz: number = 0
    t: number = 0

    constructor(x: number, z: number, bodyLength: number, previousDirection: Direction, currentDirection: Direction) {
        super();

        log("STAART")
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
            position: new Vector3(this.prevX, SCALE, this.prevZ),
            scale: new Vector3(SCALE, SCALE, SCALE)
        }))

        this.addComponent(new BoxShape())

        let xBody = this.x
        let zBody = this.z

        const zDiff = this.z - this.prevZ
        const xDiff = this.x - this.prevX

        this.body = []
        for (let i = 0; i < bodyLength; i++) {
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
                this.z += SCALE * 2;
                break;
            case Direction.Up:
                this.z -= SCALE * 2;
                break;
            case Direction.Right:
                this.x += SCALE * 2;
                break;
            case Direction.Left:
                this.x -= SCALE * 2;
                break;
        }
    }

    _setSpeed() {
        this.dx = (this.x - this.prevX)
        this.dz = (this.z - this.prevZ)
    }

    _setVerticalDirection() {
        if (this.previousDirection === Direction.Down && this.z >= downBoundary) {
            this.currentDirection = Direction.Up;
        } else if (this.previousDirection === Direction.Up && this.z <= upBoundary) {
            this.currentDirection = Direction.Down;
        } else {
            this.currentDirection = this.previousDirection;
        }
    }

    update(dt: number) {
        // if falling down or collision with poison mushroom
        this.t += dt
        if (this.t >= 0.5) {
            this.t = 0

            // todo !this.fallingStraightDown
            if (true) {
                if (this.currentDirection === Direction.Right) {
                    if (this.x >= rightBoundary) {
                        this._setVerticalDirection()
                        this.previousDirection = Direction.Right
                    }
                } else if (this.currentDirection === Direction.Left) {
                    if (this.x <= leftBoundary) {
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

                    if (this.currentDirection === Direction.Right && this.x >= rightBoundary) {
                        this.currentDirection = Direction.Left;
                    } else if (this.currentDirection === Direction.Left && this.x <= leftBoundary) {
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
        this.getComponent(Transform).position = Vector3.Lerp(new Vector3(this.prevX, SCALE, this.prevZ), new Vector3(this.x, SCALE, this.z), this.t * 2)
    }
}
