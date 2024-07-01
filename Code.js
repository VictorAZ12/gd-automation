function retrieveFolders(){
  let folders = DriveApp.getFolders();
  while (folders.hasNext()) {
    let folder = folders.next();
    Logger.log(folder.getName());
    console.log(folder.getName());
  }
}