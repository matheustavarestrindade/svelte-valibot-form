<script lang="ts">
	import FileInput from '$lib/components/FileInput.svelte';
	import GenericInput from '$lib/components/GenericInput.svelte';
	import ValibotForm from '$lib/components/ValibotForm.svelte';
	import { ValibotAction } from '$lib/index.js';
	import { LoginSchema, type LoginSchemaType } from '$lib/schema/LoginSchema.js';
	import type { InferOutput } from '@valibot/valibot';

	const login = async (data: InferOutput<LoginSchemaType>) => await ValibotAction.call('login', LoginSchema, data);
</script>

<ValibotForm
	schema={LoginSchema}
	defaultValues={{ email: '', password: 'teste', file: [new File([], 'test.png')] }}
	onSubmit={login}
	onError={console.log}
>
	<GenericInput name="email" type="email" placeholder="Email" />
	<GenericInput name="password" type="password" placeholder="Password" />
	<!--  Allow multiple files-->
	<FileInput name="file" multiple />
	<button type="submit">Teste</button>
</ValibotForm>
