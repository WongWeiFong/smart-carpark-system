const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/test", (req, res) => {
  res.send({ message: "API connected successfully" });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
