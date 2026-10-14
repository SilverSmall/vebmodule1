"use strict";

/**
 * Точка входу застосунку: збирає Express-застосунок з маршрутів і обробників
 * помилок. Сама бізнес-логіка живе в `src/`.
 */

const express = require("express");
const ordersRouter = require("./src/routes/orders");
const {
  validationProblem,
  routeNotFoundProblem,
  internalProblem,
} = require("./src/problems");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const API_VERSION = "1.0";

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

// Перевірка стану не залежить від обробки замовлень.
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    version: API_VERSION,
  });
});

app.use("/orders", ordersRouter);

app.use((req, res) => {
  res.status(404).json(routeNotFoundProblem());
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json(
      validationProblem("Invalid JSON body", [
        "Request body must contain valid JSON",
      ]),
    );
  }

  console.error(error);
  return res.status(500).json(internalProblem());
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Orders API is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
