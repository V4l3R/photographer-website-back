var nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

let { handleSuccess, handleError } = require("./utils.js");

// TODO: Const ?
const SALT = "$2b$10$BSMOEfTEeFdYjVkpFkF0xu";

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "melissachesiphoto@gmail.com",
    pass: "btbd escp gtnt lnna",
  },
});

function sendRecoverUsernameMail(username, res) {
  var lien = createUsernameTokenAndCreateLink(username);

  var mailOptions = {
    from: "youremail@gmail.com",
    to: username,
    subject: "Changement de votre adresse email",
    html:
      'Bonjour, <br/> Vous avez demandé un changement de votre adresse email. Pour confirmer, cliquez <a href="' +
      lien +
      "\">ici</a>.  <br/> Si vous n'êtes pas à l'origine de cette action, vous devriez changer votre mot de passe car cette action a été probablement effectuée avec vos identifiants.",
  };

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

  return "http://localhost:3001/updateUsername?t=" + token;
}

function sendRecoverPasswordMail(username, res) {
  var lien = createPasswordTokenAndCreateLink(username);

  var mailOptions = {
    from: "youremail@gmail.com",
    to: username,
    subject: "Récupération de votre mot de passe",
    html:
      'Bonjour, <br/> Vous avez demandé une réinitialisation de votre mot de passe. Pour créer un nouveau mot de passe, cliquez <a href="' +
      lien +
      "\">ici</a>. <br/> Si vous n'êtes pas à l'origine de cette action, vous pouvez ignorer ce mail. Cependant, vous devez noter que quelqu'un a tenté de modifier votre mot de passe.",
  };

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

  return "http://localhost:3001/updatePassword?t=" + token;
}

module.exports = { sendRecoverUsernameMail, sendRecoverPasswordMail };
