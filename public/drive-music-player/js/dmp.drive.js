// Copyright 2013 Nicolas Garnier (nivco.las@gmail.com). All Rights Reserved.

// Namespace initialization.
var dmp = dmp || {};
dmp.drive = dmp.drive || {};

/** MIME-Type for folders in Drive. */
dmp.drive.FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

/**
 * Fetches the URL of the file of the given File Id. Then calls the
 * callback.
 *
 * @param{String} fileId The ID of the file from which to find the song.
 * @param{function} callback The callback function that will be called
 *    when the file URL has been fetched. This function should have 1
 *    parameter which will be the file's URL or an error object if
 *    something went wrong. The second argument is the file name.
 * @param{int} retryCounter OPTIONAL. Number of times this function call has
 *    been retried previously call.
 */
dmp.drive.getFileUrl = function(fileId, callback, retryCounter) {
  gapi.client.load('drive', 'v2', function() {
    var accessTokenObj = new Object();
    accessTokenObj.access_token = dmp.auth.accessToken;
    accessTokenObj.token_type = "Bearer";
    accessTokenObj.expires_in = "3600";
    gapi.auth.setToken(accessTokenObj);
    gapi.client.drive.files.get({'fileId': fileId}).execute(function(resp){
      // We got an error object back so we can check it out.
      if (resp && resp.error) {
        console.log("Error while fetching the file's metadata: "
            + resp.error.message)
        // If the issue is that auth has expired we refresh and retry.
        if (resp.error.code == 401
            && resp.error.data[0].reason == "authError"
            && (retryCounter ? retryCounter == 0 : true)) {
          dmp.auth.autoRefreshAuth(function() {
            dmp.drive.getFileUrl(fileId, callback, 1);
          });
        // For any other errors we retry once.
        } else if (!retryCounter || retryCounter == 0) {
          dmp.drive.getFileUrl(fileId, callback, 1);
        // For any other errors and we already retried we call the callback.
        } else {
          callback(null, null, resp.error, null, false);
        }
      // We have a good response
      } else if (resp && resp.title) {
        console.log("Got the File's URL: " + resp.downloadUrl);
        var authedCallbackUrl = resp.downloadUrl + "&access_token="
            + encodeURIComponent(dmp.auth.accessToken);
        console.log("File's URL w/ auth: " + authedCallbackUrl);
        callback(authedCallbackUrl, resp.title, null, resp.fileExtension, resp.mimeType == dmp.drive.FOLDER_MIME_TYPE);
      // The return object has no title, maybe it;s an error so we retry.
      } else if (!retryCounter || retryCounter == 0){
        dmp.drive.getFileUrl(fileId, callback, 1);
      // We already retried so we simply call the callback with an error.
      } else {
        callback(null, null, {}, null, false);
      }
    });
  });
}
