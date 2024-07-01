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
  let folders = rootFolder.getFolders();
  while (folders.hasNext()) {
    let folder = folders.next();
    Logger.log(folder.getName());
  }
}