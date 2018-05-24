var valb = 1;

document.getElementById('join-room').onclick = function() {
  if (document.getElementById('room-password').value.length == 0 ||  document.getElementById(
      'room-id').value.length == 0) {
    alert('Please enter required details');
    return;
  }
  disableInputButtons();
  document.getElementById('share-file').style.display = "inline";
  document.getElementById('input-text-chat').style.display = "inline";
  
      document.getElementById('chat-output').style.display = "inline";
      document.getElementById('file-container').style.display = "inline";
  connection.openOrJoin(document.getElementById('room-id').value, document.getElementById(
    'room-password').value);
  showRoomURL(document.getElementById('room-id').value);
};



// ......................................................
// ................FileSharing/TextChat Code.............
// ......................................................
document.getElementById('share-file').onclick = function() {
  var fileSelector = new FileSelector();
  fileSelector.selectSingleFile(function(file) {
    connection.send(file);
  });
};
document.getElementById('input-text-chat').onkeyup = function(e) {
  if (e.keyCode != 13) return;
  // removing trailing/leading whitespace
  this.value = this.value.replace(/^\s+|\s+$/g, '');
  if (!this.value.length) return;
  connection.send(this.value);
  appendDIV(this.value);
  this.value = '';
};
var chatContainer = document.querySelector('.chat-output');

chatContainer.style.height = "200px";

function appendDIV(event) {
  var div = document.createElement('div');
  if (valb == 1) {
  	div.style.backgroundColor = "#E0E0E0"
    valb = 0;
  } else if (valb == 0) {
  	valb = 1;
  }
  
  div.innerHTML = event.data || event;
  chatContainer.insertBefore(div, chatContainer.firstChild);
  div.tabIndex = 0;
  div.focus();
  document.getElementById('input-text-chat').focus();
}

// ......................................................
// ..................RTCMultiConnection Code.............
// ......................................................

var connection = new RTCMultiConnection();
connection.enableFileSharing = true;


// comment-out below line if you do not have your own socket.io server
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

connection.socketMessageEvent = 'password-protected-rooms';

connection.session = {
  audio: true,
  video: true,
  data: true
};

connection.sdpConstraints.mandatory = {
  OfferToReceiveAudio: true,
  OfferToReceiveVideo: true
};

connection.onJoinWithPassword = function(remoteUserId) {
  var password = document.getElementById('room-password').value;
  connection.openOrJoin(remoteUserId, password);
};
connection.onInvalidPassword = function(remoteUserId, oldPassword) {
  alert(remoteUserId + ' is password protected. Your entered wrong password, Please enter valid pasword:');
  location.reload();
  
};
connection.onPasswordMaxTriesOver = function(remoteUserId) {
  alert(remoteUserId + ' is password protected. Your max password tries exceeded the limit.');
};

connection.onmessage = appendDIV;
connection.filesContainer = document.getElementById('file-container');

connection.filesContainer.style.height = "200px";



connection.videosContainer = document.getElementById('videos-container');
connection.onstream = function(event) {
  var width = parseInt(connection.videosContainer.clientWidth / 2) - 20;
  var mediaElement = getMediaElement(event.mediaElement, {
    title: event.userid,
    buttons: ['full-screen', 'mute-audio', 'volume-controls'],
    width: width,
    showOnMouseEnter: false
  });

  connection.videosContainer.appendChild(mediaElement);

  setTimeout(function() {
    mediaElement.media.play();
  }, 5000);

  mediaElement.id = event.streamid;

};





connection.onstreamended = function(event) {
  var mediaElement = document.getElementById(event.streamid);
  if (mediaElement) {
    mediaElement.parentNode.removeChild(mediaElement);
  }
};


function disableInputButtons() {
  document.getElementById('join-room').disabled = true;
  document.getElementById('room-id').disabled = true;
  document.getElementById('room-password').disabled = true;
  document.getElementById('join-room').style.display = "none";
}



// ......................................................
// ......................Handling Room-ID................
// ......................................................

function showRoomURL(roomid) {
  var roomQueryStringURL = '?roomid=' + roomid +'&password=' + document.getElementById('room-password').value;
  var html = 'Unique URL for your room:';
  html += '<a style="color: #E0E0E0; text-decoration: underline;" href="' + roomQueryStringURL + '" target="_blank">' + roomQueryStringURL + '</a>';
  var roomURLsDiv = document.getElementById('room-urls');
  roomURLsDiv.innerHTML = html;
  roomURLsDiv.style.display = 'inline';
  roomURLsDiv.style.color = 'white';
}
(function() {
                var params = {},
                    r = /([^&=]+)=?([^&]*)/g;
                function d(s) {
                    return decodeURIComponent(s.replace(/\+/g, ' '));
                }
                var match, search = window.location.search;
                while (match = r.exec(search.substring(1)))
                    params[d(match[1])] = d(match[2]);
                window.params = params;
            })();
            var roomid = '';
            if (localStorage.getItem(connection.socketMessageEvent)) {
                roomid = localStorage.getItem(connection.socketMessageEvent);
            } else {
                //roomid = connection.token();
            }
            document.getElementById('room-id').value = roomid;
            document.getElementById('room-id').onkeyup = function() {
                localStorage.setItem(connection.socketMessageEvent, this.value);
            };
            var roomid = params.roomid;
            var password = params.password;
            if(roomid && roomid.length && password && password.length) {
                document.getElementById('room-id').value = roomid;
                localStorage.setItem(connection.socketMessageEvent, roomid);
                document.getElementById('room-password').value = password;
                // auto-join-room
                (function reCheckRoomPresence() {
                    connection.checkPresence(roomid, function(isRoomExists) {
                        if(isRoomExists) {
                            connection.join(roomid,password);
                            return;
                        }
                        setTimeout(reCheckRoomPresence, 5000);
                    });
                })();
                disableInputButtons();}
