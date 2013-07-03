// Copyright 2013 Nicolas Garnier (nivco.las@gmail.com). All Rights Reserved.

// Namespace initialization.
var dmp = dmp || {};
dmp.url = dmp.url || {};

/**
 * Returns the value of the given URL parameter.
 *
 * @return{String} The value of the given URL parameter.
 */
dmp.url.getUrlParameter = function(name) {
  var params = location.search;
  var param = (RegExp(name + '=' + '(.+?)(&|$)').exec(params)||[,null])[1];
  return (param ? decodeURIComponent(param) : param);
};
 
/**
 * Returns the value of the given Hash parameter.
 *
 * @return{String} The value of the given Hash parameter.
 */
dmp.url.getHashParameter = function(name) {
  var hash = window.location.hash;
  hash = hash.indexOf("#") == 0 ? hash.substr(1) : hash;
  var param = (RegExp(name + '=' + '(.+?)(&|$)').exec(hash)||[,null])[1];
  return (param ? decodeURIComponent(param) : param);
};

/**
 * Extracts the File IDs from the State parameter and saves them locally.
 * 
 * @return{Array<String>} The File IDs extracted from the state Hash parameter.
 */
dmp.url.getFileIdsFromStateParam = function() {
  var stateParamObj = dmp.url.stringToObject(dmp.url.getHashParameter("state"));
  if (stateParamObj && stateParamObj.ids) {
    console.log("Extracted the file IDs: " + stateParamObj.ids);
    return stateParamObj.ids;
  } else {
    console.log("Extracted the file IDs: " + []);
    return [];
  }
};

/**
 * When a user gets redirect from Google Drive to an app using the Create
 * menu Google Drive will pass the ID of the user in the State parameter
 * which will be a serialized JSON object. This functions extracts and
 * returns the User ID from such state parameter.
 *
 * @return{String} The ID of the user or undefined if it wasn't found.
 */
dmp.url.stringToObject = function(state) {
  try {
    var stateObj = JSON.parse(state);
    return stateObj;
  } catch(e) {
    return undefined;
  }
}

/**
 * Updates the URL Hash portion so that it lists the file IDs and the User ID.
 */
dmp.url.makePrettyUrl = function() {
  var hashParams = [];
  if (dmp.fileIds.length > 0) {
    hashParams.push("fileIds=" + dmp.fileIds.join(','));
  }
  if (dmp.folderId) {
    hashParams.push("folderId=" + dmp.folderId);
  }
  if (dmp.auth.userId) {
    hashParams.push("userId=" + dmp.auth.userId);
  }
  var hashParamsString = hashParams.join('&');
  // Make sure we never get an empty Hash to avoid an IE crash on the page.
  if (!hashParamsString || hashParamsString == "") {
    hashParamsString = "empty";
  }
  window.location.hash = "#" + hashParamsString;
}