const express = require('express');
const pool = require("./src/db");
 const routes = require('./src/routes');

const app = express();
const port = 3000;

app.use(express.json());
 app.use('/identify', routes);

(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
     console.log("Database connection successful:", result.rows[0]);

  } catch (err) {
    console.error("Error connecting to the database:", err);
  }
})();

app.get('/',(req,res)=>{
  res.send("console.log surver is Running")
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
