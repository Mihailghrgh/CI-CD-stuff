const core = require("@actions/core");
const exec = require("@actions/exec");

async function run() {
  const baseBranch = core.getInput("base-branch");
  const targetBranch = core.getInput("target-branch");
  const githubToken = core.getInput("github-token");
  const workingDirectory = core.getInput("working-directory") || ".";
  const debugInput = core.getInput("debug") === "true";

  core.setSecret(githubToken);

  const validateBranchName = ({ branchName }) =>
    /^[a-zA-Z0-9_\-\.\/]+$/.test(branchName);

  const validateDirectoryName = ({ dirName }) =>
    /^[a-zA-Z0-9_\-\.\/]+$/.test(dirName);

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

  if (!validateDirectoryName({ dirName: workingDir })) {
    core.setFailed(
      "Invalid working directory name. Directory names can only contain characters, numbers, hyphens, underscores and forward slashes."
    );
    return;
  }

  core.info(`[js-deps-update] Base branch is: ${baseBranch}`);
  core.info(`[js-deps-update] Working Directory is: ${workingDirectory}`);

  await exec.exec("npm update", [], { cwd: workingDirectory });

  const gitStatus = await exec.getExecOutput("git status -s package.json", [], {
    cwd: workingDirectory,
  });

  if (gitStatus.stdout.length > 0) {
    core.info(
      "[js-deps-update] ==> Changes detected in package.json, there are updates available!"
    );

    await exec.exec("git config user.name 'GitHub Actions'");
    await exec.exec("git config user.email ");
  } else {
    core.info("[js-deps-update] ==> No updates at this time!");
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
  core.info("Starting the js-deps-update action ///");
}

run();
