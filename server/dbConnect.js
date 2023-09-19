

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/testDb";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const client = new MongoClient(url, options);

// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     console.log("Database created!");
//     db.close();
//   });


function getFirstAlbum() {

  db.collection("albums").findOne().then((res) => {
    console.log("La promesse est terminée ");
    console.log("on a pour resultat : ");
    console.log(res);
  });

}

function addAlbum2(albumName) {

    return db.createCollection(albumName, (res) => {
        console.log("Collection créée");
        db.close();
        return res;
    });

}

async function main() {
  try {
    await client.connect(); // Connectez-vous à la base de données

    console.log('Connecté à la base de données MongoDB !');

    // Ici, vous pouvez exécuter des opérations sur la base de données, par exemple :
    const db = client.db(); // Obtenez une référence à la base de données
    // console.log("Ici on a la db : ");
    // console.log(db);


    // MODIFIE UN
    // updateAlbum();

    // SUPPR PLUSIEURS
    // NE MARCHE PAS SANS REGEXP
    // db.collection("albums").deleteMany({ name: "Album 1", name: "Album 3" }).then((res) => {
    //   console.log("on a comme reponse : ");
    //   console.log(res);
    // });

    // SUPPR UN SEUL
    // deleteAlbum();

    // TROUVE UN SEUL
    // getAlbums();

    // TROUVE TOUS
    // getAllAlbums();

    // TROUVE LE PREMIER
    // getFirstAlbum();

    // AJOUTE UN
    // addAlbum();

    // CREE UN
    // addAlbum2();

    // var databaseList = await client.db().admin().listDatabases();
    // console.log(`On a comme dbList : `);
    // console.log(databaseList);

    const collection = db.collection('albums'); // Obtenez une référence à la collection
    // console.log("ici on a la collection albums : ");
    // console.log(collection);

    // Pour effectuer des opérations CRUD sur la base de données, consultez la documentation de MongoDB : https://docs.mongodb.com/drivers/node/current/
  } catch (error) {
    console.error('Erreur de connexion à la base de données :', error);
  } finally {
    // N'oubliez pas de fermer la connexion lorsque vous avez fini !
    // client.close();
  }
}

// Appelez la fonction pour établir la connexion
main().catch(console.error);