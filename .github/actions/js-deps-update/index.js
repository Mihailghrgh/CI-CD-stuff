const core = require("@actions/core");
const exec = require("@actions/exec");
const github = require("@actions/github");

const validateBranchName = ({ branchName }) =>
  /^[a-zA-Z0-9_\-\.\/]+$/.test(branchName);

const validateDirectoryName = ({ dirName }) =>
  /^[a-zA-Z0-9_\-\.\/]+$/.test(dirName);

const setupLogger = ({ debug, prefix } = { debug: false, prefix: "" }) => ({
  debug: (message) => {
    if (debug) {
      core.debug(message);
    }
  },
  info: (message) => {
    core.info(`${prefix}${prefix ? " : " : ""}${message}`);
  },
  warn: (message) => {
    core.error(`${prefix}${prefix ? " : " : ""}${message}`);
  },
});

async function run() {
  const baseBranch = core.getInput("base-branch", { required: true });
  const targetBranch = core.getInput("target-branch", { required: true });
  const githubToken = core.getInput("github-token", { required: true });
  const workingDirectory = core.getInput("working-directory", {
    required: true,
  });
  const debug = core.getInput("debug");
  const logger = setupLogger({ debug, prefix: "[js-deps-update]" });

  const commonExecOptions = { cwd: workingDirectory };

  core.setSecret(githubToken);

  logger.debug(
    "validate inputs = base-branch, target-branch, working-directory"
  );

  if (!validateBranchName({ branchName: baseBranch })) {
    core.setFailed(
      "Invalid branch Name. Branch names can only contain characters, numbers, hyphens, underscores and forward slashes."
    );
    return;
  }

  if (!validateBranchName({ branchName: targetBranch })) {
    core.setFailed(
      "Invalid target branch Name. Branch names can only contain characters, numbers, hyphens, underscores and forward slashes."
    );
    return;
  }

  if (!validateDirectoryName({ dirName: workingDirectory })) {
    core.setFailed(
      "Invalid working directory name. Directory names can only contain characters, numbers, hyphens, underscores and forward slashes."
    );
    return;
  }

  // Debug log for Inputs
  logger.debug(`Base branch is ${baseBranch}`);
  logger.debug(`Target branch is ${targetBranch}`);
  logger.debug(`Working directory is ${workingDirectory}`);

  core.info(`[js-deps-update] ===> Base branch is: ${baseBranch}`);
  core.info(`[js-deps-update] ===> Working Directory is: ${workingDirectory}`);

  await exec.exec("npm update", [], { ...commonExecOptions });

  const gitStatus = await exec.getExecOutput(
    "git status -s package.json package-lock.json",
    [],
    {
      ...commonExecOptions,
    }
  );

  if (gitStatus.stdout.length > 0) {
    // Just for debugging purposes
    logger.debug(
      "[js-deps-update] ==> Changes detected in package.json, there are updates available!"
    );
    // Just for debugging purposes
    core.info(
      "[js-deps-update] ==> Changes detected in package.json, there are updates available!"
    );

    await exec.exec(`git config --global user.name "Mihail" `, [], {
      ...commonExecOptions,
    });
    await exec.exec(
      `git config --global user.email "mihailghrgh@gmail.com" `,
      [],
      { ...commonExecOptions }
    );

    await exec.e

  
    await exec.exec(`git checkout -b ${targetBranch}`, [], {
      ...commonExecOptions,
    });
    await exec.exec(`git add package.json package-lock.json`, [], {
      ...commonExecOptions,
    });

    await exec.exec(
      `git commit -m "Updated npm dependencies for ${baseBranch}"`,
      [],
      {
        ...commonExecOptions,
      }
    );

    await exec.exec(`git push -u origin ${targetBranch} --force`, [], {
      ...commonExecOptions,
    });

    const octokit = github.getOctokit(githubToken);

    try {
      await octokit.rest.pulls.create({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        title: `Update npm dependencies`,
        body: `This pull request updated npm packages in the \`package.json\` file.`,
        base: baseBranch,
        head: targetBranch,
      });
    } catch (error) {
      core.warning(`Error creating pull request: ${error.message}`, `${error}`);
      core.setFailed(`Failed to create pull request: ${error.message}`);
    }

    /*
    This actions is used to update the npm dependencies in the package.json Yay

    1. base branch for, which to check for updates and parsing Inputs
    
    2. target-branch to use to create the PR

    3. Github token to use for authentication (to authorize PR creation)

    4. Working directory of which to update the dependencies updates

    5.Check if there are modified updates ,IF THERE ARE modified files create a PR request using the target branch.

    6. Create a PR to base-branch using the octokit API

    6. Otherwise , conclude the custom action
    */
  } else {
    core.info(
      "[js-deps-update] ===> No changes detected in package.json, no updates available."
    );
  }
}

run();
