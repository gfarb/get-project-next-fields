const core = require('@actions/core');
const github = require('@actions/github');
const graphqlWithAuth = require('@octokit/graphql').graphql.defaults({
	headers: {
	  authorization: `token ${core.getInput('PAT')}`
	},
});
const errors = [];

function QueryDataWrapper(queryType, response, results) {
	if(response !== undefined) {
		const fieldData = queryType === 'org'
			? response.organization.projectNext.fields
			: response.user.projectNext.fields;
		for(const index in fieldData.nodes) {
			fieldData.nodes[index].settings = JSON.parse(fieldData.nodes[index].settings);
			results.set(fieldData.nodes[index].name, fieldData.nodes[index]);
		}
		this.results = results;
		this.hasNextPage = fieldData.pageInfo.hasNextPage;
		this.endCursor = fieldData.pageInfo.endCursor;
	}
}

(async function start() {
	const queryDetails = validateInputs();
	if(queryDetails !== undefined) {
		let queryData = new QueryDataWrapper();
		queryData.hasNextPage = true;
		const results = await invokeQueries(
			queryDetails,
			core.getInput('PROJECT_NEXT_NUMBER'),
			queryData
		);
		exit(results);
	} else {
		exit(new Map());
	}
})();

function validateInputs() {
	const org = core.getInput('ORG');
	const user = core.getInput('USER');
	if(org.length < 0 && user.length < 0) {
		errors.push('Either the "ORG" or the "USER" input must be provided.');
		return undefined;
	} else if(org.length > 0 && user.length > 0) {
		errors.push('Both the "ORG" and "USER" inputs can\'t be provided. Please provide one or the other.');
		return undefined;
	} else {
		return org.length > 0
			? {
				topLevelQuery: `organization(login: "${org}") {`,
				queryType: 'org'
			}
			: {
				topLevelQuery: `user(login: "${user}") {`,
				queryType: 'user'
			}
	}
}

async function invokeQueries(queryDetails, projectNumber, queryData) {
	let results = new Map();
	while(queryData.hasNextPage === true) {
		try {
			const response = await getFieldSettings(
				queryDetails.topLevelQuery,
				projectNumber,
				queryData.endCursor === undefined ? 'first: 100' : `first: 100, after: "${queryData.endCursor}"`
			);
			queryData = new QueryDataWrapper(queryDetails.queryType, response, results);
			results = queryData.results;
			if(queryData.endCursor === undefined) break;
		} catch(error) {
			errors.push(error);
			results.clear();
			break;
		}
	}
	return results;
}

async function getFieldSettings(topLevelQuery, projectNumber, fieldArguments) {
	const response = await graphqlWithAuth(`
		{
			${topLevelQuery}
				projectNext(number: ${projectNumber}) {
					id
					fields(${fieldArguments}) {
						nodes {
							id
							name
							settings
						}
						pageInfo {
							hasNextPage
							endCursor
						}
						totalCount
					}
				}
			}
		}
	`);
	return response;
}

function exit(results) {
	core.setOutput('PROJECT_NEXT_FIELDS', Object.fromEntries(results));
	if(errors.length > 0) {
		for(const index in errors) {
			core.setFailed(errors[index]);
		}
	}
}