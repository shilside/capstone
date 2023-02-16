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
  database: "bike_locations",
});

client.connect();

client.query(
  `
  CREATE TABLE IF NOT EXISTS bike_locations (
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
      console.log("Table created successfully");
    }
  }
);

app.post("/stations", (req, res) => {
  const data = req.body;
  let values = [];

  data.forEach((item) => {
    values.push(
      `(${item.station_id}, '${item.name}', ${item.lat}, ${item.lon})`
    );
  });

  client.query(
    `
    INSERT INTO bike_locations (station_id, name, lat, lon)
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
  client.query("SELECT * FROM bike_locations", (err, result) => {
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
app.delete("/stations/:id", (req, res) => {
  const { id } = req.params;

  client.query(
    `DELETE FROM bike_locations WHERE station_id = ${id}`,
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

app.listen(3333, () => {
  console.log("Server listening on port 3333");
});
