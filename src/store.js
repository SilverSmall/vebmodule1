"use strict";

/**
 * Сховище замовлень у пам'яті процесу.
 *
 * Модуль нічого не знає про HTTP, Express чи формати відповідей: він лише
 * зберігає записи замовлень. Дані зникають після перезапуску сервера.
 */

const orders = [];

function create(order) {
  orders.push(order);
  return order;
}

function list() {
  return [...orders];
}

function findById(id) {
  return orders.find((order) => order.id === id);
}

function removeById(id) {
  const index = orders.findIndex((order) => order.id === id);

  if (index === -1) {
    return false;
  }

  orders.splice(index, 1);
  return true;
}

module.exports = { create, list, findById, removeById };
