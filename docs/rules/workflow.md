# Digital Asset Manager - Workflow Rules

## AI Development Orchestration

This file lays out rules and the expectations related to orchestration of development workflows.

### Implement Only What's Specifically Asked For and is Well Understood

Implement only features needed to complete the current task, and only according to written requirements
that you have received and understand.  NEVER implement features or make decisions regarding gaps or
conflicts in written requirements or designs; always point these gaps out to the requestor and ask for
clarification.  You can make recommendations for how to fill in the gaps when you have clear ideas about
how to proceed, but again - DO NOT IMPLEMENT THESE GAPS without specific approval.

### Context Management

#### Work Inside of 50% Context

As soon as possible after your context exceeds 50% full, you MUST save your working memory, and advise
the requestor to `/clear` or start a new session before continuing.

#### Project Folders

The standard project folders are the following.  If these cannot be found, or if for any reason  
there are questions about this, please reach out to clarify:

- User home: `~`
- Project root: `~/repos/noodnik2/digital-asset-manager`
- Do not use any other base path under any circumstances

#### Tracking Progress / Milestone Handoffs

At the end of every major milestone, please summarize the progress made and any technical decisions taken into
a new `docs/milestones/milestone-X.md` file before clearing context.  This will be used to help ensure continuity
of development and effective communication between the various agents collaborating on the project.

Also, keep the larger project context in mind (e.g., what's written in `docs/design`) when preparing this
communication hand-off.  Bring disparities or "drift" noticed from the larger plan to the forefront of
attention within this and other avenues of communication.  It is important to maintain focus on - and to
regularly update - the larger "plan" as the project evolves.

#### Resumption of Context

When starting with fresh context (e.g., after context is cleared from a previous workflow - see above), please
read and analyze the recent hand-off document(s) found in the folder `docs/milestones`.  Confirm you understand
the plan or clarify anything that is unclear or contradictory before starting work on a new milestone or workflow
after having done this.

#### Accumulation of Context

As significant milestones, decisions, issues or new technical directions are realized, please update the file
`docs/milestones/notes.md` so that we can keep track of progress and make informed future decisions.  This does
not need to be duplicative of the communication to record milestone status; rather, it is another communication
outlet for "side-notes" which don't fit directly within that type of workflow progress recording and tracking.

### Verify Your Work

After making code changes, ALWAYS run the relevant tests and linter checks. If a test fails, fix it before reporting
the task as complete. 

Then review the proposed changes yourself using an Adversarial Prompting / Red-Teaming approach and address any
issues found.

Run this verification process iteratively until there are no more issues.

#### Perform a Code Review

After any changes are made, or when requested, assume the role of code reviewer and review the relevant
set of files / changes using an Adversarial Prompting / Red-Teaming approach.  

If it's not abundantly clear exactly what set of files or proposed changes should be reviewed, ask the requestor.

In all cases, follow the guidelines set forth in `docs/rules` when performing code reviews.

### Don't Get Stuck in a Loop

If you find yourself looping more than three times to solve a given issue, stop and reach out to me to:
(1) let me know about this problem and, (2) ask for guidance in case I've got some context that might help.

### Testing

See guidance about the norms and expectations for testing in the separate doc `docs/rules/testing.md`.

## Coding Best Practices

- Respect DRY (Don't Repeat Yourself)
    - To the extent practical, avoid code duplication.  When a block of code or logic is needed in multiple
      places, consider refactoring so that it can be reused.  Of course, also consider the ramifications of
      introducing a new dependency and linkage between modules before making this decision.
- Maintain a consistent coding style and naming conventions across each component / module (e.g., frontend /
  backend / technology stack).
- Use a linter to enforce coding standards and best practices, integrated into the development and continuous
  testing workflow.
- Always consider whether a change needs to be made to existing documentation, mainly based upon whether
  it renders the existing documentation as incorrect or misleading.  Also, update the documentation to reflect
  new features or conceptual changes are introduced – especially if awareness of these is important to other
  developers or onlookers to do their job or take into account.
