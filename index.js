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
var Dispenser = 'hermes/intent/'+snipsUserName+':dispenser';
var hwordToggle = false;
var counter = 0;
var i = 0, delay = 0;
let everloop = new Array(matrix.led.length).fill({});// Array of black LEDs
everloop[0] = {b:100};

// Servo Init
matrix.gpio.setFunction(0, 'PWM');
matrix.gpio.setFunction(1, 'PWM');
matrix.gpio.setMode(0,'output');
matrix.gpio.setMode(1,'output');


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

        client.subscribe(Dispenser);

});

client.on('message', function(topic,message) {
    var message = JSON.parse(message);
        switch(topic) {
        // * On Wakeword
        case wakeword:
            hwordToggle = true;
            console.log('Wakeword Detected');
            break;

			case Dispenser:
			console.log(message.slots[0].value.value);
            // Turn Servo motors
            try{
                if (message.slots[0].value.value === 'soap'){
                    console.log('Dispenser Active - Soap Detected');
                    
					matrix.gpio.setServoAngle({
					  pin: 0,
					  angle: 90,
					  // minimum pulse width for a PWM wave (in milliseconds)
					  min_pulse_ms: 0.8
					});
					
					for(delay = 0; delay < 20000; delay++);
					
					matrix.gpio.setServoAngle({
					  pin: 0,
					  angle: 0,
					  // minimum pulse width for a PWM wave (in milliseconds)
					  min_pulse_ms: 0.8
					});
					
					console.log('Dispenser - Soap Dispensed');
                }
                else if(message.slots[0].value.value === 'paste'){
                    console.log('Dispenser Active - Paste Detected');
                   
					matrix.gpio.setServoAngle({
					  pin: 1,
					  angle: 90,
					  // minimum pulse width for a PWM wave (in milliseconds)
					  min_pulse_ms: 0.8
					});
					
					for(delay = 0; delay < 20000; delay++);
					
					matrix.gpio.setServoAngle({
					  pin: 1,
					  angle: 0,
					  // minimum pulse width for a PWM wave (in milliseconds)
					  min_pulse_ms: 0.8
					});
					
					console.log('Dispenser - Paste Dispensed');
                }
            }
           
            catch(e){
                console.log('Did not receive a proper command')
            }
        break;
        // * On Conversation End
        case sessionEnd:
            console.log('Session Ended\n');
        break;
    }
});

