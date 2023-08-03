const {Sequelize} = require('sequelize');



const sequelize = new Sequelize('astrodb', 'sanjeev.dasgupta', '6jNiyWEKxoA1', {
    dialect: 'postgres',
    dialectOptions: {
    ssl: {
        rejectUnauthorized: false
    }
},
    host: 'ep-solitary-meadow-593229.ap-southeast-1.aws.neon.tech'
});

//postgres://sanjeev.dasgupta@ep-solitary-meadow-593229.ap-southeast-1.aws.neon.tech/

/** REMOTE DEV ENV SETTINGSS
# Connection details
PGHOST=ep-solitary-meadow-593229.ap-southeast-1.aws.neon.tech
PGDATABASE=neondb
PGUSER=sanjeev.dasgupta
PGPASSWORD=6jNiyWEKxoA1

# Connection string
DATABASE_URL=postgres://sanjeev.dasgupta:6jNiyWEKxoA1@ep-solitary-meadow-593229.ap-southeast-1.aws.neon.tech/neondb

const sequelize = new Sequelize('SpunkyFormsDb', 'root', 'sanjeev', {
    dialect: 'mysql',
    dialectOptions: {
    ssl: {
        rejectUnauthorized: false
    }
},
    host: 'localhost',
    pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }   
});
**/
//export default sequelize;
module.exports = sequelize;
