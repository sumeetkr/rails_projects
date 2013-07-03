// Copyright 2013 Nicolas Garnier (nivco.las@gmail.com). All Rights Reserved.

// Namespace initialization.
var dmp = dmp || {};

/** The IDs of the Files opened in the playlist. */
dmp.fileIds = [];

/** The ID of the file currently playing. */
dmp.playingFileId = undefined;

/** The ID of the folder which was opened from the Drive UI. */
dmp.folderId = undefined;

/** The Label of the folder which was opened from the Drive UI. */
dmp.folderLabel = undefined;

/**
 * First initiates authorization and then starts the audio player.
 */
dmp.init = function() {
  if (!dmp.ui.detectFlash()) {
    return;
  }
  // First make sure we are authorized to access the Drive API.
  dmp.auth.initAuth(function() {
    // Extracting all the file IDs to play.
    dmp.fileIds = dmp.url.getFileIdsFromStateParam();
    // Makes a pretty URL from the current playlist.
    dmp.url.makePrettyUrl();
    // Hide/show the empty playlist message depending songs are selected.
    dmp.ui.toggleEmptyPlaylist();
    // Builds a picker object.
    dmp.ui.buildPicker();
    // Create an entry for each songs.
    dmp.ui.createSongEntries();
    // Now we can initialize the Player and play some audio files.
    dmp.player.initPlayer();
  });
};
