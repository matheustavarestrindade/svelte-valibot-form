import type { GenericValibotObject, PartialSchemaError } from '$lib/types.js';
import type { GenericIssue, InferInput } from '@valibot/valibot';

export const convertIssuesToErrorMap = <Schema extends GenericValibotObject>(issues: GenericIssue[]): PartialSchemaError<Schema> => {
	const errors: PartialSchemaError<Schema> = {};

	for (const issue of issues ?? []) {
		if (!issue.path) continue;
		const key = issue.path[0]?.key as keyof InferInput<Schema>;
		if (!key) continue;
		errors[key] = issue.message;
	}
	return errors;
};
