import { CodegenConfig } from '@graphql-codegen/cli';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const config: CodegenConfig = {
	schema: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/graphql`,
	documents: ['graphql/**/*.graphql'],
	generates: {
		'generated.ts': {
			plugins: ['typescript', 'typescript-react-apollo', 'typescript-operations'],
			config: {
				withHooks: false,
			},
			hooks: {
				afterAllFileWrite: ['eslint --fix', 'prettier --write'],
			},
		},
	},
};

export default config;
