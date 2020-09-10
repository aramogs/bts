let mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 10,
  supportBigNumbers: true,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_CONN_AREAS,
});


function query(sql, args) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      connection.release();
      if (err) return reject(err);
      connection.query(sql, args, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      })
    })
  })
}

module.exports = query;
