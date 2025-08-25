# Rules

- always ultra think for reasoning.
- always ultra think first before coding and depend on coding tasks use right method
- always refer to `./context`

## **code generation priority**

1. **follow my guideline for**
   1. project structure [project_structure.md]('./guidelines/project_structure.md')
2. **always care backend and related frontend together**
3. **high readability that anyone can read easily**
4. **always implement progressive way**
5. **when test, create test cases in `./test`**

# **Prompt Implementation guideline**

## step1 - find or creating a implementation Plan

Check there is a implementation plan to follow
if there is no implementation plan to follow, then create a implementation plan

### plan types

- requirements
  - `requirements.md` in `./plans`
  - requirements is representative of the goal of implementation
  - if things are change this should be updated.
- version plan
  - version plans are split downed plans from `requirements.md`
  - version plans should have more detailed plans to implementation after analyzing `requirements.md`
  - version plans naming convention should be `v[version number]_plan.md` and should be located in `./plans/versions`
- implementation plan
  - This is detailed todo list plans to implement actual code and how to test
  - It must include detail guidelines for each aspect of
    - frontend and backend implementation
    - integration test way
    - implement api test, e2e test, unit test in `./test`
  - implementation plan naming convention should be `[mm-dd_hh:mm]_[implementation feature/domain].md` in `./plans/implementations`

## step2 - implementation according to plan

- always care frontend and backend both together as like as a fullstack engineer
- use context7 MCP for latest reference instead of old reference before 2025
- create test cases for test

### frontend

- all api must be called through `./packages/shared-api-controllers`

### backend

- no need to re-run docker for file changes as tsup is watching local files in docker container
- api url
  - api url must started with `/api`
  - whenever change api url, it should be updated to `./packages/shared-api-controllers` too
- other services api routes must be called through `./packages/shared-api-controllers`

## step3 - review codes

- review code in readable and scalable aspect.
- refactor code according to [code review guideline]('./guidelines/code_review_guideline.md')

## step4 - test codes

- create test cased in `./test` to test and then run the test file.
