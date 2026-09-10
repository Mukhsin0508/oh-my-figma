#!/usr/bin/env node
import { main, skillRoot } from '../skills/oh-my-figma/scripts/workflow.mjs';
import { bundle } from '../skills/oh-my-figma/scripts/bundle.mjs';
const args = process.argv.slice(2);
try {
  if (args[0] === 'bundle') {
    if (args.length !== 2) throw new Error('Usage: bundle <output.zip>');
    bundle(skillRoot, args[1]); console.log(`Skill ZIP: ${args[1]}`);
  } else {
    main(args);
    if (args.length === 0 || ['help', '--help', '-h'].includes(args[0])) console.log('\nbundle <output.zip>  Export the self-contained skill for supported ChatGPT upload');
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
