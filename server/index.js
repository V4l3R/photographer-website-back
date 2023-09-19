const path = require('path');
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt")
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'melissachesiphoto@gmail.com',
        pass: 'btbd escp gtnt lnna'
    }
});

const SALT = "$2b$10$BSMOEfTEeFdYjVkpFkF0xu";

// var mongo = require('mongodb');
// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/collectionsDb";


// MongoClient.connect(url, function (err, db) {
//     if (err) throw err;
//     console.log("Database created!");
//     db.close();
// });


var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/testDb";
var db = [];

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

const client = new MongoClient(url, options);

const PORT = process.env.PORT || 3001;

const app = express();

app.use(bodyParser.urlencoded({ extended: true })); //this line is already mentioned above
app.use(bodyParser.json());//add this line

const upload = multer({
    dest: "./albums"
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

const handleSuccess = (res) => {
    res
        .status(200)
        .contentType("text/plain")
        .end();
    // .end(res);
    // .end(succ);
};

const handleSuccessAndReturnToken = (res, token) => {

    console.log("on aaaaaaaaaaa token");
    console.log(token);

    res
        .status(200)
        .contentType("text/plain")
        .end(token);
    // .end(res);
    // .end(succ);
};

const handleError = (err, res) => {
    res
        .status(500)
        .contentType("text/plain")
        .end(err);
};

function unlinksAndSuccess(files, res) {
    files.forEach(el => {
        fs.unlink(el.path, err => {
            if (err) return handleError(err, res);
        });
    });
    handleSuccess(res);
}

function unlinksAndError(files, errorMsg, res) {
    files.forEach(el => {
        fs.unlink(el.path, err => {
            if (err) return handleError(err, res);
        });
    });
    handleError(errorMsg, res);
}

function removeExtFromName(picName) {

    const array = picName.split('.');
    array.pop();
    return array.length > 0 ? array.join('.') : picName;

}

function generateSalt() {
    // bcrypt.hashSync(req.body.password1, SALT).then(hash => {
    // console.log("on a comme hash : ");
    // console.log(bcrypt.hashSync(req.body.password, salt));
    // })
    // bcrypt.genSalt(10).then(salt => {
    //     console.log("on a comme salt : ");
    //     console.log(salt);
    //     return bcrypt.hashSync(req.body.password1, salt);
    // })
    // .then(hash => {
    //     console.log("on a comme hash : ");
    //     console.log(hash);
    // })
    // .catch(err => {
    //     handleError(err, res);
    // })
}

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

function addAdminCollection() {

    return db.createCollection("admin", (res) => {
        console.log("Collection créée");
        db.close();
        return res;
    })
}

function addAdminData() {

    // var myobj = { username: "test@test.com", password: "123" };
    var myobj = { username: "test@test.com", password: "$2b$10$BSMOEfTEeFdYjVkpFkF0xuosMK3nPFTvk9CXlRlVYdVbVqZRp/Fca" };
    return db.collection("admin").insertOne(myobj);

}

function addSettingsCollection() {

    return db.createCollection("settings", (res) => {
        console.log("Collection créée");
        db.close();
        return res;
    })
}

function addSettingsData() {

    addSpecificSettings({ name: "galleryImageHeight", label: "Hauteur des images (en px)", value: "200px" });
    addSpecificSettings({ name: "gallerySpacing", label: "Espacement des images (en px)", value: "2px" });
    addSpecificSettings({ name: "facebookUrl", label: "Url vers page facebook", value: "http://www.facebook.com" });
    addSpecificSettings({ name: "twitterUrl", label: "Url vers page twitter", value: "http://www.twitter.com" });
    addSpecificSettings({ name: "instagramUrl", label: "Url vers page instagram", value: "http://www.instagram.com" });
    addSpecificSettings({ name: "pinterestUrl", label: "Url vers page pinterest", value: "http://www.pinterest.com" });
    addSpecificSettings({ name: "youtubeUrl", label: "Url vers page youtube", value: "http://www.youtube.com" });

    // var myobj = { name: "galleryImageHeight", label: "Hauteur des images (en px)", value: "200px" };
    // return db.collection("settings").insertOne(myobj);

}

function addSpecificSettings(speSett) {

    // var myobj = { name: "galleryImageHeight", label: "Hauteur des images (en px)", value: "200px" };
    return db.collection("settings").insertOne(speSett);

}

function addAlbumsCollection() {

    return db.createCollection("albums", (res) => {
        console.log("Collection créée");
        db.close();
        return res;
    })
}

function addTokensCollection() {

    return db.createCollection("tokens", (res) => {
        console.log("Collection créée");
        db.close();
        return res;
    })
}

function addTokensData() {

    let dayInMilli = 1000 * 60 * 60 * 24;
    let hourInMilli = 1000 * 60 * 60;
    // var myobj = { name: "connection", username:"test@test.com", value: "xxxxxxxxxxxxxx", end: Date.now() + dayInMilli };
    // var myobj = { name: "resetPassword", username:"test@test.com", value: "yyyyyyyyyyyyyy", end: Date.now() + hourInMilli };
    // var myobj = { name: "resetUsername", username:"test@test.com", value: "zzzzzzzzzzzzzz", end: Date.now() + hourInMilli };
    return db.collection("tokens").insertOne(speSett);

}

function initDb() {
    addAdminCollection().then(() => {
        addAdminData().then(() => {
            addSettingsCollection().then(() => {
                addAlbumsCollection().then(() => {
                    addSettingsData();
                })
            })
        })
    })
}

function getToken(tokenValue) {

    return db.collection("tokens").findOne({ value: tokenValue }).then((res) => {
        // console.log("on a comme reponse : ");
        // console.log(res);
        return res;
    });

}

function getAdmin(username) {

    console.log('on est dans special admin');
    console.log(username);

    return db.collection("admin").findOne({ username: username }).then((res) => {
        console.log("on a comme reponse special admin : ");
        console.log(res);
        return res;
    });

}

function getOneAdmin() {

    return db.collection("admin").findOne({}).then((res) => {
        console.log("on a comme reponse single admin : ");
        console.log(res);
        return res;
    });

}

function updateAdminUsername(oldUsername, newUsername) {

    var myquery = { username: oldUsername };
    var newvalues = { $set: { username: newUsername } };

    return db.collection("admin").updateOne(myquery, newvalues).then((res) => {
        console.log("on a comme reponse : ");
        console.log(res);

        return res;
    });

}

function updateAdminPassword(username, newPassword) {

    var myquery = { username: username };
    var newvalues = { $set: { password: newPassword } };

    return db.collection("admin").updateOne(myquery, newvalues).then((res) => {
        console.log("on a comme reponse : ");
        console.log(res);

        return res;
    });

}

function getAlbum(albumName) {

    // var res = db.collection("albums").findOne({ name: albumName });
    // console.log(res);
    return db.collection("albums").findOne({ name: albumName }).then((res) => {
        // console.log("on a comme reponse : ");
        // console.log(res);
        return res;
    });

}

function getDefaultAlbum() {

    // initDb();

    return db.collection("albums").findOne({ isDefault: true }).then((res) => {
        // console.log("on a comme reponse : ");
        // console.log(res);
        return res;
    });

}

function getSettings() {

    // initDb();


    // return db.collection("settings").find({}).then((res) => {
    return db.collection("settings").find({}).toArray().then((res) => {
        console.log("on a pour settings : ");
        console.log(res);

        return res;
    });

}

function getSetting(settingName) {

    return db.collection("settings").findOne({ name: settingName }).then((res) => {
        // console.log("on a comme reponse : ");
        // console.log(res);
        return res;
    });

}

function updateSetting(settingName, newValue) {

    var myquery = { name: settingName };
    var newvalues = { $set: { value: newValue } };

    return db.collection("settings").updateOne(myquery, newvalues).then((res) => {
        console.log("on a comme reponse : ");
        console.log(res);

        return res;
    });

}

function getAllAlbums() {

    return db.collection("albums").find({}).toArray().then((res) => {
        // console.log("on a pour all : ");
        // console.log(res);
        return res;
    });

}

function addAlbum(albumName) {

    var myobj = { name: albumName, isDefault: false, pictures: [] };
    // var myobj = { name: "Album 1", pictures: [{ name: "1.png", base64: "xxx" }, { name: "2.png", base64: "yyy" }] };
    return db.collection("albums").insertOne(myobj);

}

function updateAlbumName(oldAlbumName, newAlbumName) {

    // albumName = "Mickey 2";
    // picturesArray = [{ name: picName1, base64: xxx }];

    var myquery = { name: oldAlbumName };
    var newvalues = { $set: { name: newAlbumName } };

    return db.collection("albums").updateOne(myquery, newvalues).then((res) => {
        console.log("on a comme reponse : ");
        console.log(res);

        return res;
    });

}

function updateAlbumPicture(albumName, picturesArray) {

    // albumName = "Mickey 2";
    // picturesArray = [{ name: picName1, base64: xxx }];

    var myquery = { name: albumName };
    var newvalues = { $set: { pictures: picturesArray } };
    return db.collection("albums").updateOne(myquery, newvalues).then(res => {
        // console.log("on a comme reponse : ");
        // console.log(res);
        return res;
    });

}

function updateAlbumDefault(albumName, isDefault) {

    var myquery = { name: albumName };
    var newvalues = { $set: { isDefault: isDefault } };
    return db.collection("albums").updateOne(myquery, newvalues).then(res => {
        // console.log("on a comme reponse : ");
        // console.log(res);
        return res;
    });


}

function deleteAlbum(albumName) {

    //   albumName = "Album 2"
    return db.collection("albums").deleteOne({ name: albumName }).then((res) => {
        console.log("on a comme reponse : ");
        console.log(res);
        return res;
    });

}

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../../photographer-website/build')));

app.post('/connect', (req, res) => {

    let username = req.body.username;
    let password = bcrypt.hashSync(req.body.password, SALT);

    getAdmin(username).then((admin) => {

        if (admin === null) {
            handleError("L'utilisateur n'a pas été trouvé", res);
        } else {

            if (admin.password !== password) {
                handleError("Le mot de passe est incorrect", res);
            } else {

                createConnectionToken(username, res);

            }
        }
    })
})

app.post('/saveAlbum', (req, res) => {

    var albumName = req.body.newAlbumName;

    let adminUsername = req.body.adminUsername;
    let accessToken = req.body.accessToken;

    // On vérifie la validité du token
    if (validateAdminToken(adminUsername, accessToken, res)) {

        getAlbum(albumName).then(album => {

            // Si l'album existe deja, retourner erreur
            if (album !== null) {
                handleError("L'album existe deja", res);
            } else {

                // Sinon sauvegarder l'album
                addAlbum(albumName).then(resp => {
                    if (resp.acknowledged) {
                        handleSuccess(res);
                    } else {
                        handleError("L'album n'a pas pu être sauvegardé", res);
                    }
                })
            }
        })
    }

});

app.post('/renameAlbum', (req, res) => {

    var oldAlbumName = req.body.targetedAlbumName;
    var newAlbumName = req.body.newAlbumName;

    let adminUsername = req.body.adminUsername;
    let accessToken = req.body.accessToken;

    // On vérifie la validité du token
    if (validateAdminToken(adminUsername, accessToken, res)) {

        getAlbum(oldAlbumName).then(oldAlbum => {

            // Si l'album n'existe pas, retourner erreur
            if (oldAlbum === null) {
                handleError("L'album n'existe pas", res);
            } else {

                getAlbum(newAlbumName).then(newAlbum => {

                    // Si le nouveau nom d'album est deja pris, retourner erreur
                    if (newAlbum !== null) {
                        handleError("Ce nom d'album est deja pris", res);
                    } else {
                        // Sinon renommer l'album
                        updateAlbumName(oldAlbumName, newAlbumName).then(resp => {
                            if (resp.acknowledged) {
                                handleSuccess(res);
                            } else {
                                handleError("L'album n'a pas pu être renommé", res);
                            }
                        })
                    }
                })
            }
        })
    }
});

app.post('/updateDefaultAlbum', (req, res) => {

    var albumName = req.body.targetedAlbumName;

    let adminUsername = req.body.adminUsername;
    let accessToken = req.body.accessToken;

    // On vérifie la validité du token
    if (validateAdminToken(adminUsername, accessToken, res)) {

        console.log("on cherche : ");
        console.log(albumName);

        getAlbum(albumName).then(album => {

            // Si l'album n'existe pas, on retourner une erreur
            if (album === null) {
                handleError("L'album n'existe pas", res);
            } else {

                // On cherche s'il existe un album par default, si oui on le passe a false
                getDefaultAlbum().then(defaultAlbum => {
                    if (defaultAlbum !== null) {
                        updateAlbumDefault(defaultAlbum.name, false);
                    }
                })

                // Dans tous les cas, on passe l'album trouvé à true
                updateAlbumDefault(album.name, true);
                handleSuccess(res);
            }
        })
    }

})

app.post('/uploadPictures',
    upload.array("files", 100),
    (req, res) => {

        var albumName = req.body.targetedAlbumName;

        let adminUsername = req.body.adminUsername;
        let accessToken = req.body.accessToken;

        // On vérifie la validité du token
        if (validateAdminToken(adminUsername, accessToken, res)) {

            getAlbum(albumName).then(album => {

                // Si l'album n'existe pas, retourner erreur
                if (album === null) {
                    // handleError("L'album n'existe pas", res);
                    unlinksAndError(req.files, "L'album n'existe pas", res);
                } else {

                    const pictures = album.pictures;

                    // Sinon sauvegarder les photos
                    req.files.forEach(file => {

                        let fileObj = {};
                        fileObj.name = removeExtFromName(file.originalname);
                        fileObj.base64 = base64_encode(file.path);
                        pictures.push(fileObj);

                    })

                    updateAlbumPicture(albumName, pictures).then(resp => {
                        if (resp.acknowledged) {
                            // handleSuccess(res);
                            unlinksAndSuccess(req.files, res);
                        } else {
                            // handleError("Les photos n'ont pas pu être sauvegardées", res);
                            unlinksAndError(req.files, "Les photos n'ont pas pu être sauvegardées", res);
                        }
                    })
                }
            })

        }
    });

app.post('/updatePictureName', (req, res) => {

    var albumName = req.body.targetedAlbumName;

    let adminUsername = req.body.adminUsername;
    let accessToken = req.body.accessToken;

    // On vérifie la validité du token
    if (validateAdminToken(adminUsername, accessToken, res)) {

        getAlbum(albumName).then(album => {
            // Si l'album n'existe pas, retourner erreur
            if (album === null) {
                handleError("L'album n'existe pas", res);
            } else {
    
                const pictures = album.pictures;
                pictures[req.body.updatedPicture].name = req.body.updatedPictureName;
    
                updateAlbumPicture(albumName, pictures).then(resp => {
                    if (resp.acknowledged) {
                        handleSuccess(res);
                    } else {
                        handleError("La photo n'a pas pu être renommée", res);
                    }
                })
            }
        })
    }
});

app.post('/deleteAlbumPictures', (req, res) => {

    var albumName = req.body.targetedAlbumName;

    let adminUsername = req.body.adminUsername;
    let accessToken = req.body.accessToken;

    // On vérifie la validité du token
    if (validateAdminToken(adminUsername, accessToken, res)) {

        getAlbum(albumName).then(album => {
    
            // Si l'album n'existe pas, retourner erreur
            if (album === null) {
                handleError("L'album n'existe pas", res);
            } else {
    
                const pictures = album.pictures;
    
                // Sinon supprimer les photos
                req.body.deletedPictures.split(",").sort(function (a, b) { return b - a }).forEach(picture => {
                    pictures.splice(picture, 1);
                });
    
                updateAlbumPicture(albumName, pictures).then(resp => {
                    if (resp.acknowledged) {
                        handleSuccess(res);
                    } else {
                        handleError("Les photos n'ont pas pu être supprimées", res);
                    }
                })
            }
        })
    }
});

app.post('/deleteAlbum', (req, res) => {

    var albumName = req.body.targetedAlbumName;

    let adminUsername = req.body.adminUsername;
    let accessToken = req.body.accessToken;

    // On vérifie la validité du token
    if (validateAdminToken(adminUsername, accessToken, res)) {

        getAlbum(albumName).then(album => {
    
            // Si l'album n'existe pas, retourner erreur
            if (album === null) {
                handleError("L'album n'existe pas", res);
                console.log("album non trouvé");
            } else {
    
                deleteAlbum(albumName).then(resp => {
                    if (resp.acknowledged) {
                        handleSuccess(res);
                    } else {
                        handleError("L'album n'a pas pu être supprimé", res);
                    }
                })
            }
        })
    }
});

app.get('/getAlbumsList', (req, res) => {

    getAllAlbums().then((allAlbums) => {
        let albumsName = [];
        allAlbums.forEach(album => {
            albumsName.push(album.name);
        });

        res.json({ albumsName });
    });

});

app.get('/getSettings', (req, res) => {

    getSettings().then((settings) => {
        // let settingsData = settings[0];
        res.json({ settings });
    })

})

app.post('/updateSetting', (req, res) => {

    let settingName = req.body.settingName;
    let adminUsername = req.body.adminUsername;
    let accessToken = req.body.accessToken;

    console.log("post updateSetting");
    console.log(req.body);
    console.log(adminUsername);
    console.log(accessToken);


    // On vérifie la validité du token
    if (validateAdminToken(adminUsername, accessToken, res)) {

        getSetting(settingName).then(setting => {

            if (setting === null) {
                handleError("Le paramètre n'existe pas", res)
            } else {

                console.log("jjjjjjjjjjjjjjjjj2");

                let newValue = req.body.newValue;

                updateSetting(settingName, newValue).then(resp => {

                    if (resp.acknowledged) {
                        handleSuccess(res);
                    } else {
                        handleError("Le paramètre n'a pas pû être sauvegardé", res);
                    }

                })
            }
        })
    }
})

app.get('/getDefaultAlbumName', (req, res) => {

    getDefaultAlbum().then((defaultAlbum) => {

        let defaultAlbumName = "";
        if (defaultAlbum !== null) {
            defaultAlbumName = defaultAlbum.name;
        }

        res.json({ defaultAlbumName });
    })

})

app.post('/getAlbumPictures', (req, res) => {

    console.log("on recoit");

    var albumName = req.body.targetedAlbumName;
    console.log(albumName);
    // var albumName = dumbAlbumName;
    // var albumName = "teton3";

    getAlbum(albumName).then((album) => {
        res.json(album);
    });

});

app.post('/resetUsername', (req, res) => {

    let adminUsername = req.body.adminUsername;
    let accessToken = req.body.accessToken;

    // On vérifie la validité du token
    if (validateAdminToken(adminUsername, accessToken, res)) {
        sendRecoverUsernameMail(adminUsername, res);
    }

    // On vérifie que l'utilisateur existe en bdd
    // getAdmin(adminUsername).then((admin) => {

    //     // Si non, on envoi une erreur
    //     if (admin === null) {
    //         handleError("Vous n'êtes pas connecté", res);
    //     } else {

    //         // On vérifie que le token existe
    //         getToken(accessToken).then(token => {

    //             // Si non, on retourne une erreur
    //             if (token === null) {
    //                 handleError("Vous n'êtes pas connecté", res);
    //             } else {

    //                 // Si oui, on vérifie la validité du token
    //                 if (token.name === "connect" && token.end > Date.now() && token.username === adminUsername) {

    //                     // Si oui, on envoi un mail avec un lien de modification de nom d'utilisateur
    //                     sendRecoverUsernameMail(admin.username);
    //                     handleSuccess(res);

    //                 } else {

    //                     // Si invalide, on retourne une erreur
    //                     handleError("Le token n'est pas valide", res);

    //                 }
    //             }
    //         })
    //     }
    // })
})

app.post('/changeUsername', (req, res) => {

    let tokenValue = req.body.token;
    let newUsername = req.body.newUsername;

    // On vérifie que le token existe
    getToken(tokenValue).then((token) => {

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
                    if (token.name === "resetUsername" && token.end > Date.now() && token.username === admin.username) {

                        // Si valide, on change l'username
                        updateAdminUsername(token.username, newUsername).then((resp) => {

                            if (resp.acknowledged) {
                                handleSuccess(res);
                            } else {
                                handleError("L'adresse email n'a pas pû être modifiée", res)
                            }
                        })

                    } else {

                        // Si invalide, on retourne une erreur
                        handleError("Le token n'est pas valide", res);

                    }
                }
            })
        }
    })

})

