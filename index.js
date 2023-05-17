const prompt = require('prompt');
const { cloneRepository, installDependencies, startService } = require('./utils');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const microservices = [];


function runBuildScript(path) {
  return new Promise((resolve, reject) => {
    exec('npm run build', { cwd: path }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function checkRepositoryExists(path) {
  try {
    await fs.promises.access(path, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

async function addDebugScript(path, debugValue, port, configBasePath, certsBasePath) {
  const packageJsonPath = `${path}/package.json`;

  try {
    const packageJsonData = await fs.promises.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonData);

    if (!packageJson.scripts || !packageJson.scripts.debug) {
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.debug = createDebugScript(debugValue, port, configBasePath, certsBasePath);
    } else {
      const existingScript = packageJson.scripts.debug;
      packageJson.scripts.debug = updateDebugScript(existingScript, debugValue, port, configBasePath, certsBasePath);
    }

    await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Updated package.json with debug script in ${packageJsonPath}`);

    if (debugValue === 'y') {
      const vscodeDirPath = `${path}/.vscode`;
      const launchConfigPath = `${vscodeDirPath}/launch.json`;

      if (!fs.existsSync(vscodeDirPath)) {
        fs.mkdirSync(vscodeDirPath);
      }

      const launchConfigData = {
        version: '0.2.0',
        configurations: [
          {
            type: 'node',
            request: 'launch',
            name: packageJson.name || 'Launch Program',
            env: {
              CONFIGBASEPATH: configBasePath,
              CERTBASEPATH: certsBasePath,
              PORT: port,
              CORS: 'true',
              ENV: 'SIT1'
            },
            program: '${workspaceFolder}/dist/index.js',
            outFiles: ['${workspaceFolder}/dist/**/*.js']
          }
        ]
      };

      await fs.promises.writeFile(launchConfigPath, JSON.stringify(launchConfigData, null, 2));
      console.log(`Updated launch.json with launch configuration in ${launchConfigPath}`);
    }
  } catch (error) {
    console.error(`Error updating package.json: ${error}`);
  }
}



function createDebugScript(debugValue, port, configBasePath, certsBasePath) {
  const debugScript = `PORT=${port} CONFIGBASEPATH=${configBasePath} CERTSBASEPATH=${certsBasePath}`;

  return debugValue === 'y' ? `${debugScript} ${debugValue}` : debugScript;
}

function updateDebugScript(existingScript, debugValue, port, configBasePath, certsBasePath) {
  const updatedScript = `PORT=${port} CONFIGBASEPATH=${configBasePath} CERTSBASEPATH=${certsBasePath}`;

  if (debugValue === 'y') {
    return `${updatedScript} ${debugValue}`;
  } else {
    // Replace only the PORT, CONFIGBASEPATH, and CERTSBASEPATH values
    const regex = /(PORT=\d+)|(CONFIGBASEPATH=[^ ]+)|(CERTSBASEPATH=[^ ]+)/g;
    return existingScript.replace(regex, updatedScript);
  }
}

async function startMicroservices() {
  for (const microservice of microservices) {
    const { path, port, debugValue, hasBuild } = microservice;

    console.log(`Starting microservice at ${path} on port ${port}`);

    try {
      if (hasBuild) {
        if (debugValue === 'y') {
          const debugCommand = `PORT=${port} CONFIGBASEPATH=${CONFIGBASEPATH} CERTBASEPATH=${CERTBASEPATH} ${debugValue}`;
          await startService(path, port, debugCommand);
        } else if (debugValue === 'N') {
          const packageJsonPath = `${path}/package.json`;
          const packageJsonData = await fs.promises.readFile(packageJsonPath, 'utf-8');
          const packageJson = JSON.parse(packageJsonData);

          if (packageJson.scripts && packageJson.scripts.start) {
            await startService(path, port, 'npm run start');
          } else {
            console.log(`No start script found in package.json for microservice at ${path}`);
          }
        } else {
          await startService(path, port);
        }
      } else {
        console.log(`Build not completed for microservice at ${path}. Skipping start.`);
      }
    } catch (error) {
      console.error(`Error starting microservice at ${path}: ${error}`);
    }
  }
}


async function promptInput() {
  prompt.get(['repoUrl', 'port', 'debugValue'], async (err, result) => {
    if (err) {
      console.error(err);
      return;
    }

    const { repoUrl, port, debugValue } = result;

    if (repoUrl.toLowerCase() === 'done') {
      startMicroservices();
      return;
    }

    const repoName = repoUrl.split('/').pop().replace('.git', '');
    const servicePath = `./${repoName}`;

    const repositoryExists = await checkRepositoryExists(servicePath);

    if (repositoryExists) {
      console.log(`Repository ${repoUrl} already exists in the current directory. Please enter a different repoUrl.`);
      promptInput();
      return;
    }

    const portExists = microservices.some((microservice) => microservice.port === port);

    if (portExists) {
      console.log(`Port ${port} is already assigned to another microservice. Please enter a different port number.`);
      promptInput();
      return;
    }

    // Set default values for CONFIGBASEPATH and CERTBASEPATH based on full paths of existing directories
    const configBasePath = fs.existsSync('./config') ? path.resolve('./config') : '';
    const certsBasePath = fs.existsSync('./nodecerts') ? path.resolve('./nodecerts') : '';

    try {
      await cloneRepository(repoUrl);
      console.log(`Cloned repository ${repoUrl}`);

      await installDependencies(servicePath);
      console.log(`Installed dependencies for ${repoName}`);

      await runBuildScript(servicePath);
      console.log(`Built microservice ${repoName}`);

      await addDebugScript(servicePath, debugValue, port, configBasePath, certsBasePath);
      console.log(`Added debug script to package.json with value "${debugValue}"`);

      microservices.push({ path: servicePath, port: port, debugValue: debugValue });
      console.log(`Added microservice ${repoName} on port ${port}`);

      promptInput();
    } catch (error) {
      console.error(`Error setting up microservice: ${error}`);
    }
  });
}




// Start the application
console.log('Microservice Setup');

// Initialize the prompt
prompt.start();

// Start the input prompt
promptInput();
