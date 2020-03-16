/* eslint-disable import/extensions */
import Skylink, { SkylinkLogger, SkylinkEventManager, SkylinkConstants } from '../../../build/skylink.complete.js';
import config from '../config.js';

/********************************************************
 API Settings
 *********************************************************/
const Demo = window.Demo || {};
Demo.Peers = 0;
Demo.PeerIds = [];
Demo.Stats = {};
Demo.Methods = {};
Demo.Skylink = new Skylink(config);
Demo.ShowStats = {};
Demo._Skylink = Skylink;
window.Demo = Demo;
let selectedPeers = [];
let _peerId = null;

const { $, document } = window;

//----- join room options
const displayName = `name_user_${  Math.floor((Math.random() * 1000) + 1)}`;
const joinRoomOptions = {
  audio: false,
  video: false,
  userData: displayName,
};

//----- set logging -----
SkylinkLogger.setLevel(SkylinkLogger.logLevels.DEBUG, true);

Demo.Methods.toggleInRoomSettings = function(peerId, inRoom) {
  if (inRoom) {
    // Connection panel
    $('#display_user_name').html(joinRoomOptions.userData);
    $('#display_room_name').html(joinRoomOptions.roomName || config.defaultRoom);
    $('#display_user_id').html(peerId);

    $('#chat_settings_panel').show();
    $('#set_persistent_message').prop('checked', Demo.Skylink.getMessagePersistence(config.defaultRoom));

    $('#encrypt-secrets-panel').show();

    $('#join_room_panel').css("display", "none");
    $('#in_room_panel').css("display", "block");
  } else {
    $('#display_user_name').html('-');
    $('#display_room_name').html('-');

    $('#presence_list_body').empty();

    $('#chat_settings_panel').hide();
    $('#chat_log').empty();

    $('#encrypt-secrets-panel').hide();

    $('#join_room_panel').css("display", "block");
    $('#in_room_panel').css("display", "none");
  }
};

Demo.Methods.getTimestamp = function (timeStamp) {
  var timestamp = new Date(timeStamp);
  var dDate, Month, Year, Hours, Minutes, Seconds;
  if (timestamp.getDate() < 10)
    dDate = '0' + timestamp.getDate();
  else
    dDate = timestamp.getDate();
  if (timestamp.getMonth() < 10)
    Month = '0' + (timestamp.getMonth() + 1);
  else
    Month = timestamp.getMonth() + 1;
  Year = timestamp.getFullYear();
  if (timestamp.getHours() < 10)
    Hours = '0' + timestamp.getHours();
  else
    Hours = timestamp.getHours();
  if (timestamp.getMinutes() < 10)
    Minutes = '0' + timestamp.getMinutes();
  else
    Minutes = timestamp.getMinutes();
  if (timestamp.getSeconds() < 10)
    Seconds = '0' + timestamp.getSeconds();
  else
    Seconds = timestamp.getSeconds();
  return `${dDate}/${Month}/${Year} ${Hours}:${Minutes}:${Seconds}`
};

Demo.Methods.logToChatBox = (message, level, chatOptions) => {
  const $loggerListParentDOM = $('ul#chat_log');
  const $logListItem = $('<li />').addClass('list-group-item');

  if (chatOptions) {
    $logListItem.addClass(chatOptions.type);
  }

  if (level) {
    const $levelBadge = $('<span />').addClass('log-level-badge badge badge-primary').text(level.toUpperCase());
    $logListItem.append($levelBadge);
  }

  if (chatOptions && chatOptions.type === 'remote-message') {
    const $senderDisplayName = $('<span />').addClass('log-message-sender-display-name').text(chatOptions.senderDisplayName);
    $logListItem.append($senderDisplayName);
    $logListItem.append($('<br />'));
  }

  const $logText = $('<span />').addClass('log-message-text').text(message);
  $logListItem.append($logText);

  if (chatOptions && chatOptions.senderDisplayName) {
    const messageInfo = `[${chatOptions.isDataChannel ? 'P2P' : 'Socket'}]${chatOptions.type === 'remote-message' ? (chatOptions.isPrivate ? '[Private]' : '[Public]') : (selectedPeers.length === 0 ? '[Public]' : '[Private]')} ${Demo.Methods.getTimestamp(chatOptions.timeStamp)}`;
    const $logTextInfo = $('<span />').addClass('log-message-info').text(messageInfo);
    $logListItem.append($('<br />'));
    $logListItem.append($logTextInfo);
  }

  $logListItem.appendTo($loggerListParentDOM);
};

/********************************************************
 SKYLINK EVENTS
 *********************************************************/

