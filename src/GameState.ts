import {CornerLabel, SmallIcon} from '@dcl/ui-scene-utils'
import {getUserPublicKey, getUserData} from "@decentraland/Identity";

import {Mushroom} from './Mushroom'
import State from "./constants/State";
import gameSettings from "./constants/gameSettings";
import {Centipede} from "./Centipede";
import {CentipedeComponent} from "./CentipedeComponent";
import {SpiderComponent} from "./SpiderComponent";
import {Spider} from "./Spider";
import {SceneManager} from "./SceneManager";
import {FleaComponent} from "./FleaComponent";
import {Flea} from "./Flea";
import {mushroomSpawner} from "./mushroomSpawner";
import {SnailComponent} from "./SnailComponent";
import {Snail} from "./Snail";
import {MushroomComponent} from "./MushroomComponent";

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
const fleaGroup = engine.getComponentGroup(FleaComponent)
const snailGroup = engine.getComponentGroup(SnailComponent)
const mushroomGroup = engine.getComponentGroup(MushroomComponent)

export class GameState {
    score = 0
    level = 1
    lives = 3
    state = State.NewGame
    sceneManager: SceneManager

    counter: UIText
    hearts: SmallIcon[]
    hideAvatarsEntity: Entity
    deathSfx: AudioSource

    constructor() {
        this.sceneManager = new SceneManager(this)
        this.fetchScores()
        this.fetchHighscore()
        this.generateMushroom()
        this.generateMushroom()
        // Create screenspace component
        const canvas = new UICanvas()
        this.counter = new UIText(canvas)
        this.counter.hAlign = 'right'
        this.counter.vAlign = 'top'
        this.counter.positionX = -32
        this.counter.hTextAlign = 'right'
        this.counter.color = Color4.White()
        this.counter.fontSize = 32
        this.counter.outlineColor = Color4.Black()
        this.counter.outlineWidth = 0.2
        this.counter.opacity = 0.8
        this.counter.value = '0'
        // this.counter = new CornerLabel(convertScore(this.score), 0, 6, Color4.Blue(), 40, false)
        //this.counter.hide()
        this.hearts = [
            new SmallIcon('images/heart.png', -32, 0),
            new SmallIcon('images/heart.png', -64, 0),
            new SmallIcon('images/heart.png', -96, 0),
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

    fetchScores () {
        executeTask(async () => {
            try {
                let response = await fetch('https://centipede-leaderboards.herokuapp.com/highscores')
                let json = await response.json()
                if (json && Array.isArray(json)) {
                    this.sceneManager.displayHighscores(json)
                }
            } catch {
                log("failed to reach URL")
            }
        })
    }

    fetchHighscore () {
        executeTask(async () => {
            try {
                const userData = await getUserData()
                if (userData) {
                    log('hitting', `https://centipede-leaderboards.herokuapp.com/highscores/${userData.userId}`)
                    let response = await fetch(`https://centipede-leaderboards.herokuapp.com/highscores/${userData.userId}`)
                    let json = await response.json()
                    log('personal!!!!', json)
                    if (json && json.fields) {
                        this.sceneManager.displayPersonalHighscore(json.fields.score)
                    }
                }
            } catch {
                log("failed to reach URL")
            }
        })
    }

    incrementScore(score: number) {
        this.score += score
        this.counter.value = this.score.toString()
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
        mushroomSpawner.spawn(x, z)
    }

    poisonArea(x: number, z: number) {
        const targetPosition = new Vector3(x, 0, z)
        for (const entity of mushroomSpawner.pool) {
            const mushroom = entity as Mushroom
            if (mushroom.alive && !mushroom.poisoned && Vector3.Distance(targetPosition, mushroom.getComponent(Transform).position) < gameSettings.SNAIL_POISON_DISTANCE) {
                mushroom.poison()
            }
        }
    }

    startGame() {
        this.score = 0
        this.level = 1
        this.lives = 3
        this.counter.value = this.score.toString()
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
            this.sceneManager.disableWalls()
            engine.addEntity(this.sceneManager.wand)
            engine.addEntity(this.sceneManager.arrow)
            const mushrooms = [...mushroomGroup.entities]
            for (const entity of mushrooms) {
                const mushroom = entity as Mushroom
                if (mushroom.poisoned) {
                    mushroom.poisonMushroomSmall.getComponent(GLTFShape).visible = false
                    mushroom.poisonMushroomLarge.getComponent(GLTFShape).visible = false
                }
                engine.removeEntity(entity)
            }
            this.generateMushroom()
            this.state = State.GameOverTransition


            executeTask(async () => {
                try {
                    const publicKey = await getUserPublicKey()
                    const userData = await getUserData()
                    if (this.score) {
                        const response = await fetch('https://centipede-leaderboards.herokuapp.com/score', {
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json'
                            },
                            method: "POST",
                            body: JSON.stringify({publicKey, userData, score: this.score}),
                        })
                        const json = await response.json()
                        if (json.newHighscore) {
                            this.sceneManager.displayPersonalHighscore(this.score)
                        }
                        this.fetchScores()
                    }
                } catch {
                    log("failed to reach URL")
                }
            })
        } else {
            this.state = State.PlayerDeathTransition
        }
    }

    reset() {
        const spiders = [...spiderGroup.entities]
        for (const entity of spiders) {
            const spider = entity as Spider
            spider.spiderSfx.playing = false
            if (spider.alive) {
                engine.removeEntity(spider)
            }
        }
        const fleas = [...fleaGroup.entities]
        for (const entity of fleas) {
            const flea = entity as Flea
            flea.fleaSfx.playing = false
            if (flea.alive) {
                engine.removeEntity(flea)
            }
        }
        const snails = [...snailGroup.entities]
        for (const entity of snails) {
            const snail = entity as Snail
            snail.snailSfx.playing = false
            if (snail.alive) {
                engine.removeEntity(snail)
            }
        }

        const entities = [...centipedeGroup.entities]
        for (const entity of entities) {
            const centipede = entity as Centipede
            for (const body of centipede.body) {
                if (body.alive) {
                    engine.removeEntity(body)
                }
            }
            if (centipede.alive) {
                engine.removeEntity(centipede)
            }
        }
    }
}
