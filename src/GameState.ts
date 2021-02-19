import {CornerLabel, MediumIcon} from '@dcl/ui-scene-utils'
import millify from '../node_modules/millify/dist/millify'

import {Mushroom} from './Mushroom'
import State from "./constants/State";
import gameSettings from "./constants/gameSettings";
import {Centipede} from "./Centipede";
import {CentipedeComponent} from "./CentipedeComponent";
import {SpiderComponent} from "./SpiderComponent";
import {Spider} from "./Spider";
import {SceneManager} from "./SceneManager";

function random(chance: number) {
    return Math.floor(Math.random() * chance);
}

function convertScore(score: number) {
    if (score > 1000) {
        return `${(score / 1000).toFixed(1)}k`
    }
    return score.toString()
}

const centipedeGroup = engine.getComponentGroup(CentipedeComponent)
const spiderGroup = engine.getComponentGroup(SpiderComponent)

export class GameState {
    score = 0
    level = 1
    lives = 3
    state = State.NewGame
    sceneManager: SceneManager

    counter: CornerLabel
    hearts: MediumIcon[]
    hideAvatarsEntity: Entity
    deathSfx: AudioSource

    constructor() {
        this.sceneManager = new SceneManager(this)
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
            area: {box: new Vector3(16, 4, 16)},
            modifiers: [AvatarModifiers.HIDE_AVATARS]
        }))
        hideAvatarsEntity.addComponent(new Transform({
            position: new Vector3(8, 2, 8)
        }))
        this.hideAvatarsEntity = hideAvatarsEntity

        const deathSoundEntity = new Entity()
        const deathSoundClip = new AudioClip("sounds/death.wav")
        this.deathSfx = new AudioSource(deathSoundClip)
        this.deathSfx.volume = 1
        deathSoundEntity.addComponent(this.deathSfx)
        engine.addEntity(deathSoundEntity)
        deathSoundEntity.setParent(Attachable.AVATAR)
        // this.squishSfxEntity = deathSoundEntity
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

    startGame() {
        this.score = 0
        this.level = 1
        this.lives = 3
        this.counter.set(convertScore(this.score))
        for (const heart of this.hearts) {
            heart.show()
        }
        this.state = State.LevelTransition
    }

    startLevelTransition() {
        this.state = State.LevelTransition
        this.level++
    }

    playerHit() {
        if (this.lives > 0) {
            this.lives--
        }
        this.hearts[this.lives].hide()

        // hide the player
        engine.addEntity(this.hideAvatarsEntity)
        // play the death sound
        this.deathSfx.playOnce()
        // destroy centipedes
        this.reset()
        if (this.lives === 0) {
            engine.addEntity(this.sceneManager.wand)
            this.state = State.GameOverTransition
        } else {
            this.state = State.PlayerDeathTransition
        }
    }

    reset() {
        const spiders = [...spiderGroup.entities]
        for (const entity of spiders) {
            const spider = entity as Spider
            spider.spiderSfx.playing = false
            engine.removeEntity(spider)
        }

        const entities = [...centipedeGroup.entities]
        for (const entity of entities) {
            const centipede = entity as Centipede
            for (const body of centipede.body) {
                engine.removeEntity(body)
            }
            engine.removeEntity(centipede)
        }
    }
}
