const prompt = require('prompt');
const { cloneRepository, installDependencies, startService } = require('./utils');
const { exec } = require('child_process');
const fs = require('fs');
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
    const { path, port, debugValue } = microservice;

    console.log(`Starting microservice at ${path} on port ${port}`);

    try {
      await startService(path, port, debugValue);
    } catch (error) {
      console.error(`Error starting microservice at ${path}: ${error}`);
    }
  }
}
async function promptInput() {
  prompt.get(['repoUrl', 'port', 'debugValue', 'CONFIGBASEPATH', 'CERTBASEPATH'], async (err, result) => {
    if (err) {
      console.error(err);
      return;
    }

    const { repoUrl, port, debugValue, CONFIGBASEPATH, CERTBASEPATH } = result;

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

    try {
      await cloneRepository(repoUrl);
      console.log(`Cloned repository ${repoUrl}`);

      await installDependencies(servicePath);
      console.log(`Installed dependencies for ${repoName}`);

      await runBuildScript(servicePath);
      console.log(`Built microservice ${repoName}`);

      await addDebugScript(servicePath, debugValue, port, CONFIGBASEPATH, CERTBASEPATH);
      console.log(`Added debug script to package.json with value "${debugValue}", CONFIGBASEPATH="${CONFIGBASEPATH}", and CERTBASEPATH="${CERTBASEPATH}"`);

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
