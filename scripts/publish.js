#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = require(packageJsonPath);
const currentVersion = packageJson.version;

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`Current version: ${currentVersion}`);

// Parse current version
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Display version options
console.log('\nSelect version increment:');
console.log(`1) Patch (${major}.${minor}.${patch + 1})`);
console.log(`2) Minor (${major}.${minor + 1}.0)`);
console.log(`3) Major (${major + 1}.0.0)`);
console.log('4) Enter version manually');

rl.question('\nEnter option (1-4): ', (option) => {
  let newVersion;
  
  switch (option) {
    case '1':
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
    case '2':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case '3':
      newVersion = `${major + 1}.0.0`;
      break;
    case '4':
      rl.question('Enter new version (x.y.z): ', (manualVersion) => {
        updateVersionAndPublish(manualVersion);
      });
      return;
    default:
      console.log('Invalid option. Exiting.');
      rl.close();
      return;
  }
  
  updateVersionAndPublish(newVersion);
});

function updateVersionAndPublish(newVersion) {
  // Confirm publication
  rl.question(`Publish version ${newVersion}? (y/n): `, (answer) => {
    if (answer.toLowerCase() === 'y') {
      try {
        // Update package.json
        packageJson.version = newVersion;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        console.log(`Updated package.json to version ${newVersion}`);
        
        // Run build process
        console.log('Building package...');
        execSync('npm run build', { stdio: 'inherit' });
        
        // Publish to npm
        console.log('Publishing to npm...');
        execSync('npm publish', { stdio: 'inherit' });
        
        // Commit the version change
        console.log('Committing version change...');
        execSync(`git add package.json`, { stdio: 'inherit' });
        execSync(`git commit -m "Bump version to ${newVersion}"`, { stdio: 'inherit' });
        
        // Create a tag
        console.log('Creating git tag...');
        execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
        
        console.log(`\nSuccessfully published version ${newVersion}!`);
        console.log('Remember to push the commit and tag:');
        console.log('  git push && git push --tags');
      } catch (error) {
        console.error('Error during publish:', error.message);
      }
    } else {
      console.log('Publication cancelled.');
    }
    rl.close();
  });
} 