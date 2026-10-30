
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend connected successfully"
  });
});

test("Health endpoint returns success", async () => {
  const response = await request(app)
    .get("/api/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
});

test("Unknown endpoint returns 404", async () => {
  const response = await request(app)
    .get("/api/nonexistent");

  assert.equal(response.status, 404);
});
