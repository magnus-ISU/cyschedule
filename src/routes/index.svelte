<script lang='ts'>
	let data: any = "Loading...";
	let num = 0
	async function f() {
		//fetch("https://classes.iastate.edu/app/rest/courses/preferences", {
		fetch("localhost:8080/https://classes.iastate.edu/app/rest/courses/preferences", {
			headers: { "content-type": "application/json; charset=UTF-8", },
			body: '{"selectedTerm":2,"selectedDepartment":"MATH"}',
			method: "POST",
		}) .then((x) => {num = 1; return x.json();}) .then((x) => {console.log(x); data = x; num = 2}) .catch((err) => {num = 3; console.log(`error encountered: ${err}`);});
	}
	f();
</script>

<h1>Welcome to SvelteKit</h1>
<p>
	{data}
</p>
<p>
	{num}
</p>
