require("dotenv").config();

const http = require("http");
const mysql = require("mysql2/promise");

const host = process.env.HOST;
const user = process.env.USER;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;

console.log("user", user, password);

const dbConfig = {
  host,
  user,
  password,
  database,
};

async function insertData(data) {
  let connection;
  try {
    // Établir la connexion
    connection = await mysql.createConnection(dbConfig);
    console.log("Connexion à la base de données réussie");

    // Exemple d'insertion avec des paramètres pour éviter les injections SQL
    const query =
      "INSERT INTO grids (alive_cells, user_id, creation_date) VALUES (?, 10, NOW())";
    const values = [data];

    const [result] = await connection.execute(query, values);
    console.log("Données insérées avec succès, ID:", result.insertId);
    return result;
  } catch (error) {
    // Gestion des erreurs spécifiques
    if (error.code === "ECONNREFUSED") {
      console.error(
        "Erreur : Connexion au serveur MySQL refusée. Vérifiez si le serveur est en cours d'exécution."
      );
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error(
        "Erreur : Accès refusé. Vérifiez votre nom d'utilisateur et mot de passe."
      );
    } else if (error.code === "ER_NO_SUCH_TABLE") {
      console.error("Erreur : La table spécifiée n'existe pas.");
    } else {
      console.error("Erreur lors de l'insertion :", error.message);
    }
    throw error; // Relancer l'erreur si nécessaire pour une gestion supérieure
  } finally {
    // Toujours fermer la connexion
    if (connection) {
      try {
        await connection.end();
        console.log("Connexion à la base de données fermée");
      } catch (error) {
        console.error(
          "Erreur lors de la fermeture de la connexion :",
          error.message
        );
      }
    }
  }
}

// Créer un serveur HTTP
const server = http.createServer((req, res) => {
  // Répondre à la requête
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  //Gestion de la requète options

  if (req.method === "OPTIONS") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Le serveur accèpte la requête");
    return;
  }

  //Gestion de la réception du body

  if (req.method === "POST") {
    let body = "";

    // Écouter les données du body
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convertir les chunks en string
    });

    // Fin de la réception des données
    req.on("end", async () => {
      try {
        const parsedBody = JSON.parse(body); // Parser le JSON
        const result = await insertData(JSON.stringify(parsedBody.data));
        console.log("Résultat de l'insertion :", result);
        // Réponse au client
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ message: "Données reçues", data: parsedBody })
        );
      } catch (error) {
        console.error("Échec de l'opération d'insertion :", error.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Body invalide ou non JSON" }));
      }
    });
  }
});
// Écouter sur le port 3000
server.listen(3000, () => {
  console.log("Serveur en écoute sur http://localhost:3000");
});
