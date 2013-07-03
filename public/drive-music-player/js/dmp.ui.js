// Copyright 2013 Nicolas Garnier (nivco.las@gmail.com). All Rights Reserved.

// Namespace initialization.
var dmp = dmp || {};
dmp.ui = dmp.ui || {};

/** The Google Picker Object. */
dmp.ui.picker = undefined;

/** The data URI of a loading image as a base64 Data URI. */
dmp.ui.LOADING_IMAGE_DATA_URI = "data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==";

/**
 * Creates the UI elements for each song with title of song inside the
 * @code{#fileContainer} table.
 */
dmp.ui.createSongEntries = function() {
  for (index in dmp.fileIds) {
    if (dmp.fileIds[index]) {
      dmp.ui.createSongEntry(dmp.fileIds[index]);
    }
  }
  // Makes the song's UI elements sortable by dragging them.
  $("#fileContainer tbody").sortable({
    helper : 'clone',
    update: dmp.ui.createSongListFromDom
  }).disableSelection();
};

/**
 * Creates the list of Songs from the DOM elements inside the
 * @code{#fileContainer} table.
 * 
 * @param{Event} event The event from jQuery UI Sortable event.
 * @param{Object} ui An object containing the sorted element.
 */
dmp.ui.createSongListFromDom = function(event, ui) {
  dmp.fileIds = [];
  ui.item.parent().children().each(function(index, elem) {
    var fileId = $(elem).attr('id').split('file-');
    if(fileId.length == 2) {
      dmp.fileIds[index-1] = fileId[1];
    }
    dmp.url.makePrettyUrl();
  });
};

/**
 * Creates a new File Entry in the playlist.
 * 
 * @param{String} fileId The ID of the file to create a UI entry for.
 */
dmp.ui.createSongEntry = function(fileId) {
  // Create the empty container with loading icon for the file.
  var entryContainer = $("<tr>").attr('id','file-' + fileId).addClass('song').click(function(){dmp.player.playFile(fileId);});
  var loadingImg = $('<img>').attr('src', dmp.ui.LOADING_IMAGE_DATA_URI).css("margin-right", "10px");
  var playindicatorContainer = $('<td>').addClass('playindicator');
  var artistContainer = $('<td>').addClass('artist').text("Loading info...").prepend(loadingImg);
  var titleContainer = $('<td>').addClass('title');
  var removeButton = $('<td>').addClass('remove').text("✕").click(function(e){
    // Removing the Entry from the list of songs.
    entryContainer.remove();
    // If this is the last song we stop the player.
    if (dmp.fileIds.length == 1) {
      $("#jqueryPlayerContainer").jPlayer("clearMedia");
    // If this is the currently playing song we move to the next one.
    } else if (dmp.playingFileId == fileId) {
      dmp.player.playNext();
    }
    dmp.fileIds.splice(dmp.fileIds.indexOf(fileId), 1);
    dmp.ui.toggleEmptyPlaylist();
    dmp.url.makePrettyUrl();
    e.stopPropagation();
  });
  entryContainer.append(playindicatorContainer).append(artistContainer).append(titleContainer).append(removeButton);
  $('#fileContainer tbody').append(entryContainer);
  
  // Start fetching the file's URL and title so we can extract ID3 tags.
  dmp.drive.getFileUrl(fileId, function(fileUrl, fileName, error, fileExtension, isFolder){
    // If the file is a folder and not a song.
    if (isFolder) {
      $("#file-" + fileId).remove();
      var folderIdIndex = dmp.fileIds.indexOf(fileId);
      dmp.fileIds.splice(folderIdIndex, 1);
      dmp.folderId = fileId;
      dmp.folderLabel = fileName;
      dmp.url.makePrettyUrl();
      dmp.ui.buildPicker(true);
      dmp.ui.picker.setVisible(true);
      dmp.ui.toggleEmptyPlaylist();
    } else {
      if (error && error.code == 404) {
        $(".artist", $("#file-" + fileId))
            .text("You are not authorized to read this file or the file does not exists.")
            .addClass("error").attr("colspan", "2");
        $(".title", $("#file-" + fileId)).remove();
      } else if (error) {
        $(".artist", $("#file-" + fileId))
            .text("There was an error reading the file: " + error.message)
            .addClass("error").attr("colspan", "2");
        $(".title", $("#file-" + fileId)).remove();
      } else if (fileUrl) {
        dmp.ui.displayID3Tags(fileId, fileUrl, fileName);
      }
    }
  });
}

/**
 * Builds a new picker using the current auth token. You should re-launch this
 * function every time the auth changes to re-create a newly authorized picker.
 * The new picker will be accessible at @code{dmp.ui.picker}.
 */
