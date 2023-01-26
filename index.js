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
    //let num = getRandomInt(80) - 40;
    conv.ask("The temperature is " + currentTemperature.value + " degrees Celcius");
});

app.intent("SetTemperature", (conv, params) => {
    let num = Number.parseInt(params['temp']);
    currentTemperature.value = num;
    conv.ask("The temperature has been changed to " + num + " degrees Celcius");
});

app.intent("SendNotifs", conv => {
    console.log("Asked for notifs");
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
        conv.close("Ok, you are subscribed");
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
                            title: 'temperatureNotif',
                        },
                        target : {
                            userId: uid,
                            intent: 'GetState',
                        },
                    },
                    'isInSandbox': true,
                },
            };
            request.post('https://actions.googleapis.com/v2/conversations:send',authObj , (err, httpResponse, body) => {
                if (err) {
                    throw new Error(`API request error: ${err}`);
                }
                console.log(`${httpResponse.statusCode}: ` + `${httpResponse.statusMessage}`);
                console.log(JSON.stringify(body));
            })
        });
    })

}

setInterval(function() {
    console.log(userIDs);
    if (currentTemperature.value > maxTemperature.value) sendNotif();
}, 10*1000);