import utils from "../node_modules/decentraland-ecs-utils/index";
import {canvas, OkPrompt} from '@dcl/ui-scene-utils'

import {GameState} from "./GameState";
import State from "./constants/State";

function random(chance: number) {
    return Math.floor(Math.random() * chance);
}

class WandSystem implements ISystem {
    wand: Entity

    constructor(wand: Entity) {
        this.wand = wand
    }

    update(dt: number) {
        if (this.wand.alive) {
            this.wand.getComponent(Transform).rotate(Vector3.Left(), 20 * dt)
        }
    }
}

export class SceneManager {
    wand: Entity
    gameState: GameState
    startGamePrompt: OkPrompt
    startSfx: AudioSource
    walls: Entity[]
    highscoreList: Entity
    personBest: Entity
    arrow: Entity

    constructor(gameState: GameState) {
        this.gameState = gameState
        this._initGround()
        this._initFence()
        this.startSfx = this._initStump()
        this.wand = this._initWand()
        engine.addSystem(new WandSystem(this.wand))
        this.walls = this._initWalls()

        const siren = new Entity()
        siren.addComponent(new Transform({
            position: new Vector3(8, 2, 13.44),
            scale: new Vector3(4, 4, 4)
        }))
        const animator = new Animator()
        const clip = new AnimationState('ArmatureAction', {looping: true})
        animator.addClip(clip)
        siren.addComponent(animator)
        siren.addComponent(new GLTFShape('a491051c-8092-4245-ae85-d274e90d8443/models/Arrow.glb'))
        clip.play()
        engine.addEntity(siren)
        this.arrow = siren

        this.startGamePrompt = new OkPrompt(
            'Please help us!\nThe monsters are coming.\nGrab that wand...',
            async () => {
                this.startSfx.playOnce()
                engine.removeEntity(this.wand)
                engine.removeEntity(this.arrow)
                this.enableWalls()
                this.gameState.startGame()
            },
            'Start',
            true
        )
        this.startGamePrompt.hide()

        const smallStoneWall = new Entity('smallStoneWall')
        engine.addEntity(smallStoneWall)
        const transform = new Transform({
            position: new Vector3(15.8, 0, 15.4)
        })
        smallStoneWall.addComponentOrReplace(transform)
        const gltfShape = new GLTFShape("models/FenceStoneTallSmall_01/FenceStoneTallSmall_01.glb")
        gltfShape.withCollisions = true
        gltfShape.isPointerBlocker = true
        gltfShape.visible = true
        smallStoneWall.addComponentOrReplace(gltfShape)

        this.highscoreList = new Entity()
        this.highscoreList.addComponent(new Transform({
            position: new Vector3(15.65, 0.9, 14.92),
            rotation: Quaternion.Euler(0, 90, 0),
            scale: new Vector3(0.55, 0.55, 0.55)
        }))
        const hsTextShape = new TextShape("Loading...")
        hsTextShape.fontSize = 1
        hsTextShape.color = Color3.Black()
        hsTextShape.font = new Font(Fonts.SanFrancisco)
        this.highscoreList.addComponent(hsTextShape)
        engine.addEntity(this.highscoreList)

        this.personBest = new Entity()
        this.personBest.addComponent(new Transform({
            position: new Vector3(15.65, 0.3, 14.92),
            rotation: Quaternion.Euler(0, 90, 0),
            scale: new Vector3(0.8, 0.8, 0.8)
        }))
        const personalTextShape = new TextShape("Personal Best: None")
        personalTextShape.fontSize = 1
        personalTextShape.color = Color3.White()
        personalTextShape.font = new Font(Fonts.SanFrancisco)
        this.personBest.addComponent(personalTextShape)
        engine.addEntity(this.personBest)

        const hsLabel = new Entity()
        hsLabel.addComponent(new Transform({
            position: new Vector3(15.65, 1.5, 14.92),
            rotation: Quaternion.Euler(0, 90, 0),
            scale: new Vector3(1.2, 1.2, 1.2)
        }))
        const hsLabelShape = new TextShape("HIGHSCORES")
        hsLabelShape.fontSize = 1
        hsLabelShape.color = Color3.White()
        hsLabelShape.font = new Font(Fonts.SanFrancisco)
        hsLabel.addComponent(hsLabelShape)
        engine.addEntity(hsLabel)

        this._initGrass()
    }

