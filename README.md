# Frontend

This project contains the frontend of the Data Abstraction Platform.

It is a web application platform built using [SvelteKit](https://svelte.dev/).

# Table of Contents

1. [Environment Variables](#environment-variables)
2. [Development](#developing)
3. [Containerization](#containerization)
4. [SvelteKit Documentation](#sv)
5. [Key tools, and technologies used](#key-tools-and-technologies-used)

# Key tools and technologies used

<table>
    <thead>
        <th>Name</th>
        <th>Use</th>
        <th>Documentation Link</th>
    </thead>
    <tbody>
        <tr>
            <td>Svelte</td>
            <td>Component building</td>
            <td><a href="https://svelte.dev/docs/svelte/overview">Click Here</a></td>
        </tr>
        <tr>
            <td>Tailwind CSS</td>
            <td>Base CSS Styling</td>
            <td><a href="https://tailwindcss.com/docs/installation/using-vite">Click Here</a></td>
        </tr>
        <tr>
            <td>Daisy UI</td>
            <td>Component and Theme Styling</td>
            <td><a href="https://daisyui.com/docs/install/">Click Here</a></td>
        </tr>
        <tr>
            <td>Svelte for VS Code</td>
            <td>Extension for VS Code</td>
            <td><a href="https://marketplace.visualstudio.com/items/?itemName=svelte.svelte-vscode">Click Here</a></td>
        </tr>
        <tr>
            <td>Iconify Design</td>
            <td>Repository with thousands of icons</td>
            <td><a href="https://icon-sets.iconify.design/">Click Here</a></td>
        </tr>
    </tbody>
</table>

# Environment Variables

Create your own `.env` file using this [template](./env.template).

<table>
    <thead>
        <th>Name/Key</th>
        <th>Example</th>
        <th>Default</th>
        <th>Description</th>
    </thead>
    <tbody>
        <tr>
            <td>PUBLIC_API_CORE_URL</td>
            <td><code>http://localhost:5174/api</code></td>
            <td></td>
            <td>Backend Core Api URL.</td>
        </tr>
        <tr>
            <td>PUBLIC_BASE_PATH</td>
            <td><code>/dap</code></td>
            <td><code>/</code></td>
            <td>
                <div>Base Path to serve the webiste from.</div>
                <div>Requires rebuild if this value is changed.</div>
            </td>
        </tr>
        <tr>
            <td>PUBLIC_WEBSITE_TITLE</td>
            <td><code>Data Abstraction Platform</code></td>
            <td><code>Data Abstraction Platform Dev</code></td>
            <td>Title of the website</td>
        </tr>
       <tr>
            <td>PUBLIC_TELEMETRY_LOG_LEVEL</td>
            <td><code>-4</code></td>
            <td><code>0</code></td>
            <td>
                <div>Level of detail of logs generated.</div>
                <table>
                    <thead>
                        <th>Range</th>
                        <th>Meaning</th>
                    </thead>
                    <tbody>
                        <tr>
                            <td>-4 to -1</td>
                            <td>debug</td>
                        </tr>
                        <tr>
                            <td>0 to 3</td>
                            <td>info</td>
                        </tr>
                        <tr>
                            <td>4 to 7</td>
                            <td>warning</td>
                        </tr>
                        <tr>
                            <td>8</td>
                            <td>error</td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>

# Containerization

The [script](./build_container.sh) builds a `data_abstraction_platform/website` container image using this [`Dockerfile`](./Dockerfile).

The script accepts the following flags during execution.

<table>
    <thead>
        <th>Flag</th>
        <th>Example</th>
        <th>Default</th>
        <th>Purpose</th>
    </thead>
    <tbody>
        <tr>
            <td>-c</td>
            <td><code>podman</code></td>
            <td><code>docker</code></td>
            <td>
                <div>Container engine to use</div>
                <div>Optional</div>
            </td>
        </tr>
        <tr>
            <td>-t</td>
            <td><code>v1alpha3</code></td>
            <td><code>latest</code></td>
            <td>
                <div>Container Tag</div>
                <div>Optional</div>
            </td>
        </tr>
    </tbody>
</table>

Example:

```sh
#!/bin/bash

CONTAINER_TAG="v4.18.3"
CONTAINER_ENGINE="podman"

bash build_container.sh -t $CONTAINER_TAG -c $CONTAINER_ENGINE
```

# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
