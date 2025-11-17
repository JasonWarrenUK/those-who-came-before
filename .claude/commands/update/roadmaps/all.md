---
description: Update project roadmaps
argument-hint: []
# allowed-tools:
# model: claude-sonnet-4-5-20250929
disable-model-invocation: true
---

<UpdateRoadmapAll>
  <Steps>
    <Step i="0" name="shuffle content">
      Check whether content needs to be moved to a different Roadmap
    </Step>
    <Step i="1" name="loop through Roadmaps">
      For each `UpdateRoadmapAll/Roadmaps/Roadmap/attribute::active="true"`, go through `Loops/Loop/attribute::i="0"`
    </Step>
    <Step i="2" name="update README">
      Using all content from files in `UpdateRoadmapAll/Roadmaps`, update @docs/dev/roadmap/README.md
    </Step>
    <Step i="3" name="report to user">
      Tell the user what you changed
    </Step>
  </Steps>
  <Roadmaps>
    <Roadmap i="0" type="hub" active="true" path="docs/dev/roadmap/Those-Who-Came-Before-MVP.md"  />
    <Roadmap i="1" type="route" active="true" path="docs/dev/roadmap/Item-Generation-MVP.md" />
    <Roadmap i="1" type="route" active="true" path="docs/dev/roadmap/Culture-Generation-MVP.md" />
    <Roadmap i="1" type="route" active="true" path="docs/dev/roadmap/History-Generation-MVP.md" />
  </Roadmaps>
  <Loops>
    <Loop i="0">
      <Task i="0" origin="1.1.1" target="4.2.1" name="tasks open due">
        1. Check for completed tasks based on codebase
        2. Move them to 4.2.1
      </Task>
      <Task i="1" origin="1.1.2" target="4.2.2" name="tasks open other">
        1. Check for completed tasks based on codebase
        2. Move them to 4.2.2
      </Task>
      <Task i="2" origin="1.2" target="4.2.2" name="tasks blocked complete">
        1. Check origin for completed tasks based on codebase
        2. Move them to target
      </Task>
      <Task i="3" origin="1.2" target="1.1.2" name="tasks blocked open">
        1. Check for origin for now-unblocked tasks based on codebase
        2. Move them to target
      </Task>
      <Task i="4" origin="2" target="4.1" name="current">
        1. Check origin for completed milestones based on codebase
        2. Move them to 4.1
      </Task>
    </Loop>
  <Loops>
</UpdateRoadmapAll>
