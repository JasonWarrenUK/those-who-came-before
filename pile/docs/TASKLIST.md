# Tasklist

## Tasks

### Project Setup

- [ ] Create [folder structure](./FOLDERS.md)

### Front End

- [x] Create `index.html`

### Dev Log

#### Set Up Devlog

- [ ] Create a new repo for blog posts
- [ ] Create a directory to clone the repo into
  
	```bash
	mkdir devlog
	```

- [ ] Clone the repo

	```bash
  cd devlog
  git clone <devlog URL>
	```

- [ ] Create a directory for blog posts

	```bash
	mkdir blog
	```

- [ ] Create 1st Blog Post
  
	```bash
	touch blog/post1.md
  code blog/post1.md
	```

	```md
	# A Blog Post

	Texty texty texty
	```

- [ ] Open blog folder in VS Code, add to workspace & save as a project
- [ ] Set `GitHub -> Pages -> Source` to `main`
- [ ] Set `GitHub -> Pages -> Folder` to `/blog`
- [ ] Create a basic index page

    ```bash
    touch index.md
    code index.md
    ```

    ```md
    # Those Who Came Before

    - [First Post](blog/post1.md)
    ```

#### Set Up a Custom Domain

- [ ] Acquire custom domain?
- [ ] Add `CNAME` file with domain name to repo

### Devlog Styling

- [ ] Create a Jekyll theme
- [ ] Create `_config.yml` for Jekyll configuration
- [ ] Add this code to `_config.yml`:

  ```yaml
  theme: minima
  ```

- [ ] Add Jekyll front matter to posts

    ```yaml
    ---
    layout: post
    title: "First Post"
    ---
    ```

- [ ] Customize theme CSS

### React

#### Set Up React

- [ ] Create tasks

#### Use React

- [ ] Make sure `index.html` works
- [ ] Move `index.html` to `public/` & make sure it still works
- [ ] Add this code to `index.html`:

	```html
	<div id="root"></div>
	```

- [ ] Add this code to `src/app.js`:

	```js
	import React from 'react';

	function App() {
		return (
			<div>
				<h1>Those Who Came Before</h1>
				<p>Welcome to the game!</p>
			</div>
		);
	}

	export default App;
	```

- [ ] Check `index.html` now shows the code from `src/app.js`
- [ ] Add this code to `src/index.jsx`:

	```js
	import React from 'react';

	function App() {
		return (
			<div>
				<h1>Those Who Came Before</h1>
				<p>Welcome to the game!</p>
			</div>
		);
	}

	export default App;
	```

- [ ] Add this code to `src/styles/global.css`:

	```css
	body {
		margin: 0;
		font-family: Arial, sans-serif;
		background-color: #f0f0f0;
		color: #333;
	}
	```

- [ ] Add this code to `README.md`:

	```markdown
	# Those Who Came Before

	Those Who Came Before is a narrative game where players, as historians, interpret artefacts and make inferences about ancient cultures. Each decision impacts future interpretations, creating a unique and engaging gameplay experience.

	## Setup

	1. Clone the repository
	2. Install dependencies: `npm install`
	3. Start the development server: `npm start`

	## Folder Structure

	- `public/` - Contains the static HTML file
	- `src/` - Contains the React components, styles, and data
	- `assets/` - Contains images and other static assets
	- `components/` - Contains React components
	- `context/` - Contains context providers
	- `hooks/` - Contains custom hooks
	- `styles/` - Contains CSS files
	- `utils/` - Contains utility functions
	- `data/` - Contains initial JSON data for artefacts and cultures

	```

---

## Outcomes to Detail

- [ ] **State Management:** Create tasks for `Context API` (or `Redux` if necessary)
- [ ] **Styling:** Create tasks for `CSS` Modules or styled-components
- [ ] **Build Tools:** Create tasks for `Webpack` or `Create React App`
- [ ] **Data Handling:** Create tasks for `JSON` for initial data (artefacts and cultures)
- [ ] **Procedural Generation:** Create tasks for `JavaScript` & `Tracery` for generating artefacts and cultures

---
