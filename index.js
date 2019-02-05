'use strict';

const tessel = require('tessel');
const relaylib = require('relay-mono');

const pin = tessel.port.B.pin[2];
const relay = relaylib.use(tessel.port['A']);

const tick = 2000;
const maxTicksOfDrinkingAllowed = 15; // 1 mins
const tickTimout = 45; // 3 mins
let pumpIsOn = false;

let cat = {
  hasHadEnough: null,
  timeSinceLastDrink: 0,
  timeInCurrentDrinkSession: 0,
  reset() {
    this.hasHadEnough =  null;
    this.timeSinceLastDrink =  0;
    this.timeInCurrentDrinkSession =  0;
    console.log('RESET THE CAT COUNTER');
  },
};

relay.on('ready', function relayReady () {
  setInterval(function() {

    if (!cat.hasHadEnough) {
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

          cat.timeInCurrentDrinkSession += 1;
          console.log('THE CAT HAS BEEN DRINKING FOR, ', cat.timeInCurrentDrinkSession);
        } else {
          if (pumpIsOn) {
            relay.toggle(1);
            console.log('TURNING OFF THE PUMP');
            cat.reset();
            pumpIsOn = false;
          }
        }
      });
    }

    if (cat.timeInCurrentDrinkSession >= maxTicksOfDrinkingAllowed) {
      cat.hasHadEnough = true;
      console.log('THE CAT HAS HAD ENOUGH');
    } else if (cat.hasHadEnough && cat.timeSinceLastDrink <= tickTimout) {
      cat.timeSinceLastDrink += 1;
      console.log('TIME SINCE LAST DRINK, ', cat.timeSinceLastDrink);
    } else if (cat.hasHadEnough && cat.timeSinceLastDrink > tickTimout) {
      console.log('THE CAT CAN START DRINKING AGAIN');
      cat.reset();
    }
  }, tick);
});
