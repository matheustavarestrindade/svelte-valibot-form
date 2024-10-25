<script lang="ts">
	import { getContext } from 'svelte';
	import type { SvelteHTMLElements } from 'svelte/elements';
	const props: SvelteHTMLElements['input'] = $props();
	import type { LoginSchemaType } from '$lib/schema/LoginSchema.js';
	import type { ValibotErrorContext, ValibotErrorKey } from '$lib/types.js';

	const key = props.name as ValibotErrorKey<LoginSchemaType>;
	const ctx = getContext<ValibotErrorContext<LoginSchemaType>>('form');

	const value = ctx?.defaultValues?.[key];
	const error = $derived(ctx?.errors?.[key]);
</script>

<div>
	<input {value} {...props} />
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
