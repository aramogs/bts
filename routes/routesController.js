//Conexion a base de datos
const controller = {};

//Require Funciones
const funcion = require('../public/js/functions/controllerFunctions');
// const { turnosGet, getAreas } = require('../public/js/functions/controllerFunctions');

//Require ExcelJs
const Excel = require('exceljs');


controller.index_GET = (req, res) => {
    user = req.connection.user
    res.render('index.ejs', {
        user
    });
}



controller.accesoDenegado_GET = (req, res) => {

    user = req.connection.user
    res.render('acceso_denegado.ejs', {
        user
    });
}



function acceso(req) {
    let acceso = []
    let userGroups = req.connection.userGroups
    
    return new Promise((resolve, reject) => {
        userGroups.forEach(element => {
            if (element.toString() === 'TFT\\TFT.DEL.PAGES_BTS_CargaProduccion' || element.toString() === 'TFT\\TFT.DEL.PAGES_BTS_CapturaProduccion' || element.toString() === 'TFT\\TFT.DEL.PAGES_BTS_CambioProduccion') {
                acceso.push(element.toString())
            }
        });
        let response = acceso.length == 0 ? reject("noAccess") : resolve(acceso)
    })
    
}


function ExcelDateToJSDate(fecha) {


    let d = new Date(Math.round((fecha - 25569) * 86400 * 1000)),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}


const arreglosExcel = (excel, id_carga) => {
    return new Promise((resolve, reject) => {
        let arreglo = []
        let arreglo2 = []
        let arreglo3 = []
        let arreglo4 = []
        let arreglo5 = []
        let fechas = []

        const wb = new Excel.Workbook();

        wb.xlsx.load(excel)
            .then(() => {
                worksheet = wb.worksheets[0]
                worksheet.eachRow(function (row, rowNumber) {
                    val = row.values
                    for (let i = 0; i < val.length; i++) {
                        if (val[i] === undefined) {
                            val[i] = " "
                        }
                    }
                    arreglo.push(val)
                });
            })
            .then(() => {
                for (let i = 0; i < arreglo.length; i++) {
                    arreglo2 = []
                    for (let y = 1; y < arreglo[i].length; y++) {
                        if (arreglo[i][y] !== '') {
                            arreglo2.push(arreglo[i][y])
                        }
                    }
                    arreglo3.push(arreglo2)
                }
                for (let i = 0; i < arreglo3.length; i++) {

                    for (let y = 2; y < arreglo3[i].length; y++) {
                        arreglo4 = []

                        let cliente = ""
                        let numPart = ""

                        cliente = `"${arreglo3[i][0]}"`
                        numPart = `"${arreglo3[i][1]}"`

                        arreglo4.push(`"${id_carga}"`)
                        arreglo4.push(cliente, numPart)
                        let fecha = parseInt((arreglo3[i][y]).toString().substr(0, 5))
                        let turno = parseInt((arreglo3[i][y]).toString().substring(5, 6))
                        let cantidad = parseInt((arreglo3[i][y]).toString().substr(6))
                        let id = `"${parseInt(fecha)}${parseInt(turno)}${arreglo3[i][1]}"`
                        fechas.push(fecha)
                        arreglo4.push(`"${ExcelDateToJSDate(fecha)}"`)
                        arreglo4.push(turno)
                        arreglo4.push(cantidad)
                        arreglo4.unshift(id)
                        arreglo5.push(arreglo4)
                    }
                }
                resolve({ arreglo5, fechas })
                reject("Error al cargar arreglos")
            })
    })
}


controller.registro_GET = (req, res) => {

    user = req.connection.user
    let status = ""
    let access = ""
    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === 'TFT\\TFT.DEL.PAGES_BTS_CapturaProduccion') access = "ok"
            });
            if (access == "ok") {
                Promise.all([funcion.getCausas(), funcion.getAreas()])
                    .then((values) => {
                        let causas = values[0]
                        let areas = values[1]
                        res.render('registro.ejs', {
                            user,
                            causas,
                            areas,
                            status
                        })
                    })
                    .catch((err) => { console.error(err) })
            } else {
                res.redirect("/acceso_denegado")
            }

        })
        .catch((err) => { res.redirect("/acceso_denegado")})
};


