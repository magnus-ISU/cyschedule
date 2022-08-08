<script lang="ts">
	let terms: any[] = []
	let departments: Object[] = []
	let selected_term = 1
	let selected_department = "math"
	let classes: string = ""
	let data_pulled_for = {}
	async function read_form_defaults() {
		fetch(`http://127.0.0.1:8081/info/`, {
			method: "GET",
		})
			.then((x) => x.json())
			.then((x) => {
				terms = x["semesters"]
				departments = x["departments"]
				console.log(departments)
				console.log(terms)
			})
			.catch((err) => {
				console.log(`error encountered: ${err}`)
			})
	}
	// Get the terms and departments as soon as possible
	read_form_defaults()
</script>

<h1>Welcome to SvelteKit</h1>
{#if terms != undefined}
	{#each terms as term}
		<p>
			{term.semesterTitle}
		</p>
	{/each}
{/if}
<p>
	{departments}
</p>
