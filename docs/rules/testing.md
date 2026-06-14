# Digital Asset Manager - Testing

## Test-Driven Development

You MUST follow a test-driven development (TDD) approach. The required order is strict and
non-negotiable:

1. **Write the test first** — referencing the function, method, or type that does not yet exist.
2. **Run the test and confirm it fails (red)** — `npm run test:run`. If the test passes before any
   implementation is written, it is not testing anything meaningful. Stop and fix the test.
3. **Write the minimum implementation to make the test pass (green).**
4. **Run `npm run test:coverage`** — confirm coverage stays ≥ 80% lines and branches.

A separate test case MUST be written to demonstrate each functional aspect, behavior, or edge case
of the feature or bug fix.

**Anti-pattern to avoid:** Writing all type definitions, interfaces, and implementation code first,
then adding tests that pass on their first run. This is not TDD — the tests describe the code after
the fact rather than driving it. It has happened in this project and is explicitly prohibited.

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

