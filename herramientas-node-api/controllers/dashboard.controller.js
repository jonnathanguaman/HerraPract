const { Op, fn, col } = require("sequelize")
const { Venta, DetalleVenta, Producto, Cliente } = require("../models")

const STOCK_BAJO_UMBRAL = 5

const startOfToday = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

const dashboardController = {
  resumen: async (req, res, next) => {
    try {
      const inicioHoy = startOfToday()

      const [
        totalProductos,
        productosStockBajo,
        ventasHoy,
        totalVendidoHoy,
        ventasRecientes,
        productosMenorStock,
      ] = await Promise.all([
        Producto.count(),
        Producto.findAll({
          where: { stock: { [Op.lte]: STOCK_BAJO_UMBRAL } },
          include: [{ model: require("../models").Categoria, as: "categoria" }],
          order: [["stock", "ASC"], ["nombre", "ASC"]],
          limit: 8,
        }),
        Venta.count({ where: { fecha: { [Op.gte]: inicioHoy } } }),
        Venta.sum("total", { where: { fecha: { [Op.gte]: inicioHoy } } }),
        Venta.findAll({
          include: [
            { model: Cliente, as: "cliente" },
            { model: DetalleVenta, as: "detalles", include: [{ model: Producto, as: "producto" }] },
          ],
          order: [["fecha", "DESC"]],
          limit: 6,
        }),
        Producto.findAll({
          include: [{ model: require("../models").Categoria, as: "categoria" }],
          order: [["stock", "ASC"], ["nombre", "ASC"]],
          limit: 8,
        }),
      ])

      res.json({
        totalProductos,
        productosStockBajo,
        ventasHoy,
        totalVendidoHoy: Number(totalVendidoHoy || 0),
        ventasRecientes,
        productosMenorStock,
        stockBajoUmbral: STOCK_BAJO_UMBRAL,
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = dashboardController
