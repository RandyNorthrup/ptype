/**
 * Asset Generation Script
 * Uses Rodin API to generate high-quality 3D models for the game
 * Run this once to generate all needed assets
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '../.env.local') });

const RODIN_API_KEY = process.env.RODIN_API_KEY;
const RODIN_API_BASE = 'https://api.hyper3d.com/api/v2';
const OUTPUT_DIR = path.join(__dirname, '../web/public/assets/models');

interface AssetDefinition {
  name: string;
  prompt: string;
  category: 'ships' | 'powerups' | 'achievements' | 'environment';
  bboxCondition?: [number, number, number];
}

// Define all assets to generate
const ASSETS_TO_GENERATE: AssetDefinition[] = [
  // Player Ship
  {
    name: 'player-ship',
    prompt: 'futuristic player spaceship, sleek design, blue and white colors, detailed cockpit, advanced weaponry, hero ship, high quality, game asset, sci-fi',
    category: 'ships',
    bboxCondition: [100, 120, 80], // Slightly wider and flatter (integers >= 1)
  },
  
  // Enemy Ships (different types)
  {
    name: 'enemy-basic',
    prompt: 'alien enemy spaceship, aggressive angular design, red and black colors, menacing, simple geometric, game asset, sci-fi, high quality',
    category: 'ships',
    bboxCondition: [1, 1, 1],
  },
  {
    name: 'enemy-fast',
    prompt: 'fast alien interceptor ship, streamlined aerodynamic design, purple and silver colors, sleek, speed-focused, game asset, sci-fi, high quality',
    category: 'ships',
    bboxCondition: [150, 80, 70], // Longer and thinner for speed (integers)
  },
  {
    name: 'enemy-tank',
    prompt: 'heavy armored alien battleship, bulky powerful design, dark gray and orange colors, intimidating, heavily armored, game asset, sci-fi, high quality',
    category: 'ships',
    bboxCondition: [120, 120, 100], // Bigger and bulkier (integers)
  },
  {
    name: 'enemy-boss',
    prompt: 'massive alien boss mothership, imposing detailed design, red and gold colors, ornate powerful, highly detailed, game asset, sci-fi, high quality, epic',
    category: 'ships',
    bboxCondition: [200, 200, 150], // Much larger (integers)
  },
  
  // Power-ups
  {
    name: 'powerup-health',
    prompt: 'health pack power-up, medical cross symbol, glowing green energy, floating item, sci-fi medical kit, game pickup, high quality',
    category: 'powerups',
    bboxCondition: [80, 80, 80], // Integers >= 1
  },
  {
    name: 'powerup-shield',
    prompt: 'shield boost power-up, hexagonal shield icon, glowing blue energy field, protective barrier, game pickup, sci-fi, high quality',
    category: 'powerups',
    bboxCondition: [80, 80, 50], // Integers >= 1
  },
  {
    name: 'powerup-missile',
    prompt: 'missile launcher power-up, rocket symbol, glowing orange energy, ammunition pack, game pickup, sci-fi weapon, high quality',
    category: 'powerups',
    bboxCondition: [100, 50, 50], // Integers >= 1
  },
  {
    name: 'powerup-timefreeze',
    prompt: 'time freeze power-up, clock or hourglass symbol, glowing cyan energy, temporal distortion effect, game pickup, sci-fi, high quality',
    category: 'powerups',
    bboxCondition: [80, 80, 80], // Integers >= 1
  },
  {
    name: 'powerup-emp',
    prompt: 'EMP power-up, horseshoe magnet with electromagnetic waves, glowing electric energy rings radiating outward, purple and blue colors, electromagnetic pulse effect, game pickup, sci-fi, high quality',
    category: 'powerups',
    bboxCondition: [80, 80, 60], // Integers >= 1
  },
  
  // Achievement Trophies
  {
    name: 'trophy-bronze',
    prompt: 'bronze achievement trophy, third place medal, bronze metallic finish, star or ribbon, award pedestal, high quality, game achievement',
    category: 'achievements',
    bboxCondition: [60, 60, 100], // Integers >= 1
  },
  {
    name: 'trophy-silver',
    prompt: 'silver achievement trophy, second place medal, polished silver finish, star or ribbon, award pedestal, high quality, game achievement',
    category: 'achievements',
    bboxCondition: [60, 60, 100], // Integers >= 1
  },
  {
    name: 'trophy-gold',
    prompt: 'gold achievement trophy, first place medal, shiny gold finish, star or ribbon, award pedestal, high quality, game achievement',
    category: 'achievements',
    bboxCondition: [60, 60, 100], // Integers >= 1
  },
  {
    name: 'trophy-platinum',
    prompt: 'platinum achievement trophy, ultimate mastery medal, brilliant platinum finish, ornate star or ribbon, prestigious award pedestal, high quality, game achievement',
    category: 'achievements',
    bboxCondition: [60, 60, 120], // Integers >= 1
  },
  
  // Environment pieces
  {
    name: 'asteroid-small',
    prompt: 'small space asteroid, rocky surface with craters, gray and brown, detailed texture, space debris, game asset, high quality',
    category: 'environment',
    bboxCondition: [100, 90, 80], // Integers >= 1
  },
  {
    name: 'asteroid-medium',
    prompt: 'medium space asteroid, detailed rocky surface, impact craters, metallic ore veins, space debris, game asset, high quality',
    category: 'environment',
    bboxCondition: [150, 130, 120], // Integers >= 1
  },
  {
    name: 'space-station',
    prompt: 'futuristic space station module, detailed sci-fi architecture, white and blue panels, solar arrays, orbital facility, game asset, high quality',
    category: 'environment',
    bboxCondition: [200, 150, 150], // Integers >= 1
  },
];

interface RodinJob {
  taskUuid: string;
  subscriptionKey: string;
  asset: AssetDefinition;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateModel(asset: AssetDefinition): Promise<RodinJob> {
  console.log(`\n🎨 Generating: ${asset.name}`);
  console.log(`   Prompt: ${asset.prompt.substring(0, 60)}...`);
  
  // Use multipart/form-data for Rodin API
  const formData = new FormData();
  formData.append('prompt', asset.prompt);
  formData.append('tier', 'Gen-2');
  formData.append('quality', 'high');
  formData.append('geometry_file_format', 'glb');
  formData.append('material', 'PBR');
  
  // bbox_condition should be sent as individual array elements
  if (asset.bboxCondition) {
    asset.bboxCondition.forEach((value) => {
      formData.append('bbox_condition', value.toString());
    });
  }

  const response = await fetch(`${RODIN_API_BASE}/rodin`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RODIN_API_KEY!}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate ${asset.name}: ${error}`);
  }

  const data = await response.json();
  console.log(`   📋 Generation response:`, JSON.stringify(data, null, 2));
  console.log(`   ✅ Job started - Task ID: ${data.uuid}`);
  
  // Extract subscription_key properly
  const subscriptionKey = data.jobs?.subscription_key || data.subscription_key || '';
  console.log(`   🔑 Subscription Key: ${subscriptionKey || 'NOT FOUND'}`);
  
  return {
    taskUuid: data.uuid,
    subscriptionKey: subscriptionKey,
    asset,
  };
}

async function pollJobStatus(job: RodinJob): Promise<string | null> {
  console.log(`\n⏳ Polling status for: ${job.asset.name}`);
  
  const maxAttempts = 60; // 10 minutes max (10 second intervals)
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    // The subscription_key is used to poll for job status
    // The API expects the subscription_key to check ALL jobs in that batch
    const response = await fetch(`${RODIN_API_BASE}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RODIN_API_KEY!}`,
      },
      body: JSON.stringify({
        subscription_key: job.subscriptionKey,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   ⚠️  Status check failed: ${response.status} - ${errorText}`);
      // If subscription_key is empty or invalid, try checking by task UUID directly
      if (!job.subscriptionKey) {
        console.log(`   ⚠️  No subscription key for ${job.asset.name}, skipping status check`);
        return null;
      }
      throw new Error(`Failed to check status for ${job.asset.name}`);
    }

    const data = await response.json();
    console.log(`   📋 Response data:`, JSON.stringify(data, null, 2));
    
    const jobs = data.jobs || [];
    
    if (jobs.length === 0) {
      console.log(`   ⚠️  No jobs returned in response for ${job.asset.name}`);
      console.log(`   📋 Full response:`, JSON.stringify(data, null, 2));
      // Wait and retry - job might not be registered yet
      attempts++;
      await sleep(10000);
      continue;
    }
    
    // Find our specific task in the jobs array
    const taskJob = jobs.find((j: any) => j.uuid === job.taskUuid);
    if (!taskJob) {
      console.log(`   ⚠️  Task UUID ${job.taskUuid} not found in jobs array`);
      console.log(`   📋 Available job UUIDs:`, jobs.map((j: any) => j.uuid));
      // Wait and retry
      attempts++;
      await sleep(10000);
      continue;
    }
    
    const status = taskJob.status;
    
    // Check status
    if (status === 'Failed' || status === 'Canceled') {
      console.log(`   ❌ Generation ${status.toLowerCase()} for ${job.asset.name}`);
      return null;
    }
    
    if (status === 'Done') {
      console.log(`   ✅ Generation complete! Downloading...`);
      
      // Get download URL
      const downloadResponse = await fetch(`${RODIN_API_BASE}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RODIN_API_KEY!}`,
        },
        body: JSON.stringify({
          task_uuid: job.taskUuid,
        }),
      });
      
      if (!downloadResponse.ok) {
        throw new Error(`Failed to get download URL for ${job.asset.name}`);
      }
      
      const downloadData = await downloadResponse.json();
      const glbFile = downloadData.list?.find((f: any) => f.name?.endsWith('.glb'));
      
      if (glbFile?.url) {
        return glbFile.url;
      } else {
        console.log(`   ⚠️  No GLB file found for ${job.asset.name}`);
        return null;
      }
    }
    
    attempts++;
    console.log(`   ⏳ Status: ${status}... (attempt ${attempts}/${maxAttempts})`);
    await sleep(10000); // Wait 10 seconds between polls
  }
  
  console.log(`   ⚠️  Timeout waiting for ${job.asset.name}`);
  return null;
}

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

async function main() {
  console.log('🚀 P-Type Asset Generation Script\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (!RODIN_API_KEY) {
    console.error('❌ RODIN_API_KEY not found in .env.local');
    process.exit(1);
  }
  
  // Create output directories
  const categories = ['ships', 'powerups', 'achievements', 'environment'];
  for (const category of categories) {
    const dir = path.join(OUTPUT_DIR, category);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);
  console.log(`📋 Generating ${ASSETS_TO_GENERATE.length} assets...\n`);
  
  // Generate all models in batches to avoid overwhelming the API
  const BATCH_SIZE = 3;
  const jobs: RodinJob[] = [];
  
  for (let i = 0; i < ASSETS_TO_GENERATE.length; i += BATCH_SIZE) {
    const batch = ASSETS_TO_GENERATE.slice(i, i + BATCH_SIZE);
    console.log(`\n📦 Starting batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(ASSETS_TO_GENERATE.length / BATCH_SIZE)}`);
    
    // Start generation for this batch
    for (const asset of batch) {
      try {
        const job = await generateModel(asset);
        jobs.push(job);
        await sleep(2000); // Small delay between requests
      } catch (error) {
        console.error(`❌ Failed to start generation for ${asset.name}:`, error);
      }
    }
    
    // Wait a bit before starting next batch
    if (i + BATCH_SIZE < ASSETS_TO_GENERATE.length) {
      console.log('\n⏸️  Waiting 30 seconds before next batch...');
      await sleep(30000);
    }
  }
  
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('⏳ All generation jobs started. Waiting for completion...\n');
  
  // Poll and download completed models
  const results: { asset: AssetDefinition; success: boolean; path?: string }[] = [];
  
  for (const job of jobs) {
    try {
      const modelUrl = await pollJobStatus(job);
      
      if (modelUrl) {
        const outputPath = path.join(
          OUTPUT_DIR,
          job.asset.category,
          `${job.asset.name}.glb`
        );
        
        console.log(`📥 Downloading ${job.asset.name}...`);
        await downloadModel(modelUrl, outputPath);
        console.log(`✅ Saved to: ${outputPath}`);
        
        results.push({
          asset: job.asset,
          success: true,
          path: outputPath,
        });
      } else {
        results.push({
          asset: job.asset,
          success: false,
        });
      }
    } catch (error) {
      console.error(`❌ Error processing ${job.asset.name}:`, error);
      results.push({
        asset: job.asset,
        success: false,
      });
    }
  }
  
  // Print summary
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('📊 Generation Summary\n');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}\n`);
  
  if (successful > 0) {
    console.log('Generated assets:');
    results.filter(r => r.success).forEach(r => {
      console.log(`  ✅ ${r.asset.name} (${r.asset.category})`);
    });
  }
  
  if (failed > 0) {
    console.log('\nFailed assets:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  ❌ ${r.asset.name} (${r.asset.category})`);
    });
  }
  
  console.log('\n🎉 Asset generation complete!');
  console.log('\nNext steps:');
  console.log('  1. Review the generated models in web/public/assets/models/');
  console.log('  2. Update the game code to use these models');
  console.log('  3. Test the models in the game\n');
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
