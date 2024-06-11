import { addUser, getUser, addPullRequest, getPullRequest, addMetrics, getSimilarMetrics } from "./repositories.js";
import { memoryDelta } from "./config.js";


export default (app) => {
	app.on(["pull_request.opened", "pull_request.synchronize"], async (context) => {
		const owner = context.payload.repository.owner.id
		const prId = context.payload.pull_request.id
	    const head_sha = context.payload.pull_request.head.sha;
		const user = await getUser(owner)
		console.log(user)
		if (!user.length) {
			await addUser({userId: owner})
		}
		const pr = await getPullRequest(prId)
		if (!pr.length) {
			await addPullRequest({pullRequestId: prId, userId: owner})
		}	
	})

	app.on(['check_run.completed'], async context => {
		const head_sha = context.payload.check_run.check_suite.head_sha
		if (context.payload.check_run.app.slug == 'github-actions') {
			const runs = await context.octokit.request('GET /repos/{owner}/{repo}/actions/runs', {
				owner: context.payload.repository.owner.login,
				repo: context.payload.repository.name,
				headers: {
					'X-GitHub-Api-Version': '2022-11-28'
				},
				check_suite_id: context.payload.check_run.check_suite.id,
				event: "pull_request",
			})
			const metric = await context.octokit.request('GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts', {
				owner: context.payload.repository.owner.login,
				repo: context.payload.repository.name,
				run_id: runs.data.workflow_runs.at(-1).id,
				headers: {
					'X-GitHub-Api-Version': '2022-11-28'
				},
				name: '.gcdump'
			})
			const size = metric.data.artifacts.at(-1).size_in_bytes
			if (size) {
				const prId = context.payload.check_run.check_suite.pull_requests.at(-1).id
				const similar = await getSimilarMetrics(prId, context.payload.repository.owner.id, size, memoryDelta)
				if (!similar.length) {
					await addMetrics({pullRequestId: prId, allocatedMemory: size})
					await context.octokit.rest.checks.create({
						owner: context.payload.repository.owner.login,
						repo: context.payload.repository.name,
						name: "FilchCheck",
						head_sha: head_sha,
						conclusion: 'success'
					})
				} else {
					await context.octokit.rest.checks.create({
						owner: context.payload.repository.owner.login,
						repo: context.payload.repository.name,
						name: "FilchCheck",
						head_sha: head_sha,
						conclusion: 'failure',
						output: {
							title: "Filched",
							summary: "ofCourse"
						}
					})
				}
			}
		}
	})
}
