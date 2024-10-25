import { applyAction, deserialize } from '$app/forms';
import { invalidateAll } from '$app/navigation';
import type { GenericValibotObject } from '$lib/types.js';
import { convertIssuesToErrorMap } from '$lib/utils/ErrorUtils.js';
import { safeParse, type InferInput } from '@valibot/valibot';

const defaultOptions = { invalidate: true };
type ActionOptions = { invalidate: boolean };

const actionFetch = async (action: string, data: FormData, { invalidate }: ActionOptions = defaultOptions): Promise<{ success: boolean }> => {
	try {
		const response = await fetch(`?/${action}`, { method: 'POST', body: data });
		const result = deserialize(await response.text());

		await applyAction(result);
		if (result.type !== 'success') return { success: false };

		if (invalidate) await invalidateAll();
		return { success: true };
	} catch (error) {
		return { success: false };
	}
};

class ValibotAction {
	static async call<Schema extends GenericValibotObject>(action: string, schema: Schema, data: InferInput<Schema>, options?: ActionOptions) {
		const result = safeParse(schema, data);

		if (!result.success) return { success: false, errors: convertIssuesToErrorMap<Schema>(result.issues), issues: result.issues };

		const formData = new FormData();

		for (const key in data) {
			const value = data[key];
			if (value === undefined || value === null) continue;
			if (typeof value === 'object') formData.append(key, JSON.stringify(value));
			else formData.append(key, value.toString());
		}

		return await actionFetch(action, formData, options);
	}

	// static async invoke(action: string, options: ActionOptions = defaultOptions) {
	// 	return await actionFetch(action, new FormData(), options);
	// }
}

export default ValibotAction;
