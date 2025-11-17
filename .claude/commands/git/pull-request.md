---
description: Create a pull request for current branch
argument-hint: [note to include in pig block]
# allowed-tools:
model: claude-sonnet-4-5-20250929
# disable-model-invocation:
---

<overview>
  Follow the instructions in `<steps>`
</overview>
<role>
  You are...
</role>
<steps>
    1. Look at the commits on this branch
    2. Analyse the overall effect of these changes if merged into `main`
    3. Use `<template>` to write the content of a pull request
    4. Check for my approval, then...
        4.1. ...if I approve, create the PR to `main`
        4.2. ...if I don't approve, incorporate my changes then repeat step 3
</steps>
<rules>
    <title-rules>
        1. brief & descriptive
        2. use title case
        3. be understandable to non-devs
    </title-rules>
    <tldr-rules>
        1. list any steps devs have to take after pulling this down
    </tldr-rules>
    <changes-rules>
        1. Break your changes into either files or categories, depending on how wide-ranging the PR is.
        <changes-examples>
            <changes-example-1>
                `<details>
                    <summary><strong>{{ Category }}</strong></summary>
                    {{ Brief description of changes }}
                    - {{ details in bullet points, if necessary}}
                </details>`
            </changes-example-1>
            <changes-example-2>
                `<details>
                    <summary><code>{{ filepath }}</code></summary>
                    {{ Brief description of changes }}
                    - {{ details in bullet points, if necessary}}
                </details>`
            </changes-example-2>
        </changes-examples>
    </changes-rules>
    <summary-rules>
        1. Describe this PR with a non-technical and absurd metaphor
    </summary-rules>
    <pig-rules>
        1. if arguments are passed, include `<pig-block>` (including backticks & language specifier)
        <pig-block>
            ```pig
            {
            "inbox": "$ARGUMENTS"
            }
            ```
        </pig-block>
    <pig-rules>
</rules>
<template>
    ```md
        # {{ see `<title-rules>` }}
        ## Overview
        {{ see `<overview-rules>` }}
        > [!TIP]
        > {{ see `<tldr-rules>` }}
        ## Changes
        {{ see `<changes-rules>` }}
        ---
        ## Summary
        {{ Describe this PR with a non-technical and absurd metaphor }}
        {{ see `<pig-rules>` }}
    ```
</template>
<guidance>
    1. `pig` is a user-defined language for making notes
</guidance>
