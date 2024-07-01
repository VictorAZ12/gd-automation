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

- The app should be easy to use: it should have a GUI, allow users to manipulate with buttons, and can be used anywhere - that is, a web application.
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
2. Testing deploy using Ashley's google account.
3. Testing deploy and handover to the supervisor.