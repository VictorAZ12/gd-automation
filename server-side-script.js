function doGet(request) {
  // initiate html service
  return HtmlService.createTemplateFromFile('Index')
      .evaluate();
}

function include(filename) {
  // include css and js into html template (printing scriptlets)
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

function retrieveFolders(){
  // retrieve all folders and display names
  let folders = DriveApp.getFolders();
  while (folders.hasNext()) {
    let folder = folders.next();
    Logger.log("Folder: %s, id %s",folder.getName(), folder.getId());
  }
}

function getFoldersInFolder(folderId) {
  // retrieve the given folder, otherwise root folder is used
  // return a list of folder in JSON: {[{id, name}, ...]}

  // get folder
  let folder;
  if (folderId) {
    folder = DriveApp.getFolderById(folderId);
  } else {
    folder = DriveApp.getRootFolder();
  }
  
  // get subfolders
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
  // get a folder's path structure using its id
  // return a list folder path in JSON {[{id, name}, ...]}
  // the first element should be the root folder "Drive App", the last element should be the 
  // given folder if it's not root

  // get folder
  let path = [];
  let folder;
  if (folderId) {
    folder = DriveApp.getFolderById(folderId);
  }
  else {
    folder = DriveApp.getRootFolder();
  }
  
  // get all parent folders
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
  return JSON.stringify(path);
  
}

function getFolderPathString(folderId){
  // construct a path string "Drive App/.../.../folder"
  return JSON.parse(getFolderPath(folderId)).map(folder => folder.name).join("/");
}


function copyFolderRec(fromId, toId, newFolderName, keepFileFolders){
  // copy all subfolders and files stored in a folder with id
  // this function creates a folder using newFolderName under the folder with toId
  // the newly created folder will be used to store copied subfolders and files
  // folders present in keepFileFolders will have their files copied, too
  
  let fromFolder = DriveApp.getFolderById(fromId);
  let toFolder = DriveApp.getFolderById(toId);

  // check if a copy already exists
  let toFolderSubfolders = toFolder.getFolders();
  while(toFolderSubfolders.hasNext()){
    let subfolder = toFolderSubfolders.next();
    if (subfolder.getName() === newFolderName){
      Logger.log("Folder %s already exists in the target folder, cannot copy folder.", subfolder.getName());
      return;
    }
  }

  // create a folder and perform recursive copying
  let createdFolder = toFolder.createFolder(newFolderName);
  Logger.log("Folder %s (id: %s) has been created, subfolders and files to be copied into this folder.", createdFolder.getName(), createdFolder.getId());
  copy(fromFolder, createdFolder, false, keepFileFolders);
  Logger.log("Folder copied as %s (id: %s).", getFolderPathString(createdFolder.getId()), createdFolder.getId());
  return createdFolder.getId();

}

function copy(fromFolder, toFolder, isCopyFile, keepFileFolders) {
  // copy files and folders recursively from a folder into another folder
  // inspired by KenjiOhtsuka code retrieved from https://gist.github.com/KenjiOhtsuka/d4432b6d80ad2b81ab7c965de2a8a00d

  // if isCopyFile is true, also copy the files in fromFolder into toFolder
  if (isCopyFile){
    let files = fromFolder.getFiles()
    while (files.hasNext()) {
      let file = files.next();
      let newFile = file.makeCopy(toFolder);
      newFile.setName(file.getName());
      Logger.log("    File %s is copied.", file.getName());
    }
  }
  // copy folders
  let folders = fromFolder.getFolders();
  while (folders.hasNext()) {
    let folder = folders.next();
    let newFolder = toFolder.createFolder(folder.getName());
    Logger.log("  Folder %s is created.", getFolderPathString(newFolder.getId()));
    // determine if the files should be copied
    isCopyFile = false;
    for (let i=0; i<keepFileFolders.length; i++) {
      if (folder.getId() === keepFileFolders[i].id) {
        isCopyFile = true;
        Logger.log("  The folder %s will have its file copid.", folder.getName());
        break;
      }
    }
    copy(folder, newFolder, isCopyFile, keepFileFolders);
  }
}

function copyAccessRec(fromId, toId, duplicateFolderPathString, createdFolderPathString, keepAccessFolders) {
  // copy access based on the copyAccessFolders array  
  let fromFolder = DriveApp.getFolderById(fromId);
  let toFolder = DriveApp.getFolderById(toId);

  // copy folder access
  let fromSubfolders = fromFolder.getFolders();
  while (fromSubfolders.hasNext()) {
    let folder = fromSubfolders.next();
    // copy access if in keepAccessFolders and has the same relative path
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
  Logger.log("  Copying access from %s to %s...", fromFolder.getName(), toFolder.getName());
  // copy editors
  let fromFolderEditors = fromFolder.getEditors();
  for (let i = 0; i < fromFolderEditors.length; i++){
    toFolder.addEditor(fromFolderEditors[i]);
    Logger.log("    Editor: %s (%s) is added.", fromFolderEditors[i].getName(), fromFolderEditors[i].getEmail());

  }
  // copy viewers (cannot differentiate commenter, technology limitation)
  let fromFolderViewers = fromFolder.getViewers();
  for (let i = 0; i < fromFolderViewers.length; i++){
    toFolder.addViewer(fromFolderViewers[i]);
    Logger.log("    Viewer: %s (%s) is added.", fromFolderViewers[i].getName(), fromFolderViewers[i].getEmail());
  }
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
  if (createdFolderId){
    let duplicateFolderPathString = getFolderPathString(duplicateFolder.getId());
    let createdFolderPathString = getFolderPathString(createdFolderId);
    Logger.log("Duplicate folder path string: %s, folder to copy access to path string: %s", duplicateFolderPathString, createdFolderPathString);
    copyAccessRec(duplicateFolder.getId(), createdFolderId, duplicateFolderPathString, createdFolderPathString, data.keepAccessFolders);
    Logger.log("All work done.");
    // Logger.log(JSON.parse(data));
    return createdFolderId;
  }
  else {
    return "Folder already exists!";
  }
  
  
}


