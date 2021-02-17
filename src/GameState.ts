import * as ui from '../node_modules/@dcl/ui-utils/index'

import {Mushroom} from './Mushroom'
import State from "./constants/State";
import gameSettings from "./constants/gameSettings";

function random(chance: number) {
    return Math.floor(Math.random() * chance);
}

export class GameState {
    score = 0
    level = 1
    state = State.Active
    counter: ui.UICounter

    constructor() {
        this.generateMushroom()
        this.counter = new ui.UICounter(this.score)
    }

    incrementScore(score: number) {
        this.score += score
        this.counter.set(this.score)
    }

    generateMushroom() {
        for (let h = 2; h < 14; h += gameSettings.SCALE * 2) {
            for (let w = 1; w < 15.4; w += gameSettings.SCALE * 2) {
                if (!random(h < 8 ? 16 : 50)) {
                    this.spawnMushroom(w, h)
                }
            }
        }
    }

    spawnMushroom(x: number, z: number) {
        new Mushroom(x, z)
    }

    startLevelTransition() {
        log("LVELL TRANSITION")
        this.state = State.LevelTransition
        this.level++
    }
}
