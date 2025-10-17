require("dotenv").config();
const https = require("https");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const querystring = require("querystring");
const fs = require("fs");
const path = require("path");

///////////////////////////////////////////////////////
/////////////////////CONFIG///////////////////////////
/////////////////////////////////////////////////////

const options = {
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost.pem"),
};

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});
/////////////////////////////////////////////////////////
/////////////////////FUNCTIONS///////////////////////////
/////////////////////////////////////////////////////////
async function insertGrid(aliveCells, gridSize, userId) {
  const query =
    "INSERT INTO grids (alive_cells, grid_size, user_id, likes) VALUES (?, ?, ?,JSON_ARRAY())";
  const values = [aliveCells, gridSize, userId];
  const [result] = await pool.execute(query, values);
  console.log("Grille insérée avec succès, ID:", result.insertId);

  return result;
}

async function likeGrid(gridId, userId) {
  await pool.execute(
    "UPDATE grids SET likes = JSON_ARRAY_APPEND(likes, '$', ?) WHERE grid_id = ?;",
    [userId + "", gridId]
  );
}

async function unLikeGrid(gridId, userId) {
  await pool.execute(
    `UPDATE grids
      SET likes = JSON_REMOVE(
        likes,
        JSON_UNQUOTE(JSON_SEARCH(likes, 'one', ?))
      )
      WHERE grid_id = ?
      AND JSON_SEARCH(likes, 'one', ?) IS NOT NULL;`,
    [userId + "", gridId, userId + ""]
  );
}

async function getGrid(gridId) {
  const query = "SELECT alive_cells, likes FROM grids WHERE grid_id = ?";
  const values = [gridId];

  const [grid] = await pool.execute(query, values);
  console.log("Grille trouvé avec succès: ", grid[0]);
  return grid[0];
}

async function getGrids(userId) {
  if (userId) {
    const values = [userId];
    const query =
      "SELECT alive_cells,likes, grid_id, grid_size FROM grids WHERE user_id = ?";
    const [grids] = await pool.execute(query, values);
    console.log("Grilles de l'utilisateur trouvées avec succès", grids);
    return grids;
  } else {
    const query = "SELECT alive_cells, likes, grid_id, grid_size FROM grids";
    const [grids] = await pool.execute(query);
    console.log("Grilles trouvées avec succès");
    return grids;
  }
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

async function getUserBySessionId(sessionId) {
  if (sessionId) {
    const query =
      "SELECT u.* FROM users u JOIN sessions s ON u.user_id = s.user_id WHERE s.session_id = ? AND s.expires_at > CURRENT_TIMESTAMP";
    const values = [sessionId];
    const [result] = await pool.execute(query, values);

    return result[0];
  } else {
    return undefined;
  }
}

async function addUser(name, email, userPassword) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userPassword, saltRounds);
  const userByEmail = await getUserByEmail(email);
  const userByName = await getUserByName(name);

  if (userByEmail) {
    return { success: false, message: "Email déjà existant" };
  } else if (userByName) {
    return { success: false, message: "Nom déjà existant" };
  } else {
    const query =
      "INSERT INTO users (user_name, password, email) VALUES (?, ?, ?)";
    const values = [name, hashedPassword, email];
    const [result] = await pool.execute(query, values);
    console.log("Utilisateur enregistré avec succès:", result);
    return { success: true, message: "Compte créé avec succès" };
  }
}

