<script lang="ts">
	import { getContext } from 'svelte';
	import type { SvelteHTMLElements } from 'svelte/elements';
	import type { LoginSchemaType } from '$lib/schema/LoginSchema.js';
	import type { ValibotErrorContext, ValibotErrorKey } from '$lib/types.js';

	const props: SvelteHTMLElements['input'] = $props();

	const ctx = getContext<ValibotErrorContext<LoginSchemaType>>('form');
	const key = props.name as ValibotErrorKey<LoginSchemaType>;

	const defaultValue = ctx?.defaultValues?.[key] as File | null | File[] | undefined;
	const error = ctx?.errors?.[key] as string | undefined;

	let files: FileList | null = $state(null);

	$effect(() => {
		if (!defaultValue) return;
		const dt = new DataTransfer();
		if (Array.isArray(defaultValue)) {
			defaultValue.forEach((file) => dt.items.add(file));
		} else {
			dt.items.add(defaultValue);
		}
		files = dt.files;
	});
</script>

<div>
	<input type="file" bind:files {...props} />
	{#if error}
		<p>{error}</p>
	{/if}
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
	}

	input {
		margin: 0.5rem 0;
	}

	p {
		color: red;
		margin: 0.25rem 0;
	}
</style>
