var socket;
var output = document.getElementById('output');
var status = document.getElementById('status');

function handler(event, data) {
  output.innerHTML += '<p><b>' + event +
    '</b> ' + JSON.stringify(data) + '</p>';
}

function clearL() {
  output.innerHTML = '';
}

function failConnect() {
  socket = new Socket({
    server: document.getElementById('server').value,
    httpsPortList: document.getElementById('https').value.split(','),
    httpPortList: document.getElementById('http').value.split(',')
  }, handler);

  socket.connect();

  handler('Connecting', '...');
}

function successConnect() {
  var socketType = document.getElementById('type').value;

  socket = new Socket({
    server: 'sg-signaling.temasys.com.sg',
    httpPortList: [500, 6001],
    httpsPortList: [443],
    type: socketType
  }, handler);

  socket.connect();

  handler('Connecting', socketType);
}

function disconnect() {
  if (socket) {
    socket.disconnect();
  }
}