/**
 * Three.js Game Engine Core
 * Handles scene setup, rendering, and game loop
 */
import * as THREE from 'three';
import { GAME_CONSTANTS } from '../types';

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private isRunning = false;
  private lastTime = 0;
  private deltaTime = 0;

  // Lighting
  private ambientLight!: THREE.AmbientLight;
  private directionalLight!: THREE.DirectionalLight;
  private pointLights: THREE.PointLight[] = [];

  // Callbacks
  private updateCallbacks: Array<(delta: number) => void> = [];
  private renderCallbacks: Array<() => void> = [];

  constructor(canvas: HTMLCanvasElement) {
    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1a); // Deep space blue/black
    this.scene.fog = new THREE.Fog(0x0a0a1a, 50, 200);

    // Initialize camera
    const aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(
      GAME_CONSTANTS.CAMERA_FOV,
      aspect,
      GAME_CONSTANTS.CAMERA_NEAR,
      GAME_CONSTANTS.CAMERA_FAR
    );
    this.camera.position.set(0, 10, 30);
    this.camera.lookAt(0, 0, 0);

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Setup lighting
    this.setupLighting();

    // Handle window resize
    window.addEventListener('resize', this.handleResize);
  }

  private setupLighting(): void {
    // Ambient light for overall scene illumination
    this.ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    this.scene.add(this.ambientLight);

    // Main directional light (sun/star light)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(10, 20, 10);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.camera.left = -50;
    this.directionalLight.shadow.camera.right = 50;
    this.directionalLight.shadow.camera.top = 50;
    this.directionalLight.shadow.camera.bottom = -50;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(this.directionalLight);

    // Add accent point lights for dramatic effect
    const colors = [0x00ff88, 0xff0088, 0x0088ff];
    const positions = [
      new THREE.Vector3(-20, 5, -10),
      new THREE.Vector3(20, 5, -10),
      new THREE.Vector3(0, 15, -30),
    ];

    colors.forEach((color, i) => {
      const light = new THREE.PointLight(color, 0.8, 50);
      light.position.copy(positions[i]);
      this.pointLights.push(light);
      this.scene.add(light);
    });
  }

  private handleResize = (): void => {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate(this.lastTime);
  }

  public stop(): void {
    this.isRunning = false;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private animate = (currentTime: number): void => {
    if (!this.isRunning) return;

    this.animationFrameId = requestAnimationFrame(this.animate);

    // Calculate delta time in seconds
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Cap delta time to prevent large jumps
    const cappedDelta = Math.min(this.deltaTime, 0.1);

    // Execute update callbacks
    this.updateCallbacks.forEach(callback => callback(cappedDelta));

    // Execute pre-render callbacks
    this.renderCallbacks.forEach(callback => callback());

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  };

  public onUpdate(callback: (delta: number) => void): () => void {
    this.updateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  public onRender(callback: () => void): () => void {
    this.renderCallbacks.push(callback);
    
    return () => {
      const index = this.renderCallbacks.indexOf(callback);
      if (index > -1) {
        this.renderCallbacks.splice(index, 1);
      }
    };
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.Camera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public getDeltaTime(): number {
    return this.deltaTime;
  }

  public addToScene(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  public removeFromScene(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  public setCameraPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
  }

  public setCameraLookAt(x: number, y: number, z: number): void {
    this.camera.lookAt(x, y, z);
  }

  public dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    
    // Dispose of all geometries and materials in scene
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    this.renderer.dispose();
  }
}
