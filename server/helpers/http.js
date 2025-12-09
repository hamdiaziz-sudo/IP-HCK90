require("dotenv").config();
const app = require("../app"); // karena http.js berada di folder helpers
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
