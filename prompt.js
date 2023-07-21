import { generateAsciiArt, animateAsciiArt } from './utils.js';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { colorfulMessage, centerAlignText } from './utils.js';
import { emojis } from './constants.js';

export async function promptUser() {
	const welcomeMessage = await generateAsciiArt('Next.js CLI');

	// Animated text effect for the welcome message
	await animateAsciiArt(welcomeMessage);

	console.log();
	console.log(
		chalk.green(
			centerAlignText(
				`${emojis.rocket} Welcome to the Awesome Next.js Boilerplate CLI! ${emojis.rocket}`
			)
		)
	);

	const response = inquirer.prompt([
		{
			type: 'list',
			name: 'apiType',
			message: colorfulMessage('Which API type do you want to use?'),
			choices: ['GraphQL', 'REST', 'None'],
		},
		{
			type: 'list',
			name: 'dataFetchingLibrary',
			message: colorfulMessage('Which data fetching library do you want to use?'),
			choices: ['SWR', 'React Query', 'None'],
		},
		{
			type: 'list',
			name: 'uiLibrary',
			message: colorfulMessage('Which UI library do you want to use?'),
			choices: ['Radix', 'Catalyst', 'None'],
		},
	]);

	// setTimeout(() => {
	// 	animatedMessage.stop(); // Stop the animation after a delay
	// }, 5000);
	return response;
}
