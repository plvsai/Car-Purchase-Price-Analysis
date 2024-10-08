const express = require("C:/Users/plvsa/node_modules/express");
const app = express();
app.listen(5000, () => console.log("listening at 5000"));
app.use(express.static("public"));