app.post('/recoverPassword', (req, res) => {

    let username = req.body.username;

    // On vérifie que l'utilisateur existe en bdd
    getAdmin(username).then((admin) => {

        // Si non, on envoi une erreur
        if (admin === null) {
            handleError("L'utilisateur n'a pas été trouvé", res);
        } else {

            // Si oui, on envoi un mail avec lien de récupération de mot de passe
            sendRecoverPasswordMail(username);

        }
    })
})

app.post('/changePassword', (req, res) => {

    // let username = req.body.username;
    let tokenValue = req.body.token;
    let newPassword = bcrypt.hashSync(req.body.newPassword, SALT);

    console.log("changePassword");
    console.log(req.body);

    // On vérifie que le token existe
    getToken(tokenValue).then((token) => {

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

                        console.log("iciiiiiiiiiii :");
                        console.log(token.end);
                        console.log(Date.now());
                        console.log(token.end > Date.now());

                        // Si valide, on change le mdp
                        updateAdminPassword(token.username, newPassword).then(resp => {

                            if (resp.acknowledged) {
                                handleSuccess(res);
                            } else {
                                handleError("Le mot de passe n'a pas pû être modifié", res)
                            }
                        })

                    } else {

                        // Si invalide, on retourne une erreur
                        handleError("Le token n'est pas valide", res);

                    }
                }
            })
        }
    })
})

