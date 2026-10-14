"use strict";

/**
 * HTTP-шар замовлень: читає параметри запиту, викликає бізнес-логіку та
 * перетворює її результат на статус-код і тіло відповіді.
 */

const express = require("express");
const orders = require("../orders");
const { validationProblem, orderNotFoundProblem } = require("../problems");

const router = express.Router();

/** Публічне представлення замовлення: приховує внутрішні поля запису. */
function toResponse(order) {
  return {
    id: order.id,
    customerName: order.customerName,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    total: order.total,
    status: order.status,
  };
}

router.post("/", (req, res) => {
  const problems = orders.validateOrderInput(req.body);

  if (problems.length > 0) {
    return res.status(400).json(validationProblem("Invalid order", problems));
  }

  const created = orders.createOrder(req.body);

  return res
    .status(201)
    .location(`/orders/${created.id}`)
    .json(toResponse(created));
});

router.get("/", (req, res) => {
  const result = orders.listOrders().map(toResponse);

  return res.status(200).json({ orders: result, count: result.length });
});

router.get("/:id", (req, res) => {
  const order = orders.getOrder(req.params.id);

  if (!order) {
    return res.status(404).json(orderNotFoundProblem());
  }

  return res.status(200).json(toResponse(order));
});

router.delete("/:id", (req, res) => {
  if (!orders.deleteOrder(req.params.id)) {
    return res.status(404).json(orderNotFoundProblem());
  }

  return res.status(204).send();
});

module.exports = router;
