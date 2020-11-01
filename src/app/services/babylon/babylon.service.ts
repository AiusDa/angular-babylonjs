import { ElementRef, Injectable, NgZone } from '@angular/core';
import {
  Engine,
  FreeCamera,
  Scene,
  Mesh,
  Color3,
  Color4,
  Vector3,
  HemisphericLight,
  StandardMaterial,
  DynamicTexture,
  SceneLoader,
  AbstractMesh,
  IParticleSystem,
  Skeleton,
  AnimationGroup,
  SceneOptions,
  MeshBuilder,
  VirtualJoysticksCamera,
  EngineOptions,
} from 'babylonjs';
import 'babylonjs-materials';

import { WindowService } from '../window/window.service';

@Injectable({ providedIn: 'root' })
export class BabylonService {
  public constructor(
    private ngZone: NgZone,
    private windowRef: WindowService
  ) {}

  public createEngine(
    canvas: HTMLCanvasElement | WebGLRenderingContext,
    antialias?: boolean,
    options?: EngineOptions,
    adaptToDeviceRatio?: boolean
  ): Engine {
    return new Engine(canvas, antialias, options, adaptToDeviceRatio);
  }

  public createScene(engine: Engine, options?: SceneOptions): Scene {
    // The first step is to get the reference of the canvas element from our HTML document

    // create a basic BJS Scene object
    const scene = new Scene(engine, options);
    scene.collisionsEnabled = true;
    scene.clearColor = new Color4(0, 0, 0, 0);

    // generates the world x-y-z axis for better understanding
    this.showWorldAxis(8, scene);

    return scene;
  }

  public animate(scene: Scene): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    const engine = scene.getEngine();

