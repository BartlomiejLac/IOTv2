const { dialogflow, UpdatePermission } = require('actions-on-google');
const express = require('express');
const bodyParser = require('body-parser');

const app = dialogflow();

let currentTemperature = {
    value : 10
}

let maxTemperature = {
    value: 50
}

let userIDs = [];

app.intent("QuestionTemperature", conv => {
    conv.ask("The temperature is " + currentTemperature.value + " degrees Celcius");
    console.log("Asked for temperature");
});

app.intent("SetTemperature", (conv, params) => {
    
    let num = Number.parseInt(params['temp']);
    maxTemperature.value = num;
    conv.ask("The max temperature has been changed to " + num + " degrees Celcius");
    console.log("The max temperature has been changed to " + num);
});

app.intent("SendNotifs", conv => {
    console.info("Asked for notifs");
    conv.ask(new UpdatePermission({
        intent: 'GetState'
    }));
});

app.intent("ConfirmNotifs", (conv) => {
    if (conv.arguments.get('PERMISSION')) {
        const userID = conv.arguments.get('UPDATES_USER_ID');
        if(!userID) {userID = conv.request.conversation.conversationId; console.log("ConversationID");}
        if (!userIDs.includes(userID)){
            userIDs.push(userID);
        }
        conv.ask("Ok, you are subscribed");
    }
    else {
        conv.close("Ok, you are not subscribed")
    }
})

app.intent('actions_intent_PERMISSION', )

app.intent("GetState", conv => {
    if (currentTemperature.value > maxTemperature.value) {
        conv.ask("Alert! The current temperature has a value of " + currentTemperature.value + " which is higher than max temperature of " + maxTemperature.value);
    }
    else {
        conv.ask("The temperature has a value of " + currentTemperature.value + " which is fortunately lower than max temperature of " + maxTemperature.value);
    }
})

const expressApp = express().use(bodyParser.json());

expressApp.post('/temperature', app);
expressApp.listen(8080);

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function sendNotif(){
    const request = require('request');
    const {google} = require('googleapis');
    const serviceAccount = require('./service-account.json');
    
    const jwtClient = new google.auth.JWT(
        serviceAccount.client_email, null, serviceAccount.private_key, ['https://www.googleapis.com/auth/actions.fulfillment.conversation'], null
    );
    jwtClient.authorize((err, tokens) => {
        if (err) {
            throw new Error(`Auth error: ${err}`);
        }
        userIDs.forEach(uid => {
            let authObj = {
                'auth': {
                    'bearer': tokens.access_token,
                },
                'json': true,
                'body': {
                    'customPushMessage': {
                        userNotification: {
                            title: "Alert! The temperature is " + currentTemperature.value + "!",
                        },
                        target : {
                            userId: uid,
                            intent: 'GetState',
                        },
                    },
                    'isInSandbox': true,
                },
            };
            //request.get('https://actions.googleapis.com/v2/conversations:batchGet');
            request.post('https://actions.googleapis.com/v2/conversations:send',authObj , (err, httpResponse, body) => {
                if (err) {
                    throw new Error(`API request error: ${err}`);
                }
                console.log(`${httpResponse.statusCode}: ` + `${httpResponse.statusMessage}`);
                console.log(JSON.stringify(body));
            })
            console.log("Send alert");
        });
    })

}

setInterval(function() {
    currentTemperature.value = getRandomInt(80) - 40;
    console.log("Changed temp to " + currentTemperature.value);
    console.log("userIDs: " + userIDs);
    if (currentTemperature.value > maxTemperature.value){
         sendNotif();
    }
}, 15*1000);
