import { CornerLabel, MediumIcon } from '@dcl/ui-scene-utils'
import millify from '../node_modules/millify/dist/millify'

import {Mushroom} from './Mushroom'
import State from "./constants/State";
import gameSettings from "./constants/gameSettings";

function random(chance: number) {
    return Math.floor(Math.random() * chance);
}

function convertScore (score:number) {
    if (score > 1000) {
        return `${(score/1000).toFixed(1)}k`
    }
    return score.toString()
}

export class GameState {
    score = 0
    level = 1
    lives = 3
    state = State.NewGame

    counter: CornerLabel
    hearts: MediumIcon[]
    hideAvatarsEntity: Entity

    constructor() {
        this.generateMushroom()
        this.counter = new CornerLabel(convertScore(this.score), 0, 6, Color4.Blue(), 40, false)
        //this.counter.hide()
        this.hearts = [
            new MediumIcon('images/heart.png', -90, 0),
            new MediumIcon('images/heart.png', -162, 0),
            new MediumIcon('images/heart.png', -234, 0),
        ]

        const hideAvatarsEntity = new Entity()
        hideAvatarsEntity.addComponent(new AvatarModifierArea({
            area: { box: new Vector3(16, 4, 16) },
            modifiers: [AvatarModifiers.HIDE_AVATARS]
        }))
        hideAvatarsEntity.addComponent(new Transform({
            position: new Vector3(8, 2, 8)
        }))
        this.hideAvatarsEntity = hideAvatarsEntity
    }


    incrementScore(score: number) {
        this.score += score
        this.counter.set(convertScore(this.score))
    }

    generateMushroom() {
        for (let h = 2; h < 14; h += gameSettings.SCALE * 2) {
            for (let w = 1; w < 15.4; w += gameSettings.SCALE * 2) {
                if (!random(h < 11 ? gameSettings.MUSHROOM_CHANCE_NON_PLAYER : gameSettings.MUSHROOM_CHANCE_PLAYER)) {
                    this.spawnMushroom(w, h)
                }
            }
        }
    }
    spawnMushroom(x: number, z: number) {
        new Mushroom(x, z)
    }

    startGame () {
        this.state = State.LevelTransition
        this.counter.show()
    }

    startLevelTransition() {
        this.state = State.LevelTransition
        this.level++
    }

    playerHit () {
        if (this.lives > 0) {
            this.lives--
        }

        if (this.lives === 0) {
            this.state = State.GameOverTransition
        } else {
            // hide the player
            engine.addEntity(this.hideAvatarsEntity)
            // play the death sound
            this.state = State.PlayerDeathTransition
        }
    }
}
