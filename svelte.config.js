import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { config as DotenvConfig } from 'dotenv'

DotenvConfig()

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		paths: {
			base: (() => {
				let basePath = process.env.PUBLIC_BASE_PATH
				if (basePath && basePath !== '/') {
					if (basePath.endsWith('/')) {
						basePath = basePath.substring(0, basePath.length - 1)
					}

					return basePath
				}

				return ''
			})()
		},
		alias: {
			$testdata: './test_data'
		}
	}
}

export default config