dmp.ui.buildPicker = function() {

  // Search Songs in Drive View.
  var view = new google.picker.DocsView();
  view.setLabel? view.setLabel("🔍\u00A0Search\u00A0Audio\u00A0Files") : (view.Wd ? view.Wd("🔍\u00A0Search\u00A0Audio\u00A0Files") : null);
  view.setMimeTypes("audio/mpeg,audio/mp4,audio/mpg,audio/mp4a-latm,audio/ogg,audio/webm,audio/wav,audio/x-wav,audio/wave");

  // Picker allowing users to browse folders.
  var view2 = new google.picker.DocsView();
  view2.setLabel? view2.setLabel("📂\u00A0My\u00A0Drive") : (view2.Wd ? view2.Wd("📂\u00A0My\u00A0Drive") : null);
  view2.setIncludeFolders(true);
  view2.setParent("root");
  view2.setMimeTypes("audio/mpeg,audio/mp4,audio/mpg,audio/mp4a-latm,audio/ogg,audio/webm,audio/wav,audio/x-wav,audio/wave");

  // Recently selected items view.
  var view3 = new google.picker.View(google.picker.ViewId.RECENTLY_PICKED);

  var newPickerBuilder = new google.picker.PickerBuilder()

  // If user opened from a folder, display it.
  if (dmp.folderId) {
    var customFolderView = new google.picker.DocsView();
    customFolderView.setLabel? customFolderView.setLabel("📂\u00A0" + dmp.folderLabel.replace(/ /g, "\u00A0")) : (customFolderView.Wd ? customFolderView.Wd("📂\u00A0" + dmp.folderLabel.replace(/ /g, "\u00A0")) : null);
    customFolderView.setIncludeFolders(true);
    customFolderView.setParent(dmp.folderId);
    customFolderView.setMimeTypes("audio/mpeg,audio/mp4,audio/mpg,audio/mp4a-latm,audio/ogg,audio/webm,audio/wav,audio/x-wav,audio/wave");
    newPickerBuilder.addView(customFolderView);
  }
  
  var newPicker = newPickerBuilder.enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
    .setAppId(dmp.auth.APPLICATION_ID)
    .setOAuthToken(dmp.auth.accessToken)
    .addView(view)
    .addView(view2)
    //.addView(view3) // Disabling until this is fixed. Not working with .setOAuthToken
    .setTitle("Select audio files in Google Drive")
    .setCallback(dmp.ui.pickerCallback).build();
  newPicker.setVisible(true);
  newPicker.setVisible(false);
  dmp.ui.picker = newPicker;
}

/**
 * Called when the user has selected songs using the picker. We add these songs
 * to the playlist.
 */
dmp.ui.pickerCallback = function(data) {
  if (data.action == google.picker.Action.PICKED) {
    var numberOfSongsBefore = dmp.fileIds.length;
    for (var index in data.docs) {
      // If the song is not already in the playlist we add it.
      if (data.docs[index].id
          && dmp.fileIds.indexOf(data.docs[index].id) == -1) {
        dmp.ui.createSongEntry(data.docs[index].id);
        dmp.fileIds.push(data.docs[index].id);
        dmp.ui.toggleEmptyPlaylist();
        dmp.url.makePrettyUrl();
      }
    }
    // If there was no song before and we added some we start playing the first
    // one automatically.
    if(numberOfSongsBefore == 0 && data.docs.length > 0) {
      dmp.player.playNext();
    }
  }
}

/**
 * Hides or Shows the message showing an empty playlist depending if the
 * playlist is empty or not.
 */
dmp.ui.toggleEmptyPlaylist = function() {
  if (dmp.fileIds.length > 0) {
    $("#empty").hide();
  } else {
    $("#empty").show();
  }
}

/**
 * Fetches and displays the ID3 tags for the given song. Also tries to
 * subsequently fetch the album cover using the LastFm API.
 * 
 * @param{String} fileId The ID of the file.
 * @param{String} fileUrl The URL where the file content is.
 * @param{String} fileName The name of the file.
 */
dmp.ui.displayID3Tags = function(fileId, fileUrl, fileName) {
  console.log("Trying to look at ID3 tags for: " + fileName);
  ID3.loadTags(fileUrl, function(){
      var tags = ID3.getAllTags(fileUrl);
      if(tags && tags.artist && tags.title) {
        $(".artist", $("#file-" + fileId)).text(tags.artist);
        $(".title", $("#file-" + fileId)).text(tags.title);
        // If we extracted the picture from the ID3 tags we use it otherwise we try to get it in the lastfm API.
        if (tags.picture) {
          $("#file-" + fileId).css("background-image", "url(data:" + (tags.mimetype ? tags.mimetype : "") + ";base64," + tags.picture + ")");
        } else {
          dmp.lastfm.getAlbumCover(tags.title, tags.artist, function(albumUrl) {
            if (albumUrl) {
              $("#file-" + fileId).css("background-image", "url(" + albumUrl + ")");
            }
          });
        }
      } else {
        $(".artist", $("#file-" + fileId)).text(fileName).addClass("noID3tags").attr("colspan", "2");
        $(".title", $("#file-" + fileId)).remove();
      }
  });
};

/**
 * Displays a message if the user does not have flash installed.
 * 
 * @returns{boolean} True if the browser has flash installed.
 */
dmp.ui.detectFlash = function() {
  var hasFlash = swfobject.hasFlashPlayerVersion("1");
  if (!hasFlash) {
    $('#flashAlert').show();
  }
  return hasFlash;
}
