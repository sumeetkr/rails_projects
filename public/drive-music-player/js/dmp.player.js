// Copyright 2013 Nicolas Garnier (nivco.las@gmail.com). All Rights Reserved.

// Namespace initialization.
var dmp = dmp || {};
dmp.player = dmp.player || {};

/** The IDs of the Files opened in the playlist. */
dmp.fileIds = [];

/** The ID of the file currently playing. */
dmp.playingFileId = undefined;

/**
 * Initializes the Player and starts playing if there is a song.
 */
dmp.player.initPlayer = function(){
  // Initialize the Player.
  $("#jqueryPlayerContainer").jPlayer({
      ended: dmp.player.playNext,
      swfPath: "/js",
      errorAlerts: false,
      solution:"flash,html",
      supplied: "mp3,m4a,wav,oga,webma,fla",
      ready: function() {
        // Start playing if we have songs.
        if (dmp.fileIds.length > 0) {
          dmp.player.playNext();
        }
        // Removing the hider.
        $("#hider").hide();
      }    
  });
};

/**
 * Depends on looping settings finds the ID of the next song to play and
 * plays it.
 */
dmp.player.playNext = function() {
  var playingIndex = dmp.playingFileId ?
      dmp.fileIds.indexOf(dmp.playingFileId) : -1;
  // If we are not looping on the same song we find the next song's ID.
  if ($(".jp-repeat").is(":visible")) {
    // We take the next song's ID or we go back to the start of the list.
    playingIndex = playingIndex == dmp.fileIds.length - 1 ?
        0 : playingIndex + 1;
    console.log("Next song index is: " + playingIndex);
  }
  var nextSongId = dmp.fileIds[playingIndex];
  if (nextSongId) {
    console.log("Now playing song ID: " + nextSongId);
    dmp.player.playFile(nextSongId);
  } else {
    dmp.playingFileId = null;
  }
}

/**
 * Plays the song of the given ID.
 */
dmp.player.playFile = function(fileId) {
  dmp.playingFileId = fileId;
  dmp.drive.getFileUrl(fileId,
      function(fileUrl, fileName, error, fileExtension) {
        if (error) {
          dmp.player.playNext();
        } else {
          $(".playing").removeClass("playing");
          $("#file-" + fileId).addClass("playing");
          var setMediaValue = {};
          setMediaValue[fileExtension] = fileUrl;
          $("#jqueryPlayerContainer").jPlayer("setMedia", setMediaValue).jPlayer("play");
        }
      }
  );
};
