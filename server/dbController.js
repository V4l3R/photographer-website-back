// var MongoClient = require("mongodb").MongoClient;
// var url = "mongodb://127.0.0.1:27017/testDb";

// const options = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// };

// const client = new MongoClient(url, options);

// async function main() {
//   try {
//     await client.connect(); // Connectez-vous à la base de données

//     console.log("Connecté à la base de données MongoDB !");

//     // Ici, vous pouvez exécuter des opérations sur la base de données, par exemple :
//     const db = client.db(); // Obtenez une référence à la base de données
//     // console.log("Ici on a la db : ");

//     const collection = db.collection("albums"); // Obtenez une référence à la collection
//     // console.log("ici on a la collection albums : ");
//     // console.log(collection);

//     // Pour effectuer des opérations CRUD sur la base de données, consultez la documentation de MongoDB : https://docs.mongodb.com/drivers/node/current/
//   } catch (error) {
//     console.error("Erreur de connexion à la base de données :", error);
//   } finally {
//     // N'oubliez pas de fermer la connexion lorsque vous avez fini !
//     // client.close();
//   }
// }

// // Appelez la fonction pour établir la connexion
// main().catch(console.error);

const bcrypt = require("bcrypt");

// TODO: Const ?
const SALT = "$2b$10$BSMOEfTEeFdYjVkpFkF0xu";

let {
  handleSuccess,
  handleSuccessAndReturnToken,
  handleError,
  unlinksAndSuccess,
  unlinksAndError,
  base64_encode,
  removeExtFromName,
} = require("./utils.js");

function getAdmin(username) {
  return db
    .collection("admin")
    .findOne({ username: username })
    .then((res) => {
      return res;
    });
}

function updateAdminUsername(oldUsername, newUsername) {
  var myquery = { username: oldUsername };
  var newvalues = { $set: { username: newUsername } };

  return db
    .collection("admin")
    .updateOne(myquery, newvalues)
    .then((res) => {
      return res;
    });
}

function updateAdminPassword(username, newPassword) {
  var myquery = { username: username };
  var newvalues = { $set: { password: newPassword } };

  return db
    .collection("admin")
    .updateOne(myquery, newvalues)
    .then((res) => {
      return res;
    });
}

function getToken(tokenValue) {
  return db
    .collection("tokens")
    .findOne({ value: tokenValue })
    .then((res) => {
      return res;
    });
}

function createConnectionToken(username, res) {
  let token = bcrypt.hashSync(Date.now().toString(), SALT);

  let dayInMilli = 1000 * 60 * 60 * 24;
  var myobj = {
    name: "connection",
    username: username,
    value: token,
    end: Date.now() + dayInMilli,
  };

  db.collection("tokens")
    .insertOne(myobj)
    .then((resp) => {
      if (resp.acknowledged) {
        handleSuccessAndReturnToken(res, token);
      } else {
        handleError("La base de donnée n'a pas pû être contactée", res);
      }
    });
}

function getDefaultAlbum() {
  return db
    .collection("albums")
    .findOne({ isDefault: true })
    .then((res) => {
      return res;
    });
}

function updateAlbumDefault(albumName, isDefault) {
  var myquery = { name: albumName };
  var newvalues = { $set: { isDefault: isDefault } };

  return db
    .collection("albums")
    .updateOne(myquery, newvalues)
    .then((res) => {
      return res;
    });
}

function getAlbum(albumName) {
  return db
    .collection("albums")
    .findOne({ name: albumName })
    .then((res) => {
      return res;
    });
}

function getAllAlbums() {
  console.log("getAllAlbums");
  return db
    .collection("albums")
    .find({})
    .toArray()
    .then((res) => {
      return res;
    });
}

function addAlbum(albumName) {
  var myobj = { name: albumName, isDefault: false, pictures: [] };
  return db.collection("albums").insertOne(myobj);
}

function updateAlbumName(oldAlbumName, newAlbumName) {
  var myquery = { name: oldAlbumName };
  var newvalues = { $set: { name: newAlbumName } };

  return db
    .collection("albums")
    .updateOne(myquery, newvalues)
    .then((res) => {
      return res;
    });
}

function updateAlbumPicture(albumName, picturesArray) {
  var myquery = { name: albumName };
  var newvalues = { $set: { pictures: picturesArray } };

  return db
    .collection("albums")
    .updateOne(myquery, newvalues)
    .then((res) => {
      return res;
    });
}

function deleteAlbum(albumName) {
  return db
    .collection("albums")
    .deleteOne({ name: albumName })
    .then((res) => {
      return res;
    });
}

function getSetting(settingName) {
  return db
    .collection("settings")
    .findOne({ name: settingName })
    .then((res) => {
      return res;
    });
}

function getSettings() {
  return db
    .collection("settings")
    .find({})
    .toArray()
    .then((res) => {
      return res;
    });
}

