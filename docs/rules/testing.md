# Digital Asset Manager - Testing

## Test-Driven Development

You MUST follow a test-driven development (TDD) approach in which for each new feature or bug fix,
you first write a test that fails, working iteratively towards passing test(s) as part of the
development process.  A separate test case MUST be written to demonstrate each functional aspect,
behavior, or edge case of the feature or bug fix.

## Automated Tests – Unit, Component, and Integration Testing

There are three categories of automated tests: Unit, Component, and Integration, using industry-standard
distinctions to help classify them and identify them clearly into one of these three categories.

### Test Types

- **Unit tests** test a single function or class in isolation — no rendering, no DOM, no network.
- **Component tests** test a React component's rendered output and user interactions.

#### Unit Testing

- **Minimum Unit Test Coverage** – a minimum unit test coverage of 80% lines and branches, confirmed
  continually, MUST be maintained throughout the testing workflow.

#### When to write each

Write a **unit test** when:
- The subject is a pure function, utility, hook, or service
- There is no UI rendering involved
- You can fully verify behavior through return values or state changes alone

Write a **component test** when:
- The subject is a React component
- You need to assert on rendered output, user events, or conditional rendering
- The behavior is only observable through the DOM

We are currently not using integration tests.

#### File conventions
- Unit tests: `*.test.ts` — colocated with the source file
- Component tests: `*.test.tsx` — colocated with the component file

#### Never mix types
Do not render a component inside a unit test. Do not test business logic exclusively
through a component test — extract the logic and unit test it directly.

