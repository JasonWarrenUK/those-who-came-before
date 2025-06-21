# Dev Log

## Progress

### What's the Latest Feature?

A basic artefact generator & [web UI](https://jasonwarrenuk.github.io/Those-Who-Came-Before/). It currently generates lists of 5 unique artefacts, each comprising a type of object (axe, urn, etc) and a material it's made from (wood, bone, etc).

### Progress Chart

|  #  |          Theme          |   Current Status    |           Next Feature            |    Branch     | Waiting On |
| :-: | :---------------------: | :-----------------: | :-------------------------------: | :-----------: | :--------: |
|  1  |      **Interface**      |   Basic generator   |                 -                 |    `main`     |    `#2`    |
|  2  | **Artefact Generation** | item-material pairs |            item traits            |    `main`     | `#4`, `#5` |
|  3  |       **Devlog**        |     `README.md`     |          generated site           |    `main`     |     -      |
|  4  | **Artefact Generation** |          -          | Dynamic blueprints via JavaScript | `itemAnatomy` |     -      |
|  5  | **Artefact Generation** |          -          |    Dynamic blueprints via RiTa    | `itemGrammar` |     -      |

### Which Branches are Being Worked On?

Right now I'm knee deep in the `itemAnatomy` & `itemGrammar` branches

### What's the Current Focus?

I'm working on a template object for artefacts that will allow dynamic generation of artefacts with variable (but reasonable) constructions. Say the game generates a sword. It...

- Has to have a blade, or it isn't a sword
- Has to have a handle
- Doesn't _have_ to have a crossguard, but if it does then...
  - it has to be between the handle and the blade
- Doesn't _have_ to have a pommel, but it it does then...
  - it has to be at the end of the handle
- Probably doesn't have a belt loop on it, but if it does, then...
  - it could be attached to pommel.
    - which it might not have.
  - it could be threaded through a hole drilled through the handle - but only if there isn't a pommel - but there shouldn't be a hole there is there _isn't_ a belt loop

<details>
	
<summary>You can see the ~~convoluted bullshit~~ depth of thought involved by expanding this section.</summary>

### Artefact Generation Flowchart

```mermaid
graph TD
type["`**Type**
	What is this object?
	*Sword*
	*Vase*
	*Brooch*
`"]

type ---> chance
type ---> loc1
type ---> loc2
type ---> orientation
type ---> position

chance["`**Likelihood**
	% chance part exists
`"]

chance -.-> part1
chance -.-> part2

position["`**Position**
	Position when in use
	*Held*
	*Free*
	*Worn*
`"]

orientation["`**Orientation**
	Directionality of object
	*Near -> Far*
	*Bottom -> Top*
	*Back -> Front*
`"]

position & orientation ---> loc1 & loc2

loc1["`**Slot**
	Potential part
	*Grip*
	*Base*
	*Pin*
`"]
loc2["`**Slot**
	Potential part
	*Blade*
	*Mouth*
	*Frontpiece*
`"]

loc1 -..-> part1
loc2 -..-> part2

part1["`**Part**
	If generated
`"]


part2["`**Part**
	If generated
`"]

part1 ---> material1
part2 ---> material2

material1["`**Material**
	What it's made from
	*Bone*
	*Clay*
	*Tin*
`"]
material2["`**Material**
	What it's made from
	*Obsidian*
	*Clay*
	*Jade*
`"]
```

</details>

The system also needs to scale to further complexity well, because after item generation is nailed down I'll need to make sure that a culture can generate multiple items that feel coherent. Here's some initial ideas for that...

- if a sword lacks a crossguard, further swords from that culture should have a reduced chance of generating crossguards
- the use of a material can...
  - increase the likelihood of that material being used by that culture ("_we use Obsidian_")
  - **significantly** increase the likelihood of that material being used by that culture **in similar contexts** ("_we make blades out of obsidian_")

More abstracted inferences can be drawn from emergent patterns:

- Patterns
  - Ornamental items
    - 3 have been generated
    - jade was present in 2 of them
  - Utility items
    - 2 have been generated
    - jade was present in neither of them
- Inferences
  - Jade is a decorative material
