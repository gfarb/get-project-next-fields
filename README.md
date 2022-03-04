# Get Project Next Fields Action
GitHub Action to retrieve Project Next Field data for a Project (beta) owned by a User or Organization.
## Description
The `Get Project Next Fields` GitHub Action was created to ease the pain of maintaining a file of constants or hardcoding values pertaining to Project Next Fields for use within a GitHub CI/CD flow.

This GitHub Action uses the GitHub GraphQL API and pagination to retrieve all Project Next Field data for a Project (beta) that is owned by a User or Organization. The action returns an easily-parseable object representing a map of all Project Next Fields for a Project (beta).
## Getting Started
### How to use
##### Example #1 - User-Owned Project:
- Assumptions:
  - You want to query Project Next Fields for a Project (beta) that is owned by the `gfarb` User and is assigned the number `1`
  - You have a repository secret named `PAT` that stores a Personal Access Token scoped with the appropriate permissions
- Workflow: 
	```
	steps:
	   - name: Get Project Next-Fields
	      id: project-next-fields
	      uses: gfarb/get-project-next-fields@0.1
	      with:
	        PAT: ${{ secrets.PAT }}
		 USER: gfarb
		 PROJECT_NEXT_NUMBER: 1
	```
##### Example #2 - Organization-Owned Project:
- Assumptions:
  - You want to query Project Next Fields for a Project (beta) that is owned by the `github` Organization and is assigned the number `1234`
  - You have a repository secret named `PAT` that stores a Personal Access Token scoped with the appropriate permissions
- Workflow: 
	```
	steps:
	   - name: Get Project Next-Fields
	      id: project-next-fields
	      uses: gfarb/get-project-next-fields@0.1
	      with:
	        PAT: ${{ secrets.PAT }}
		 ORG: github
		 PROJECT_NEXT_NUMBER: 1234
	```
### Parsing output
##### Example #1:
- Assumptions:
   - You want to find the `id` of a `single select` Project Next Field value for a specific project
   - The `PROJECT_NEXT_FIELDS` output of the `Get Project Next Fields` GitHub Action step was passed as an input to your future step called `PROJECT_NEXT_FIELDS`
   - The Project Next Field is named `SingleSelectFieldName` and the value is named `SingleSelectField_Value1`
- Bash:
   ```
   echo "$PROJECT_NEXT_FIELDS" | \
      jq '.SingleSelectFieldName.settings.options |
      map(select(.name == "SingleSelectField_Value1")) |
      .[].id'
   ```
- JavaScript:
   ```
   const selectFieldValueId = JSON.parse(core.getInput('PROJECT_NEXT_FIELDS'))
      .SingleSelectFieldName
      .settings
      .options
      .filter(fieldOption => {
         return  fieldOption.name === 'SingleSelectField_Value1'
      })[0].id;
   ```
## Supporting Docs
- [About projects (beta)](https://docs.github.com/en/issues/trying-out-the-new-projects-experience/about-projects)
- [Using the API to manage projects (beta)](https://docs.github.com/en/issues/trying-out-the-new-projects-experience/using-the-api-to-manage-projects)
- [GitHub GraphQL Explorer](https://docs.github.com/en/graphql/overview/explorer)
## Version History
* 0.1
  * Initial Release
## License
This project is licensed under the MIT License - see the LICENSE.md file for details
