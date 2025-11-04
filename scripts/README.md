# Asset Generation Guide

This directory contains scripts to generate high-quality 3D assets and textures for P-Type using the Rodin API.

## Prerequisites

1. **Rodin API Key**: Your business account API key is configured in `.env.local`
2. **Node.js packages**: `dotenv` and `tsx` are installed
3. **Time**: Asset generation takes approximately 30-60 minutes total

## Asset Generation Scripts

### 1. Generate 3D Models

```bash
npm run generate:assets
```

This script generates **18 high-quality 3D models**:

#### Ships (5 models)
- `player-ship.glb` - Hero spaceship with sleek blue/white design
- `enemy-basic.glb` - Standard red/black alien ship
- `enemy-fast.glb` - Streamlined purple interceptor
- `enemy-tank.glb` - Heavy armored battleship
- `enemy-boss.glb` - Massive ornate mothership (2x larger)

#### Power-ups (5 models)
- `powerup-health.glb` - Medical cross with green glow
- `powerup-shield.glb` - Hexagonal shield with blue glow
- `powerup-missile.glb` - Rocket launcher with orange glow
- `powerup-timefreeze.glb` - Clock/hourglass with cyan glow
- `powerup-emp.glb` - Lightning symbol with purple glow

#### Achievement Trophies (4 models)
- `trophy-bronze.glb` - Third place medal
- `trophy-silver.glb` - Second place medal
- `trophy-gold.glb` - First place medal
- `trophy-platinum.glb` - Ultimate mastery trophy

#### Environment (4 models)
- `asteroid-small.glb` - Small rocky debris
- `asteroid-medium.glb` - Medium space rock with ore veins
- `space-station.glb` - Futuristic orbital facility module

**Output**: `web/public/assets/models/{ships,powerups,achievements,environment}/`

### 2. Space Textures (Recommended Sources)

Instead of generating textures with Rodin (optimized for 3D), download from these high-quality sources:

#### Poly Haven (FREE, HIGH QUALITY)
Visit: [polyhaven.com/hdris](https://polyhaven.com/hdris)

**Recommended Downloads** (4K HDR):
- `space_background_01.hdr` - Deep space with stars
- `nebula_emission_01.hdr` - Colorful cosmic clouds
- `galaxy_center_01.hdr` - Milky way view

**Directory**: `web/public/assets/textures/skybox/`

#### NASA Image Library (FREE, REAL PHOTOS)
Visit: [images.nasa.gov](https://images.nasa.gov)

Search for:
- "Nebula" - Purple/blue/orange cosmic clouds
- "Galaxy" - Spiral and elliptical galaxies
- "Earth from space" - Planet textures
- "Hubble deep field" - Deep space backgrounds

**Directory**: `web/public/assets/textures/nebula/` and `textures/planet/`

#### Material Textures
Visit: [polyhaven.com/textures](https://polyhaven.com/textures)

Search for:
- "Metal" - Spaceship hull materials
- "Scratched metal" - Battle damage
- "Sci-fi panels" - Futuristic surfaces

**Directory**: `web/public/assets/textures/material/`

## Generation Process

### What Happens During Generation

1. **Batch Processing**: Models are generated in batches of 3 to avoid API rate limits
2. **High Quality**: All models use "premium" tier for maximum detail
3. **Custom Dimensions**: Each model has optimized bboxCondition for its use case
4. **Polling**: Script waits for each model to complete (up to 10 minutes per model)
5. **Download**: Completed models are downloaded as GLB files
6. **Organization**: Files are sorted into category folders

### Expected Timeline

- **Player ship**: 5-8 minutes
- **Enemy ships** (4 models): 20-30 minutes
- **Power-ups** (5 models): 25-35 minutes
- **Trophies** (4 models): 15-20 minutes
- **Environment** (4 models): 15-20 minutes

**Total**: ~30-60 minutes depending on API load

### Monitoring Progress

The script provides real-time feedback:
```
🎨 Generating: player-ship
   Prompt: futuristic player spaceship, sleek design, blue and white...
   ✅ Job started - Task ID: abc123...

⏳ Polling status for: player-ship
   ⏳ Progress: 2/3 tasks complete...
   ✅ Generation complete!

📥 Downloading player-ship...
✅ Saved to: /web/public/assets/models/ships/player-ship.glb
```

## Using Generated Assets

### In React Three Fiber

```typescript
import { useGLTF } from '@react-three/drei';

function PlayerShip() {
  const { scene } = useGLTF('/assets/models/ships/player-ship.glb');
  return <primitive object={scene} />;
}
```

### Loading Textures

```typescript
import { useTexture } from '@react-three/drei';

function SpaceBackground() {
  const texture = useTexture('/assets/textures/skybox/space_background_01.hdr');
  return <Environment map={texture} />;
}
```

## Troubleshooting

### API Key Issues
```
❌ RODIN_API_KEY not found in .env.local
```
**Solution**: Check that `.env.local` has `RODIN_API_KEY=your_key_here`

### Generation Failures
```
❌ Generation failed for enemy-basic
```
**Solution**: 
- Check API quota/credits
- Simplify the prompt
- Try again (temporary API issues)

### Timeout Issues
```
⚠️ Timeout waiting for player-ship
```
**Solution**:
- Generation is still running on Rodin's servers
- Check your Rodin dashboard for job status
- Increase `maxAttempts` in script if needed

### Batch Size
If hitting rate limits, reduce `BATCH_SIZE` from 3 to 1:
```typescript
const BATCH_SIZE = 1; // Generate one at a time
```

## Quality Settings

All models are generated with:
- **Tier**: `premium` (highest quality)
- **Format**: GLB (optimized for web)
- **Textures**: Baked PBR materials included
- **Optimization**: Game-ready polygon counts

## Next Steps

After generation completes:

1. ✅ Review models in Blender or online GLB viewer
2. ✅ Update game code to load GLB files instead of placeholders
3. ✅ Download space textures from Poly Haven/NASA
4. ✅ Integrate textures into Three.js scene
5. ✅ Test models in-game
6. ✅ Optimize if needed (LOD, compression)

## Cost Estimate

Using Rodin business account:
- **18 models** × **premium tier** = varies by plan
- Check your Rodin dashboard for credit usage

## Support

- **Rodin API Docs**: [docs.hyperhuman.ai](https://docs.hyperhuman.ai)
- **Three.js Docs**: [threejs.org/docs](https://threejs.org/docs)
- **React Three Fiber**: [docs.pmnd.rs/react-three-fiber](https://docs.pmnd.rs/react-three-fiber)
