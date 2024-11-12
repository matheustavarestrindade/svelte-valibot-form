import type { GenericValibotObject, PartialSchemaError } from '$lib/types.js';
import { convertIssuesToErrorMap } from '$lib/utils/ErrorUtils.js';
import type { RequestEvent } from '@sveltejs/kit';
import { safeParse, type InferIssue, type InferOutput } from 'valibot';

type ContentType<Schema extends GenericValibotObject> = RequestEvent & { data: InferOutput<Schema> };

export const withValibot = <Schema extends GenericValibotObject, OutputData>(
	schema: Schema,
	callback: (content: ContentType<Schema>) => Promise<OutputData>
) => {
	return async (
		event: RequestEvent
	): Promise<OutputData | { errors: PartialSchemaError<Schema>; issues: [InferIssue<Schema>, ...InferIssue<Schema>[]] }> => {
		const data = await event.request.formData();

		// TODO: is there a better way to parse the FormData object?
		let parsedObject: any = {};
		for (const key of data.keys()) {
			// Check if expected key is an array
			const isArray = schema.entries?.[key]?.expects === 'Array';
			if (isArray) {
				parsedObject[key] = [];
				for (const value of data.getAll(key)) {
					try {
						parsedObject[key].push(JSON.parse(value as string));
					} catch (error) {
						parsedObject[key].push(value);
					}
				}
				continue;
			}

			const value = data.get(key);
			if (value instanceof File) {
				parsedObject[key] = value;
				continue;
			}
			try {
				parsedObject[key] = JSON.parse(value as string);
			} catch (error) {
				parsedObject[key] = value;
			}
		}

		const result = safeParse(schema, parsedObject);

		if (!result.success) return { errors: convertIssuesToErrorMap<Schema>(result.issues), issues: result.issues };
		return await callback({ data: result.output, ...event });
	};
};
