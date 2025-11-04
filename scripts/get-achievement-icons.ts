/**
 * Script to fetch achievement icons from Icons8
 * Uses the Icons8 API to get appropriate icons for each achievement
 */

const achievements = [
  { id: 'first_word', name: 'First Steps', icon: 'BABY', search: 'baby bottle' },
  { id: 'speed_demon', name: 'Speed Demon', icon: 'SPEED', search: 'lightning bolt fast' },
  { id: 'accuracy_master', name: 'Accuracy Master', icon: 'TARGET', search: 'target bullseye' },
  { id: 'boss_slayer', name: 'Boss Slayer', icon: 'BOSS', search: 'sword warrior' },
  { id: 'level_10', name: 'Level 10', icon: 'L10', search: 'medal bronze' },
  { id: 'level_20', name: 'Level 20', icon: 'L20', search: 'medal gold star' },
  { id: 'perfect_game', name: 'Perfect Game', icon: '100%', search: 'checkmark perfect' },
  { id: 'marathon', name: 'Marathon', icon: '30M', search: 'stopwatch timer' },
  { id: 'polyglot', name: 'Polyglot', icon: 'CODE', search: 'code programming' },
  { id: 'high_scorer', name: 'High Scorer', icon: '10K', search: 'coin money trophy' },
  { id: 'veteran', name: 'Veteran', icon: '50G', search: 'badge veteran star' },
  { id: 'word_master', name: 'Word Master', icon: '1000W', search: 'book dictionary' },
  { id: 'trivia_novice', name: 'Trivia Novice', icon: 'Q1', search: 'question mark quiz' },
  { id: 'trivia_expert', name: 'Trivia Expert', icon: 'Q10', search: 'brain smart' },
  { id: 'trivia_master', name: 'Trivia Master', icon: 'Q25', search: 'graduation cap diploma' },
  { id: 'trivia_genius', name: 'Trivia Genius', icon: 'Q50', search: 'wizard hat magic' },
  { id: 'perfect_trivia', name: 'Perfect Trivia', icon: '5✓', search: 'check list complete' },
  { id: 'bonus_collector', name: 'Bonus Collector', icon: 'B10', search: 'gift box present' },
  { id: 'bonus_master', name: 'Bonus Master', icon: 'B25', search: 'crown king' },
];

async function searchIcon(query: string): Promise<string> {
  const apiKey = 'I7dpWNZhSPMousybVYZOjthXrgCsuQnBpH5mpgkH';
  const response = await fetch(`https://api.icons8.com/api/iconsets/v5/search?term=${encodeURIComponent(query)}&amount=1&token=${apiKey}`);
  const data = await response.json();
  
  if (data.icons && data.icons.length > 0) {
    const icon = data.icons[0];
    // Get SVG URL
    return `https://img.icons8.com/color/96/${icon.commonName}.png`;
  }
  return '';
}

async function main() {
  console.log('Fetching achievement icons from Icons8...\n');
  
  for (const achievement of achievements) {
    try {
      const iconUrl = await searchIcon(achievement.search);
      console.log(`${achievement.id}:`);
      console.log(`  Name: ${achievement.name}`);
      console.log(`  Current: ${achievement.icon}`);
      console.log(`  Icon URL: ${iconUrl}`);
      console.log('');
      
      // Wait a bit to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error fetching icon for ${achievement.name}:`, error);
    }
  }
}

main();
