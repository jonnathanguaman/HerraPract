const { Op, fn, col } = require("sequelize")
const { Venta, DetalleVenta, Producto, Cliente } = require("../models")
const { ValidationError } = require("../utils/errors")

const parseDateRange = (desde, hasta) => {
  const start = desde ? new Date(`${desde}T00:00:00`) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const end = hasta ? new Date(`${hasta}T23:59:59.999`) : new Date()

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new ValidationError("Las fechas deben tener formato YYYY-MM-DD")
  }
  if (start > end) {
    throw new ValidationError("La fecha desde no puede ser mayor que la fecha hasta")
  }

  return { start, end }
}

const reporteController = {
  ventas: async (req, res, next) => {
    try {
      const { start, end } = parseDateRange(req.query.desde, req.query.hasta)
      const whereFecha = { fecha: { [Op.between]: [start, end] } }

      const [ventas, totalVendido, productosMasVendidos] = await Promise.all([
        Venta.findAll({
          where: whereFecha,
          include: [
            { model: Cliente, as: "cliente" },
            { model: DetalleVenta, as: "detalles", include: [{ model: Producto, as: "producto" }] },
          ],
          order: [["fecha", "DESC"]],
        }),
        Venta.sum("total", { where: whereFecha }),
        DetalleVenta.findAll({
          attributes: [
            "productoId",
            [fn("SUM", col("cantidad")), "cantidadVendida"],
            [fn("SUM", col("subtotal")), "totalVendido"],
          ],
          include: [
            { model: Producto, as: "producto", attributes: ["id", "nombre", "precio", "stock"] },
            { model: Venta, as: "venta", attributes: [], where: whereFecha },
          ],
          group: ["DetalleVenta.productoId", "producto.id"],
          order: [[fn("SUM", col("cantidad")), "DESC"]],
          limit: 10,
        }),
      ])

      res.json({
        desde: start.toISOString(),
        hasta: end.toISOString(),
        totalVentas: ventas.length,
        totalVendido: Number(totalVendido || 0),
        ventas,
        productosMasVendidos,
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = reporteController
