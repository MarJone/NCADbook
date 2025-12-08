# End Current Session

End the current development session and capture all learnings and progress.

## Instructions

1. **Read current state**:
   - Read `docs/planning/PHASE2_TASKS.md` for task status
   - Read `docs/planning/CURRENT_STATUS.md` for progress
   - Check git status for uncommitted changes

2. **Count existing sessions**:
   - List files in `docs/sessions/` to determine next session number
   - New session file: `docs/sessions/phase2-session-[X].md`

3. **Create session log** with the following template:

```markdown
# Phase 2 Session [X] - [Date]

## Session Overview
- **Date**: [YYYY-MM-DD]
- **Duration**: [approximate time]
- **Progress**: [X]% → [Y]%
- **Focus Area**: [main area worked on]

## Accomplishments

### Features Completed
- [ ] Feature 1 - brief description
- [ ] Feature 2 - brief description

### Tasks Completed
- [x] Task from PHASE2_TASKS.md
- [x] Another task

### Files Modified
| File | Changes | Lines |
|------|---------|-------|
| path/to/file.jsx | Description | +XX/-YY |

## Decisions Made

### Decision 1: [Title]
- **Context**: Why this decision was needed
- **Options Considered**: What alternatives existed
- **Chosen**: What was selected
- **Reasoning**: Why this option

## Challenges & Solutions

### Challenge 1: [Title]
- **Problem**: What went wrong
- **Investigation**: What was tried
- **Solution**: What fixed it
- **Prevention**: How to avoid in future

## Technical Insights
- Insight 1
- Insight 2

## Handoff Context

### Exact Next Steps
1. First thing to do next session
2. Second thing
3. Third thing

### Work In Progress
- [ ] Incomplete task 1 - what's done, what's left
- [ ] Incomplete task 2

### Blockers
- Blocker 1 (if any)

### Important Notes for Next Session
- Note 1
- Note 2
```

4. **Update planning docs**:
   - Change completed tasks from `[>]` to `[x]` in PHASE2_TASKS.md
   - Update CURRENT_STATUS.md with new progress percentage
   - Add any new tasks discovered

5. **Commit documentation**:
   ```bash
   git add docs/
   git commit -m "docs: Session [X] complete - [brief summary]"
   ```

6. **Report summary to user**:
   - What was accomplished
   - Current progress %
   - Next steps for next session
   - Any blockers or concerns

## Safety Checks Before Ending

- [ ] All changes committed?
- [ ] Build passes? (`npm run build`)
- [ ] No broken functionality?
- [ ] Session log created?
- [ ] Planning docs updated?
- [ ] Handoff context clear for next session?

## Session Log Location

All session logs are stored in: `docs/sessions/phase2-session-[X].md`

Naming convention:
- `phase2-session-1.md` - First session
- `phase2-session-2.md` - Second session
- etc.
