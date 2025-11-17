---
description: Generate a commit message. If no files commited, commit all changes.
argument-hint: [pig note]
# allowed-tools:
model: claude-sonnet-4-5-20250929
disable-model-invocation: true
---

<overview>
  Follow the instructions in `<steps>`
</overview>
<steps>
  <step-1>
    Check if there are currently staged changes and then...
    1. ...if no changes are staged, stage all changes.
    2. ...if changes are staged, do not stage additional changes.
  </step-1>
  <step-2>
    Generate a commit message for staged changes according to `<template>`
  </step-2>
  <step-3>
    Show me the message and await approval. Then...
    1. ...if I approve, push the commit to upstream
    2. ...if I request changes, incorporate them and repeat `<step-3>`
  </step-3>
</steps>
<guidance>
  1. `pig` is a user-defined language for taking notes.
</guidance>
<template>
  <first-line>
    <type>
      required; [reference](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13#types)
    </type>
    <scope>
      optional; [reference](https://www.conventionalcommits.org/en/v1.0.0/#specification)
    </scope>
    <breaking-change>
      required if relevant; [reference](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13#breaking-changes-indicator)
    </breaking-change>
    <desc>
      required; [reference](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13#description)
    </desc>
  </first-line>
  <body>
    optional; [reference](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13#body)
  </body>
  <pig>
    Omit if no arguments passed; if used, insert `<pig-block>` exactly
    <pig-block>
      ```pig
      { "inbox": $ARGUMENTS }
      ```
    </pig-block>
  </pig>
  <footer>
    omit if no breaking changes; [reference](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13#footer)
  </footer>
</template>
