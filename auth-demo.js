const RtcTokenBuilder = require("./api/RtcTokenBuilder").RtcTokenBuilder;
const RtcRole = require("./api/RtcTokenBuilder").Role;

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
 databaseURL: "https://onlineclass-1d1e5-default-rtdb.firebaseio.com"
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

app.post('/generate_rtc_token', async (req, res) => {
 
  const channelName = '';
  const role = RtcRole.PUBLISHER;

	const user = await User.findOne({where:{account: req.body.account}})
  if (user) {
  
  const expirationTimeInSeconds = 3600

  const currentTimestamp = Math.floor(Date.now() / 1000)

  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

  // IMPORTANT! Build token with either the uid or with the user account. Comment out the option you do not want to use below.


  // Build token with uid
 const tokenA = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      req.body.channel,
      parseInt(req.body.account),
      role,
      expirationTimeInSeconds,
      privilegeExpiredTs
    );
  console.log("Token With Integer Number Uid: " + tokenA+"appid="+appId+"appcert="+appCertificate+"channel="+req.body.channel+"role="+role+"expirationTimeInSeconds="+expirationTimeInSeconds+"privilegeExpiredTs"+privilegeExpiredTs);

 res
      .status(200)
      .json({
        code: "RES_OK",
        expireTimestamp: expirationTimeInSeconds,
        rtcToken: tokenA // agorachatAuthToken
      });

}
	  
});

  // Build token with user account 
	/*
 const tokenB = RtcTokenBuilder.buildTokenWithUserAccount(
    appId,
    appCertificate,
    channelName,
    req.body.account,
    role, 
    privilegeExpiredTs);
  console.log("Token With UserAccount: " + tokenB); 
  */

app.post('/send_fcm_push_notification', async (req, res, next) => {
  
  try {
    const { title, body, imageUrl, regtoken, student_id, teacher_id,url } = req.body;
    console.log('my registrationoken passed id::'+regtoken);
    //Multicast

	  
	  /*
	  notification: {
        "title":title,
        "body":body,
        "image":imageUrl,
      },
      */
    await admin.messaging().send({
      "token": regtoken,
	  "data":{
		"msgtitle":title,
		  "msgbody":body,
		  "url":url,
		  "msgimage":imageUrl,
		  "student_id":student_id,
		  "teacher_id":teacher_id,
	  },
	     "android":{
	"priority": "high"
	     },
    });
    console.log('title:'+title+'body:'+body+'img:'+imageUrl+'stdid:'+student_id+'tchid'+teacher_id+'url='+url);
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
