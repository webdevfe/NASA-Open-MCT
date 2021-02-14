const express = require("express")
const app = express();
const cors = require('cors');
const path = require('path');
const port = process.env.PORT || 3000;
const axios = require('axios');

app.use(cors());
app.use(express.static(__dirname + '/'));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

async function makeServiceCall(params) {
  return axios.get(`http://localhost:8080/history/${params}`);
}

app.get("/history", async function(req, res) {
  const params = req.query.urlParams;
  try {
    const apiData = await makeServiceCall(params);
    const { data: telemetry } = apiData;
    res.status(200).json({telemetry}).end();
  } catch(e) {
    console.log('in error', e.stack)
    res.status(500).send({error: e.message})
  }
});

app.listen(port, () => console.log(`App is running on port ${port}`));