controller.getProgramacion_GET = (req, res) => {
    fecha = req.params.fecha
    funcion.getProgramacion(fecha)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })
}

controller.getComponentes_GET = (req, res) => {
    numPart = req.params.numPart
    funcion.getComponentes(numPart)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })
}

controller.getPlataforma_GET = (req, res) => {
    numPart = req.params.numPart
    funcion.getPlataforma(numPart)
        .then((result) => { res.json(result) })
        .catch((err) => console.error(err))
}

controller.getAreas_GET = (req, res) => {
    funcion.getAreas()
        .then((result) => { res.json(result) })
        .catch((err) => console.error(err))
}


controller.guardarProd_POST = (req, res) => {
    let producido = req.body
    let ids = req.body.id
    let userName = req.body.userName
    userName = userName.replace("TFT\\", "")

    const regexId = /[a-z]+\-/g;
    const regexTitle = /\-(.*)/g;

    function forLoop() {
        return new Promise((resolve, reject) => {
            for (const [key, value] of Object.entries(producido)) {
                for (let i = 0; i < ids.length; i++) {
                    if (ids[i] == key.replace(regexId, "")) {
                        if (value != "") {
                            if (key.replace(regexTitle, '') == "producido") {
                                funcion.postProducido(ids[i], `${key.replace(regexTitle, '')}`, parseInt(value), userName)
                                    .then((result) => { resolve(result) })
                                    .catch((err) => reject(err))
                            } else {
                                funcion.postProducido(ids[i], `${key.replace(regexTitle, '')}`, `${value}`, userName)
                                    .then((result) => { resolve(result) })
                                    .catch((err) => reject(err))
                            }
                        }
                    }
                }
            }
        })
    }


    forLoop()
        .then((result) => {
            let status = "guardado"
            user = req.connection.user
            Promise.all([funcion.getCausas(), funcion.getAreas()])
                .then((values) => {
                    let causas = values[0]
                    let areas = values[1]
                    res.render('registro.ejs', {
                        user,
                        causas,
                        areas,
                        status
                    })
                })
                .catch((err) => { console.error(err) })
        })
        .catch((err) => console.error(err))
}

controller.guardarProd_GET = (req, res, result) => {

    user = req.connection.user
    res.render('guardarProd.ejs', {
        user
    })
}


controller.cargaProgramacion_GET = (req, res) => {
    user = req.connection.user
    let access = ""
    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_BTS_CargaProduccion") access = "ok"
            });
            if (access == "ok") {
                res.render("carga_Producion.ejs", { user })
            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })
}

controller.verificarFechas_POST = (req, res) => {

    id_carga = req.params.id_carga
    let bufferExcel = req.file.buffer
    let ids = []

    arreglosExcel(bufferExcel)
        .then((result) => {
            let uniq = [...new Set(result.fechas)]
            let min = ExcelDateToJSDate(Math.min.apply(Math, uniq))
            let max = ExcelDateToJSDate(Math.max.apply(Math, uniq))

            funcion.checkDates(min, max)
                .then((result) => {
                    if (result.length > 0) {
                        result.forEach(element => {
                            if (ids.indexOf(element.id_carga) === -1) ids.push(element.id_carga);
                        });
                        res.json(ids)
                    } else {
                        res.json("noData")
                    }
                })
                .catch((err) => { console.error(err) })
        })
}

controller.insertar_excel_POST = (req, res) => {
    let bufferExcel = req.file.buffer
    let id_carga = req.params.id_carga
    arreglosExcel(bufferExcel, id_carga)
        .then((result) => {
            funcion.postProgramacion(result.arreglo5)
                .then((result) => { res.json(result) })
                .catch((error) => { console.error(error); })
        })
}

