"use strict";
module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define(
    "Job",
    {
      description: DataTypes.STRING,
      company: DataTypes.STRING,
      title: DataTypes.STRING,
      username: DataTypes.STRING,
      tweet_id: DataTypes.STRING,
      tweet_createdAt: DataTypes.STRING
    },
    {}
  );
  Job.associate = function(models) {
    // associations can be defined here
  };
  return Job;
};
