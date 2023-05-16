# GitHub Collaboration Guide for Teams

This comprehensive guide outlines the collaboration process and best practices for teams using GitHub. By following this guide, we'll ensure a smooth and efficient workflow for our team.

## Table of Contents

1. [Branching Strategy](#branching-strategy)
2. [Workflow Steps](#workflow-steps)
3. [Commit Guidelines](#commit-guidelines)
4. [Pull Request Best Practices](#pull-request-best-practices)
5. [Handling Conflicts](#handling-conflicts)

<a name="branching-strategy"></a>

## Branching Strategy

Our team follows a simple and effective branching strategy consisting of two main branches, `main` and `dev`, along with short-lived feature branches.

- `main`: The stable, production-ready branch. Only the authorized team member can merge changes into this branch.
- `dev`: The active development branch where all new features and bug fixes are merged. Developers create `short-lived branches` based on `Zoho Sprint` and submit pull requests to merge back into it.

## Workflow Steps

1. **Sync your local repository**: Make sure your local repository is up-to-date with the remote `dev` branch.
   ```bash
   # Switch to dev branch
   git switch dev
   # Update local repo with  any changes from remote repo
   git pull
   ```
2. **Create a short-lived branch**: Start working on a new feature or bugfix by creating a new branch based on `dev`. Use a descriptive name prefixed with either `feat`, `bugfix`, `hotfix` and `refactor`. Example name: `feat-<short_description_of_feature>#<ID of Zoho User Story or Task>` =>
   `feat-payment-gateway#CCP-I12`
   ```bash
   # Create branch, make sure you are currently in dev branch
   git branch your-short-lived-branch
   # Switch to branch
   git switch your-short-lived-branch
   ```
3. **Commit your changes**: Implement your changes and commit them to your `short-lived branch`. Follow the [Commit Guidelines](#commit-guidelines) for writing clear and descriptive commit messages.
4. **Keep your branch up to date**: Regularly update your `short-lived branch` with the latest changes from dev to minimize conflicts.
   ```bash
   # You are currently in short-lived branch
   git fetch
   git merge origin/dev
   ```
5. **Push your branch**: Push your `short-lived branch` to the remote repository.
   ```bash
   # Push to upstream
   git push -u origin your-short-lived-branch
   ```
6. **Create a pull request**: Once your changes are ready for review, create a `pull request` from Github repo.
   - Click the <span style="color:#90EE90">Pull requests</span> tab
   - In the "Pull Requests" page, click the green <span style="color:#90EE90">New pull request</span> button.
   - In the <span style="color:#90EE90">Compare changes</span> page, you'll see two dropdown menus labeled `base <repo>` and `head/compare <repo>`. Select `dev` as `base <repo>` and your `short-lived branch` as `compare <repo>`.
   - After selecting the correct branches, GitHub will show you the differences between the two branches. Review the changes to make sure they are correct.
   - If everything looks good, click the green <span style="color:#90EE90">Create pull request</span> button.
   - In the <span style="color:#90EE90">Open a pull request</span> page, give your pull request a clear and descriptive `title`, add `labels` and provide any relevant information in the comment section, such as a summary of the changes or links to related issues. Example of the title : `feature - preliminary architecture (CCP-I7) ` , with labels : `documentation`, `enhancement`, `graphql`, `tests`, `dependencies`, `configuration` and `database`
   - When you're ready, click the green <span style="color:#90EE90">Create pull request</span> button to submit your pull request.
   - Your pull request is now open, and the authorized team member of the project can review your changes, provide feedback, or approve and merge the changes
7. **Address review feedback**: Respond to feedback on your pull request and make any necessary changes. Push your updates to the `short-lived branch`, which will automatically update the `pull request`. Mark any conversations as `resolved` when appropriate.
8. **Merge**: After the pull request is reviewed and approved, the authorized team member will merge the changes into the `dev` branch.
9. **Pull request to `main`**: Authorized team member will create a pull request from `dev` to `main` when the changes are ready for production deployment.

<a name="commit-guidelines"></a>

## Commit Guidelines

- Write clear, concise, and descriptive commit messages that provide context for the changes.
- Use the imperative mood ("Add feature" instead of "Added feature").
- Limit the `first line` of the commit message to `50 characters or fewer`.
- If needed, provide a more detailed description `after a blank line`.

Add all untracked files to staging:

```bash
git add .
```

Example of a good commit message:

```bash
Add user authentication with JWT

- Implement JWT-based authentication in the API
- Add login and registration endpoints
- Update user model with new fields
```

Example to write in command line:

```bash
git commit -m "Add user authentication with JWT" -m "- Implement JWT-based authentication in the API" -m "- Add login and registration endpoints" -m "- Update user model with new fields"
```

This command uses multiple `-m` flags to create a commit message with separate lines for the title and the description. The first `-m` flag is for the main commit message, and each subsequent `-m` flag creates a new line in the description.

<a name="pull-request-best-practices"></a>

## Pull Request Best Practices

- Write a clear and descriptive title that summarizes the purpose of the pull request.
- Provide a detailed description in the body of the pull request, outlining the changes made, the problem you address, and any potential side effects or limitations.
- Add any relevant labels, such as:
  - `enhancement`: For changes that introduce new features, capabilities, or improvements to the existing codebase. These changes extend the functionality or performance of the system without altering the core behavior.
  - `graphql`: For changes specifically related to the GraphQL API, including schema updates, resolvers, or mutations.
  - `bug`: For changes that address issues or errors in the existing code, such as incorrect behavior, unexpected results, or crashes. These changes fix the problem and restore the intended functionality.
  - `hotfix`: For urgent bug fixes that need to be deployed as soon as possible.
  - `documentation`: For changes related to the documentation of the project, such as updating existing documentation, creating new documentation, or improving the clarity and organization of the documentation
  - `security`: For changes addressing security issues or improvements.
  - `performance`: For changes focused on improving the performance or efficiency of the API.
  - `refactor`: For changes that restructure the code without altering functionality.
  - `tests`: For changes related to testing, including adding, updating, or fixing tests.
  - `dependencies`: For changes involving updates or modifications to external dependencies.
  - `breaking`: For changes that introduce breaking changes or require updates to client applications.
  - `configuration`: For changes related to configuration settings or environment variables.
  - `aws`: For changes involving AWS services or resources
  - `database`: For changes related to the database layer, including migrations, schema modifications, or optimizations.
  - `authentication`: For changes involving authentication or authorization, such as updates to JWT handling, access control, or user management.
  - `monitoring`: For changes related to monitoring, logging, or observability, such as adding CloudWatch metrics or log entries.
  - `deployment`: For changes affecting the deployment process or infrastructure, including updates to CI/CD pipelines, Dockerfiles, or environment configurations.
  - `scaling`: For changes related to scalability, such as updates to auto-scaling groups, load balancing, or caching strategies.
- You can apply `multiple labels` to a pull request in GitHub
- If the pull request resolves an issue, reference the issue number using `#<issue-number>` in the description.
- Request reviews from authorized team members.

<a name="handling-conflicts"></a>

## Handling Conflicts

Conflicts may arise when multiple developers are working on the same files or sections of code. Follow these steps to resolve conflicts:

1. Update your local `dev` branch with the latest changes from the remote repository.
   ```bash
   git switch dev
   git pull
   ```
2. Switch to your `short-lived branch` and merge the updated `dev` branch into it.

```bash
git switch your-short-lived-branch
git merge dev
```

3. Git will notify you of any conflicts. Open the affected files and look for conflict markers (`<<<<<<<`, `=======`, and `>>>>>>>`). Resolve the conflicts by choosing the appropriate changes or manually editing the code.

   - Suppose you are merging a short-lived branch called `feature_branch` into the `dev` branch, and you encounter a conflict in a file named `example.txt`. Git might display the conflict markers in `example.txt` like this:

   ```txt
   Some non-conflicting text...

   <<<<<<< HEAD
   This is the change made in the dev branch.
   =======
   This is the change made in the feature_branch.
   >>>>>>> feature_branch

   Some more non-conflicting text...

   ```

   - `<<<<<<< HEAD`: This marker indicates the beginning of the conflicting section in the current branch (usually the branch you are merging into, also known as the `HEAD` branch)
   - `=======`: This marker separates the conflicting changes between the two branches being merged.
   - `>>>>>>> feature_branch`: This marker indicates the end of the conflicting section in the branch you are merging from

4. After resolving the conflicts, commit the changes and push your updated short-lived branch to the remote repository.
