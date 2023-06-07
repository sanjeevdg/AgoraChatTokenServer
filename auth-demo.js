const express = require("express");

const fetch = require('node-fetch')
const bodyParser = require("body-parser");
const cors = require('cors');
const agoraToken = require('agora-token');
const User = require('./models/User');

// import dbConnect from './utils/dbConnect'
const sequelize = require('./utils/database.js');
const { ChatTokenBuilder } = agoraToken

const app = express();

const admin = require("firebase-admin");

const serviceAccount = require("./firebase.json");


var MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
var SCOPES = [MESSAGING_SCOPE];


serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
//console.log(JSON.stringify(serviceAccount));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
 databaseURL: "https://astrokingbeta-default-rtdb.firebaseio.com"
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.raw());


const hostname = '192.168.100.172'
const port = 3000

// Get the appId and appCertificate from the agora console
const appId = "77a773d5d11d4ee489d52fe863eb9cd7";
const appCertificate = "0c58a56303b0443bbf625c57ae024c24";
// Token expire time, hardcode to 86400 seconds = 1 day
const expirationInSeconds = 86400;

// Get the RestApiHost, OrgName and AppName from the chat feature in agora console
const chatRegisterURL = "https://a61.chat.agora.io/61838540/1036708/users"

// https://a61.chat.agora.io/61838540/1036708/messages/users

app.use(cors())
//app.use(express.json())

sequelize.sync(); 


app.post('/login', async (req, res) => {
//   await dbConnect()
  const user = await User.findOne({where:{account: req.body.account}})
  if (user) {
    const userToken = ChatTokenBuilder.buildUserToken(appId, appCertificate, user.userUuid, expirationInSeconds);
    res
      .status(200)
      .json({
        code: "RES_OK",
        expireTimestamp: expirationInSeconds,
        chatUsername: user.chatUsername,
        accessToken: userToken // agorachatAuthToken
      })
  } else {
    res.status(401).json({
      message: 'You account or password is wrong'
    })
  }
});



app.post('/send_fcm_push_notification', async (req, res, next) => {
  
  try {
    const { title, body, imageUrl, regtoken, user_id,astro_id } = req.body;
    console.log('my registrationoken passed id::'+regtoken);
    //Multicast

    await admin.messaging().send({
      token: regtoken,
	  data:{"user_id":user_id,"astro_id":astro_id},
      notification: {
        "title":title,
        "body":body,
        "image":imageUrl,
      },
    });
    console.log('title:'+title+'body:'+body+'img:'+imageUrl+'usrid:'+user_id+'astroid'+astro_id);
    res.status(200).json({ message: "Successfully sent notifications!" });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong!" });
  }
});



//const appToken = 
//ChatTokenBuilder.buildAppToken(appId, appCertificate, expirationInSeconds);

app.post('/apptoken', async (req, res) => {
//   await dbConnect()
 // const user = await User.findOne(where:{account: req.body.account},)
//  if (user) {
    const appToken = ChatTokenBuilder.buildAppToken(appId, appCertificate, expirationInSeconds);
    res
      .status(200)
      .json({
        code: "RES_OK",
        expireTimestamp: expirationInSeconds,
        accessToken: appToken // agorachatAuthToken
      })
 // } else {
 //   res.status(401).json({
 //     message: 'You account or password is wrong'
 //   })
 // }
});


app.post('/register', async (req, res) => {

 // await dbConnect()
  const account = req.body.account
  const password = req.body.password
  // const chatUsername = "<User-defined username>"
  // const chatPassword = "<User-defined password>"
  // const ChatNickname = "<User-defined nickname>"
  const chatUsername = account
  const chatPassword = password
  const ChatNickname = account
  
  const body = {'username': chatUsername, 'password': chatPassword, 'nickname': ChatNickname};
  const appToken = ChatTokenBuilder.buildAppToken(appId, appCertificate, expirationInSeconds);
  const response = await fetch(chatRegisterURL , {
    method: 'post',
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer '+appToken,
    },
    body: JSON.stringify(body)
  })
  const result = await response.json()
  if (response.status != 200 ) {
    res.status(400).json({ success: false, data: result })
    return
  }
  try {
    const user = await User.create({
      "account": account,
      "password": password,
      "chatUsername": chatUsername,
      "userUuid": result.entities[0].uuid
    })
    res.status(200).json({ success: true, message: "User Registered Sucessfully !", "code": "RES_OK" })
  } catch (error) {
    console.log(error)
    res.status(400).json({ success: false })
  }

})

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
