/**
 * Regenerate EMP Powerup with new magnet design using Rodin API
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../.env.local') });

const RODIN_API_KEY = process.env.RODIN_API_KEY;
const RODIN_API_BASE = 'https://api.hyper3d.com/api/v2';
const OUTPUT_DIR = path.join(__dirname, '../web/public/assets/models/powerups');

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔮 Rodin EMP Powerup Regeneration');
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (!RODIN_API_KEY) {
    console.error('❌ RODIN_API_KEY not found');
    process.exit(1);
  }
  
  const assetName = 'powerup-emp';
  const prompt = 'EMP power-up, horseshoe magnet with electromagnetic waves, glowing electric energy rings radiating outward, purple and blue colors, electromagnetic pulse effect, game pickup, sci-fi, high quality';
  
  console.log(`🎨 Generating: ${assetName}`);
  console.log(`📝 Prompt: ${prompt}\n`);
  
  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('tier', 'Gen-2');
  formData.append('quality', 'high');
  formData.append('geometry_file_format', 'glb');
  formData.append('material', 'PBR');
  formData.append('bbox_condition', '80');
  formData.append('bbox_condition', '80');
  formData.append('bbox_condition', '60');
  
  console.log('🚀 Starting generation...');
  
  const response = await fetch(`${RODIN_API_BASE}/rodin`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RODIN_API_KEY}` },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Generation failed: ${await response.text()}`);
  }
  
  const data = await response.json();
  console.log(`✅ Job started - Task UUID: ${data.uuid}`);
  
  const taskUuid = data.uuid;
  const subscriptionKey = data.jobs?.subscription_key || data.subscription_key || '';
  
  console.log(`⏳ Polling for completion...\n`);
  
  let attempts = 0;
  while (attempts < 60) {
    await sleep(10000);
    
    const statusResponse = await fetch(`${RODIN_API_BASE}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RODIN_API_KEY}`,
      },
      body: JSON.stringify({ subscription_key: subscriptionKey }),
    });
    
    if (!statusResponse.ok) {
      attempts++;
      continue;
    }
    
    const statusData = await statusResponse.json();
    const taskJob = statusData.jobs?.find((j: any) => j.uuid === taskUuid);
    
    if (!taskJob) {
      attempts++;
      process.stdout.write(`\r⏳ Waiting... (${attempts * 10}s)`);
      continue;
    }
    
    if (taskJob.status === 'Failed' || taskJob.status === 'Canceled') {
      throw new Error(`Generation ${taskJob.status.toLowerCase()}`);
    }
    
    if (taskJob.status === 'Done') {
      console.log('\n✅ Generation complete!');
      
      const downloadResponse = await fetch(`${RODIN_API_BASE}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RODIN_API_KEY}`,
        },
        body: JSON.stringify({ task_uuid: taskUuid }),
      });
      
      if (!downloadResponse.ok) {
        throw new Error('Failed to get download URL');
      }
      
      const downloadData = await downloadResponse.json();
      const glbFile = downloadData.list?.find((f: any) => f.name?.endsWith('.glb'));
      
      if (!glbFile?.url) {
        throw new Error('No GLB file URL found');
      }
      
      console.log('📥 Downloading GLB file...');
      
      const fileResponse = await fetch(glbFile.url);
      const arrayBuffer = await fileResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      }
      
      const outputPath = path.join(OUTPUT_DIR, `${assetName}.glb`);
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`✅ Downloaded: ${assetName}.glb (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
      console.log('\n🎉 EMP powerup regenerated with magnet + wave design!');
      console.log(`📁 Location: ${outputPath}`);
      console.log('   View at: http://localhost:3001/#model-viewer');
      
      return;
    }
    
    attempts++;
    process.stdout.write(`\r⏳ Status: ${taskJob.status}... (${attempts * 10}s)`);
  }
  
  throw new Error('Timeout after 10 minutes');
}

main().catch(error => {
  console.error('\n\n❌ Error:', error.message);
  process.exit(1);
});
