const Joi = require("joi");

function MusicModel(sequelize, Sequelize) {
  const musicSchema = {
    categoryId: {
      type: Sequelize.INTEGER,
      references: {
        model: "categories",
        key: "id",
      },
    },
    artistId: {
      type: Sequelize.INTEGER,
      ref: 'users'
    },
    name: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
    musicPath: {
      type: Sequelize.STRING
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    isDelete: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  let Music = sequelize.define("music", musicSchema);

  return Music;
}

exports.MusicModel = MusicModel;

function validate(music) {
  const schema = {
    name: Joi.string().required().min(4).max(255),
    description: Joi.string().min(4).max(255),
  };
  return Joi.validate(music, schema);
}

exports.validate = validate;