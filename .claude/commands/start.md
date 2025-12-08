# Start Next Task

Begin the next pending task from Phase 2 feature expansion.

## Instructions

1. **Read** `docs/planning/PHASE2_TASKS.md` to find next pending task (marked `[ ]`)
2. **Read** `docs/planning/CURRENT_STATUS.md` for current phase and progress
3. **Check dependencies**: Ensure prerequisite features are complete
4. **Update task status**:
   - Change task from `[ ]` to `[>]` in PHASE2_TASKS.md
   - Update CURRENT_STATUS.md "In Progress" section
5. **Create branch** if starting new feature:
   - `git checkout -b feature/[feature-name]`
6. **Begin implementation**:
   - Follow incremental protocol (ONE change at a time)
   - Build after EVERY change: `npm run build`
   - Test in browser after every build
   - Commit after successful test
7. **Update TodoWrite** tool with current subtasks
8. **Report** to user:
   - Which feature/task started
   - Files that will be modified
   - Dependencies identified
   - Next 3-5 immediate steps

## Safety Protocol (CRITICAL)

Follow ONE-CHANGE-AT-A-TIME protocol:
1. Modify ONE file
2. Run `npm run build`
3. Test in browser
4. Commit if working
5. Repeat for next change

**NEVER** modify multiple files simultaneously without testing between changes.

## Quick Start Checklist

- [ ] Read PHASE2_TASKS.md
- [ ] Read CURRENT_STATUS.md
- [ ] Identify next pending task
- [ ] Check dependencies
- [ ] Update task status to [>]
- [ ] Create feature branch if needed
- [ ] Set up TodoWrite with subtasks
- [ ] Begin implementation
