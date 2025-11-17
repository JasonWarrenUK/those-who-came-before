---
description: "Update a roadmap chain due to a specific reason"
argument-hint: "[child], [parent file], [reason]"
# allowed-tools:
model: claude-sonnet-4-5-20250929
disable-model-invocation: true
---

<UpdateRoadmapChain>
  <Steps>
    <Step i="0" name="shuffle content">
      Check whether content needs to be moved to a different Roadmap
    </Step>
    <Step i="1" name="loop through roadmap 1">
      For $1, go through `UpdateChain/Loops/attribute::i="0"`
    </Step>
    <Step i="1" name="loop through roadmap 2">
      For $2, go through `UpdateChain/Loops/attribute::i="0"`
    </Step>
    <Step i="2" name="update README">
      Using all content from within docs/dev/roadmap, update docs/dev/roadmap/README.md
    </Step>
    <Step i="3" name="report to user">
      Tell the user what you changed
    </Step>
  </Steps>
  <Loops>
    <Loop i="0" name="Roadmap">
      <Guide>For all tasks, origin and target refer to section headers in the document being processed</Guide>
      <Tasklist>
        <Task i="0" origin="1.1.1" target="4.2.1" name="tasks open due">
          1. Check origin for completed tasks based on codebase state
          2. Move them to target
        </Task>
        <Task i="1" origin="1.1.2" target="4.2.2" name="tasks open other">
          1. Check origin for completed tasks based on codebase state
          2. Move them to target
        </Task>
        <Task i="2" origin="1.2" target="4.2.2" name="tasks blocked complete">
          1. Check origin for completed tasks based on codebase state
          2. Move them to target
        </Task>
        <Task i="3" origin="1.2" target="1.1.2" name="tasks blocked open">
          1. Check for origin for now-unblocked tasks based on codebase state
          2. Move them to target
        </Task>
        <Task i="3" origin="2" target="4.1" name="current">
          1. Check for completed milestones based on codebase state
          2. Move them to 4.1
        </Task>
      </Tasklist>
    </Loop>
  </Loops>
<UpdateRoadmapChain>
