function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index');
}

function getFolders() {
  var folders = DriveApp.getFolders();
  var folderList = [];
  
  while (folders.hasNext()) {
    var folder = folders.next();
    folderList.push({name: folder.getName(), id: folder.getId()});
  }
  
  return folderList;
}

function duplicateFolder(folderId, selectedFoldersToKeep, subfoldersToLimitAccess) {
  var sourceFolder = DriveApp.getFolderById(folderId);
  var destinationFolder = DriveApp.createFolder(sourceFolder.getName() + " - Copy");
  
  copyFolderContents(sourceFolder, destinationFolder, selectedFoldersToKeep, subfoldersToLimitAccess);
  
  return "Folder duplication complete!";
}

function copyFolderContents(source, destination, selectedFoldersToKeep, subfoldersToLimitAccess) {
  var folders = source.getFolders();
  var files = source.getFiles();
  
  while (files.hasNext()) {
    var file = files.next();
    if (selectedFoldersToKeep.includes(source.getId())) {
      destination.createFile(file);
    }
  }
  
  while (folders.hasNext()) {
    var folder = folders.next();
    var newFolder = destination.createFolder(folder.getName());
    
    if (subfoldersToLimitAccess.includes(folder.getId())) {
      var editors = folder.getEditors();
      for (var i = 0; i < editors.length; i++) {
        folder.removeEditor(editors[i]);
      }
    }
    
    copyFolderContents(folder, newFolder, selectedFoldersToKeep, subfoldersToLimitAccess);
  }
}
