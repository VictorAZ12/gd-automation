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
  let copyFolderResult = {
    id: null,
    hasError: false,
    logs: [],
  }
  let fromFolder;
  let toFolder;
  try {
    fromFolder = DriveApp.getFolderById(fromId);
    toFolder = DriveApp.getFolderById(toId);
  }
  catch (err){
    copyFolderResult.logs.push("Error: Folder to be duplicated or its parent folder is lost.");
    copyFolderResult.hasError = true;
    return copyFolderResult;
  }

  // check if a copy already exists
  try {
    let toFolderSubfolders = toFolder.getFolders();
    while(toFolderSubfolders.hasNext()){
      let subfolder = toFolderSubfolders.next();
      if (subfolder.getName() === newFolderName){
        Logger.log("Folder %s already exists in the target folder, cannot copy folder.", subfolder.getName());
        throw new Error(`Folder ${subfolder.getName()} already exists in the target folder, cannot copy folder.`);
      }
    }
  }
  catch (err){
    copyFolderResult.logs.push(err.message);
    copyFolderResult.hasError = true;
    return copyFolderResult;
  }
  

  // create a folder and perform recursive copying
  let createdFolder;
  try {
     createdFolder = toFolder.createFolder(newFolderName);
     Logger.log("Folder %s (id: %s) has been created, subfolders and files to be copied into this folder.", createdFolder.getName(), createdFolder.getId());
     copyFolderResult.logs.push(`Folder ${createdFolder.getName()} created.`);
  }
  catch(err) {
    Logger.log("Error: Cannot create folder %s.", newFolderName);
    copyFolderResult.logs.push(`Error: Cannot create folder ${newFolderName}`);
    copyFolderResult.hasError = true;
    return copyFolderResult;
  }
  
  
  try {
    copy(fromFolder, createdFolder, false, keepFileFolders);
    copyFolderResult.hasError = false;
  }
  catch(err) {
    Logger.log("Error: something went wrong when copying the folders and files.");
    copyFolderResult.logs.push("Error: something went wrong when copying the folders and files");
    copyFolderResult.hasError = true;
    return copyFolderResult;
  }
  
  Logger.log("Folder copied as %s (id: %s).", getFolderPathString(createdFolder.getId()), createdFolder.getId());
  copyFolderResult.logs.push(`Folder copied as ${getFolderPathString(createdFolder.getId())}.`);
  copyFolderResult.id = createdFolder.getId();
  return copyFolderResult;

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
  let response = {
    "success": false,
    "createdFolderId": null,
    "createdFolderPath": null,
    "logs" : []
  };
  // fetch the folder to be duplicated
  let duplicateFolder;
  let targetFolder;
  
  try {
     duplicateFolder = DriveApp.getFolderById(data.duplicateFolder.id);
     
  }
  catch (err) {
    response.logs.push("Something went wrong.");
    response.logs.push("Error: The folder to be duplicated may have been moved or deleted.");
    return JSON.stringify(response);
  }
  // choose the target folder
  try {
    targetFolder = duplicateFolder.getParents().next();
  }
  catch (err) {
    response.logs.push("Something went wrong.");
    response.logs.push("Error: The folder to be duplicated has no parent folder. Cannot duplicate the root folder Drive App!");
    return JSON.stringify(response);
  }

  // copy folders and files
  let createdFolderId;
  
  let dulicateFolderSplit = data.duplicateFolder.path.split("/");
  let newFolderName = "[copy]" + dulicateFolderSplit[dulicateFolderSplit.length-1];
  let copyFolderResult = copyFolderRec(duplicateFolder.getId(), targetFolder.getId(), newFolderName, data.keepFileFolders);
  
  if (copyFolderResult.hasError){
    response.logs.push("Something went wrong.");
    response.logs.push("Error: Folder duplication not completed.");
    response.logs.push("Runtime:");
    response.logs = response.logs.concat(copyFolderResult.logs);
    return JSON.stringify(response);
  }
  else{
    createdFolderId = copyFolderResult.id;
    response.logs = response.logs.concat(copyFolderResult.logs);
  }
  
  // 3. copy access to the new folders based on keepAccessFolders
  if (createdFolderId){
    try {
      let duplicateFolderPathString = getFolderPathString(duplicateFolder.getId());
      let createdFolderPathString = getFolderPathString(createdFolderId);
      Logger.log("Duplicate folder path string: %s, folder to copy access to path string: %s", duplicateFolderPathString, createdFolderPathString);
      response.logs.push(`Duplicate folder path string: ${duplicateFolderPathString}, folder to copy access to path string: ${createdFolderPathString}`);
      copyAccessRec(duplicateFolder.getId(), createdFolderId, duplicateFolderPathString, createdFolderPathString, data.keepAccessFolders);
    }
    catch (err) {
      response.logs.push("Error: access copy not completed.");
      response.logs.push(err.message);
      return JSON.stringify(response);
    }
  }
  else {
    response.logs.push("Error: folder is not created.")
    return JSON.stringify(response);
  }
  Logger.log("All work done.");
  response.success = true;
  response.logs.push("All work done.");
  // Logger.log(JSON.parse(data));

  return JSON.stringify(response);
}
function test(){
  try{
    throw Error("Error something");
  }
  catch(err){
    Logger.log(err.name + " : " + err.message);
  }
  
}