    _initGrass() {
        for (let z = 1; z < 14; z++) {
            if (random(5) === 0) {
                const grass = new Entity()
                const scale = random(5) + 5
                grass.addComponent(new Transform({
                    position: new Vector3(0.54, 0, z),
                    rotation: Quaternion.Euler(0, random(359), 0),
                    scale: new Vector3(scale * 0.1, scale * 0.1, scale * 0.1)
                }))
                grass.addComponent(new GLTFShape("models/Grass_03/Grass_03.glb"))
                engine.addEntity(grass)
            }
            if (random(5) === 0) {
                const grass = new Entity()
                const scale = random(5) + 5
                grass.addComponent(new Transform({
                    position: new Vector3(15.4, 0, z),
                    rotation: Quaternion.Euler(0, random(359), 0),
                    scale: new Vector3(scale * 0.1, scale * 0.1, scale * 0.1)
                }))
                grass.addComponent(new GLTFShape("models/Grass_03/Grass_03.glb"))
                engine.addEntity(grass)
            }
        }

        const p1 = new Entity()
        p1.addComponent(new Transform({
            position: new Vector3(5, 0, 14),
            rotation: Quaternion.Euler(0, 0, 0),
        }))
        p1.addComponent(new GLTFShape("models/Rock_Patch_01/Rock_Patch_01.glb"))
        engine.addEntity(p1)
        const p2 = new Entity()
        p2.addComponent(new Transform({
            position: new Vector3(2, 0, 13.85),
            rotation: Quaternion.Euler(0, 0, 0),
        }))
        p2.addComponent(new GLTFShape("models/Rock_Patch_03/Rock_Patch_03.glb"))
        engine.addEntity(p2)
        const p3 = new Entity()
        p3.addComponent(new Transform({
            position: new Vector3(12, 0, 14),
            rotation: Quaternion.Euler(0, 0, 0),
        }))
        p3.addComponent(new GLTFShape("models/Rock_Patch_03/Rock_Patch_03.glb"))
        engine.addEntity(p3)
        const p4 = new Entity()
        p4.addComponent(new Transform({
            position: new Vector3(10, 0, 13.4),
            rotation: Quaternion.Euler(0, 0, 0),
        }))
        p4.addComponent(new GLTFShape("models/Rock_Patch_01/Rock_Patch_01.glb"))
        engine.addEntity(p4)
        const p5 = new Entity()
        p5.addComponent(new Transform({
            position: new Vector3(14, 0, 13.4),
            rotation: Quaternion.Euler(0, 24, 0),
        }))
        p5.addComponent(new GLTFShape("models/Rock_Patch_01/Rock_Patch_01.glb"))
        engine.addEntity(p5)
    }

    displayHighscores(highscores: { fields: { displayName: string, score: number } }[]) {
        this.highscoreList.getComponent(TextShape).value = `${highscores.map(({fields}) => `${fields.displayName}: ${fields.score.toLocaleString()}\n`).join('')}`
    }

    displayPersonalHighscore(score: number) {
        this.personBest.getComponent(TextShape).value = `Personal Best: ${score.toLocaleString()}`
    }

    _initWalls(): Entity[] {
        const walls = []
        const fence = new Entity()
        fence.addComponent(new Transform({
            scale: new Vector3(15, 1, 0.2),
            position: new Vector3(8, 2, 15.6)
        }))
        fence.addComponent(new BoxShape())
        fence.getComponent(BoxShape).visible = false
        walls.push(fence)

        const left = new Entity()
        left.addComponent(new Transform({
            scale: new Vector3(0.2, 2, 6),
            position: new Vector3(15.5, 1, 12)
        }))
        left.addComponent(new BoxShape())
        left.getComponent(BoxShape).visible = false
        walls.push(left)
        const right = new Entity()
        right.addComponent(new Transform({
            scale: new Vector3(0.2, 2, 6),
            position: new Vector3(0.4, 1, 12)
        }))
        right.addComponent(new BoxShape())
        right.getComponent(BoxShape).visible = false
        walls.push(right)

        const main = new Entity()
        main.addComponent(new Transform({
            scale: new Vector3(15, 1, 9),
            position: new Vector3(8, 2.2, 5)
        }))
        main.addComponent(new BoxShape())
        main.getComponent(BoxShape).visible = false
        walls.push(main)
        return walls
    }

