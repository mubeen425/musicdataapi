const Sequelize = require("sequelize");
const dbConfig = require("../config/db.config.js");
const { UsersModel } = require("./user.model");
const { Emailverification } = require("./emailVerification.model");
const { ForgetPassword } = require("./forgetPassword.model");
const { CategoryModel } = require("./category.model");
const { MusicModel } = require("./music.model");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.users = UsersModel(sequelize, Sequelize);
db.ForgetPassword = ForgetPassword(sequelize, Sequelize);
db.Emailverification = Emailverification(sequelize, Sequelize);
db.category = CategoryModel(sequelize, Sequelize);
db.music = MusicModel(sequelize, Sequelize);

db.category.hasMany(db.music);
db.music.belongsTo(db.category);

// db.music.hasMany(db.users);
// db.users.belongsTo(db.music);

module.exports = db;
