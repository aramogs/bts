const express = require('express');
const router = express.Router();
const routesController = require('./routesController')
const multer = require('multer')
const upload = multer()

//Routes

router.get('/', routesController.index_GET);
router.get('/acceso_denegado',routesController.accesoDenegado_GET);
router.get('/registro', routesController.registro_GET);
router.get('/getProgramacion/:fecha', routesController.getProgramacion_GET);
router.get('/getComponentes/:numPart', routesController.getComponentes_GET);
router.get('/getPlataforma/:numPart', routesController.getPlataforma_GET);
router.get('/getAreas', routesController.getAreas_GET);
router.post('/guardarProd', routesController.guardarProd_POST);
router.get('/cargaProgramacion', routesController.cargaProgramacion_GET);
router.post('/insertar_excel/:id_carga', upload.single("excelFile"), routesController.insertar_excel_POST);
router.post('/deleteInsert_excel/:id_borrar/:id_carga', upload.single("excelFile"), routesController.deleteInsert_excel_POST);
router.post('/verificarFechas/:id_carga', upload.single("excelFile"), routesController.verificarFechas_POST);
router.get('/guardarProd',routesController.guardarProd_GET);
router.get('/detalleDiario',routesController.detalleDiario_GET);
router.post('/guardarAjuste', routesController.guardarAjuste_POST);
router.get('/getAjuste/:fecha', routesController.getAjuste_GET);
router.get('/getCantidadMensual/:selectedDate/:selectedMonth/:cliente',routesController.getCantidadMensual_GET);
router.get('/graficaClienteArea',routesController.graficaClienteArea_GET);

// // router.get('*', (req, res) => {
// //   res.redirect('http://tftdelsrv001:3000/not_found');
// // });
module.exports = router;