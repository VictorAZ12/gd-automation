# Google Drive Folder Dupe Management Tool

<a name="top"></a>

[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENCE)

<a name="overview"></a>

# Overview
Folders on Google Drive can contain subfolders, files, and have folder-level access control if they are shared. A folder with an organised hierarchy may be reused by duplicating it. However, when a folder is duplicated, all subfolders the files contained in these folders, and the access to these files and folders are duplicated as well. Using a template folder could be a good idea to scaffold folder hierarchy. Nevertheless, the user may want to remove files within some folders and revoke access to some files and folders. This Google Apps Script project allows the user to:
* select a folder stored in the user's Google Drive
* duplicate the selected folder with a new name
* remove all files within its subfolders (only keep subfolders and their original name) and all access to the shared folders except for the user himself/herself
* additionally, the user can select which subfolders can keep the files, which folders can maintain the access.

* The app should be easy to use: it should have a nice-looking GUI (implemented in an HTML file), with some aesthetic design with boostrap (or other frontend CSS module), allow users to manipulate with buttons, and can be used anywhere - that is, a web application.


- This web application should require no individual server. That is: it should utilise google cloud service, like Google Apps Script, or Google Cloud Project, or Google Workspace, or a combination of them.
# Description
This program is developed during the developer's internship at Path of Hope Foundation.

## Test Folders
- GD-Automation-Test-Folder
  - Permission-Remove-Folder
  - Keep-File-Folder
  - Test File 1

## Expected outcome
- All folder's permission should be removed, including the root directory. Only owner access is preserved.
- All files are removed, except the files in Keep-File-Folder
## Chosen technology
Google Apps Script: Light weight (do not need a google cloud project), free to use, easy to be deployed with google account, server-less.

## References
[Download project, manage project in linux using clasp](https://developers.google.com/apps-script/guides/clasp#download_a_script_project)

## Development Steps
1. Develop and deploy using Yanchen (Victor) Zhao's google account.
    1. Fetch a list of folders, select a folder to duplicate, with all content copied.
2. Testing deploy using Ashley's google account.
3. Testing deploy and handover to the supervisor.

## Stages
### Stage 1
Create a Google Apps Script and an associated HTML page to allow user to select a folder from all folders. This page should simulate the google drive's behaviour in the following way:
- Start with root folder, display all folders
- When click on a folder, it is selected. When a selected folder is clicked again, it's navigated into.
- When a folder is navigated into. the page should show the subfolders instead
- Provide a button, to navigate to the parent folder, the page should show the subfolders in its parent folders instead, unless it's the root folder.
- Display text of the directory path
- Provide a button, so that the user confirms the selection.
The HTML page should utilise bootstrap framework to make it look good.
### Stage 2
The user can then select the subfolders within the selected folder to choose to maintain files stored in them. 
- The user can only navigate up to the selected folder
- **IMPORTANT: add server-side verification, do not duplicate folders outside the selected folder.**
- The use can click on an add button to select folders.
### Stage 3
The user can view response from the apps script service. Also, the developer should be able to see more information from the logger.
- User should be able to click on the reset to refresh the page and clear all selections.
- User
- Programming running logs should be friendly for developers
- Program file structures should follow the [best practice](https://developers.google.com/apps-script/guides/html/best-practices).
