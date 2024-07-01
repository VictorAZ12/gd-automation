function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Folder Management App')
      .setWidth(600)
      .setHeight(400);
}

function getFolders() {
  var folders = DriveApp.getFolders();
  var folderList = [];
  
  while (folders.hasNext()) {
    var folder = folders.next();
    folderList.push({
      id: folder.getId(),
      name: folder.getName()
    });
  }
  
  return folderList;
}

function duplicateFolder(folderId, newFolderName, keepFilesFolders, maintainAccessFolders) {
  var originalFolder = DriveApp.getFolderById(folderId);
  var newFolder = originalFolder.copy(newFolderName);
  clearFolder(newFolder, keepFilesFolders, maintainAccessFolders);
  
  return newFolder.getId();
}

function clearFolder(folder, keepFilesFolders, maintainAccessFolders) {
  var folders = folder.getFolders();
  
  while (folders.hasNext()) {
    var subFolder = folders.next();
    if (!keepFilesFolders.includes(subFolder.getId())) {
      var files = subFolder.getFiles();
      while (files.hasNext()) {
        var file = files.next();
        file.setTrashed(true);
      }
    }
    
    if (!maintainAccessFolders.includes(subFolder.getId())) {
      var editors = subFolder.getEditors();
      var viewers = subFolder.getViewers();
      
      for (var i = 0; i < editors.length; i++) {
        subFolder.removeEditor(editors[i].getEmail());
      }
      
      for (var j = 0; j < viewers.length; j++) {
        subFolder.removeViewer(viewers[j].getEmail());
      }
    }
  }
}
