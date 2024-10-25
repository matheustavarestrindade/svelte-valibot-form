<script lang="ts">
	import FileInput from '$lib/components/FileInput.svelte';
	import GenericInput from '$lib/components/GenericInput.svelte';
	import ValibotForm from '$lib/components/ValibotForm.svelte';
	import { LoginSchema } from '$lib/schema/LoginSchema.js';
</script>

<ValibotForm
	schema={LoginSchema}
	defaultValues={{ email: '', password: 'teste', file: [new File([], 'test.png')] }}
	onSubmit={console.log}
	onError={console.log}
>
	<GenericInput name="email" type="email" placeholder="Email" />
	<GenericInput name="password" type="password" placeholder="Password" />
	<!--  Allow multiple files-->
	<FileInput name="file" multiple />
	<button type="submit">Teste</button>
</ValibotForm>
