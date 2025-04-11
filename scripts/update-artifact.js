const fs = require('fs');
const path = require('path');

// Paths
const artifactPath = path.join(__dirname, '../artifacts/contracts/MultiGuard.sol/MultiGuard.json');
const targetPath = path.join(__dirname, '../src/contracts/MultiGuardArtifact.js');

// Read the compiled artifact
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

// Create the new artifact content
const newContent = `// Contract ABI and bytecode from the compiled contract
export const MultiGuardArtifact = {
  abi: ${JSON.stringify(artifact.abi, null, 2)},
  bytecode: "${artifact.bytecode}"
};`;

// Write to the target file
fs.writeFileSync(targetPath, newContent);

console.log('Successfully updated MultiGuardArtifact.js with latest bytecode'); 