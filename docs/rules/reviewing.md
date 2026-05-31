# Code Reviews

Review any set of proposed changes using these standards:

## Code Quality
- Minimal and pragmatic — no over-engineering, no premature abstractions
- No unnecessary config, or "just in case" code
- Readability over cleverness
- Follow language style guides (gofmt for Go, ESLint/Prettier for TS)

## Security (OWASP Top 10)
- Input validation at system boundaries
- No hardcoded secrets, credentials, or API keys
- No injection vulnerabilities (SQL, XSS, command injection)
- Parameterized queries for database access

## Testing
- All code changes must include unit tests
- Integration tests for external boundaries (APIs, databases, file I/O)

## Output Format
Format your response as a GitHub PR comment in markdown with EXACTLY these section headers:

### Must Fix
Critical issues that must be resolved before merging. Number each item. If none, write "None."

### Should Consider
Important improvements that should be addressed. Number each item. If none, write "None."

### Minor
Non-blocking nits and style suggestions. These will NOT be auto-fixed.

### Looks Good
What the PR does well.

Be concise. Flag real problems, skip trivial nitpicks.