const { ipcMain, dialog, remote } = require( "electron" ),
      { E_BROWSE_DIRECTORY, E_DIRECTORY_SELECTED, E_RUN_TESTS,
        E_TEST_REPORTED, E_WATCH_FILE_NAVIGATOR, E_BROWSE_FILE, E_FILE_SELECTED,
        E_INSTALL_RUNTIME_TEST, E_SHOW_CONFIRM_DIALOG, E_CONFIRM_DIALOG_VALUE,
        E_GIT_INIT, E_GIT_COMMIT, E_GIT_SET_REMOTE, E_RENDERER_ERROR, E_RENDERER_INFO,
        E_GIT_PUSH, E_GIT_PULL, E_GIT_LOG, E_GIT_LOG_RESPONSE,
        E_GIT_CHECKOUT, E_GIT_REVERT, E_GIT_CHECKOUT_RESPONSE, E_GIT_REVERT_RESPONSE
      } = require( "../constant" ),
      watchFiles = require( "./file-watcher" ),
      { installRuntimeTest } = require( "./install-runtime-test" ),
      runTests = require( "./test-runner" ),
      gitApi = require( "./git-api" );


ipcMain.on( E_SHOW_CONFIRM_DIALOG, async ( event, runtimeTestDirectory ) => {
   const res = dialog.showMessageBox( {
        type: "warning",
        buttons: [ "Save", "Ignore" ],
        title: "Unsaved changes",
        message: "You have unsaved changes in the open suite"
    });
   event.sender.send( E_CONFIRM_DIALOG_VALUE, res );
});



ipcMain.on( E_BROWSE_DIRECTORY, ( event ) => {
  dialog.showOpenDialog({
    properties: [ "openDirectory", "createDirectory" ]
  }, ( directories ) => {
    event.sender.send( E_DIRECTORY_SELECTED, directories ? directories[ 0 ] : "" );
  });
});

ipcMain.on( E_INSTALL_RUNTIME_TEST, async ( event, runtimeTestDirectory ) => {
  try {
    installRuntimeTest( event, runtimeTestDirectory );
  } catch ( err ) {

  }
});


ipcMain.on( E_RUN_TESTS, async ( event, cwd, targetFiles ) => {
  try {
    event.returnValue = await runTests( cwd, targetFiles );
    console.log( "\n" );
  } catch ( err ) {
    event.returnValue = { results: `Error: ${ err.message }` };
  }
});


ipcMain.on( E_BROWSE_FILE, ( event, defaultPath ) => {
  dialog.showOpenDialog({
    defaultPath,
    properties: [ "openFile" ],
    filters: [
      { name: "Files" }
    ]
  }, ( files ) => {
    event.sender.send( E_FILE_SELECTED, files ? files[ 0 ] : "" );
  });
});

ipcMain.on( E_WATCH_FILE_NAVIGATOR, async ( event, projectDirectory ) => {
  watchFiles( event, projectDirectory );
});

ipcMain.on( E_GIT_INIT, async ( event, projectDirectory ) => {
  try {
    await gitApi.init( projectDirectory );
    event.sender.send( E_RENDERER_INFO, "Empty local Git repository created" );
  } catch ( err ) {
    event.sender.send( E_RENDERER_ERROR, `Cannot initialize local Git: ${ err.message }` );
  }
});

ipcMain.on( E_GIT_COMMIT, async ( event, message, projectDirectory, username, email ) => {
  try {
    const sha = await gitApi.commit( message, projectDirectory, username, email );
    event.sender.send( E_RENDERER_INFO, `New commit ${ sha } created` );
  } catch ( err ) {
    event.sender.send( E_RENDERER_ERROR, `Cannot commit changes: ${ err.message }` );
  }
});

ipcMain.on( E_GIT_SET_REMOTE, async ( event, remoteRepository, projectDirectory, credentials  ) => {
  try {
    await gitApi.setRemote( remoteRepository, projectDirectory, credentials  );
    event.sender.send( E_RENDERER_INFO, `New remote repository is set successfully` );
  } catch ( err ) {
    event.sender.send( E_RENDERER_ERROR, `Cannot set remote repository: ${ err.message }` );
  }
});

ipcMain.on( E_GIT_PULL, async ( event, projectDirectory, credentials  ) => {
  try {
    await gitApi.pull( projectDirectory, credentials  );
    event.sender.send( E_RENDERER_INFO, `Changes pulled from remote repository successfully` );
  } catch ( err ) {
    event.sender.send( E_RENDERER_ERROR, `Cannot pull from remote repository: ${ err.message }` );
  }
});

ipcMain.on( E_GIT_PUSH, async ( event, projectDirectory, credentials  ) => {
  try {
    await gitApi.push( projectDirectory, credentials  );
    event.sender.send( E_RENDERER_INFO, `Changes pushed to remote repository successfully` );
  } catch ( err ) {
    event.sender.send( E_RENDERER_ERROR, `Cannot push to remote repository: ${ err.message }` );
  }
});

ipcMain.on( E_GIT_LOG, async ( event, projectDirectory  ) => {
  try {
    event.sender.send( E_GIT_LOG_RESPONSE, await gitApi.log( projectDirectory ) );
  } catch ( err ) {
    event.sender.send( E_RENDERER_ERROR, `Cannot push to remote repository: ${ err.message }` );
  }
});

ipcMain.on( E_GIT_CHECKOUT, async ( event, projectDirectory, oid  ) => {
  try {
    await gitApi.checkout( projectDirectory, oid );
    event.sender.send( E_GIT_CHECKOUT_RESPONSE, oid );
    event.sender.send( E_RENDERER_INFO, `Index moved to project version ${ oid }` );
  } catch ( err ) {
    event.sender.send( E_RENDERER_ERROR, `Cannot push to remote repository: ${ err.message }` );
  }
});

ipcMain.on( E_GIT_REVERT, async ( event, projectDirectory, oid  ) => {
  try {
    await gitApi.checkout( projectDirectory, oid );
    event.sender.send( E_GIT_REVERT_RESPONSE, oid );
    event.sender.send( E_RENDERER_INFO, `Reverted to version ${ oid }` );
  } catch ( err ) {
    event.sender.send( E_RENDERER_ERROR, `Cannot push to remote repository: ${ err.message }` );
  }
});