#! /usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the path to the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function promptUser() {
	return inquirer.prompt([
		{
			type: 'list',
			name: 'apiType',
			message: 'Which API type do you want to use?',
			choices: ['GraphQL', 'REST'],
		},
		{
			type: 'list',
			name: 'dataFetchingLibrary',
			message: 'Which data fetching library do you want to use?',
			choices: ['SWR', 'React Query', 'None'],
		},
		{
			type: 'list',
			name: 'uiLibrary',
			message: 'Which UI library do you want to use?',
			choices: ['Radix', 'Chakra UI', 'Catalyst', 'None'],
		},
	]);
}

async function installAdditionalDependencies(targetDir, packageChoices) {
	console.log('Installing additional dependencies...');
	if (packageChoices.apiType === 'GraphQL') {
		execSync(`npm install -D graphql`, {
			cwd: targetDir,
			stdio: 'inherit',
		});
	}

	if (packageChoices.apiType === 'REST') {
		execSync(`npm install -D axios`, {
			cwd: targetDir,
			stdio: 'inherit',
		});
	}

	if (packageChoices.dataFetchingLibrary === 'SWR') {
		execSync(`npm install swr`, {
			cwd: targetDir,
			stdio: 'inherit',
		});
	}

	if (packageChoices.dataFetchingLibrary === 'React Query') {
		execSync(`npm install -D react-query`, {
			cwd: targetDir,
			stdio: 'inherit',
		});
	}

	// Install additional dependencies
	execSync(`npm install -D prettier lint-staged husky`, {
		cwd: targetDir,
		stdio: 'inherit',
	});
}

const configFiles = ['.lintstagedrc.js', '.prettierrc', '.prettierignore'];
// Add more config file names as needed

async function addConfigsToBoilerplate(projectDirectoryName) {
	try {
		for (const configFile of configFiles) {
			const projectConfigPath = path.join(process.cwd(), projectDirectoryName, configFile);
			const configData = path.join(__dirname, configFile);

			await fs.copyFile(configData, projectConfigPath);
		}

		console.log('Config files added to the boilerplate successfully!');
	} catch (error) {
		console.error('Error while adding config files:', error);
	}
}

async function createNextJsBoilerplate(targetDir) {
	try {
		// Install the latest version of Next.js on the fly
		const packageChoices = await promptUser();

		const initialFiles = await fs.readdir(process.cwd());

		console.log('Installing the latest version of Next.js...');
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

		console.log('Next.js boilerplate created successfully!');
		process.exit(0);
	} catch (error) {
		console.error('Error creating Next.js boilerplate:', error);
		process.exit(1);
	}
}

// Run the CLI tool
createNextJsBoilerplate(process.cwd());
