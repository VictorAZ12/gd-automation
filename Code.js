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
  Logger.log(JSON.stringify(path));
  return JSON.stringify(path);
  
}


function copyFolderRec(from, to, name){
  // Copy all subfolders and files stored in a folder with id, copy access
  let fromID = "1KDw_2XUzR72Wdad2RJJXkS3SajzDc-bW";
  let toID = "0AOWuBqGTrL__Uk9PVA";
  let newFolderName = "copy-test";
  let fromFolder = DriveApp.getFolderById(fromID);
  let toFolder = DriveApp.getFolderById(toID);
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
  copy(fromFolder, createdFolder);
  Logger.log("Folder copied. Folder ID: %s", createdFolder.getId());

}

function copy(fromFolder, toFolder) {
  // copy files recursively, inspired by KenjiOhtsuka code retrieved from https://gist.github.com/KenjiOhtsuka/d4432b6d80ad2b81ab7c965de2a8a00d
  let files = fromFolder.getFiles()
  while (files.hasNext()) {
    let file = files.next();
    let newFile = file.makeCopy(toFolder)
    newFile.setName(file.getName())
  }

  // copy folders
  let folders = fromFolder.getFolders()
  while (folders.hasNext()) {
    let folder = folders.next()
    let newFolder = toFolder.createFolder(folder.getName())
    copy(folder, newFolder)
  }
}

function addEditorsFolder(editors, targetFolderID) {
  // add a grouop of editors to a folder using the folder's ID
  let targetFolder = DriveApp.getFolderById("1wBiwaiaQTrkERDVckl7Ky8WbA3Cbh4x6");
  const editorEmails = ["23428364@student.uwa.edu.au"];
  targetFolder.addEditors(editorEmails);
}

function copyAccess(fromFolderId, toFolderId) {
  // get the access of the fromFolder, copy that to the toFolder
  let fromID = "1KDw_2XUzR72Wdad2RJJXkS3SajzDc-bW";
  let toID = "15MsMq4oeDY5RqvhhC7hnFAlLJh0Pr8_-";
  let fromFolder = DriveApp.getFolderById(fromID);
  let toFolder = DriveApp.getFolderById(toID);
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



