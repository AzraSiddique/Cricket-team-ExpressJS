const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      //const { port } = server.address();//
      console.log(`Server running at http://localhost:3000/`);
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDBObjToResponseObj = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
    jerseyNumber: object.jersey_number,
    role: object.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
  SELECT * 
  FROM cricket_team 
  ORDER BY player_id`;
  const playerList = await db.all(getPlayerQuery);
  response.send(
    playerList.map((eachItem) => convertDBObjToResponseObj(eachItem))
  );
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO cricket_team(player_name, jersey_number, role)
  VALUES (
      '${playerName}',
      ${jerseyNumber},
      '${role}'
  )`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastId;
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
  SELECT * 
  FROM cricket_team 
  WHERE player_id=${playerId}`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDBObjToResponseObj(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const getPlayerQuery = `
   UPDATE cricket_team
   SET 
   player_name='${playerName}',
   jersey_number=${jerseyNumber},
   role='${role}'
   WHERE player_id=${playerId};`;
  await db.run(getPlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    DELETE FROM cricket_team 
    WHERE player_id=${playerId};`;
  await db.run(getPlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
