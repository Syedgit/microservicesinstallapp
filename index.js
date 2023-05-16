const prompt = require('prompt');
const { cloneRepository, installDependencies, buildService, startService } = require('./utils');

const microservices = [];

function promptInput() {
  prompt.get(['repoUrl', 'port'], async function (err, result) {
    if (err) {
      console.error(err);
      return;
    }

    const { repoUrl, port } = result;

    if (repoUrl.toLowerCase() === 'done') {
      startMicroservices();
      return;
    }

    const repoName = repoUrl.split('/').pop().replace('.git', '');
    const servicePath = `./${repoName}`;

    try {
      const repositoryExists = await checkRepositoryExists(servicePath);

      if (repositoryExists) {
        console.log(`Repository ${repoUrl} already exists in the current directory. Skipping cloning.`);
      } else {
        await cloneRepository(repoUrl);
        console.log(`Cloned repository ${repoUrl}`);
      }

      await installDependencies(servicePath);
      console.log(`Installed dependencies for ${repoName}`);

      await runBuildScript(servicePath);
      console.log(`Built microservice ${repoName}`);

      microservices.push({ path: servicePath, port: port });
      console.log(`Added microservice ${repoName} on port ${port}`);

      promptInput();
    } catch (error) {
      console.error(`Error setting up microservice: ${error}`);
    }
  });
}

async function checkRepositoryExists(path) {
  const fs = require('fs');
  try {
    await fs.promises.access(path);
    return true;
  } catch (error) {
    return false;
  }
}

async function runBuildScript(path) {
  const packageJsonPath = `${path}/package.json`;
  const packageJson = require(packageJsonPath);

  if (packageJson.scripts && packageJson.scripts.build) {
    console.log(`Running build script for microservice at ${path}`);
    await buildService(path);
    console.log(`Build completed for microservice at ${path}`);
  }
}

async function startMicroservices() {
    for (const microservice of microservices) {
      try {
        const { path, port } = microservice;
        const packageJsonPath = `${path}/package.json`;
        const packageJson = require(packageJsonPath);
  
        let debugValue = packageJson.scripts && packageJson.scripts.debug ? packageJson.scripts.debug : '';
  
        if (debugValue) {
          console.log(`Debug script found for microservice at ${path}`);
          console.log(`Current debug value: ${debugValue}`);
  
          const { enableDebug } = await prompt.get(['enableDebug']);
          debugValue = enableDebug ? `$PORT=${port}` : '';
  
          console.log(`New debug value: ${debugValue}`);
        }
  
        // Modify package.json scripts.debug value
        if (debugValue) {
          packageJson.scripts = packageJson.scripts || {};
          packageJson.scripts.debug = debugValue;
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          console.log(`Updated debug value in package.json for microservice at ${path}`);
        }
  
        await startService(path, port);
        console.log(`Started microservice at ${path} on port ${port}`);
      } catch (error) {
        console.error(`Error starting microservice at ${microservice.path}: ${error}`);
      }
    }
  }
  

promptInput();
