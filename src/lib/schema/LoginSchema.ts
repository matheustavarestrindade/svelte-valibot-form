import * as v from 'valibot';

export const LoginSchema = v.object({
	email: v.pipe(v.string(), v.email()),
	password: v.pipe(v.string(), v.minLength(8)),
	file: v.array(v.file())
});

export type LoginSchemaType = typeof LoginSchema
