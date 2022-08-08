<script lang="ts">
	let terms: Object[] = []
	let departments: Object[] = []
	let selected_term = 1
	let selected_department = "math"
	let classes: string = ""
	async function read_form_defaults() {
		fetch(`http://127.0.0.1:8081/info/`, {
			method: "GET",
		})
			.then((x) => x.json())
			.then((x) => {
				terms = x["semesters"]
				departments = x["departments"]
				console.log(terms)
				console.log(departments)
			})
			.catch((err) => {
				console.log(`error encountered: ${err}`)
			})
	}
	// Get the terms and departments as soon as possible
	read_form_defaults()
</script>

<h1>Welcome to SvelteKit</h1>
<p>
	{terms}
</p>
<p>
	{departments}
</p>
