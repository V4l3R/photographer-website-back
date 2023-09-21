const SMTP_MAIL = "melissachesiphoto@gmail.com";

async function drobDb() {
  return removeTokensCollection().then(() => {
    return removeAlbumsCollection().then(() => {
      return removeSettingsCollection().then(() => {
        return removeAdminCollection();
      });
    });
  });
}

async function initDb() {
  return addAdminCollection().then(() => {
    return addAdminData().then(() => {
      return addSettingsCollection().then(() => {
        return addAlbumsCollection().then(() => {
          return addTokensCollection().then(() => {
            return addSettingsData().then(() => {
              return true;
            });
          });
        });
      });
    });
  });
}

async function resetDb() {
  return drobDb().then(() => {
    return initDb();
  });
}

function addAdminCollection() {
  return db.createCollection("admin", (res) => {
    console.log("Collection créée");
    db.close();
    return res;
  });
}

function removeAdminCollection() {
  return db.collection("admin").drop({});
  // return db.collection("admin").drop((err, delOk) => {
  //   console.log("Collection créée");
  //   db.close();
  //   return res;
  // });
}

function addAdminData() {
  var myobj = {
    username: SMTP_MAIL,
    password: "$2b$10$BSMOEfTEeFdYjVkpFkF0xuosMK3nPFTvk9CXlRlVYdVbVqZRp/Fca",
  };
  return db.collection("admin").insertOne(myobj);
}

function addSettingsCollection() {
  return db.createCollection("settings", (res) => {
    console.log("Collection créée");
    db.close();
    return res;
  });
}

function removeSettingsCollection() {
  return db.collection("settings").drop({});
}

function addAlbumsCollection() {
  return db.createCollection("albums", (res) => {
    db.close();
    return res;
  });
}

function removeAlbumsCollection() {
  return db.collection("albums").drop({});
}

function addTokensCollection() {
  return db.createCollection("tokens", (res) => {
    console.log("Collection créée");
    db.close();
    return res;
  });
}

function removeTokensCollection() {
  return db.collection("tokens").drop({});
}

function addSettingsData() {
  addSpecificSettings({
    name: "galleryImageHeight",
    label: "Hauteur des images (en px)",
    value: "200px",
  });
  addSpecificSettings({
    name: "gallerySpacing",
    label: "Espacement des images (en px)",
    value: "2px",
  });
  addSpecificSettings({
    name: "facebookUrl",
    label: "Url vers page facebook",
    value: encodeURI("http://www.facebook.com"),
  });
  addSpecificSettings({
    name: "twitterUrl",
    label: "Url vers page twitter",
    value: encodeURI("http://www.twitter.com"),
  });
  addSpecificSettings({
    name: "instagramUrl",
    label: "Url vers page instagram",
    value: encodeURI("http://www.instagram.com"),
  });
  addSpecificSettings({
    name: "pinterestUrl",
    label: "Url vers page pinterest",
    value: encodeURI("http://www.pinterest.com"),
  });
  return addSpecificSettings({
    name: "youtubeUrl",
    label: "Url vers page youtube",
    value: encodeURI("http://www.youtube.com"),
  });
}

function addSpecificSettings(speSett) {
  return db.collection("settings").insertOne(speSett);
}

module.exports = { resetDb };
