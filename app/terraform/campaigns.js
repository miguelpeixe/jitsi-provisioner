const Sequelize = require("sequelize");

const db = require("../sequelize");

const User = require("./users");

const Campaign = db.define(
  "campaign",
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    country: {
      type: Sequelize.STRING
    },
    accountId: {
      type: Sequelize.STRING,
      allowNull: true
    }
  },
  {
    timestamps: false
  }
);

module.exports = Campaign;
