var inc1 = 0;
var inc2 = 0;
var inc3 = 0;
var inc4 = 0;
var inc5 = 0;


function handler(event, data1, data2, data3) {
  document.getElementById('output').innerHTML += '<p><b>' + event +
    '</b> ' + [data1, data2, data3].toString() + '</p>';
}

function clearL() {
  output.innerHTML = '';
}

function example1() {
  Event.on('example1', handler);

  inc1 += 1;

  Event.respond('example1', 'Triggered example1', 'Fired ' + inc1 + ' times', 10, true);
}

function example2() {
  Event.once('example2', handler);

  inc2 += 1;

  Event.respond('example2', 'Triggered example2', 'Fired ' + inc2 + ' times', 5, false);
}

function example3() {
  var notMeantToBe = function () {
    handler('example2', 'Triggered example3', 'Not meant to be fired', 15, 3);
  };

  inc3 += 1;

  Event.on('example3', notMeantToBe);

  Event.off('example3', notMeantToBe);

  handler('Turned off an example3 .on()', 1, 1, 1);

  Event.once('example3', handler);

  Event.respond('example3', 'Triggered example3', 'Fired ' + inc3 + ' times', 10, 15);
}

function example4() {
  inc4 += 1;

  Event.on('example4-1', handler);
  Event.on('example4-1', handler);
  Event.once('example4-1', handler);
  Event.once('example4-2', handler);
  Event.on('example4-2', handler);

  Event.off('example4-1');

  handler('Turned off an example4-1 listeners', 1, 1, 1);

  Event.respond('example4-1', 'Triggered example4-1', 'Fired ' + inc4 + ' times', 10, 15);
  Event.respond('example4-2', 'Triggered example4-2', 'Fired ' + inc4 + ' times', 10, 15);
}

function example5() {
  inc5 += 1;

  Event.on('example5-1', handler);
  Event.on('example5-1', handler);
  Event.once('example5-1', handler);
  Event.once('example5-2', handler);
  Event.on('example5-2', handler);

  Event.off();

  handler('Turned off all listeners', 1, 1, 1);

  Event.respond('example5-1', 'Triggered example5-1', 'Fired ' + inc5 + ' times', 10, 15);
  Event.respond('example5-2', 'Triggered example5-2', 'Fired ' + inc5 + ' times', 10, 15);
}