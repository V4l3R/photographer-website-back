const path = require("path");
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

let {} = require("./initDb.js");

let {
  getAdmin,
  getFirstAdmin,
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
} = require("./dbController.js");

let {
  sendContactMail,
  sendRecoverUsernameMail,
  sendRecoverPasswordMail,
} = require("./mailController.js");

let {
  handleSuccess,
  handleSuccessAndReturnToken,
  handleError,
  unlinksAndSuccess,
  unlinksAndError,
  base64_encode,
  removeExtFromName,
  addPicturesToArray,
  removeValuesFromArray,
  getURI,
  parseURI,
} = require("./utils.js");

const SALT = "$2b$10$BSMOEfTEeFdYjVkpFkF0xu";

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://127.0.0.1:27017/testDb";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const client = new MongoClient(url, options);

const PORT = process.env.PORT || 3001;

const app = express();

const upload = multer({
  dest: "./albums",
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

app.use(bodyParser.urlencoded({ extended: true })); //this line is already mentioned above
app.use(bodyParser.json()); //add this line

// Have Node serve the files for our built React app
app.use(
  express.static(path.resolve(__dirname, "../../photographer-website/build"))
);

////////////////
// CONNECTION //
////////////////
app.post("/connect", (req, res) => {
  let username = req.body.username;
  let password = bcrypt.hashSync(req.body.password, SALT);

  isAdminAndPasswordHandler(username, password, res).then((resp) => {
    if (resp) {
      createConnectionToken(username, res);
    }
  });
});

///////////////
//// ALBUM ////
///////////////
app.get("/getDefaultAlbumName", (req, res) => {
  getDefaultAlbum().then((defaultAlbum) => {
    let defaultAlbumName = "";
    if (defaultAlbum !== null) {
      defaultAlbumName = defaultAlbum.name;
    }

    res.json({ defaultAlbumName });
  });
});

app.get("/getAlbumsList", (req, res) => {
  console.log("/getAlbumsList");
  getAllAlbums().then((allAlbums) => {
    let albumsName = [];
    allAlbums.forEach((album) => {
      albumsName.push(album.name);
    });

    res.json({ albumsName });
  });
});

app.post("/acquireAlbumPictures", (req, res) => {
  let albumName = req.body.targetedAlbumName;

  getAlbum(albumName).then((album) => {
    res.json(album);
  });
});

app.post("/saveAlbum", (req, res) => {
  let newAlbumName = req.body.newAlbumName;
  let adminUsername = req.body.adminUsername;
  let accessToken = req.body.accessToken;

  // On vérifie la validité du token
  validateAdminToken(adminUsername, accessToken, "connection", res).then(
    (respon) => {
      if (respon) {
        isNotAlbumHandler(newAlbumName, res).then((respo) => {
          if (respo) {
            // Sinon sauvegarder l'album
            addAlbum(newAlbumName).then((resp) => {
              if (resp.acknowledged) {
                handleSuccess(res);
              } else {
                handleError("L'album n'a pas pu être sauvegardé", res);
              }
            });
          }
        });
      }
    }
  );
});

app.post("/renameAlbum", (req, res) => {
  let { targetedAlbumName, newAlbumName, adminUsername, accessToken } =
    req.body;

  // On vérifie la validité du token
  validateAdminToken(adminUsername, accessToken, "connection", res).then(
    (resp) => {
      if (resp) {
        getAlbumHandler(targetedAlbumName, res).then((album) => {
          if (album) {
            isNotAlbumHandler(newAlbumName, res).then((respon) => {
              if (respon) {
                // Sinon renommer l'album
                updateAlbumName(targetedAlbumName, newAlbumName).then(
                  (resp) => {
                    if (resp.acknowledged) {
                      handleSuccess(res);
                    } else {
                      handleError("L'album n'a pas pu être renommé", res);
                    }
                  }
                );
              }
            });
          }
        });
      }
    }
  );
});

app.post("/updateDefaultAlbum", (req, res) => {
  let { targetedAlbumName, adminUsername, accessToken } = req.body;

  // On vérifie la validité du token
  validateAdminToken(adminUsername, accessToken, "connection", res).then(
    (resp) => {
      if (resp) {
        getAlbumHandler(targetedAlbumName, res).then((album) => {
          if (album) {
            // On cherche s'il existe un album par default, si oui on le passe a false
            getDefaultAlbum().then((defaultAlbum) => {
              if (defaultAlbum !== null) {
                updateAlbumDefault(defaultAlbum.name, false);
              }
            });

            // Dans tous les cas, on passe l'album trouvé à true
            updateAlbumDefault(album.name, true);
            handleSuccess(res);
          }
        });
      }
    }
  );
});

app.post("/deleteAlbum", (req, res) => {
  let { targetedAlbumName, adminUsername, accessToken } = req.body;

  // On vérifie la validité du token
  validateAdminToken(adminUsername, accessToken, "connection", res).then(
    (resp) => {
      if (resp) {
        getAlbumHandler(targetedAlbumName, res).then((album) => {
          if (album) {
            deleteAlbum(targetedAlbumName).then((respo) => {
              if (respo.acknowledged) {
                handleSuccess(res);
              } else {
                handleError("L'album n'a pas pu être supprimé", res);
              }
            });
          }
        });
      }
    }
  );
});

////////////////
/// PICTURES ///
////////////////
app.post("/uploadPictures", upload.array("files", 100), (req, res) => {
  let { targetedAlbumName, adminUsername, accessToken } = req.body;
  let files = req.files;

  // On vérifie la validité du token
  validateAdminTokenAndUnlinks(adminUsername, accessToken, files, res).then(
    (resp) => {
      if (resp) {
        getAlbumAndUnlinksHandler(targetedAlbumName, files, res).then(
          (album) => {
            if (album) {
              // Sinon sauvegarder les photos
              const pictures = addPicturesToArray(files, album.pictures);

              updateAlbumPicture(targetedAlbumName, pictures).then((resp) => {
                if (resp.acknowledged) {
                  unlinksAndSuccess(files, res);
                } else {
                  unlinksAndError(
                    files,
                    "Les photos n'ont pas pu être sauvegardées",
                    res
                  );
                }
              });
            }
          }
        );
      } else {
        unlinksAndError(files, "Une erreur inconnue est survenue", res);
      }
    }
  );
});

app.post("/updatePictureName", (req, res) => {
  let { targetedAlbumName, adminUsername, accessToken } = req.body;

  // On vérifie la validité du token
  validateAdminToken(adminUsername, accessToken, "connection", res).then(
    (resp) => {
      if (resp) {
        getAlbumHandler(targetedAlbumName, res).then((album) => {
          if (album) {
            const pictures = album.pictures;
            pictures[req.body.updatedPicture].name =
              req.body.updatedPictureName;

            updateAlbumPicture(targetedAlbumName, pictures).then((respo) => {
              if (respo.acknowledged) {
                handleSuccess(res);
              } else {
                handleError("La photo n'a pas pu être renommée", res);
              }
            });
          }
        });
      }
    }
  );
});

app.post("/deleteAlbumPictures", (req, res) => {
  let { targetedAlbumName, adminUsername, accessToken } = req.body;

  // On vérifie la validité du token
  validateAdminToken(adminUsername, accessToken, "connection", res).then(
    (resp) => {
      if (resp) {
        getAlbumHandler(targetedAlbumName, res).then((album) => {
          if (getAlbumHandler(targetedAlbumName, res)) {
            // Sinon supprimer les photos
            const pictures = removeValuesFromArray(
              req.body.deletedPictures,
              album.pictures
            );

            updateAlbumPicture(targetedAlbumName, pictures).then((respo) => {
              if (respo.acknowledged) {
                handleSuccess(res);
              } else {
                handleError("Les photos n'ont pas pu être supprimées", res);
              }
            });
          }
        });
      }
    }
  );
});

////////////////
/// SETTINGS ///
////////////////
app.get("/getSettings", (req, res) => {
  getSettings().then((settings) => {
    res.json({ settings });
  });
});

app.post("/updateSetting", (req, res) => {
  let { settingName, adminUsername, accessToken, newValue } = req.body;

  // On vérifie la validité du token
  validateAdminToken(adminUsername, accessToken, "connection", res).then(
    (resp) => {
      if (resp) {
        isSettingHandler(settingName, res).then((setting) => {
          if (setting) {
            updateSetting(settingName, newValue).then((respo) => {
              if (respo.acknowledged) {
                handleSuccess(res);
              } else {
                handleError("Le paramètre n'a pas pû être sauvegardé", res);
              }
            });
          }
        });
      }
    }
  );
});

////////////////
/// USERNAME ///
////////////////
app.post("/resetUsername", (req, res) => {
  let { adminUsername, accessToken } = req.body;

  // On vérifie la validité du token
  validateAdminToken(adminUsername, accessToken, "connection", res).then(
    (resp) => {
      if (resp) {
        sendRecoverUsernameMail(adminUsername, res);
      }
    }
  );
});

app.post("/changeUsername", (req, res) => {
  let { token, newUsername } = req.body;

  // On vérifie la validité du token
  validateAdminToken(adminUsername, token, "resetUsername", res).then(
    (resp) => {
      if (resp) {
        // Si valide, on change l'username
        updateAdminUsername(token.username, newUsername).then((respo) => {
          if (respo.acknowledged) {
            handleSuccess(res);
          } else {
            handleError("L'adresse email n'a pas pû être modifiée", res);
          }
        });
      }
    }
  );
});

////////////////
/// PASSWORD ///
////////////////
app.post("/recoverPassword", (req, res) => {
  let username = req.body.username;

  // On vérifie que l'utilisateur existe en bdd
  isAdminHandler(username, res).then((resp) => {
    if (resp) {
      // Si oui, on envoi un mail avec lien de récupération de mot de passe
      sendRecoverPasswordMail(username, res);
    }
  });
});

app.post("/changePassword", (req, res) => {
  let tokenValue = req.body.token;
  let newPassword = bcrypt.hashSync(req.body.newPassword, SALT);

  // On vérifie que le token est valide
  getTokenChangePasswordHandler(tokenValue, res).then((token) => {
    if (token) {
      // Si valide, on change le mdp
      updateAdminPassword(token.username, newPassword).then((resp) => {
        if (resp.acknowledged) {
          handleSuccess(res);
        } else {
          handleError("Le mot de passe n'a pas pû être modifié", res);
        }
      });
    }
  });
});

////////////////
///// MAIL /////
////////////////
app.post("/sendMail", (req, res) => {
  let { name, email, message } = req.body;

  getFirstAdmin().then((admin) => {
    sendContactMail(admin.username, name, email, message, res);
  });
});

async function main() {
  try {
    await client.connect();

    console.log("Connecté à la base de données MongoDB !");

    db = client.db();
  } catch (error) {
    console.error("Erreur de connexion à la base de données :", error);
  } finally {
    // N'oubliez pas de fermer la connexion lorsque vous avez fini !
    // client.close();
  }
}

main().catch(console.error);

// All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
  res.sendFile(
    path.resolve(__dirname, "../../photographer-website/build", "index.html")
  );
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
