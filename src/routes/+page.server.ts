import { withValibot } from '$lib/request/WithSchema.js';
import { LoginSchema } from '$lib/schema/LoginSchema.js';
import type { Actions } from './$types.js';

export const actions: Actions = {
	test: withValibot(LoginSchema, async ({ data, request }) => {

    })
};