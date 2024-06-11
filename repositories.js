import { sequelize } from './database.js'
import { User, UserPullRequests, PullRequestMetrics } from './models.js' 
import { Op, literal } from 'sequelize'

export async function addUser(data) {
	const user = await User.create(data)
}

export async function getUser(userId) {
	const user = await User.findAll({where: {userId: {[Op.eq]: userId}}})
	return user
}

export async function addPullRequest(data) {
	const commit = await UserPullRequests.create(data)
}

export async function getPullRequest(pullRequestId) {
	const commit = await UserPullRequests.findAll({where: {pullRequestId}})
	return commit
}

export async function addMetrics(data) {
	const metrics = await PullRequestMetrics.create(data)
}

export async function getSimilarMetrics(prId, ownerId, allocMemory, delta) {
	const metrics = await PullRequestMetrics.findAll({
		where: {
			pullRequestId: {
				[Op.ne]: prId
			},
			allocatedMemory: {
				[Op.lt]: allocMemory + +delta,
				[Op.gt]: allocMemory - +delta
			},
		},
		include: {
			model: UserPullRequests,
			where: {
				userId: {
					[Op.ne]: ownerId
				}
			}
		}
	})
	console.log(metrics)
	return metrics.map(item => {
		return {
			userId: item.dataValues.pullRequestId,
		}
	})
}