app.post('/sendMail', (req, res) => {

    console.log("on est dans sendMail");
    let { name, email, message } = req.body;
    console.log(name, email, message);

    var mailOptions = {
        from: 'youremail@gmail.com',
        to: 'valerian.cuq@gmail.com',
        subject: name + ' vous a envoyé un message.',
        html: name + ' (' + email + ') t\'a envoyé le message suivant : <br/><br/>' + message,
    };

    transporter.sendMail(mailOptions, function (error, info) {

        if (error) {
            console.log(error);
            handleError("Le mail n'a pas pû être envoyé", res);
        } else {
            console.log('Email sent: ' + info.response);
            handleSuccess(res);
        }
    });
})

function sendRecoverUsernameMail(username, res) {

    // addTokensCollection();


    var lien = createUsernameTokenAndCreateLink(username);

    var mailOptions = {
        from: 'youremail@gmail.com',
        to: username,
        subject: 'Changement de votre adresse email',
        html: 'Bonjour, <br/> Vous avez demandé un changement de votre adresse email. Pour confirmer, suivez ce lien : ' + lien + " <br/> Si vous n'êtes pas à l'origine de cette action, vous devriez changer votre mot de passe car cette action a été probablement effectuée avec vos identifiants."
    };

    transporter.sendMail(mailOptions, function (error, info) {

        if (error) {
            console.log(error);
            handleError("Le mail n'a pas pû être envoyé", res);
        } else {
            console.log('Email sent: ' + info.response);
            handleSuccess(res);
        }
    });

}

