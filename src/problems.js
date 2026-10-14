"use strict";

/**
 * Формати тіл помилок. Один модуль, щоб коди та повідомлення помилок
 * залишалися узгодженими для всіх маршрутів.
 */

function validationProblem(message, details) {
  return {
    error: {
      code: "VALIDATION_ERROR",
      message,
      details,
    },
  };
}

function orderNotFoundProblem() {
  return {
    error: {
      code: "ORDER_NOT_FOUND",
      message: "Order not found",
    },
  };
}

function routeNotFoundProblem() {
  return {
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "Route not found",
    },
  };
}

function internalProblem() {
  return {
    error: {
      code: "INTERNAL_ERROR",
      message: "Unexpected server error",
    },
  };
}

module.exports = {
  validationProblem,
  orderNotFoundProblem,
  routeNotFoundProblem,
  internalProblem,
};
