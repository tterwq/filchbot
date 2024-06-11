import { DataTypes, Model } from 'sequelize';
import { sequelize } from './database.js';
 // замените на вашу строку подключения

export class User extends Model {}

User.init({
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users'
});

export class UserPullRequests extends Model {}

UserPullRequests.init({
  pullRequestId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
  }
}, {
  sequelize,
  modelName: 'UserPullRequests',
  tableName: 'user_pull_requests'
});

User.hasMany(UserPullRequests, { foreignKey: 'userId' })
UserPullRequests.belongsTo(User, { foreignKey: 'userId' })

export class PullRequestMetrics extends Model {}

PullRequestMetrics.init({
  metricId: {
    type: DataTypes.INTEGER,
	autoIncrement: true,
	primaryKey: true
  },
  pullRequestId: DataTypes.INTEGER,
  allocatedMemory: DataTypes.BIGINT
}, {
  sequelize,
  modelName: 'PullRequestMetrics',
  tableName: 'pull_request_metrics'
});

PullRequestMetrics.belongsTo(UserPullRequests, { foreignKey: 'pullRequestId' })
UserPullRequests.hasMany(PullRequestMetrics, { foreignKey: 'pullRequestId' })

sequelize.sync()
