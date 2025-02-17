function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index');
}

function retrieveFolders(){
  // Retrieve all folders and display names
  let folders = DriveApp.getFolders();
  while (folders.hasNext()) {
    let folder = folders.next();
    Logger.log("Folder: %s, id %s",folder.getName(), folder.getId());
  }
}

function getFoldersInFolder(folderId) {
  // if given a folderId, retrieve the given folder, otherwise root folder is used
  // return a list of folder in JSON {id, name}
  let folder;
  if (folderId) {
    folder = DriveApp.getFolderById(folderId);
  } else {
    folder = DriveApp.getRootFolder();
  }

  let folders = folder.getFolders();
  let folderList = [];

  while (folders.hasNext()) {
    let subFolder = folders.next();
    folderList.push({
      id: subFolder.getId(),
      name: subFolder.getName()
    });
  }
  return JSON.stringify(folderList);
}

function getFolderPath(folderId) {
  // get a folder's path structure using its foldervID
  let path = [];
  let folder;
  if (folderId) {
    folder = DriveApp.getFolderById(folderId);
  }
  else {
    folder = DriveApp.getRootFolder();
  }
  
  while (folder) {
    path.unshift({
      id: folder.getId(),
      name: folder.getName()
    });

    let parents = folder.getParents();
    if (parents.hasNext()) {
      folder = parents.next();
    }
    else {
      folder = null;
    }
  }
  // Logger.log(JSON.stringify(path));
  return JSON.stringify(path);
  
}

function getFolderPathString(folderId){
  return JSON.parse(getFolderPath(folderId)).map(folder => folder.name).join("/");
}


function copyFolderRec(fromId, toId, newFolderName, keepFileFolders){
  // Copy all subfolders and files stored in a folder with id, copy access
  
  let fromFolder = DriveApp.getFolderById(fromId);
  let toFolder = DriveApp.getFolderById(toId);
  // check if name is valid
  let toFolderSubfolders = toFolder.getFolders();
  while(toFolderSubfolders.hasNext()){
    let subfolder = toFolderSubfolders.next();
    if (subfolder.getName() === newFolderName){
      Logger.log("Folder already exists in the target folder! Cannot copy folder.");
      return;
    }
  }
  let createdFolder = toFolder.createFolder(newFolderName);
  Logger.log(keepFileFolders);
  copy(fromFolder, createdFolder, false, keepFileFolders);
  Logger.log("Folder copied. Folder ID: %s", createdFolder.getId());
  return createdFolder.getId();

}

function copy(fromFolder, toFolder, isCopyFile, keepFileFolders) {
  // copy files and folders recursively from a folder into another folder
  // inspired by KenjiOhtsuka code retrieved from https://gist.github.com/KenjiOhtsuka/d4432b6d80ad2b81ab7c965de2a8a00d

  if (isCopyFile){
    let files = fromFolder.getFiles()
    while (files.hasNext()) {
      let file = files.next();
      let newFile = file.makeCopy(toFolder);
      newFile.setName(file.getName());
    }
  }
  // copy folders
  let folders = fromFolder.getFolders();
  while (folders.hasNext()) {
    let folder = folders.next();
    let newFolder = toFolder.createFolder(folder.getName());
    isCopyFile = false;
    for (let i=0; i<keepFileFolders.length; i++) {
      if (folder.getId() === keepFileFolders[i].id) {
        isCopyFile = true;
        Logger.log("The folder %s will have its file copid", folder.getName());
        break;
      }
    }
    copy(folder, newFolder, isCopyFile, keepFileFolders);
  }
}

function copyAccessRec(fromId, toId, duplicateFolderPathString, createdFolderPathString, keepAccessFolders) {
  // copy access based on the copyAccessFolders array
  // get keepAccessFolder's path string
  
  let fromFolder = DriveApp.getFolderById(fromId);
  let toFolder = DriveApp.getFolderById(toId);
  // copy folder access
  let fromSubfolders = fromFolder.getFolders();

  while (fromSubfolders.hasNext()) {
    let folder = fromSubfolders.next();
    let folderRelPathString = getFolderPathString(folder.getId()).replace(duplicateFolderPathString, '');
    let toSubfolders = toFolder.getFolders();
    while (toSubfolders.hasNext()){
      let toSubfolder = toSubfolders.next();
      let toFolderRelPathString = getFolderPathString(toSubfolder.getId()).replace(createdFolderPathString, '');
      if (folderRelPathString === toFolderRelPathString) {
        for (let i=0; i<keepAccessFolders.length; i++){
          if (folder.getId() === keepAccessFolders[i].id) {
            copyAccess(folder.getId(), toSubfolder.getId());
            break;
          }
        }
        copyAccessRec(folder.getId(), toSubfolder.getId(), duplicateFolderPathString, createdFolderPathString, keepAccessFolders);
        break;
      }
    }
  }

}

function copyAccess(fromId, toId) {
  // get the access of the fromFolder, copy that to the toFolder
  let fromFolder = DriveApp.getFolderById(fromId);
  let toFolder = DriveApp.getFolderById(toId);
  Logger.log("Copying access from %s to %s...", fromFolder.getName(), toFolder.getName());
  // copy editors
  let fromFolderEditors = fromFolder.getEditors();
  for (let i = 0; i < fromFolderEditors.length; i++){
    toFolder.addEditor(fromFolderEditors[i]);
    Logger.log("Editor: %s (%s) is added.", fromFolderEditors[i].getName(), fromFolderEditors[i].getEmail());

  }
  // copy viewers (cannot differentiate commenter, technology limitation)
  let fromFolderViewers = fromFolder.getViewers();
  for (let i = 0; i < fromFolderViewers.length; i++){
    toFolder.addViewer(fromFolderViewers[i]);
    Logger.log("Viewer: %s (%s) is added.", fromFolderViewers[i].getName(), fromFolderViewers[i].getEmail());
  }
  Logger.log("Access copy completed.")
}

function handleSubmission(data){
  // data: {
  //   "duplicateFolder": {
  //     "id": id of the folder to be duplicated,
  //       "path": path of the folder to be duplicated,
  //       },
  //   "keepFileFolders": [
  //     {
  //       "id": id of the folder to keep files,
  //       "path": path of the folder to keep files,
  //     }
  //   ],
  // "keepAccessFolders": [
  //     {
  //       "id": id of the folder to keep files,
  //       "path": path of the folder to keep access,
  //     }
  //   ],
  // }
  data = JSON.parse(data);
  // 1. duplicate folder structure: duplicate the "duplicateFolder", in the same level of this folder and name it "copy of <duplicateFolder's name>"
  let duplicateFolder = DriveApp.getFolderById(data.duplicateFolder.id);
  let targetFolder = duplicateFolder.getParents().next();
  let dulicateFolderSplit = data.duplicateFolder.path.split("/");
  let newFolderName = "[copy]" + dulicateFolderSplit[dulicateFolderSplit.length-1];
  // copy folders and files
  let createdFolderId = copyFolderRec(duplicateFolder.getId(), targetFolder.getId(), newFolderName, data.keepFileFolders);
  // 3. copy access to the new folders based on keepAccessFolders
  let duplicateFolderPathString = getFolderPathString(duplicateFolder.getId());
  let createdFolderPathString = getFolderPathString(createdFolderId);
  Logger.log("Duplicate folder path string: %s, folder to copy access to path string: %s", duplicateFolderPathString, createdFolderPathString);
  copyAccessRec(duplicateFolder.getId(), createdFolderId, duplicateFolderPathString, createdFolderPathString, data.keepAccessFolders);
  // Logger.log(JSON.parse(data));
  return createdFolderId;
  
}


