/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
	},
	ignorePatterns: ['.vscode', 'dist'],
	extends: ['@nuxtjs/eslint-config-typescript', 'plugin:prettier/recommended', 'plugin:nuxt/recommended'],
	plugins: [],
	// add your custom rules here
	rules: {
		'no-unused-vars': [
			'warn',
			{
				args: 'none',
			},
		],
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				args: 'none',
			},
		],
		'prettier/prettier': [
			'warn',
			{
				printWidth: 120,
			},
		],
	},
}
