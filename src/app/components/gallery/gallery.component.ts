import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Engine, Scene, Camera, Vector3, Light, Mesh } from 'babylonjs';
import mobile from 'is-mobile';

import { BabylonService } from 'src/app/services/babylon/babylon.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  private isMobile: boolean;
  private engine: Engine;
  private scene: Scene;
  private camera: Camera;
  private light: Light;
  private ground: Mesh;

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement>;

  public constructor(private babylonService: BabylonService) {
    this.isMobile = mobile({ tablet: true });
  }

  public ngOnInit(): void {
    this.engine = this.babylonService.createEngine(
      this.rendererCanvas.nativeElement
    );
    this.scene = this.babylonService.createScene(this.engine);
    this.babylonService.animate(this.scene);
    this.camera = this.createCamera();
    this.light = this.babylonService.createHemisphericLight(
      'light1',
      new Vector3(0, 1, 0),
      this.scene
    );
    this.ground = this.babylonService.createGround('ground', this.scene, {
      native: { width: 100, height: 100 },
      aditional: { checkCollisions: true },
    });
    this.importBuilding();
  }

  private createCamera(): Camera {
    const position = new Vector3(0, 2, 18);
    const cameraOptions = {
      setTarget: Vector3.Zero(),
      attachControl: {
        element: this.rendererCanvas.nativeElement,
        noPreventDefault: false,
      },
      ellipsoid: new Vector3(1.5, 1.5, 1.5),
      checkCollisions: true,
      applyGravity: true,
      speed: 0.2,
    };

    if (this.isMobile) {
      return this.babylonService.createVirtualJoysticksCamera(
        'VirtualJoysticksCamera',
        position,
        this.scene,
        cameraOptions
      );
    }

    return this.babylonService.createFreeCamera(
      'FreeCamera',
      position,
      this.scene,
      cameraOptions
    );
  }

  private async importBuilding(): Promise<void> {
    const building = await this.babylonService.importMeshAsync(
      'assets/',
      'building.babylon',
      this.scene
    );
    building.meshes.forEach((mesh) => (mesh.checkCollisions = true));
  }
}
