//////////////////
//Everloop Stuff//
//////////////////

/////////////
//VARIABLES//
/////////////
var snipsUserName = "Rahul24-06";
const matrix = require('@matrix-io/matrix-lite');
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://localhost', { port: 1883 });
var wakeword = 'hermes/hotword/default/detected';
var sessionEnd = 'hermes/dialogueManager/sessionEnded';
//hermes/intent/account username: intentName
var Reactor = 'hermes/intent/'+snipsUserName+':arcReactor';
var waitingToggle = false;
var hwordToggle = false;
var counter = 0;
var i = 0;
let everloop = new Array(matrix.led.length).fill({});// Array of black LEDs
everloop[0] = {b:100};

setInterval(function(){

        if (waitingToggle == false) {
                matrix.led.set({});
        };

        if (waitingToggle == true) {
                        // Set individual LED value
                matrix.led.set({
                r: 139,
                b: 155,// Math used to make pulsing effect,
                g: 25,})
                };
 counter = counter + 0.2;
},50);

setInterval(function(){
        if (hwordToggle == true) {
          let lastColor = everloop.shift();
          everloop.push(lastColor);
          matrix.led.set(everloop);
  i = i + 1;
        };

        if(i > 20)
        {
        hwordToggle = false;
        i = 0;
        };
},10);


client.on('connect', function() {
        console.log("Connected to localhost");

        client.subscribe(wakeword);

        client.subscribe(sessionEnd);

        client.subscribe(Reactor);

});

client.on('message', function(topic,message) {
    var message = JSON.parse(message);
        switch(topic) {
        // * On Wakeword
        case wakeword:
            hwordToggle = true;
            console.log('Wakeword Detected');
            break;
        // * On Light State Change
        case Reactor:
            // Turn lights On/Off
            try{
                if (message.slots[0].value.value === 'on'){
                    console.log('Reactor On Detected');
                    waitingToggle = true;
                }
                else if(message.slots[0].value.value === 'off'){
                    console.log('Reactor Off Detected');
                    waitingToggle = false;
                }
            }
            // Expect error if `on` or `off` is not heard
            catch(e){
                console.log('Did not receive an On/Off state')
            }
        break;
        // * On Conversation End
        case sessionEnd:
            console.log('Session Ended\n');
        break;
    }
});

