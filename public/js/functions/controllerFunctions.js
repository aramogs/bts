const funcion = {};

const db = require('../../db/conn_bts');
const db_a = require('../../db/conn_areas');
const db_e = require('../../db/conn_empleados');
const moment = require('moment')

funcion.getArea = (numPart) => {
    return new Promise((resolve, reject) => {
        db(`SELECT area FROM programacion WHERE numero_parte ="${numPart}"`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getTurnos = () => {
    return new Promise((resolve, reject) => {
        db_a(`SELECT * FROM turnos`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


// funcion.getClientes = (plataforma) => {
//     return new Promise((resolve, reject) => {
//         db(`SELECT DISTINCT cliente FROM plataformas WHERE plataforma ="${plataforma}"`)
//             .then((result) => { resolve(result) })
//             .catch((error) => { reject(error) })
//     })
// }

funcion.getClientesFecha = (fecha) => {
    let selectedDate = moment.utc(new Date(fecha)).format("YYYY-MM-DD")
    return new Promise((resolve, reject) => {
        db(`SELECT DISTINCT cliente FROM programacion WHERE fecha ='${selectedDate}'`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getProgramacion = (fecha) => {
    return new Promise((resolve, reject) => {
        db(`
        SELECT 
        id,
        programacion.cliente,
        programacion.numero_parte,
        programacion.fecha,
        programacion.turno,
        programacion.cantidad,
        programacion.area,
        producido.producido,
        producido.causa,
        producido.componente,
        producido.justificacion
    FROM
        programacion
            LEFT JOIN
        producido ON producido.id_programacion = programacion.id
    WHERE
         fecha = '${fecha}'
    GROUP BY id
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getProducido = (fecha) => {
    return new Promise((resolve, reject) => {
        db(`SELECT 
        id,programacion.cliente,programacion.numero_parte,programacion.fecha,programacion.turno,programacion.cantidad,area
        FROM 
        programacion
        WHERE fecha = "${fecha}"`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getCausas = () => {
    return new Promise((resolve, reject) => {
        db(`SELECT causa FROM causas `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getJustificacion = () => {
    return new Promise((resolve, reject) => {
        db(`SELECT justificacion FROM justificacion_ajuste `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getResponsables = () => {
    return new Promise((resolve, reject) => {
        db_e(`SELECT * FROM del_empleados, del_accesos WHERE emp_id = acc_id AND acc_bts = 1;`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getComponentes = (numPart) => {
    return new Promise((resolve, reject) => {
        db(`SELECT * FROM numeros_parte WHERE num_part ="${numPart}"`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getAreas = () => {
    return new Promise((resolve, reject) => {
        db(`SELECT DISTINCT area FROM programacion ORDER BY area`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.postProducido = (id, campo, valor,supervisor) => {

    if (typeof (valor) === "string") {
        return new Promise((resolve, reject) => {
            db(`INSERT INTO producido (id_programacion,${campo},supervisor)
            VALUES('${id}','${valor}','${supervisor}')
            ON DUPLICATE KEY UPDATE 
            ${campo} ='${valor}'
            `)
                .then((result) => { resolve(result) })
                .catch((error) => { reject(error) })
        })
    } else {
        return new Promise((resolve, reject) => {
            db(`INSERT INTO producido (id_programacion,${campo},supervisor)
            VALUES('${id}',${valor},'${supervisor}')
            ON DUPLICATE KEY UPDATE 
            ${campo} =${valor}
            `)
                .then((result) => { resolve(result) })
                .catch((error) => { reject(error) })
        })
    }

}

// funcion.checkIdCarga = (id_carga) => {
//     return new Promise((resolve, reject) => {
//         db(`SELECT * FROM programacion WHERE id_carga ='${id_carga}'`)
//             .then((result) => resolve(result))
//             .catch((error) => { reject(error) })
//     })
// }

funcion.checkDates = (min, max) => {
    return new Promise((resolve, reject) => {
        db(`SELECT * FROM bts.programacion WHERE fecha BETWEEN "${min}" AND "${max}"`)
            .then((result) => resolve(result))
            .catch((error) => { reject(error) })
    })
}

// funcion.deleteBetween = (min, max) => {
//     return new Promise((resolve, reject) => {
//         db(`DELETE FROM programacion WHERE fecha BETWEEN "${min}" AND "${max}"`)
//             .then((result) => resolve(result))
//             .catch((error) => { reject(error) })
//     })
// }

funcion.deleteIdCarga = (id_carga) => {
    return new Promise((resolve, reject) => {
        db(`DELETE FROM programacion WHERE id_carga="${id_carga}"`)
            .then((result) => resolve(result))
            .catch((error) => { reject(error) })
    })
}

funcion.postProgramacion = (arreglo) => {

    let values = []
    for (let i = 0; i < arreglo.length; i++) {
        values.push(`(${arreglo[i]})`)
    }
    return new Promise((resolve, reject) => {
        db(`INSERT INTO programacion (id,id_carga,cliente,numero_parte,area,fecha,turno,cantidad) VALUES${values}`)
            .then((result) => resolve(result))
            .catch((error) => { reject(error) })
    })
}


funcion.postAjuste = (id, campo, valor) => {

    if (typeof (valor) === "string") {
        return new Promise((resolve, reject) => {
            db(`INSERT INTO ajustes_programacion (id_programacion,${campo})
            VALUES('${id}','${valor}')
            ON DUPLICATE KEY UPDATE 
            ${campo} ='${valor}'
            `)
                .then((result) => { resolve(result) })
                .catch((error) => { reject(error) })
        })
    } else {
        return new Promise((resolve, reject) => {
            db(`INSERT INTO ajustes_programacion (id_programacion,${campo})
            VALUES('${id}',${valor})
            ON DUPLICATE KEY UPDATE 
            ${campo} =${valor}
            `)
                .then((result) => { resolve(result) })
                .catch((error) => { reject(error) })
        })
    }

}

funcion.getCantidades = (id, fecha) => {
    return new Promise((resolve, reject) => {
        db(`SELECT cantidad,cantidad_ajustada FROM programacion WHERE id="${id}" AND fecha="${fecha}"`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.postCantidadAjustada = (id, valor) => {
    return new Promise((resolve, reject) => {
        db(`
            INSERT INTO programacion (id,cantidad_ajustada)
            VALUES('${id}',${valor})
            ON DUPLICATE KEY UPDATE 
            cantidad_ajustada =${valor}
            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })

    })

}


funcion.getAjuste = (fecha) => {
    return new Promise((resolve, reject) => {
        db(`
        SELECT 
        id,
        programacion.cliente,
        programacion.numero_parte,
        programacion.fecha,
        programacion.turno,
        programacion.cantidad,
        programacion.cantidad_ajustada,
        programacion.area,
        producido.producido,
        producido.causa,
        producido.supervisor,
        ajustes_programacion.piezas,
        ajustes_programacion.responsable,
        ajustes_programacion.justificacion,
        ajustes_programacion.fecha
    FROM
        programacion
            LEFT JOIN
        producido ON producido.id_programacion = programacion.id
			LEFT JOIN
		ajustes_programacion ON ajustes_programacion.id_programacion = programacion.id
    WHERE
        programacion.fecha = '${fecha}'
    GROUP BY id
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getCantMensual = (selectedMonth,selectedDate, cliente) => {

    let dateMonth = moment.utc(new Date(selectedMonth)).format("YYYY-MM")
    let dateSelected = moment.utc(new Date(selectedDate)).format("YYYY-MM-DD")

    let andCliente = cliente !== "Seleccionar"? `AND cliente ="${cliente}"` : ""
    return new Promise((resolve, reject) => {
        db(`
        SELECT 
            cantidad, cantidad_ajustada, producido.producido,programacion.fecha
        FROM
            bts.programacion
        LEFT JOIN
            producido ON producido.id_programacion = programacion.id
        WHERE
            programacion.fecha BETWEEN '${dateMonth}' AND '${dateSelected}' ${andCliente};
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

module.exports = funcion;