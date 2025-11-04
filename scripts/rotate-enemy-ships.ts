import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import * as fs from 'fs';
import * as path from 'path';

const loader = new GLTFLoader();
const exporter = new GLTFExporter();

// Enemy ship models to rotate
const enemyShips = [
  'public/assets/models/ships/enemy-basic.glb',
  'public/assets/models/ships/enemy-fast.glb',
  'public/assets/models/ships/enemy-boss.glb'
];

async function rotateModel(modelPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(process.cwd(), modelPath);
    const fileUrl = `file://${fullPath}`;
    
    console.log(`Loading model: ${modelPath}`);
    
    loader.load(
      fileUrl,
      (gltf) => {
        console.log(`Rotating model 180 degrees on Y-axis: ${modelPath}`);
        
        // Rotate the entire scene 180 degrees on Y-axis
        gltf.scene.rotation.y = Math.PI;
        
        // Update the matrix to apply the rotation
        gltf.scene.updateMatrixWorld(true);
        
        // Traverse all children and apply the rotation to their matrices
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.updateMatrix();
          }
        });
        
        console.log(`Exporting rotated model: ${modelPath}`);
        
        // Export the rotated model
        exporter.parse(
          gltf.scene,
          (result) => {
            const output = JSON.stringify(result, null, 2);
            fs.writeFileSync(fullPath, output);
            console.log(`✓ Successfully saved rotated model: ${modelPath}\n`);
            resolve();
          },
          (error) => {
            console.error(`Error exporting ${modelPath}:`, error);
            reject(error);
          },
          {
            binary: false, // Save as .gltf JSON format first
            embedImages: true
          }
        );
      },
      undefined,
      (error) => {
        console.error(`Error loading ${modelPath}:`, error);
        reject(error);
      }
    );
  });
}

async function main() {
  console.log('Starting enemy ship rotation process...\n');
  
  try {
    for (const shipPath of enemyShips) {
      await rotateModel(shipPath);
    }
    console.log('All enemy ships have been rotated 180 degrees successfully!');
  } catch (error) {
    console.error('Error during rotation process:', error);
    process.exit(1);
  }
}

main();
