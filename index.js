#! /usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import spinners from 'cli-spinners';
import ora from 'ora';

import { promptUser } from './prompt.js';
import { emojis } from './constants.js';
import {
	colorfulMessage,
	addConfigsToBoilerplate,
	installAdditionalDependencies,
} from './utils.js';

// Get the path to the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fun animations using cli-spinners
const spinnerFrames = spinners.dots.frames;
const spinner = ora({
	text: chalk.cyan('🚀 Configuring your Next.js project...'),
	spinner: {
		interval: 80,
		frames: spinnerFrames,
	},
});

async function createNextJsBoilerplate(targetDir, packageChoices) {
	try {
		// Install the latest version of Next.js on the fly
		const initialFiles = await fs.readdir(process.cwd());

		console.log(`${emojis.rocket} Installing the latest version of Next.js... ${emojis.rocket}`);
		spinner.start();

		execSync(`npx create-next-app@latest`, {
			cwd: targetDir,
			stdio: 'inherit',
		});

		// Get the list of directories after creating the Next.js project
		const finalFiles = await fs.readdir(process.cwd());

		// Find the newly created project directory
		const newProjectDirectoryName = finalFiles.find((file) => !initialFiles.includes(file));

		if (!newProjectDirectoryName) {
			console.error('Failed to find the newly created project directory.');
			return;
		}
		await installAdditionalDependencies(newProjectDirectoryName, packageChoices);
		await addConfigsToBoilerplate(newProjectDirectoryName);

		spinner.stopAndPersist({ symbol: colorfulMessage(emojis.success) });
		console.log(
			chalk.cyan(
				`${emojis.partyPopper} Next.js boilerplate created successfully! ${emojis.partyPopper}`
			)
		);
		process.exit(0);
	} catch (error) {
		console.error('Error creating Next.js boilerplate:', error);
		process.exit(1);
	}
}

// Run the CLI tool
(async () => {
	const response = await promptUser();
	createNextJsBoilerplate(process.cwd(), response);
})();
