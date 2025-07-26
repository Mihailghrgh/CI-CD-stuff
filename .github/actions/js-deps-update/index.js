const core = require("@actions/core");

async function run() {
  /*
    This actions is used to update the npm dependencies in the package.json Yay

    1. base branch frp, which to check for updates

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
