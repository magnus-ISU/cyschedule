<script>
	let name = 'hello';
	async function f() {
		await fetch("https://classes.iastate.edu/app/rest/courses/preferences", {
	    "credentials": "include",
	    "headers": {
	        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:104.0) Gecko/20100101 Firefox/104.0",
	        "Accept": "application/json, text/javascript, */*; q=0.01",
	        "Accept-Language": "en-US,en;q=0.5",
	        "Content-Type": "application/json; charset=UTF-8",
	        "X-Requested-With": "XMLHttpRequest",
	        "Sec-Fetch-Dest": "empty",
	        "Sec-Fetch-Mode": "cors",
	        "Sec-Fetch-Site": "same-origin",
	        "Pragma": "no-cache",
	        "Cache-Control": "no-cache"
	    },
	    "referrer": "https://classes.iastate.edu/",
	    "body": "{\"semesters\":{\"departments\":[],\"semesters\":[],\"formDefaults\":{}},\"defSem\":2,\"selectedTerm\":2,\"selectedDepartment\":\"MATH\",\"startTime\":\"\",\"stopTime\":\"\"}",
	    "method": "POST",
	    "mode": "cors"
	})
	    .then((response) => {
	        if (!response.ok) {
	            throw new Error(`HTTP Error: ${response.status}`)
	        }
	        return response.json();
	    })
	    .then((json) => initialize(json))
	    .catch((err) => console.error(`Fetch problem: ${err.message}`));
	}


</script>

<main>
	<h1>Hello {name}!</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>