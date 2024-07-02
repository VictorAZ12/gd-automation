function retrieveFolders(){
  // Retrieve all folders and display names
  let folders = DriveApp.getFolders();
  while (folders.hasNext()) {
    let folder = folders.next();
    Logger.log(folder.getName());
  }
}

function retrieveFoldersInRoot(){
  // Retrieve folders within the root folder only, display names
  let rootFolder = DriveApp.getRootFolder();
  Logger.log("Root folder id: " + rootFolder.getId());
  let folders = rootFolder.getFolders();
  while (folders.hasNext()) {
    let folder = folders.next();
    Logger.log(folder.getName() + ", id: " + folder.getId());
  }
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
  Logger.log("Folder copied.")

}

function copy(fromFolder, toFolder) {
  // copy files, inspired by KenjiOhtsuka code retrieved from https://gist.github.com/KenjiOhtsuka/d4432b6d80ad2b81ab7c965de2a8a00d
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
  let toID = "1-Xr9vO_kKBOB0DzizRXLjMW0TYclN25f";
  let fromFolder = DriveApp.getFolderById(fromID);
  let toFolder = DriveApp.getFolderById(toID);
  Logger.log(fromFolder.getName());
  // copy editors
  let fromFolderEditors = fromFolder.getEditors();
  Logger.log(fromFolderEditors);
  for (let i = 0; i < fromFolderEditors.length; i++){
    Logger.log(fromFolderEditors[i].getName());
    toFolder.addEditor(fromFolderEditors[i]);

  }
  // copy commentors

  
}