async function login(email, password, res) {
  const userByEmail = await getUserByEmail(email);
  if (!userByEmail) {
    return {
      success: false,
      message: "Ce compte n'existe pas",
    };
  } else {
    const isMatch = await bcrypt.compare(password, userByEmail.password); ///!!!!!!
    if (!isMatch) {
      return {
        success: false,
        message: "Mot de passe incorrect",
      };
    } else {
      const newSessionId = uuidv4();
      const expiresAt = new Date(Date.now() + 3600 * 1000 * 24);
      await pool.execute(
        "INSERT INTO sessions (session_id, user_id, expires_at) VALUES (?, ?, ?)",
        [newSessionId, userByEmail.user_id, expiresAt]
      );
      console.log("Utilisateur connecté:", userByEmail.user_id);
      res.setHeader(
        "Set-Cookie",
        `sessionId=${newSessionId}; Expires=${expiresAt.toUTCString()}; HttpsOnly; Path=/;`
      );
      return {
        success: true,
        data: { userId: userByEmail.user_id },
        message: "Connexion réussie",
      };
    }
  }
}

async function logout(sessionId, res) {
  await pool.execute("DELETE FROM sessions WHERE session_id = ?", [sessionId]);
  res.setHeader("Set-Cookie", "sessionId=; Max-Age=0; Path=/; HttpsOnly;");
}
/////////////////////////////////////////////////////////
////////////////////CREATE SERVER///////////////////////
////////////////////////////////////////////////////////
const server = https.createServer(options, async (req, res) => {
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  const allowedOrigin = "https://localhost:3000";
  const origin = req.headers["origin"] || req.headers["referer"];

  const url = new URL(req.url, `https://${req.headers.host}`);
  const cookies = querystring.parse(req.headers.cookie || "", "; ");
  let sessionId = cookies["sessionId"];
  let user;
  //////////////////////METHODE OPTIONS///////////////////////
  ///////////////////////////////////////////////////////////
  if (req.method === "OPTIONS") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Le serveur accèpte la requête");
    return;
    ////////////////////METHODES POST////////////////////////
    /////////////////////////////////////////////////////////
  } else if (req.method === "POST") {
    if (!origin || !origin.startsWith(allowedOrigin)) {
      ///contre attaques CSRF
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Requête non autorisée" }));
      return;
    }

    try {
      user = await getUserBySessionId(sessionId);
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end({
        error: `Impossible d'authentifier l'utilisateur: ${error.message}`,
      });
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const parsedBody = body && JSON.parse(body);
      ////////////////////GRID POST/////////////////////
      if (url.pathname === "/post") {
        try {
          if (user) {
            console.log(parsedBody.data);
            const result = await insertGrid(
              JSON.stringify(parsedBody.data.aliveCells),
              JSON.stringify(parsedBody.data.gridSize),
              user.user_id
            );
            console.log("Résultat de l'insertion :", result);
          } else {
            throw new Error(
              "Seul un utilisateur identifié peut enregistrer une grille en base de données"
            );
          }

          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: "Données reçues", data: parsedBody })
          );
        } catch (error) {
          console.error("Échec de l'opération d'insertion :", error.message);
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message }));
        }
        /////////////////////LOGIN//////////////////////////
      } else if (url.pathname === "/login") {
        if (parsedBody) {
          try {
            const { userEmail, userPassword } = parsedBody;
            const result = await login(userEmail, userPassword, res);
            res.writeHead(200, { "content-type": "application/json" });
            res.end(
              JSON.stringify({
                data: result.data.userId,
                success: true,
              })
            );
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
        } else if (user) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              data: { userId: user.user_id },
              message: "Utilisateur connecté au démarrage",
              success: true,
            })
          );
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              message: "Pas d'utilisateur authentifié au démarrage",
            })
          );
        }
        /////////////////////LOGOUT//////////////////////////
      } else if (url.pathname === "/logout") {
        try {
          if (!user) {
            throw new Error("Utilisateur non identifié pour: déconnexion");
          }
          await logout(sessionId, res);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: "Déconnexion réussie",
              success: true,
            })
          );
        } catch (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: "Echec de la déconnexion",
            })
          );
          console.log("Erreur lors de la déconnexion: ", error.message);
        }
        ////////////////////SIGNIN//////////////////////////
      } else if (url.pathname === "/signin") {
        try {
          const { userName, userEmail, userPassword } = parsedBody;
          const signinResult = await addUser(userName, userEmail, userPassword);
          const loginResult = await login(userEmail, userPassword, res);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ signin: signinResult, login: loginResult }));
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
    ///////////////////GET GRID//////////////////////
    const gridId = url.pathname.split("/")[2];
    if (url.pathname.startsWith("/grid/") && /^\d+$/.test(gridId)) {
      try {
        const { alive_cells: aliveCells, grid_size: gridSize } = await getGrid(
          gridId
        );
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ data: JSON.stringify({ aliveCells, gridSize }) })
        );
      } catch (error) {
        console.log("Impossible d'obtenir la grille: ", error.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Impossible d'obtenir la grille" }));
      }
    }
    ///////////////GET ALL GRIDS//////////////////
    else if (url.pathname === "/grids/") {
      try {
        const [...grids] = await getGrids();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ data: { grids, user } }));
      } catch (error) {
        console.log("Impossible d'obtenir les grille: ", error.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      }
    }
    /////////////////GET USER GRIDS//////////////////
    else if (url.pathname === "/mygrids/") {
      try {
        user = await getUserBySessionId(sessionId);
        const [...grids] = await getGrids(user.user_id);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ data: { grids, user } }));
      } catch (error) {
        console.log("Impossible d'obtenir les grille: ", error.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      }
    }
    ////////////////////////GET SITE FILES/////////////////////
    else if (url.pathname.startsWith("/")) {
      try {
        const mimeTypes = {
          ".html": "text/html",
          ".css": "text/css",
          ".js": "application/javascript",
          ".png": "image/png",
        };
        const filePath = path.join(
          __dirname,
          "../public",
          url.pathname === "/" ? "index.html" : url.pathname
        );
        const ext = path.extname(filePath);
        const contentType = mimeTypes[ext];
        const content = await fs.promises.readFile(filePath, "utf-8");
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      } catch (error) {
        console.log("Impossible de charger la page ", error.message);
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("404 Fichier non trouvé");
      }
    }
    ////////////////////METHODE PUT//////////////////////
    /////////////////////////////////////////////////////
  } else if (req.method === "PUT") {
    const gridId = url.pathname.split("/")[2];
    try {
      user = await getUserBySessionId(sessionId);
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end({
        error: `Impossible d'authentifier l'utilisateur: ${error.message}`,
      });
      return;
    }
    //////////////////LIKE GRID/////////////////////
    if (url.pathname.startsWith("/like/") && /^\d+$/.test(gridId)) {
      try {
        const resp = await likeGrid(gridId, user.user_id);
        res.writeHead(200, { "content-type": "application/json" });
        console.log("Grille likée avec succès");
        res.end(JSON.stringify({ data: "Grille likée" }));
      } catch (error) {
        res.writeHead(500, { "content-type": "application/json" });
        console.log("La gille n'a pas peu être likée", error.message);
        res.end(JSON.stringify({ error: error.message }));
      }
    }
    //////////////////UNLIKE GRID////////////////////////
    else if (url.pathname.startsWith("/unlike/") && /^\d+$/.test(gridId)) {
      try {
        await unLikeGrid(gridId, user.user_id);
        res.writeHead(200, { "content-type": "application/json" });
        console.log("Grille unlikée avec succès");
        res.end(JSON.stringify({ data: "Grille unlikée" }));
      } catch (error) {
        res.writeHead(500, { "content-type": "application/json" });
        console.log("La gille n'a pas peu être unlikée", error.message);
        res.end(JSON.stringify({ error: error.message }));
      }
    } else {
      res.writeHead(404, { "content-type": "text/plain" }); /////!!!!!!!! à tester
      res.end("Cette page n'existe pas");
    }
  }
});

server.listen(3000, () => {
  console.log("Serveur en écoute sur https://localhost:3000");
});

process.on("SIGINT", async () => {
  console.log("Fermeture du serveur et du pool...");
  await pool.end();
  console.log("Pool MySQL fermé");
  process.exit();
});