function updateSetting(settingName, newValue) {
  var myquery = { name: settingName };
  var newvalues = { $set: { value: newValue } };

  return db
    .collection("settings")
    .updateOne(myquery, newvalues)
    .then((res) => {
      return res;
    });
}

async function isAdminHandler(username, res) {
  return getAdmin(username).then((admin) => {
    if (admin === null) {
      handleError("L'utilisateur n'a pas été trouvé", res);
    } else {
      return true;
    }
  });
}

async function isAdminAndPasswordHandler(username, password, res) {
  return getAdmin(username).then((admin) => {
    if (admin === null) {
      handleError("L'utilisateur n'a pas été trouvé", res);
    } else {
      if (admin.password !== password) {
        handleError("Le mot de passe est incorrect", res);
      } else {
        return true;
      }
    }
  });
}

async function getAlbumHandler(albumName, res) {
  return getAlbum(albumName).then((album) => {
    // Si l'album existe deja, retourner erreur
    if (album === null) {
      handleError("L'album n'existe pas", res);
    } else {
      return album;
    }
  });
}

async function getAlbumAndUnlinksHandler(albumName, files, res) {
  return getAlbum(albumName).then((album) => {
    // Si l'album existe deja, retourner erreur
    if (album === null) {
      unlinksAndError(files, "L'album n'existe pas", res);
    } else {
      return album;
    }
  });
}

async function isNotAlbumHandler(albumName, res) {
  return getAlbum(albumName).then((album) => {
    // Si l'album existe deja, retourner erreur
    if (album !== null) {
      handleError("L'album existe deja", res);
    } else {
      return true;
    }
  });
}

async function isSettingHandler(settingName, res) {
  return getSetting(settingName).then((setting) => {
    if (setting === null) {
      handleError("Le paramètre n'existe pas", res);
    } else {
      return true;
    }
  });
}

async function getTokenChangePasswordHandler(tokenValue, res) {
  return getToken(tokenValue).then((token) => {
    // Si non, on retourne une erreur
    if (token === null) {
      handleError("Le token n'a pas été trouvé", res);
    } else {
      // Si oui, on vérifie que l'utilisateur existe en bdd
      getAdmin(token.username).then((admin) => {
        // Si non, on retourne une erreur
        if (admin === null) {
          handleError("L'utilisateur n'a pas été trouvé", res);
        } else {
          // Si oui, on vérifie la validité du token
          if (token.name === "resetPassword" && token.end > Date.now()) {
            return token;
          } else {
            // Si invalide, on retourne une erreur
            handleError("Le token n'est pas valide", res);
          }
        }
      });
    }
  });
}

async function validateAdminToken(adminUsername, tokenValue, tokenName, res) {
  // On vérifie que l'utilisateur existe en bdd
  return getAdmin(adminUsername).then((admin) => {
    // Si non, on envoi une erreur
    if (admin === null) {
      handleError("Vous n'êtes pas connecté", res);
    } else {
      // On vérifie que le token existe
      return getToken(tokenValue).then((token) => {
        // Si non, on retourne une erreur
        if (token === null) {
          handleError("Le token n'a pas été trouvé", res);
        } else {
          // Si oui, on vérifie la validité du token
          if (
            token.name === tokenName &&
            token.end > Date.now() &&
            token.username === adminUsername
          ) {
            console.log("avant");
            return true;
          } else {
            // Si invalide, on retourne une erreur
            handleError("Le token n'est pas valide", res);
          }
        }
      });
    }
  });
}

async function validateAdminTokenAndUnlinks(
  adminUsername,
  accessToken,
  files,
  res
) {
  // On vérifie que l'utilisateur existe en bdd
  return getAdmin(adminUsername).then((admin) => {
    // Si non, on envoi une erreur
    if (admin === null) {
      handleError("Vous n'êtes pas connecté", res);
    } else {
      // On vérifie que le token existe
      return getToken(accessToken).then((token) => {
        // Si non, on retourne une erreur
        if (token === null) {
          handleError("Vous n'êtes pas connecté", res);
        } else {
          // Si oui, on vérifie la validité du token
          if (
            token.name === "connection" &&
            token.end > Date.now() &&
            token.username === adminUsername
          ) {
            console.log("avant");
            return true;
          } else {
            // Si invalide, on retourne une erreur
            unlinksAndError(files, "Le token n'est pas valide", res);
          }
        }
      });
    }
  });
}

module.exports = {
  getAdmin,
  updateAdminUsername,
  updateAdminPassword,
  getToken,
  createConnectionToken,
  getDefaultAlbum,
  updateAlbumDefault,
  getAlbum,
  getAllAlbums,
  addAlbum,
  updateAlbumName,
  updateAlbumPicture,
  deleteAlbum,
  getSetting,
  getSettings,
  updateSetting,
  isAdminHandler,
  isAdminAndPasswordHandler,
  getAlbumHandler,
  getAlbumAndUnlinksHandler,
  isNotAlbumHandler,
  isSettingHandler,
  getTokenChangePasswordHandler,
  validateAdminToken,
  validateAdminTokenAndUnlinks,
};
