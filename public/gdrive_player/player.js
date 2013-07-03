var drivePlayer = drivePlayer || {};
var allSongs;

(function () {
    drivePlayer = {
//        playerInstance:chrome.extension.getBackgroundPage().playerInstance,
        googleAuthInstance:{},

        initialize:function () {
            this.googleAuth();
            this.eventBinding();
            this.createPlaylist();
            this.insertFile(JSON.stringify(allSongs));

        },
        googleAuth:function (callback) {
            this.googleAuthInstance = new OAuth2('google', {
                client_id:'202097118859.apps.googleusercontent.com',
                client_secret:'q7095ulZC-AdlUH7BafSZBE9',
                api_scope:'https://www.googleapis.com/auth/drive'
            });
            this.googleAuthInstance.authorize(callback);
        },

        createPlaylist:function () {
            $.get("https://www.googleapis.com/drive/v2/files?access_token=" + this.googleAuthInstance.getAccessToken(), function (data) {
                var playlistContainer = $("#playlist tbody");
                console.log(data);

                var songs = [];
                // iterate and find the mp3 files
                for (var i = 0, count = 1; i < data.items.length; ++i) {
                    if (data.items[i].fileExtension === "mp3") {
                        var rowHtml =
                            "<tr data-link='" + data.items[i].webContentLink + "'>" +
                                "<td>" + String(count++) + "</td>" +
                                "<td>" + data.items[i].title + "</td>" +
                                "<td><button>share</button></td>";
                        playlistContainer.append(rowHtml);

                        //also add to the songs collection
                        var song = new Object();
                        song.id = data.items[i].id;
                        song.title = data.items[i].title;
                        song.url = data.items[i].webContentLink;

                        songs.push(song);
                    }
                }

                allSongs = songs;
                console.log(allSongs);
            });
        },

        eventBinding:function () {
            var that = this;
            $('#playlist tbody').on('click', 'tr td:first', function () {
                var fileLink = $(this).parent().attr('data-link');
                that.playerInstance.setSrc(fileLink);
                that.playerInstance.play();
            });

            $('#playlist button').on('click', function () {

                console.log('share clicked');
                this.insertFile(allSongs);

            });
        },

        insertFile:function(fileData, callback) {

            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            var reader = new FileReader();
            reader.readAsBinaryString(fileData);
            reader.onload = function(e) {
                var contentType = fileData.type || 'application/octet-stream';
                var metadata = {
                    'title': "playlist",
                    'mimeType': contentType
                };

                var base64Data = btoa(reader.result);
                var multipartRequestBody =
                    delimiter +
                        'Content-Type: application/json\r\n\r\n' +
                        JSON.stringify(metadata) +
                        delimiter +
                        'Content-Type: ' + contentType + '\r\n' +
                        'Content-Transfer-Encoding: base64\r\n' +
                        '\r\n' +
                        base64Data +
                        close_delim;

                var request = gapi.client.request({
                    'path': '/upload/drive/v2/files',
                    'method': 'POST',
                    'params': {'uploadType': 'multipart'},
                    'headers': {
                        'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                    },
                    'body': multipartRequestBody});
                if (!callback) {
                    callback = function(file) {
                        console.log(file)
                    };
                }
                request.execute(callback);
            }
        }

    };
})();


$(document).ready(function () {
    drivePlayer.initialize();
});


/* Information Backup
 var CLIENT_ID = '359878478762.apps.googleusercontent.com';
 var SCOPES = [
 'https://www.googleapis.com/auth/drive',
 'https://www.googleapis.com/auth/userinfo.email',
 'https://www.googleapis.com/auth/userinfo.profile'
 ];
 */
