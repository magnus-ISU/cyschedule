<script lang='ts'>
	let form_defaults: any
	let selected_term = 1
	let selected_department = "math"
	let num = 0
	async function f() {
		fetch(`http://127.0.0.1:8081/info/`, {
			method: "GET",
		})
			.then((x) => x.json())
			.then((x) => {console.log(x); form_defaults = x;})
			.catch((err) => {console.log(`error encountered: ${err}`);});
	}
	f();
</script>

<h1>Welcome to SvelteKit</h1>
<p>
	{form_defaults}
</p>
<p>
	{num}
</p>
