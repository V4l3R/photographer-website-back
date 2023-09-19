function initDb() {
  addAdminCollection().then(() => {
    addAdminData().then(() => {
      addSettingsCollection().then(() => {
        addAlbumsCollection().then(() => {
          addTokensCollection().then(() => {
            addSettingsData();
          });
        });
      });
    });
  });
}

function addAdminCollection() {
  return db.createCollection("admin", (res) => {
    console.log("Collection créée");
    db.close();
    return res;
  });
}

function addAdminData() {
  var myobj = {
    username: "test@test.com",
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

function addAlbumsCollection() {
  return db.createCollection("albums", (res) => {
    db.close();
    return res;
  });
}

function addTokensCollection() {
  return db.createCollection("tokens", (res) => {
    console.log("Collection créée");
    db.close();
    return res;
  });
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
    value: "http://www.facebook.com",
  });
  addSpecificSettings({
    name: "twitterUrl",
    label: "Url vers page twitter",
    value: "http://www.twitter.com",
  });
  addSpecificSettings({
    name: "instagramUrl",
    label: "Url vers page instagram",
    value: "http://www.instagram.com",
  });
  addSpecificSettings({
    name: "pinterestUrl",
    label: "Url vers page pinterest",
    value: "http://www.pinterest.com",
  });
  addSpecificSettings({
    name: "youtubeUrl",
    label: "Url vers page youtube",
    value: "http://www.youtube.com",
  });
}

function addSpecificSettings(speSett) {
  return db.collection("settings").insertOne(speSett);
}

module.exports = {};
