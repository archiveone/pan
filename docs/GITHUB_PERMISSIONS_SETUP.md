# GitHub Permissions Setup Guide

## Issue: Unable to Create Pull Requests

If you're encountering the error "Resource not accessible by integration" when trying to create pull requests, this means the GitHub integration doesn't have sufficient permissions.

## Where to Fix GitHub Permissions

### 1. GitHub Repository Settings
1. Go to your repository: https://github.com/archiveone/pan
2. Click on **Settings** tab
3. In the left sidebar, click on **Actions** → **General**
4. Scroll down to **Workflow permissions**
5. Select **Read and write permissions**
6. Check **Allow GitHub Actions to create and approve pull requests**
7. Click **Save**

### 2. GitHub App/Integration Permissions
If you're using a GitHub App or integration (like Pipedream):

1. Go to **GitHub Settings** → **Developer settings** → **GitHub Apps**
2. Find your app and click **Edit**
3. Under **Permissions**, ensure these are set to **Read & write**:
   - Contents
   - Pull requests
   - Metadata
   - Issues (if needed)
4. Click **Save changes**

### 3. Personal Access Token (if applicable)
If using a Personal Access Token:

1. Go to **GitHub Settings** → **Developer settings** → **Personal access tokens**
2. Click on your token or create a new one
3. Ensure these scopes are selected:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
   - `write:packages` (if needed)
4. Click **Update token** or **Generate token**

### 4. Organization Settings (if repository is in an organization)
1. Go to your organization settings
2. Click **Third-party access**
3. Find your app/integration and ensure it has the necessary permissions
4. If using GitHub Apps, go to **GitHub Apps** and configure permissions there

## Alternative: Direct Push to Main Branch

If you cannot create pull requests, you can:
1. Push directly to the main branch (current approach)
2. Create branches manually and merge later
3. Use GitHub's web interface to create pull requests

## Testing Permissions

To test if permissions are working:
1. Try creating a simple file via the GitHub API
2. Attempt to create a branch
3. Try creating a pull request

## Current Status

✅ **File Creation/Updates**: Working (can push to main branch)
❌ **Pull Request Creation**: Not working (insufficient permissions)

## Next Steps

1. Follow the permission setup steps above
2. Test pull request creation again
3. If still not working, check with repository owner about access levels

---

*This guide was created to help resolve GitHub integration permission issues for the PAN marketplace development project.*