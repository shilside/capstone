const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("pg");

const app = express();
app.use(bodyParser.json());

const client = new Client({
  host: "localhost",
  port: 5800,
  user: "postgres",
  password: "Scroll5000",
  database: "stations",
});

client.connect();

client.query(
  `
  CREATE TABLE IF NOT EXISTS stations (  
      station_id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      lat NUMERIC NOT NULL,
      lon NUMERIC NOT NULL  
  );
  
`,
  (err) => {
    if (err) {
      console.error(`Error creating table: ${err}`);
    } else {
      console.log("Stations Table created successfully");
    }
  }
);

app.post("/stations", (req, res) => {
  const data = req.body;
  let values = [];

  data.forEach((item) => {
    const name = item.name.replace(/'/g, "''");
    values.push(`(${item.station_id}, '${name}', ${item.lat}, ${item.lon})`);
  });

  client.query(
    `
    INSERT INTO stations (station_id, name, lat, lon)
    VALUES ${values.join(",")}
  `,
    (err, result) => {
      if (err) {
        console.error(`Error inserting data: ${err}`);
        res.send({ error: "Error inserting data" });
      } else {
        console.log(`Data inserted successfully: ${result}`);
        res.send({ message: "Data inserted successfully" });
      }
    }
  );
});

//get data from database
app.get("/stations", (req, res) => {
  client.query("SELECT * FROM stations", (err, result) => {
    if (err) {
      console.error(`Error getting data: ${err}`);
      res.send({ error: "Error getting data" });
    } else {
      console.log(`Data retrieved successfully: ${result}`);
      res.send(result.rows);
    }
  });
});

//delete data from database
app.delete("/stations/:station_id", (req, res) => {
  const { station_id } = req.params;

  client.query(
    `DELETE FROM stations WHERE station_id = ${station_id}`,
    (err, result) => {
      if (err) {
        console.error(`Error deleting data: ${err}`);
        res.send({ error: "Error deleting data" });
      } else {
        console.log(`Data deleted successfully: ${result}`);
        res.send({ message: "Data deleted successfully" });
      }
    }
  );
});

//creating a new table for bikes under each station, should be releted to fk station_id

client.query(
  `
  CREATE TABLE IF NOT EXISTS bikes (
    bike_id TEXT PRIMARY KEY,
    station_id INTEGER REFERENCES stations (station_id),
    battery INTEGER NOT NULL,
    is_booked BOOLEAN NOT NULL,
    is_reserved BOOLEAN NOT NULL,
    is_returned BOOLEAN NOT NULL,
    is_damaged_or_lost BOOLEAN NOT NULL
  );
  
  
`,
  (err) => {
    if (err) {
      console.error(`Error creating table: ${err}`);
    } else {
      console.log("Bikes Table created successfully");
    }
  }
);

app.post("/bikes", (req, res) => {
  const bikeData = {
    battery: 100,
    is_booked: false,
    is_reserved: false,
    is_returned: true,
    is_damaged_or_lost: false,
  };

  client.query("SELECT station_id FROM stations", (err, result) => {
    if (err) {
      console.error(`Error fetching data: ${err}`);
      res.send({ error: "Error fetching data" });
    } else {
      const stationIds = result.rows.map((row) => row.station_id);

      const values = [];
      for (let i = 0; i < stationIds.length; i++) {
        for (let j = 1; j <= 10; j++) {
          const bikeId = `${stationIds[i]}${j.toString().padStart(2, "0")}`;
          values.push(
            `('${bikeId}', ${stationIds[i]}, ${bikeData.battery}, ${bikeData.is_booked}, ${bikeData.is_reserved}, ${bikeData.is_returned}, ${bikeData.is_damaged_or_lost})`
          );
        }
      }

      client.query(
        `INSERT INTO bikes (bike_id, station_id, battery, is_booked, is_reserved, is_returned, is_damaged_or_lost) VALUES ${values.join(
          ","
        )}`,
        (err, result) => {
          if (err) {
            console.error(`Error inserting data: ${err}`);
            res.send({ error: "Error inserting data" });
          } else {
            console.log(`Data inserted successfully: ${result}`);
            res.send({ message: "Data inserted successfully" });
          }
        }
      );
    }
  });
});

//get data from bikes database
app.get("/bikes", (req, res) => {
  client.query("SELECT * FROM bikes", (err, result) => {
    if (err) {
      console.error(`Error getting data: ${err}`);
      res.send({ error: "Error getting data" });
    } else {
      console.log(`Data retrieved successfully: ${result}`);
      res.send(result.rows);
    }
  });
});

app.listen(3333, () => {
  console.log("Server listening on port 3333");
});
