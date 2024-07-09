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

* acesss its features via a browser with a Google account

* set up the application by code sharing without installation or setup of other software
This program is developed during the developer's internship at Path of Hope Foundation.


# Chosen technology
Google Apps Script: Light weight (do not need a google cloud project), free to use, easy to be deployed with google account, server-less.

## Version control
The application is developed and tested on Google Apps Script browser editor for convenience. Version control is achieved by pulling the changes to a local git repository which is then synchorinised to GitHub.  
Clasp: [Download project, manage project in linux using clasp](https://developers.google.com/apps-script/guides/clasp#download_a_script_project)

## Development and testing
1. Develop and deploy using Yanchen (Victor) Zhao's google account.content copied.
2. Testing deploy using the teams's google account.
3. Testing deploy and handover to the supervisor.

## Devlopment Stages
### Stage 1
Create a Google Apps Script and an associated HTML page to allow user to select a folder from all folders. This page should simulate the google drive's behaviour in the following way:
- Start with root folder, display all folders
- When click on a folder, it is selected. When a selected folder is clicked again, it's navigated into.
- When a folder is navigated into. the page should show the subfolders instead
- Provide a button, to navigate to the parent folder, the page should show the subfolders in its parent folders instead, unless it's the root folder.
- Display text of the directory path
- Provide a button, so that the user confirms the selection.
- The HTML page can utilise a frontend framework to make it look good.

### Stage 2
The user can then select the subfolders within the selected folder to keep files and/or access. 
- The user can only navigate up to the selected folder.
- **IMPORTANT: add server-side verification, do not duplicate folders outside the selected folder.**
- The use can click on a checkbox to select folders.
- Selected folders should be shown as "selected": the checkbox should remain checked
### Stage 3
The user can view response from the apps script service. Also, the developer should be able to see more information from the logger.
- User should be able to click on the reset to refresh the page and clear all selections.
- User should be able to see human-friendly messages.
- Programming running logs should be friendly for developers
- Program file structures should follow the [best practice](https://developers.google.com/apps-script/guides/html/best-practices).
### Stage 4
The user can navigate to the created folder if processed successfully.
