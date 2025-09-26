require("dotenv").config();

const http = require("http");
const mysql = require("mysql2/promise");

const host = process.env.HOST;
const user = process.env.USER;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;

const pool = mysql.createPool({
  host,
  user,
  password,
  database,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

async function insertGrid(data) {
  try {
    const query =
      "INSERT INTO grids (alive_cells, user_id, creation_date) VALUES (?, 10, NOW())";
    const values = [data];

    const [result] = await pool.execute(query, values);
    console.log("Données insérées avec succès, ID:", result.insertId);

    return result;
  } catch (error) {
    console.error("Erreur lors de l'insertion :", error.message);
    throw error;
  }
}

async function getGrid(gridId) {
  try {
    const query = "SELECT alive_cells FROM grids WHERE id = ?";
    const values = [gridId];

    const [result] = await pool.execute(query, values);
    console.log("Données sélectionnées avec succès:", result);

    return result;
  } catch (error) {
    console.error("Erreur lors de la sélection :", error.message);
    throw error;
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  const url = new URL(req.url, `http://${req.headers.host}`);
  const id = url.pathname.split("/")[2];

  if (req.method === "OPTIONS") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Le serveur accèpte la requête");
    return;
    ////////////////////
  } else if (req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const parsedBody = JSON.parse(body);
        const result = await insertGrid(JSON.stringify(parsedBody.data));
        console.log("Résultat de l'insertion :", result);

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
    //////////////////
  } else if (req.method === "GET" && url.pathname.startsWith("/grids/") && id) {
    try {
      const [{ alive_cells: aliveCells }] = await getGrid(id);
      console.log("Données reçus:", aliveCells);
      res.end(JSON.stringify({ data: JSON.stringify(aliveCells) }));
    } catch (error) {
      console.log("Impossible d'obtenir la grille: ", error.message);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Impossible d'obtenir la grille" }));
    }
  }
});

server.listen(3000, () => {
  console.log("Serveur en écoute sur http://localhost:3000");
});

process.on("SIGINT", async () => {
  console.log("Fermeture du serveur et du pool...");
  await pool.end();
  console.log("Pool MySQL fermé");
  process.exit();
});
