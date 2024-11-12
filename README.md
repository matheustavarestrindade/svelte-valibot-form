# Valibot SvelteKit Form

This is a validation library for SvelteKit, integrating Valibot to simplify validation on both front and backend.
This library provides reusable form components, context-aware validation, and error handling.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Form Setup](#form-setup)
  - [Custom Inputs](#custom-inputs)
  - [Server Actions](#server-actions)
- [API Reference](#api-reference)
  - [ValibotForm Props](#valibotform-props)
  - [Context Access](#context-access)
- [Example](#example)

---

## Installation

Install the library using npm:

```bash
npm install svelte-valibot-form
```

Make sure to install its dependencies:

```bash
npm install valibot
```

## Usage

### Form Setup

To create a form that validates data based on a schema, import `ValibotForm` and pass the necessary schema. Here’s a basic login form example:

```svelte
<!-- +page.svelte -->
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
	<FileInput name="file" multiple />
	<button type="submit">Login</button>
</ValibotForm>
```

### Custom Inputs

To access validation errors and default values directly within your form elements, use `getContext` to retrieve the validation context.

### Form Input Example

```svelte
<script lang="ts">
	import { getContext } from 'svelte';
	import type { LoginSchemaType } from '$lib/schema/LoginSchema.js';
	import type { ValibotErrorContext, ValibotErrorKey } from '$lib/types.js';

	const props: SvelteHTMLElements['input'] = $props();
	const ctx = getContext<ValibotErrorContext<LoginSchemaType>>('form');
	const key = props.name as ValibotErrorKey<LoginSchemaType>;

	const defaultValue = ctx?.defaultValues?.[key];
	const error = ctx?.errors?.[key];

	let files: FileList | null = $state(null);

	$effect(() => {
		if (defaultValue) {
			const dt = new DataTransfer();
			Array.isArray(defaultValue) ? defaultValue.forEach((file) => dt.items.add(file)) : dt.items.add(defaultValue);
			files = dt.files;
		}
	});
</script>

<div>
	<input type="file" bind:files {...props} />
	{#if error}
		<p>{error}</p>
	{/if}
</div>
```

### Normal Input Example

```svelte
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
```

### Server Actions

On the server side, simply parse incoming form data using the `ValibotAction` wrapper function with the schema to validate the data.
The return object of the Action will have a new member called `data` that has all the submitted data.

```typescript
// +page.server.ts
import { withValibot } from '$lib/request/WithSchema.js';
import { LoginSchema } from '$lib/schema/LoginSchema.js';
import type { Actions } from './$types.js';

export const actions: Actions = {
	login: withValibot(LoginSchema, async ({ data, request }) => {
		console.log(request);
		console.log(data);
	})
};
```

## API Reference

### ValibotForm Props

The `ValibotForm` component accepts the following props:

```typescript
type ValibotFormProps = SvelteHTMLElements['form'] & {
	schema: Schema;
	forceSubmit?: boolean;
	defaultValues?: Partial<v.InferInput<Schema>>;
	onSubmit?: (values: v.InferOutput<Schema>) => void;
	onError?: (errors: [v.InferIssue<Schema>, ...v.InferIssue<Schema>[]]) => void;
};
```

- **schema** (required): Validation schema based on Valibot.
- **forceSubmit**: (optional) Forces form submission when set to true, will be automatically set to false after use.
- **defaultValues**: (optional) Set initial values for the form fields.
- **onSubmit**: Callback function invoked when form validation is successful.
- **onError**: Callback function invoked with validation errors.

### Context Access

Each form element can access validation context properties such as `defaultValues` and `errors` using `getContext`.

```typescript
const ctx = getContext<ValibotErrorContext<LoginSchemaType>>('form');
```

- **defaultValues**: Access default values set in the form.
- **errors**: Access validation errors associated with each form field.

## Example

Here’s a complete example to illustrate the library’s usage.

```svelte
<script lang="ts">
	import ValibotForm from '$lib/components/ValibotForm.svelte';
	import GenericInput from '$lib/components/GenericInput.svelte';
	import { LoginSchema, type LoginSchemaType } from '$lib/schema/LoginSchema.js';
	import { ValibotAction } from '$lib/index.js';
	import type { InferOutput } from '@valibot/valibot';

	const login = async (data: InferOutput<LoginSchemaType>) => await ValibotAction.call('login', LoginSchema, data);
</script>

<ValibotForm schema={LoginSchema} defaultValues={{ email: '', password: '' }} onSubmit={login} onError={console.error}>
	<GenericInput name="email" type="email" placeholder="Email" />
	<GenericInput name="password" type="password" placeholder="Password" />
	<button type="submit">Login</button>
</ValibotForm>
```
## ValibotAction

The `ValibotAction` class is a utility for submitting validated form data directly to server actions in SvelteKit. 
It allows for seamless form submission, including handling file uploads, transforming the form data, and validating inputs against a Valibot schema before sending to the server.

### How It Works

`ValibotAction.call` validates the input data with the provided Valibot schema. If validation succeeds, it converts the data into `FormData`, handling nested objects and file uploads. 
Then, it sends the data to the specified server action endpoint. If the `invalidate` option is set, the cache will be invalidated after a successful submission.

### Usage

In a form component, `ValibotAction.call` can be used to validate and send form data:

```typescript
import { ValibotAction } from '$lib/index.js';
import { LoginSchema, type LoginSchemaType } from '$lib/schema/LoginSchema.js';
import type { InferOutput } from '@valibot/valibot';

const login = async (data: InferOutput<LoginSchemaType>) => await ValibotAction.call('login', LoginSchema, data);
```

### API

#### `ValibotAction.call`

```typescript
static async call<Schema extends GenericValibotObject>(
  action: string,
  schema: Schema,
  data: InferInput<Schema>,
  options?: ActionOptions
): Promise<{ success: boolean; errors?: Record<string, string>; issues?: ValibotIssue[] }>
```

- **action** (string): Name of the server action to invoke.
- **schema** (GenericValibotObject): A Valibot schema defining validation rules for the data.
- **data** (InferInput<Schema>): Input data to validate and send to the server action.
- **options** (ActionOptions, optional): Additional options, including:

  - `invalidate` (boolean): If `true`, invalidates the client-side cache after successful submission. Defaults to `true`.

- **Returns**: An object containing:
  - `success` (boolean): Indicates if the validation and submission were successful.
  - `errors` (optional): An error map generated if validation fails.
  - `issues` (optional): Array of Valibot validation issues if validation fails.

## License

This project is licensed under the MIT License.

---

This README provides a structured overview of your Valibot SvelteKit library, detailing the setup and usage of key components, properties, and context, with example code snippets. Let me know if you'd like further customization!