    enableWalls() {
        for (const wall of this.walls) {
            engine.addEntity(wall)
        }
    }

    disableWalls() {
        for (const wall of this.walls) {
            engine.removeEntity(wall)
        }
    }

    _initWand() {
        const wand = new Entity('wand')
        engine.addEntity(wand)
        wand.addComponent(new Transform({
            position: new Vector3(8, 1, 13.5),
            scale: new Vector3(0.01, 0.2, 0.01),
            rotation: Quaternion.Euler(0, 0, 90)
        }))
        wand.addComponent(new CylinderShape())
        const material = new Material()
        material.albedoColor = new Color3(0.408, 0.259, 0.2)
        material.metallic = 0.2
        material.roughness = 0.6
        wand.addComponent(material)
        const handle = new Entity()
        handle.setParent(wand)
        handle.addComponent(new CylinderShape())
        handle.getComponent(CylinderShape).withCollisions = false
        handle.getComponent(CylinderShape).isPointerBlocker = false
        handle.addComponent(new Transform({
            position: new Vector3(0, 0.8, 0),
            scale: new Vector3(1.24, 0.3, 1.24)
        }))
        handle.addComponent(material)
        return wand
    }

    _initGround() {
        const ground = new Entity('ground')
        engine.addEntity(ground)

        const gltfShape = new GLTFShape("models/FloorBaseGrass_01/FloorBaseGrass_01.glb")
        gltfShape.withCollisions = true
        gltfShape.isPointerBlocker = true
        gltfShape.visible = true

        ground.addComponentOrReplace(gltfShape)
        const transform = new Transform({
            position: new Vector3(8, 0, 8),
            rotation: new Quaternion(0, 0, 0, 1),
            scale: new Vector3(1, 1, 1)
        })
        ground.addComponentOrReplace(transform)
    }

    _initFence() {
        for (let i = 0; i < 6; i++) {
            const fence = new Entity('fence')
            engine.addEntity(fence)

            const gltfShape = new GLTFShape("models/fence.glb")
            fence.addComponent(gltfShape)
            const collider = new Entity()
            collider.setParent(fence)
            collider.addComponent(new Transform({
                scale: new Vector3(0.2, 2, 2.2)
            }))
            collider.addComponent(new BoxShape())
            collider.getComponent(BoxShape).visible = false
            fence.addComponent(new Transform({
                position: new Vector3(1.5 + i * 2.5, 0, 15.6),
                rotation: Quaternion.Euler(0, -90, 0)
            }))
        }
    }

    _initStump() {
        const stump = new Entity('stump')
        engine.addEntity(stump)

        const gltfShape = new GLTFShape("models/stump.glb")
        stump.addComponent(gltfShape)
        stump.addComponent(new Transform({
            position: new Vector3(8, 0, 13.5)
        }))


        const startSoundEntity = new Entity()
        const startSoundClip = new AudioClip("sounds/game-start.wav")
        const startSfx = new AudioSource(startSoundClip)
        startSfx.volume = 1
        startSoundEntity.addComponent(startSfx)
        engine.addEntity(startSoundEntity)
        startSoundEntity.setParent(stump)

        const triggerBox = new utils.TriggerBoxShape(new Vector3(2, 2, 2), new Vector3(0, 1, 0))
        stump.addComponent(new utils.TriggerComponent(triggerBox, {
            onCameraEnter: () => {
                if (this.gameState.state === State.NewGame || this.gameState.state === State.GameOverTransition) {
                    this.startGamePrompt.show()
                }
            },
            onCameraExit: () => {
                this.startGamePrompt.hide()
            },
            enableDebug: false
        }))
        return startSfx
    }
}
