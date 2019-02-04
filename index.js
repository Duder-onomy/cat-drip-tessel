'use strict';

const tessel = require('tessel');
const relaylib = require('relay-mono');

const pin = tessel.port.B.pin[2];
const relay = relaylib.use(tessel.port['A']);

let pumpIsOn = false;

relay.on('ready', function relayReady () {
  setInterval(function() {
    pin.read(function(error, movementDetected) {
      if (error) {
        throw error;
      }

      console.log(`READ: ${movementDetected}`);

      if (movementDetected) {
        if (!pumpIsOn) {
          console.log('TURNING ON THE PUMP');
          relay.toggle(1);
          pumpIsOn = true;
        }
      } else {
        if (pumpIsOn) {
          relay.toggle(1);
          console.log('TURNING OFF THE PUMP');
          pumpIsOn = false;
        }
      }
    });
  }, 4000);
});