function createConnectionToken(username, res) {

    let token = bcrypt.hashSync(Date.now().toString(), SALT);
    console.log("on a token : ");
    console.log(token);

    let dayInMilli = 1000 * 60 * 60 * 24;
    var myobj = { name: "connection", username: username, value: token, end: Date.now() + dayInMilli };
    // return db.collection("tokens").insertOne(speSett);
    db.collection("tokens").insertOne(myobj).then((resp) => {
        if (resp.acknowledged) {
            console.log("on a create connection token : ");
            console.log(token);

            handleSuccessAndReturnToken(res, token);

        } else {
            handleError("La base de donnée n'a pas pû être contactée", res);
        }
    })

}

function createUsernameTokenAndCreateLink(username) {

    let token = bcrypt.hashSync(Date.now().toString(), SALT);
    console.log("on a token : ");
    console.log(token);

    let hourInMilli = 1000 * 60 * 60;
    var myobj = { name: "resetUsername", username: username, value: token, end: Date.now() + hourInMilli };
    // return db.collection("tokens").insertOne(speSett);
    db.collection("tokens").insertOne(myobj);

    return 'http://localhost:3001/updateUsername?t=' + token;

}

function sendRecoverPasswordMail(username) {

    // addTokensCollection();


    var lien = createPasswordTokenAndCreateLink(username);

    var mailOptions = {
        from: 'youremail@gmail.com',
        to: username,
        subject: 'Récupération de votre mot de passe',
        html: 'Bonjour, <br/> Vous avez demandé une réinitialisation de votre mot de passe. Pour créer un nouveau mot de passe, suivez ce lien : ' + lien + " <br/> Si vous n'êtes pas à l'origine de cette action, vous pouvez ignorer ce mail. Cependant, vous devez noter que quelqu'un a tenté de modifier votre mot de passe."
    };

    transporter.sendMail(mailOptions, function (error, info) {

        if (error) {
            console.log(error);
            handleError("Le mail n'a pas pû être envoyé", res);
        } else {
            console.log('Email sent: ' + info.response);
            handleSuccess(res);
        }
    });

}

