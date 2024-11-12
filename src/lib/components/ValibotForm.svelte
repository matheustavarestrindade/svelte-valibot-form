<script lang="ts" generics="Schema extends GenericValibotObject">
	import type { SvelteHTMLElements } from 'svelte/elements';
	import * as v from 'valibot';
	import { setContext } from 'svelte';
	import { convertIssuesToErrorMap } from '$lib/utils/ErrorUtils.js';
	import type { GenericValibotObject } from '$lib/types.js';

	type ValibotFormProps = SvelteHTMLElements['form'] & {
		schema: Schema;
		forceSubmit?: boolean;
		defaultValues?: Partial<v.InferInput<Schema>>;
		onSubmit?: (values: v.InferOutput<Schema>) => void;
		onError?: (errors: [v.InferIssue<Schema>, ...v.InferIssue<Schema>[]]) => void;
	};

	let { defaultValues, schema, forceSubmit = $bindable(false), children, onError, onSubmit, ...rest }: ValibotFormProps = $props();

	let parseResult: v.SafeParseResult<Schema> | undefined = $state(undefined);
	let form: HTMLFormElement | undefined;

	let errorsByName: { [key: string]: string | undefined } = $derived.by(() => convertIssuesToErrorMap(parseResult?.issues ?? []));

	setContext('form', {
		get errors() {
			return errorsByName;
		},
		defaultValues
	});

	const handleSubmit = (event?: SubmitEvent) => {
		event?.preventDefault();
		if (!form?.checkValidity()) return;

		const formData = new FormData(form);
		const data: { [key: string]: FormDataEntryValue | File[] | File | undefined | null } = Object.fromEntries(formData.entries());

		const traverse = (children: HTMLElement) => {
			if (!(children instanceof HTMLElement)) return;
			const element = children as HTMLElement;
			if (element.childNodes.length > 0) {
				for (const child of element.childNodes) {
					traverse(child as HTMLElement);
				}
			}
			if (element?.tagName.toLowerCase() !== 'input') return;
			const input = element as HTMLInputElement;
			if (input.type !== 'file') return;

			const multiple = input.multiple;

			if (!multiple) data[input.getAttribute('v-name') || input.name] = input.files?.length ? input.files.item(0) : null;
			else data[input.getAttribute('v-name') || input.name] = Array.from(input.files ?? []);
		};

		traverse(form);

		const result = v.safeParse(schema, data);
		parseResult = result;
	};

	$effect(() => {
		if (forceSubmit) handleSubmit();
		forceSubmit = false;
	});

	$effect(() => {
		if (!schema || !parseResult) return;
		if (!parseResult.success) {
			onError?.(parseResult.issues as [v.InferIssue<Schema>, ...v.InferIssue<Schema>[]]);
			return;
		}
		onSubmit?.(parseResult.output);
	});
</script>

<form onsubmit={handleSubmit} bind:this={form} {...rest}>
	{@render children?.()}
</form>
