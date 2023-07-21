import figlet from "figlet";
import chalk from "chalk";
import animation from "chalk-animation";
import centerAlign from "center-align";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

import { configFiles } from "./constants.js";

// Get the path to the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to center align the text
export function centerAlignText(text) {
  const terminalWidth = process.stdout.columns || 80; // Get the terminal width
  const paddedText = centerAlign(text, terminalWidth, { whitespace: true });
  return paddedText;
}

// Function to generate fun ASCII art text
export function generateAsciiArt(text) {
  return new Promise((resolve, reject) => {
    figlet.text(text, { font: "Standard" }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(centerAlignText(data));
      }
    });
  });
}

export async function animateAsciiArt(text) {
  return new Promise((resolve) => {
    const animatedMessage = animation.rainbow(text);
    setTimeout(() => {
      animatedMessage.stop(); // Stop the animation after a delay (1.5 seconds)
      resolve();
    }, 1500); // Adjust the delay time as needed
  });
}

export const colorfulMessage = (text) => chalk.hex("#FFA500")(text);

export async function addConfigsToBoilerplate(projectDirectoryName) {
  try {
    for (const configFile of configFiles) {
      const projectConfigPath = path.join(
        process.cwd(),
        projectDirectoryName,
        configFile
      );
      const configData = path.join(__dirname, "configs", configFile);

      await fs.copyFile(configData, projectConfigPath);
    }
  } catch (error) {
    console.error("Error while adding config files:", error);
  }
}

export async function addFileToBoilerPlate(projectDirectoryName, fileName) {
  try {
    const projectConfigPath = path.join(
      process.cwd(),
      projectDirectoryName,
      fileName
    );
    const configData = path.join(__dirname, "configs", fileName);

    await fs.copyFile(configData, projectConfigPath);
  } catch (error) {
    console.error("Error while adding config files:", error);
  }
}

export async function checkFileExistsInDirectory(targetDir, fileName) {
  const directoryPath = path.join(__dirname, targetDir);
  return new Promise((resolve, reject) => {
    const filePath = path.join(directoryPath, fileName);
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        resolve(true);
      } else {
        console.log(`File ${fileName} does not exist in ${directoryPath}`);
        resolve(false);
      }
    });
  });
}

export async function installAdditionalDependencies(targetDir, packageChoices) {
  console.log("Installing additional dependencies...");
  const isTypescriptProject = await checkFileExistsInDirectory(
    targetDir,
    "tsconfig.json"
  );
  const isTailwindConfigPresent = await checkFileExistsInDirectory(
    targetDir,
    "tailwind.config.js"
  );
  const isEslintConfigPresent = await checkFileExistsInDirectory(
    targetDir,
    ".eslintrc.json"
  );

  const dependencies = [];
  const devDependencies = [];

  if (packageChoices.apiType === "GraphQL") {
    dependencies.push("graphql graphql-request");
    devDependencies.push(
      "@graphql-codegen/cli @graphql-codegen/client-preset @graphql-codegen/typescript @graphql-codegen/typescript-graphql-request @graphql-codegen/typescript-operations ts-node"
    );
    addFileToBoilerPlate(targetDir, "codegen.ts");
  }

  if (packageChoices.apiType === "REST") {
    dependencies.push("axios");
  }

  if (packageChoices.dataFetchingLibrary === "SWR") {
    dependencies.push("swr");
  }

  if (packageChoices.dataFetchingLibrary === "React Query") {
    dependencies.push("react-query");
  }

  if (packageChoices.uiLibrary === "Radix") {
    dependencies.push("@radix-ui/react-popover@latest -E");
  }

  if (packageChoices.uiLibrary === "Catalyst") {
    dependencies.push("@i4o/catalystui");
  }

  if (isTypescriptProject && isEslintConfigPresent) {
    devDependencies.push("eslint-config-prettier");
  }

  if (isTailwindConfigPresent) {
    devDependencies.push("prettier-plugin-tailwindcss");
    dependencies.push("clsx");
  }

  devDependencies.push(
    "prettier lint-staged husky @svgr/cli eslint-config-prettier"
  );

  execSync(
    `npm install ${dependencies.join(
      " "
    )} && npm install -D ${devDependencies.join(" ")}`,
    {
      cwd: targetDir,
      stdio: "inherit",
    }
  );

  if (isEslintConfigPresent) {
    await addFileToBoilerPlate(targetDir, ".eslintrc.json");
  }
}
