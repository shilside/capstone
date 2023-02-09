const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const bikeLocationUrl =
  "https://gbfs.velobixi.com/gbfs/en/station_information.json";

// Create a GET endpoint to fetch the bike locations
app.get("/bike-locations", (req, res) => {
  const request = require("request");
  // Make a GET request to the bike location URL
  request(bikeLocationUrl, (error, response, body) => {
    if (error) {
      return res.status(500).json({ error });
    }
    if (response.statusCode !== 200) {
      return res
        .status(response.statusCode)
        .json({ error: response.statusMessage });
    }
    const bikeData = JSON.parse(body);

    // Map the bike location data to a new format
    const bikeLocations = bikeData.data.stations.map((locations) => {
      return {
        station_id: locations.station_id,
        name: locations.name,
        lat: locations.lat,
        lon: locations.lon,
      };
    });
    return res.status(200).json(bikeLocations);
  });
});

//get station-status
app.get("/station-status", (req, res) => {
  const request = require("request");
  const bikeStatusUrl = "https://gbfs.velobixi.com/gbfs/en/station_status.json";
  request(bikeStatusUrl, (error, response, body) => {
    if (error) {
      return res.status(500).json({ error });
    }
    if (response.statusCode !== 200) {
      return res
        .status(response.statusCode)
        .json({ error: response.statusMessage });
    }
    const stationData = JSON.parse(body);

    const stationStatus = stationData.data.stations.map((status) => {
      return {
        station_id: status.station_id,
        bikes_available: status.num_docks_available,
      };
    });
    return res.status(200).json(stationStatus);
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
