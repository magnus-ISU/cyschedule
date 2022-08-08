<script lang="ts">
	let terms: Object = []
	let departments: Object[] = []
	let selected_term = 1
	let selected_department = "math"
	let classes: string = ""
	let data_pulled_for = {}
	function term_names_to_term_ids(terms: any[]): Object {
		let retval = Object.create(null)
		terms.forEach((x) => {
			let n: string = x.semesterTitle
			let id: number = x.id
			retval[n] = id
		})
		console.log(retval)
		return retval
	}
	async function read_form_defaults() {
		fetch(`http://127.0.0.1:8081/info/`, {
			method: "GET",
		})
			.then((x) => x.json())
			.then((x) => {
				terms = term_names_to_term_ids(x["semesters"])
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
{if terms is not undefined}

{/if}
<p>
	{departments}
</p>