    this.ngZone.runOutsideAngular(() => {
      const rendererLoopCallback = () => {
        scene.render();
      };

      if (this.windowRef.document.readyState !== 'loading') {
        engine.runRenderLoop(rendererLoopCallback);
      } else {
        this.windowRef.window.addEventListener('DOMContentLoaded', () => {
          engine.runRenderLoop(rendererLoopCallback);
        });
      }

      this.windowRef.window.addEventListener('resize', () => {
        engine.resize();
      });
    });
  }

  /**
   * creates the world axes
   *
   * Source: https://doc.babylonjs.com/snippets/world_axes
   *
   * @param size number
   */
  public showWorldAxis(size: number, scene: Scene): void {
    const makeTextPlane = (text: string, color: string, textSize: number) => {
      const dynamicTexture = new DynamicTexture(
        'DynamicTexture',
        50,
        scene,
        true
      );
      dynamicTexture.hasAlpha = true;
      dynamicTexture.drawText(
        text,
        5,
        40,
        'bold 36px Arial',
        color,
        'transparent',
        true
      );
      const plane = Mesh.CreatePlane('TextPlane', textSize, scene, true);
      const material = new StandardMaterial('TextPlaneMaterial', scene);
      material.backFaceCulling = false;
      material.specularColor = new BABYLON.Color3(0, 0, 0);
      material.diffuseTexture = dynamicTexture;
      plane.material = material;

      return plane;
    };

    const axisX = Mesh.CreateLines(
      'axisX',
      [
        Vector3.Zero(),
        new Vector3(size, 0, 0),
        new Vector3(size * 0.95, 0.05 * size, 0),
        new Vector3(size, 0, 0),
        new Vector3(size * 0.95, -0.05 * size, 0),
      ],
      scene
    );

    axisX.color = new BABYLON.Color3(1, 0, 0);
    const xChar = makeTextPlane('X', 'red', size / 10);
    xChar.position = new Vector3(0.9 * size, -0.05 * size, 0);

    const axisY = Mesh.CreateLines(
      'axisY',
      [
        Vector3.Zero(),
        new Vector3(0, size, 0),
        new Vector3(-0.05 * size, size * 0.95, 0),
        new Vector3(0, size, 0),
        new Vector3(0.05 * size, size * 0.95, 0),
      ],
      scene
    );

    axisY.color = new Color3(0, 1, 0);
    const yChar = makeTextPlane('Y', 'green', size / 10);
    yChar.position = new Vector3(0, 0.9 * size, -0.05 * size);

    const axisZ = Mesh.CreateLines(
      'axisZ',
      [
        Vector3.Zero(),
        new Vector3(0, 0, size),
        new Vector3(0, -0.05 * size, size * 0.95),
        new Vector3(0, 0, size),
        new Vector3(0, 0.05 * size, size * 0.95),
      ],
      scene
    );

    axisZ.color = new Color3(0, 0, 1);
    const zChar = makeTextPlane('Z', 'blue', size / 10);
    zChar.position = new Vector3(0, 0.05 * size, 0.9 * size);
  }

  public createFreeCamera(
    name: string,
    position: Vector3,
    scene: Scene,
    options?: {
      setActiveOnSceneIfNoneActive?: boolean;
      setTarget?: Vector3;
      attachControl?: {
        element: HTMLElement;
        noPreventDefault?: boolean;
      };
      ellipsoid?: Vector3;
      checkCollisions?: boolean;
      applyGravity?: boolean;
      speed?: number;
    }
  ): FreeCamera {
    const camera = new FreeCamera(
      name,
      position,
      scene,
      options?.setActiveOnSceneIfNoneActive
    );
    // target the camera to scene origin
    camera.setTarget(options?.setTarget);

    // attach the camera to the canvas
    if (options?.attachControl?.element) {
      const { attachControl } = options;

      camera.attachControl(
        attachControl.element,
        attachControl.noPreventDefault || false
      );
    }

    // TODO: improve this
    camera.ellipsoid = options.ellipsoid;
    camera.checkCollisions = options.checkCollisions;
    camera.applyGravity = options.applyGravity;
    camera.speed = options.speed;

    return camera;
  }

  public createVirtualJoysticksCamera(
    name: string,
    position: Vector3,
    scene: Scene,
    options?: {
      setTarget?: Vector3;
      attachControl?: {
        element: HTMLElement;
        noPreventDefault?: boolean;
      };
      ellipsoid?: Vector3;
      checkCollisions?: boolean;
      applyGravity?: boolean;
      speed?: number;
    }
  ): VirtualJoysticksCamera {
    const camera = new VirtualJoysticksCamera(name, position, scene);
    // target the camera to scene origin
    if (options?.setTarget) {
      camera.setTarget(options.setTarget);
    }

    // attach the camera to the canvas
    if (options?.attachControl?.element) {
      const { attachControl } = options;

      camera.attachControl(
        attachControl.element,
        attachControl.noPreventDefault || false
      );
    }

    // TODO: improve this
    camera.ellipsoid = options.ellipsoid;
    camera.checkCollisions = options.checkCollisions;
    camera.applyGravity = options.applyGravity;
    camera.speed = options.speed;

    return camera;
  }

  public createHemisphericLight(
    name: string,
    position: Vector3,
    scene: Scene
  ): HemisphericLight {
    const light = new HemisphericLight(name, position, scene);
    return light;
  }

  public createGround(
    name: string,
    scene: Scene,
    options?: {
      native: {
        width?: number;
        height?: number;
        subdivisions?: number;
        subdivisionsX?: number;
        subdivisionsY?: number;
        updatable?: boolean;
      };
      aditional?: {
        checkCollisions: boolean;
      };
    }
  ): Mesh {
    const ground = MeshBuilder.CreateGround(name, options?.native, scene);
    ground.checkCollisions = options?.aditional?.checkCollisions || false;

    return ground;
  }

  public async importMeshAsync(
    rootUrl: string,
    fileName: string,
    scene: Scene
  ): Promise<{
    meshes: AbstractMesh[];
    particleSystems: IParticleSystem[];
    skeletons: Skeleton[];
    animationGroups: AnimationGroup[];
  }> {
    return await SceneLoader.ImportMeshAsync('', rootUrl, fileName, scene);
  }
}