function createPasswordTokenAndCreateLink(username) {

    let token = bcrypt.hashSync(Date.now().toString(), SALT);
    console.log("on a token : ");
    console.log(token);

    let hourInMilli = 1000 * 60 * 60;
    var myobj = { name: "resetPassword", username: username, value: token, end: Date.now() + hourInMilli };
    // return db.collection("tokens").insertOne(speSett);
    db.collection("tokens").insertOne(myobj);

    return 'http://localhost:3001/updatePassword?t=' + token;

}

async function validateAdminToken(adminUsername, accessToken, res) {

    console.log("validateAdminToken");
    console.log("username");
    console.log(adminUsername);
    console.log("token");
    console.log(accessToken);

    // On vérifie que l'utilisateur existe en bdd
    getAdmin(adminUsername).then((admin) => {

        // Si non, on envoi une erreur
        if (admin === null) {
            handleError("Vous n'êtes pas connecté", res);
        } else {

            // On vérifie que le token existe
            getToken(accessToken).then(token => {

                // Si non, on retourne une erreur
                if (token === null) {
                    handleError("Vous n'êtes pas connecté", res);
                } else {

                    // Si oui, on vérifie la validité du token
                    if (token.name === "connection" && token.end > Date.now() && token.username === adminUsername) {

                        return true;

                    } else {

                        // Si invalide, on retourne une erreur
                        handleError("Le token n'est pas valide", res);

                    }
                }
            })
        }
    })

}

async function main() {
    try {

        await client.connect();

        console.log('Connecté à la base de données MongoDB !');

        db = client.db();

    } catch (error) {
        console.error('Erreur de connexion à la base de données :', error);
    } finally {
        // N'oubliez pas de fermer la connexion lorsque vous avez fini !
        // client.close();
    }
}

main().catch(console.error);



// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../photographer-website/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});