// //---------------------------------------------------
// // PEER EVENTS
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_JOINED, (evt) => {
  const eventDetail = evt.detail;
  const { isSelf, peerId, peerInfo } = eventDetail;

  if (isSelf) {
    _peerId = peerId;
    Demo.Methods.toggleInRoomSettings(peerId, true);
  } else {
    $('#presence_panel').show();
    Demo.Methods.logToChatBox(`${peerInfo.userData} has joined the chat`, null, {type: 'notification'});
    var newListEntry = '<tr id="user' + peerId + '" class="badQuality">' +
      '<td><input class="select-user" target="' + peerId + '" type="checkbox" onclick="selectTargetPeer(this);">' +
      '<span class="name">' + peerInfo.userData + '</span></td><td>';
    var titleList = ['Joined Room'];
    var glyphiconList = ['glyphicon-log-in'];
    for (var i = 0; i < titleList.length; i++) {
      newListEntry += '<span class="glyphicon ' + glyphiconList[i] + ' icon-circle ' +
        i + '" title="' + titleList[i] + '"></span>&nbsp;&nbsp;&nbsp;';
    }
    newListEntry += '</td></tr>';
    $('#presence_list').append(newListEntry);
    $('#user' + peerId + ' .0').css('color', 'green');
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_LEFT, (evt) => {
  const eventDetail = evt.detail;
  const { peerId, peerInfo } = eventDetail;
  Demo.Methods.logToChatBox(`${peerInfo.userData} has left the chat`, null, {type: 'notification'});

  if (Demo.PeerIds.indexOf(peerId) > -1) {
    Demo.PeerIds.splice(Demo.PeerIds.indexOf(peerId), 1);
    Demo.Peers -= 1;
  }
  $(`#video${peerId}`).remove();
  $(`#user${peerId}`).remove();
  const index = selectedPeers.indexOf(peerId);

  if (index > -1) {
    selectedPeers.splice(index, 1);
  }

  $('#presence_panel').hide();

  delete Demo.Stats[peerId];
  delete Demo.ShowStats[peerId];
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_UPDATED, (evt) => {
  const { peerId, peerInfo } = evt.detail;
    $('#user' + peerId + ' .name').html(peerInfo.userData);
});

// //---------------------------------------------------
// // MESSAGING EVENTS
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ENCRYPT_SECRETS_UPDATED, (evt) => {
  const detail = evt.detail;
  const { encryptSecrets, selectedSecretId } = detail;

  if (Object.keys(encryptSecrets).length !== 0) {
    $('#secret_id_panel').show();
    $('#secret_id_list_body').empty();

    Object.keys(encryptSecrets).forEach((secretId) => {
      const isChecked = secretId === selectedSecretId ? "checked" : "";
      let newListEntry = '<tr><td><input value="' + secretId + '" ' +'name="secret_ids" target="' + secretId + '" type="radio" '+ isChecked +
        ' onclick="setSelectedSecret(this);">' +
        '<label for="' + secretId + '"><span>' + secretId + '</span></label></td><td>' + encryptSecrets[secretId] + '</td></tr>';
      $('#secret_id_list').append(newListEntry);
    })
  } else {
    $('#secret_id_panel').hide();
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ON_INCOMING_MESSAGE, (evt) => {
  const eventDetail = evt.detail;
  const { isSelf, peerInfo, message } = eventDetail;
  const chatOptions = {
    type: isSelf ? 'local-message' : 'remote-message',
    isDataChannel: message.isDataChannel,
    isPrivate: message.isPrivate,
    senderDisplayName: peerInfo.userData,
    timeStamp: new Date().toISOString(),
  };

  Demo.Methods.logToChatBox(message.content, null, chatOptions);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.STORED_MESSAGES, (evt) => {
  const eventDetail = evt.detail;
  const { storedMessages } = eventDetail;

  storedMessages.forEach((message) => {
    const chatOptions = {
      type: 'remote-message',
      isDataChannel: message.isDataChannel,
      isPrivate: message.isPrivate,
      senderDisplayName: 'Stored Message' + ` [${message.senderPeerId}]`,
      timeStamp: message['timeStamp'],
    };
    Demo.Methods.logToChatBox(message.content, null, chatOptions);
  })
});

// //---------------------------------------------------
// // RECONNECT
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_REOPEN, (evt) => {
  Demo.Skylink.leaveRoom(config.defaultRoom)
  .then(() => {
    Demo.Peers = 0;
    Demo.PeerIds = [];
    Demo.Skylink.joinRoom(joinRoomOptions)
  })
});

// //---------------------------------------------------
// // STATE EVENTS
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.SYSTEM_ACTION, (evt) => {
  const eventDetail = evt.detail;
  const { action, info, reason, rid } = eventDetail;
  const message = `SkylinkJS - [Server](${action}) System Action Warning: ${info} | Reason: ${reason} | Room ID: ${rid}`;
  Demo.Methods.logToChatBox(message, 'info');
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_OPEN, () => {
  $('#channel').css('color', 'green');
  $('#channel').html('Active');
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_CLOSE, () => {
  $('#channel').css('color', 'red');
  $('#channel').html('Closed');
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_MESSAGE, () => {
  $('#channel').css('color', '00FF00');
  $('#channel').html('Connecting...');
  setTimeout(() => {
    $('#channel').css('color', 'green');
    $('#channel').html('Active');
  }, 1000);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_ERROR, (evt) => {
  const { error } = evt.detail;
  Demo.Methods.logToChatBox(`Channel Error: ${error.message || error}`, 'System');
});

/********************************************************
 DOM Events
 *********************************************************/
$(document).ready(function() {
  //---------------------------------------------------
  $('#display_app_id').html(config.appKey || config.apiKey || 'Not Provided');
  // //---------------------------------------------------
  $('#set_encrypt_secret_btn').click(function(e) {
    Demo.Skylink.setEncryptSecret(config.defaultRoom, $('#encrypt_secret').val(), $('#encrypt_secret_id').val());
    $('#encrypt_secret').val('');
    $('#encrypt_secret_id').val('');
  });
  // //---------------------------------------------------
  $('#clear_secret_ids_button').click(function(e) {
    Demo.Skylink.deleteEncryptSecrets(config.defaultRoom);
  });
  // //---------------------------------------------------
  $('#clear_selected_secret_id_button').click(function(e) {
    Demo.Skylink.setSelectedSecret(config.defaultRoom);
  });
  // //---------------------------------------------------
  $('#send_message_button').click(function(e) {
    e.preventDefault();
    if ($('#send_data_channel').prop('checked')) {
      if (selectedPeers.length > 0) {
        Demo.Skylink.sendP2PMessage(config.defaultRoom, $('#chat_input').val(), selectedPeers);
      } else {
        Demo.Skylink.sendP2PMessage(config.defaultRoom, $('#chat_input').val(), null);
      }
    } else {
      try {
        if (selectedPeers.length > 0) {
          Demo.Skylink.sendMessage(config.defaultRoom, $('#chat_input').val(), selectedPeers);
        } else {
          Demo.Skylink.sendMessage(config.defaultRoom, $('#chat_input').val());
        }
      } catch (err) {
        const message = err.message.split("-")[1].trim();
        Demo.Methods.logToChatBox(`Persistent Message Error: ${message}`, 'error', { type: 'error'});
      }
    }
    $('#chat_input').val('');
  });
  // //---------------------------------------------------
  $('#set_persistent_message').click(function(e) {
    if (e.currentTarget.checked) {
      Demo.Skylink.setMessagePersistence(config.defaultRoom, true);
    } else {
      Demo.Skylink.setMessagePersistence(config.defaultRoom, false);
    }
  });
  // //---------------------------------------------------
  $('#get_stored_messages_button').click(function() {
      Demo.Skylink.getStoredMessages(config.defaultRoom);
  });
  // //---------------------------------------------------
  $('#leave_room_btn').click(function() {
    Demo.Skylink.leaveRoom(config.defaultRoom)
    .then(() => {
      Demo.Methods.toggleInRoomSettings('', false);
      Demo.Peers = 0;
      Demo.PeerIds = [];
    })
  });
  // //---------------------------------------------------
  $('#join_room_btn').click(function () {
    const displayUserName = $('#join_room_display_name').val();
    const joinRoomName = $('#join_room_name').val();
    if (displayUserName) {
      joinRoomOptions.userData = displayUserName;
    }
    if (joinRoomName) {
      joinRoomOptions.roomName = joinRoomName;
      config.defaultRoom = joinRoomName;
    }
    Demo.Skylink.joinRoom(joinRoomOptions);
    $('#join_room_btn').addClass('disabled');
  });
  // //---------------------------------------------------
  $('#clear-selected-users').click(() => {
    $('#selected_users_panel .selected-users').html('');
    $('.select-user').each(function () {
      $(this)[0].checked = false;
    });
    $('#selected_users_panel .all').show();
    $('#selected_users_panel .all').show();
    selectedPeers = [];
  });

  window.setSelectedSecret = dom => {
    var secretId = $(dom).attr('value');
    Demo.Skylink.setSelectedSecret(config.defaultRoom, secretId);
  };

  window.selectTargetPeer = dom => {
    var peerId = $(dom).attr('target');
    var panelDom = $('#selected_users_panel');

    if (!dom.checked) {
      $(`#${peerId}-selected-user`).remove();

      var index = selectedPeers.indexOf(peerId);

      if (index > -1) {
        selectedPeers.splice(index, 1);
      }

      if ($(panelDom).find('.selected-users em').length === 0) {
        $(panelDom).find('.all').show();
      } else {
        $(panelDom).find('.all').hide();
      }
    } else {
      $(panelDom).find('.selected-users').append('<em id="' +
        peerId + '-selected-user">Peer ' + peerId + '</em>');
      $(panelDom).find('.all').hide();
      selectedPeers.push(peerId);
    }
  };

  window.onunhandledrejection = function (error) {
    console.log(`Promise failed: ${error}`);
  };

  window.onerror = function (error) {
    if (error.indexOf('Failed decrypting message') > -1) {
      const message = error.split('-')[1].trim();
      Demo.Methods.logToChatBox(`Decryption Error: ${message}`, 'error', { type: 'error'});
    }
  };
});
