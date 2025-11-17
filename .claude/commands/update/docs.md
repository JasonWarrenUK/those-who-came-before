---
description: Check all project documentation and update accordingly
argument-hint: [file to focus on]
# allowed-tools:
# model: claude-sonnet-4-5-20250929
disable-model-invocation: false
---
<UpdateDocsCommand>
  <Task>Check files referenced in `UpdateDocsCommand/Documents` and make sure they are up to date with the current state of the codebase</Task>
  <Documents>
    <Doc i="0" path="$ARGUMENTS" type="ignore if path==null" />
    <Doc i="1" path="README.md" type="user" />
    <Doc i="2" path="docs/dev/Technical-Overview.md" type="dev info" />
    <Doc i="3" path="docs/dev/Architecture-Decisions.md" type="" />
  </Documents>
</UpdateDocsCommand>