controller.deleteInsert_excel_POST = (req, res) => {
    let bufferExcel = req.file.buffer
    let id_borrar = req.params.id_borrar
    let id_carga = req.params.id_carga

    arreglosExcel(bufferExcel, id_carga)
        .then((result) => {
            let uniq = [...new Set(result.fechas)]
            let min = ExcelDateToJSDate(Math.min.apply(Math, uniq))
            let max = ExcelDateToJSDate(Math.max.apply(Math, uniq))
            funcion.deleteIdCarga(id_borrar)
                .then(() => {
                    funcion.postProgramacion(result.arreglo5)
                        .then((result) => { res.json(result) })
                        .catch((error) => { res.json(error); })
                })
                .catch((err) => { err })
        })
        .catch((err) => { console.error(err); })
}



controller.getAjuste_GET = (req, res) => {
    fecha = req.params.fecha
    funcion.getAjuste(fecha)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })
}

controller.detalleDiario_GET = (req, res) => {

    let status = ""
    user = req.connection.user

    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === 'TFT\\TFT.DEL.PAGES_BTS_CapturaProduccion') access = "ok"
            });
            if (access == "ok") {
                Promise.all([funcion.getJustificacion(), funcion.getResponsables()])
                    .then((values) => {
                        let justificacion = values[0]
                        let responsables = values[1]
                        res.render('detalleDiario.ejs', {
                            user,
                            justificacion,
                            responsables,
                            status
                        })
                    })
                    .catch((err) => { console.error(err) })
            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })
}



controller.guardarAjuste_POST = (req, res) => {


    let producido = req.body
    let ids = req.body.id
    let fecha = req.body.fecha
    const regexId = /[a-z]+\-/g;
    const regexTitle = /\-(.*)/g;


    function forLoop() {
        return new Promise((resolve, reject) => {
            for (const [key, value] of Object.entries(producido)) {
                for (let i = 0; i < ids.length; i++) {
                    if (ids[i] == key.replace(regexId, "")) {
                        if (value != "") {
                            if (key.replace(regexTitle, '') == "piezas") {
                                funcion.getCantidades(ids[i], fecha)
                                    .then((result) => {
                                        let cantidadProgramada = result[0].cantidad
                                        let cantidadAjustada = result[0].cantidad_ajustada
                                        let cantidad = 0
                                        if (cantidadAjustada == null) {
                                            cantidad = cantidadProgramada + parseInt(value)
                                        } else {
                                            cantidad = cantidadAjustada + parseInt(value)
                                        }
                                        funcion.postCantidadAjustada(ids[i], cantidad)
                                            .then((result) => { /*console.log(result)*/ })
                                            .catch((err) => console.error(err))
                                        funcion.postAjuste(ids[i], `${key.replace(regexTitle, '')}`, parseInt(value))
                                            .then((result) => { resolve(result) })
                                            .catch((err) => console.error(err))
                                    })
                                    .catch((err) => { console.error(err) })
                            } else {
                                funcion.postAjuste(ids[i], `${key.replace(regexTitle, '')}`, `${value}`)
                                    .then((result) => { resolve(result) })
                                    .catch((err) => reject(err))
                            }
                        }
                    }
                }
            }
        })
    }
    forLoop()
        .then((result) => {
            let status = "guardado"
            user = req.connection.user
            Promise.all([funcion.getJustificacion(), funcion.getResponsables()])
                .then((values) => {
                    let justificacion = values[0]
                    let responsables = values[1]
                    res.render('detalleDiario.ejs', {
                        user,
                        justificacion,
                        responsables,
                        status
                    })
                })
                .catch((err) => { console.error(err) })
        })
}


controller.getCantidadMensual_GET = (req, res) => {
    let regexFecha = /-[^-]+$(.*)/;

    let selectedDate = req.params.selectedDate
    let selectedMonth = req.params.selectedMonth
    let cliente = req.params.cliente

    // selectedDate = selectedDate.replace(regexFecha,"")

    funcion.getCantMensual(selectedMonth, selectedDate, cliente)
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}

controller.graficaClienteArea_GET = (req, res) => {
    res.json("OK")
}


module.exports = controller;