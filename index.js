const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const referralsRouter = require("./routes/referals");

require("dotenv").config();

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api", referralsRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
