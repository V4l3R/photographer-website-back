var nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

let { handleSuccess, handleError } = require("./utils.js");

// TODO: Const ?
const SALT = "$2b$10$BSMOEfTEeFdYjVkpFkF0xu";
const BASE_URL = "http://localhost:3001";
const SMTP_MAIL = "melissachesiphoto@gmail.com";

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_MAIL,
    pass: "btbd escp gtnt lnna",
  },
});

function sendMail(mailOptions, res) {
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      handleError("Le mail n'a pas pû être envoyé", res);
    } else {
      console.log("Email sent: " + info.response);
      handleSuccess(res);
    }
  });
}

function sendContactMail(adminEmail, name, email, message, res) {
  var mailOptions = {
    to: adminEmail,
    subject: name + " vous a envoyé un message.",
    html:
      name +
      " (" +
      email +
      ") t'a envoyé le message suivant : <br/><br/>" +
      message,
  };

  sendMail(mailOptions, res);
}

function sendRecoverUsernameMail(username, res) {
  var lien = createUsernameTokenAndCreateLink(username);

  var mailOptions = {
    to: username,
    subject: "Changement de votre adresse email",
    html:
      'Bonjour, <br/> Vous avez demandé un changement de votre adresse email. Pour confirmer, cliquez <a href="' +
      lien +
      "\">ici</a>.  <br/> Ce lien est valable 1 heure. <br/> Si vous n'êtes pas à l'origine de cette action, vous devriez changer votre mot de passe car cette action a été effectuée avec vos identifiants.",
  };

  sendMail(mailOptions, res);
}

function createUsernameTokenAndCreateLink(username) {
  // TODO : Changer avec un salt aléatoire ?
  let token = bcrypt.hashSync(Date.now().toString(), SALT);

  let hourInMilli = 1000 * 60 * 60;
  var myobj = {
    name: "resetUsername",
    username: username,
    value: token,
    end: Date.now() + hourInMilli,
  };
  db.collection("tokens").insertOne(myobj);

  return BASE_URL + "/updateUsername?t=" + token;
}

function sendRecoverPasswordMail(username, res) {
  var lien = createPasswordTokenAndCreateLink(username);

  var mailOptions = {
    to: username,
    subject: "Récupération de votre mot de passe",
    html:
      'Bonjour, <br/> Vous avez demandé une réinitialisation de votre mot de passe. Pour créer un nouveau mot de passe, cliquez <a href="' +
      lien +
      "\">ici</a>. <br/> Ce lien est valable 1 heure. <br/> Si vous n'êtes pas à l'origine de cette action, vous pouvez ignorer ce mail. Cependant, vous devez noter que quelqu'un a tenté de modifier votre mot de passe.",
  };

  sendMail(mailOptions, res);
}

function createPasswordTokenAndCreateLink(username) {
  // TODO : Changer avec un salt aléatoire ?
  let token = bcrypt.hashSync(Date.now().toString(), SALT);

  let hourInMilli = 1000 * 60 * 60;
  var myobj = {
    name: "resetPassword",
    username: username,
    value: token,
    end: Date.now() + hourInMilli,
  };
  db.collection("tokens").insertOne(myobj);

  return BASE_URL + "/updatePassword?t=" + token;
}

function sendResetDbMail(adminUsername, res) {
  var username = SMTP_MAIL;
  var lien = createResetDbTokenAndCreateLink(adminUsername);

  var mailOptions = {
    to: username,
    subject: "Réinitialisation de la base de donnée",
    html:
      'Bonjour, <br/> Vous avez demandé une réinitialisation de la base de données. Pour regénérer la base de données, cliquez <a href="' +
      lien +
      "\">ici</a>. <br/> Ce lien est valable 10 minutes. <br/> Si vous n'êtes pas à l'origine de cette action, vous devriez changer votre mot de passe car cette action a été effectuée avec vos identifiants.",
  };

  sendMail(mailOptions, res);
}

function createResetDbTokenAndCreateLink(username) {
  // TODO : Changer avec un salt aléatoire ?
  let token = bcrypt.hashSync(Date.now().toString(), SALT);

  let tenMinutesInMilli = 1000 * 60 * 10;
  var myobj = {
    name: "resetDb",
    username: username,
    value: token,
    end: Date.now() + tenMinutesInMilli,
  };
  db.collection("tokens").insertOne(myobj);

  return BASE_URL + "/resetDb?t=" + token;
}

module.exports = {
  sendContactMail,
  sendRecoverUsernameMail,
  sendRecoverPasswordMail,
  sendResetDbMail,
};
