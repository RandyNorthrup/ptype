/**
 * Check and download existing Rodin jobs
 * Use this to recover models from previous generation attempts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../.env.local') });

const RODIN_API_KEY = process.env.RODIN_API_KEY;
const RODIN_API_BASE = 'https://api.hyper3d.com/api/v2';
const OUTPUT_DIR = path.join(__dirname, '../web/public/assets/models');

// Task IDs from the previous run
const EXISTING_TASKS = [
  { uuid: 'd4b8f317-9292-41b0-ba9c-684ea2f45cc6', name: 'player-ship', category: 'ships' },
  { uuid: '4edda45d-1442-4a08-9de9-119a75a3d39a', name: 'enemy-basic', category: 'ships' },
  { uuid: 'c0d9a09b-9e46-4f69-80af-9b49071c6fd4', name: 'enemy-fast', category: 'ships' },
  { uuid: 'd9657785-355b-4757-9fe2-6f01e2ff7900', name: 'enemy-tank', category: 'ships' },
  { uuid: '19a0af6b-ba9a-4615-baa6-08a3de212b35', name: 'enemy-boss', category: 'ships' },
  { uuid: '4c39b419-b8b3-4ae2-b2b4-6c07aaa76e75', name: 'powerup-health', category: 'powerups' },
  { uuid: 'b9ea1f55-8c8f-4b05-b8f6-757baa960d88', name: 'powerup-shield', category: 'powerups' },
  { uuid: 'f16330f0-978f-4f8d-8355-93dc0fe52c03', name: 'powerup-missile', category: 'powerups' },
  { uuid: '8af517f8-3827-4629-ad80-ac968e331933', name: 'powerup-timefreeze', category: 'powerups' },
  { uuid: '5f5e3819-3744-464a-b01b-a0017b57fee8', name: 'powerup-emp', category: 'powerups' },
  { uuid: '248c5b9d-bd64-4c84-a752-30848f26531e', name: 'trophy-bronze', category: 'achievements' },
  { uuid: '63f0b519-893c-4fc9-8778-d5fc59802c05', name: 'trophy-silver', category: 'achievements' },
  { uuid: 'ba3df4db-8fce-4bb4-b76d-19c7b6dfecc6', name: 'trophy-gold', category: 'achievements' },
  { uuid: 'f513a636-ca54-4b56-bec6-7acb9e36f1d4', name: 'trophy-platinum', category: 'achievements' },
  { uuid: '25101479-ab3f-420b-abbf-d110f1daca98', name: 'asteroid-small', category: 'environment' },
  { uuid: '65c1d80f-e5dc-42c3-b4f6-55851bc40d94', name: 'asteroid-medium', category: 'environment' },
  { uuid: 'a583e462-4fb7-4bac-8345-bf02803bdfd7', name: 'space-station', category: 'environment' },
];

async function downloadModel(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(outputPath);
      reject(err);
    });
  });
}

async function checkAndDownload(task: { uuid: string; name: string; category: string }) {
  console.log(`\n🔍 Checking: ${task.name}`);
  
  try {
    // Try to download directly
    const downloadResponse = await fetch(`${RODIN_API_BASE}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RODIN_API_KEY!}`,
      },
      body: JSON.stringify({
        task_uuid: task.uuid,
      }),
    });
    
    if (!downloadResponse.ok) {
      const error = await downloadResponse.text();
      console.log(`   ⚠️  Cannot download: ${downloadResponse.status} - ${error}`);
      return false;
    }
    
    const downloadData = await downloadResponse.json();
    console.log(`   📋 Download response:`, JSON.stringify(downloadData, null, 2));
    
    const glbFile = downloadData.list?.find((f: any) => f.name?.endsWith('.glb'));
    
    if (glbFile?.url) {
      const outputPath = path.join(OUTPUT_DIR, task.category, `${task.name}.glb`);
      console.log(`   📥 Downloading to: ${outputPath}`);
      await downloadModel(glbFile.url, outputPath);
      console.log(`   ✅ Downloaded successfully!`);
      return true;
    } else {
      console.log(`   ⚠️  No GLB file in response`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error);
    return false;
  }
}

async function main() {
  console.log('🔍 Checking Existing Rodin Jobs\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (!RODIN_API_KEY) {
    console.error('❌ RODIN_API_KEY not found in .env.local');
    process.exit(1);
  }
  
  let successful = 0;
  let failed = 0;
  
  for (const task of EXISTING_TASKS) {
    const result = await checkAndDownload(task);
    if (result) {
      successful++;
    } else {
      failed++;
    }
  }
  
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('📊 Recovery Summary\n');
  console.log(`✅ Downloaded: ${successful}/${EXISTING_TASKS.length}`);
  console.log(`❌ Failed: ${failed}/${EXISTING_TASKS.length}`);
  console.log('\n');
}

main().catch(console.error);
