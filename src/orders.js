"use strict";

/**
 * Бізнес-логіка замовлень.
 *
 * Тут живуть правила предметної області: валідація вхідних даних, нормалізація,
 * розрахунок `total` і створення запису. Модуль не знає про Express, коди
 * статусу HTTP і формати відповідей.
 */

const { randomUUID } = require("node:crypto");
const store = require("./store");

const DEFAULT_ORDER_STATUS = "created";

function makeOrderId() {
  return `ord-${randomUUID().slice(0, 8)}`;
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateTotal(items) {
  return roundMoney(
    items.reduce((sum, item) => sum + item.quantity * item.price, 0),
  );
}

function isPositiveNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Повертає список проблем валідації. Порожній масив означає, що тіло запиту
 * придатне для створення замовлення.
 */
function validateOrderInput(body) {
  const problems = [];

  if (!isPlainObject(body)) {
    problems.push("Request body must be a JSON object");
    return problems;
  }

  if (!isNonEmptyString(body.customerName)) {
    problems.push("customerName is required");
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    problems.push("At least one item is required");
    return problems;
  }

  body.items.forEach((item, index) => {
    if (!isPlainObject(item)) {
      problems.push(`items[${index}] must be an object`);
      return;
    }

    if (!isNonEmptyString(item.name)) {
      problems.push(`items[${index}].name is required`);
    }

    if (!isPositiveNumber(item.quantity)) {
      problems.push(`items[${index}].quantity must be greater than zero`);
    }

    if (!isPositiveNumber(item.price)) {
      problems.push(`items[${index}].price must be greater than zero`);
    }
  });

  return problems;
}

function normalizeItems(items) {
  return items.map((item) => ({
    name: item.name.trim(),
    quantity: item.quantity,
    price: item.price,
  }));
}

/**
 * Створює замовлення з уже валідованого тіла запиту.
 * `id`, `status` і `total` завжди визначає сервер.
 */
function createOrder(body) {
  const items = normalizeItems(body.items);

  const order = {
    id: makeOrderId(),
    customerName: body.customerName.trim(),
    items,
    total: calculateTotal(items),
    status: DEFAULT_ORDER_STATUS,
    createdAt: new Date().toISOString(),
  };

  return store.create(order);
}

function listOrders() {
  return store.list();
}

function getOrder(id) {
  return store.findById(id);
}

function deleteOrder(id) {
  return store.removeById(id);
}

module.exports = {
  validateOrderInput,
  createOrder,
  listOrders,
  getOrder,
  deleteOrder,
};
