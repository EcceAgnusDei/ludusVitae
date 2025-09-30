require("dotenv").config();
const https = require("https");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const querystring = require("querystring");
const fs = require("fs");

///////////////////////////////////////////////////////
/////////////////////CONFIG///////////////////////////
/////////////////////////////////////////////////////
const user = process.env.USER;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;

const options = {
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost.pem"),
};

const pool = mysql.createPool({
  host: "127.0.0.1",
  user,
  password,
  database,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});
/////////////////////////////////////////////////////////
/////////////////////FUNCTIONS///////////////////////////
/////////////////////////////////////////////////////////
async function insertGrid(aliveCells, userId) {
  const query = "INSERT INTO grids (alive_cells, user_id) VALUES (?, ?)";
  const values = [aliveCells, userId];
  const [result] = await pool.execute(query, values);
  console.log("Données insérées avec succès, ID:", result.insertId);

  return result;
}

async function getGrid(gridId) {
  const query = "SELECT alive_cells FROM grids WHERE id = ?";
  const values = [gridId];

  const [result] = await pool.execute(query, values);
  console.log("Données sélectionnées avec succès:", result);

  return result;
}

async function getUserByEmail(email) {
  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  if (rows.length === 0) {
    return false;
  } else return rows[0];
}

async function getUserByName(name) {
  const [rows] = await pool.execute("SELECT * FROM users WHERE user_name = ?", [
    name,
  ]);
  if (rows.length === 0) {
    return false;
  } else return rows[0];
}

async function addUser(name, email, userPassword) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userPassword, saltRounds);
  const userByEmail = await getUserByEmail(email);
  const userByName = await getUserByName(name);

  if (userByEmail) {
    console.log("Email déjà existant", userByEmail);
    return { success: false, message: "Email déjà existant" };
  } else if (userByName) {
    console.log("Nom déjà existant", userByName);
    return { success: false, message: "Nom déjà existant" };
  } else {
    const query =
      "INSERT INTO users (user_name, password, email) VALUES (?, ?, ?)";
    const values = [name, hashedPassword, email];
    const [result] = await pool.execute(query, values);
    console.log("Utilisateur enregistré avec succès:", result);
    return { success: true, message: "Compte créé" };
  }
}

/////////////////////////////////////////////////////////
////////////////////CREATE SERVER///////////////////////
////////////////////////////////////////////////////////
try {
  const server = https.createServer(options, async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    const url = new URL(req.url, `https://${req.headers.host}`);

    const cookies = querystring.parse(req.headers.cookie || "", "; ");
    let sessionId = cookies["sessionId"];
    console.log(url.href);
    //////////////////////METHODE OPTIONS///////////////////////
    ///////////////////////////////////////////////////////////
    if (req.method === "OPTIONS") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Le serveur accèpte la requête");
      return;
      ////////////////////METHODES POST////////////////////////
      /////////////////////////////////////////////////////////
    } else if (req.method === "POST") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", async () => {
        const parsedBody = JSON.parse(body);
        ////////////////////GRID POST/////////////////////
        if (url.pathname === "/post") {
          try {
            const id = url.pathname.split("/")[2];
            const result = await insertGrid(JSON.stringify(parsedBody.data), 2);
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
          /////////////////////LOGIN//////////////////////////
        } else if (url.pathname === "/login") {
          try {
            const { userEmail, userPassword } = parsedBody;
            const userByEmail = await getUserByEmail(userEmail);
            if (!userByEmail) {
              res.end(
                JSON.stringify({
                  success: false,
                  message: "Ce compte n'existe pas",
                })
              );
            } else {
              const isMatch = await bcrypt.compare(
                userPassword,
                userByEmail.password
              ); ///!!!!!!
              if (!isMatch) {
                res.end(
                  JSON.stringify({
                    success: false,
                    message: "Mot de passe incorrect",
                  })
                );
              } else {
                const expiresAt = new Date(Date.now() + 3600 * 1000 * 24); // Expire dans 24h
                await pool.execute(
                  "INSERT INTO sessions (session_id, user_id, expires_at) VALUES (?, ?, ?)",
                  [uuidv4(), userByEmail.id, expiresAt]
                );
                res.setHeader(
                  "Set-Cookie",
                  `sessionId=${uuidv4()}; Expires=${expiresAt.toUTCString()}; HttpsOnly; Path=/; SameSite=None; secure`
                );
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    success: true,
                    message: "Connexion réussie",
                  })
                );
              }
            }
          } catch (error) {
            console.error(
              "Échec de l'opération d'authentification",
              error.message
            );
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error: "Echec de l'opération d'authentification",
              })
            );
          }
          ////////////////////SIGNIN//////////////////////////
        } else if (url.pathname === "/signin") {
          try {
            const { userName, userEmail, userPassword } = parsedBody; //////////try!!!
            const result = await addUser(userName, userEmail, userPassword);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result));
          } catch (error) {
            console.error("Échec de l'opération d'inscription", error.message);
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ error: "Echec de l'opération d'inscription" })
            );
          }
        }
      });
      ///////////////////METHODE GET/////////////////////
      //////////////////////////////////////////////////
    } else if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Coucou");
      ///////////////////GET GRID//////////////////////
      if (url.pathname.startsWith("/grids/") && /^\d+$/.test(id)) {
        try {
          const [{ alive_cells: aliveCells }] = await getGrid(id);
          console.log("Données reçus:", aliveCells);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ data: JSON.stringify(aliveCells) }));
        } catch (error) {
          console.log("Impossible d'obtenir la grille: ", error.message);
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Impossible d'obtenir la grille" }));
        }
      }
    }
  });

  server.listen(3000, () => {
    console.log("Serveur en écoute sur https://localhost:3000");
  });
} catch (error) {
  console.error("Erreur lors du chargement des certificats :", err.message);
}

process.on("SIGINT", async () => {
  console.log("Fermeture du serveur et du pool...");
  await pool.end();
  console.log("Pool MySQL fermé");
  process.exit();
});

/*

//Route pour vérifier la session
    if (path === '/profile' && req.method === 'GET') {
      if (userId) {
        const [users] = await connection.execute(
          'SELECT username FROM users WHERE id = ?',
          [userId]
        );
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Utilisateur connecté avec l'ID: ${userId}, Nom: ${users[0].username}`);
      } else {
        res.writeHead(401, { 'Content-Type': 'text/plain' });
        res.end('Non connecté');
      }
      return;
    }

//Route pour déconnexion
    if (path === '/logout' && req.method === 'POST') {
      if (sessionId) {
        await connection.execute('DELETE FROM sessions WHERE session_id = ?', [sessionId]);
        setCookie(res, 'sessionId', '', 0); // Supprimer le cookie
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Déconnexion réussie');
      } else {
        res.writeHead(401, { 'Content-Type': 'text/plain' });
        res.end('Aucune session active');
      }
      return;
    } 
  
    
    
    */
