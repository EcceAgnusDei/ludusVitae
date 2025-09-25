const http = require("http");
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456789",
  database: "ludusvitae",
});

connection.connect((err) => {
  if (err) {
    console.error("Erreur de connexion :", err.stack);
    return;
  }
  console.log("Connecté à la base de données avec l'ID :", connection.threadId);
});

connection.query("SELECT * FROM utilisateurs", (err, results) => {
  if (err) {
    console.error("Erreur lors de la requête :", err);
    return;
  }
  console.log("Résultats :", results);
});

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
      console.log(chunk);
      body += chunk.toString(); // Convertir les chunks en string
    });

    // Fin de la réception des données
    req.on("end", () => {
      try {
        const parsedBody = JSON.parse(body); // Parser le JSON
        console.log("Données reçues :", parsedBody);

        // Réponse au client
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ message: "Données reçues", data: parsedBody })
        );
      } catch (error) {
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
