<script lang="ts">
	import Tab, { Label } from "@smui/tab"
	import TabBar from "@smui/tab-bar"
	import Textfield from "@smui/textfield"

	interface Term {
		semesterTitle: string
		id: number
	}

	interface Department {
		id: number
		title: string
		abbreviation: string
	}

	interface SectionTime {
		id: number
		sectionSequenceNumber: number
		instructionType: string
		instrName: string
		buildingName: string
		roomNum: string
		meetTimeDisplay: string
		meetDaysDisplay: string
	}

	interface Section {
		referenceNumber: string
		openSeats: number
		creditLow: number
		creditHigh: number
		startDateVal: string
		stopDateVal: string
		sectionTimes: SectionTime
		partialSemesterComment: string
		specialPermissionRequirementsDisplay: string
		workshopFeeDisplay: string
		secondaryDeliveryTypeDisplay: string
		deliveryTypeDisplay: string
		specialFeeTypeDisplay: string
		offCampusDisplay: string
		offCampusLocation: string
		deliveryUrl: string
		startDate: string
		stopDate: string
		courseId: number
		sectionString: string
	}

	interface Class {
		id: number
		classNumber: string
		classTitle: string
		classComments: string
		classPreReqs: string
		sections: Section[]
	}

	const dept_name_regex = /[a-zA-Z ]+/

	let terms: Term[] | undefined
	let selected_term: Term | undefined
	let departments: Department[]
	let classes_textboxes: Record<number, string> = {}
	let classes_pulled_for_departments_for_terms: Record<number, Record<string, Record<string, Class[]> | undefined>> = {}
	let valid_departments: Set<string> = new Set()
	let titles_to_abbreviations: Record<string, string> = {}
	let valid_classes_selected: Set<string> = new Set()

	function dept_name_from_class_title(s: string) {
		return (s.match(dept_name_regex) || [""])[0].trim()
	}

	function dict_from_arr_based_on_key(arr: any[], key: string): Record<string, any> {
		let retval: Record<string, any> = {}
		arr.forEach((e: any) => {
			retval[e[key]] = e
		})
		return retval
	}

	function discover_valid_classes_selected(
		selected_term: Term | undefined,
		classes_textboxes: Record<number, string>,
		classes_pulled_for_departments_for_terms: Record<string, Record<string, Record<string, Class[]> | undefined>>
	): undefined | null | string {
		if (selected_term === undefined) {
			return undefined
		}
		if (!(selected_term.id in classes_pulled_for_departments_for_terms)) {
			classes_pulled_for_departments_for_terms[selected_term.id] = {}
		}
		let classes_pulled_for_departments = classes_pulled_for_departments_for_terms[selected_term.id]
		console.log("recomputing valid departments and invalid ones")
		let classes: string[] = classes_textboxes[selected_term.id].split("\n")
		let retval = null
		classes.forEach((c) => {
			if (c === "") return
			const dept_name = dept_name_from_class_title(c)
			if (valid_departments.has(dept_name)) {
				// Check if number is valid and if we have to pull some stuff
				let dept_name_abbr = dept_name
				if (dept_name in titles_to_abbreviations) dept_name_abbr = titles_to_abbreviations[dept_name]
				console.log(dept_name_abbr)
				if (dept_name_abbr in classes_pulled_for_departments) {
					// Check if number is valid
					if (classes_pulled_for_departments[dept_name_abbr] === undefined) {
						// Do nothing, it is not loaded yet
					} else {
						// TODO get information for the class
					}
				} else {
					// Pull the number and set it to undefined
					classes_pulled_for_departments[dept_name_abbr] = undefined
					read_department_classes(selected_term.id, dept_name_abbr)
				}
			} else {
				retval = c
			}
		})

		return retval
	}

	$: invalid_department_name = discover_valid_classes_selected(selected_term, classes_textboxes, classes_pulled_for_departments_for_terms)
	$: console.log(invalid_department_name)

	async function read_department_classes(term: number, department: string) {
		fetch(`http://127.0.0.1:8081/department/${term}/${department}`, {
			method: "GET",
		})
			.then((x) => x.json())
			.then((x) => {
				classes_pulled_for_departments_for_terms[term][department] = dict_from_arr_based_on_key(x.response, 'classNumber')
				console.log(x.response)
			})
			.catch((err) => {
				console.log(`error reading department: ${err}`)
				// TODO handle a network error
			})
	}

	async function read_form_defaults() {
		fetch(`http://127.0.0.1:8081/info/`, {
			method: "GET",
		})
			.then((x) => x.json())
			.then((x) => {
				x.semesters.forEach((e: Term) => {
					classes_textboxes[e.id] = ""
				})
				selected_term = x.semesters[0]
				terms = x.semesters
				departments = x.departments
				departments.forEach((d) => {
					const abbr = d.abbreviation.toLowerCase()
					const titl = d.title.toLowerCase()
					valid_departments.add(abbr)
					valid_departments.add(titl)
					titles_to_abbreviations[titl] = abbr
				})
				console.log(valid_departments)
				console.log(terms)
			})
			.catch((err) => {
				console.log(`error reading form defaults: ${err}`)
				// TODO Handle a network error
			})
	}
	// Get the terms and departments as soon as possible
	read_form_defaults()
</script>

{#if terms != undefined && selected_term != undefined}
	<TabBar tabs={terms} let:tab bind:active={selected_term}>
		<Tab {tab}>
			<Label>{tab.semesterTitle}</Label>
		</Tab>
	</TabBar>
	<br />
	<Textfield textarea bind:value={classes_textboxes[selected_term.id]} label={"Classes for " + selected_term.semesterTitle} input$rows={10} input$cols={24} />
	{#if invalid_department_name != null}
		<p>{invalid_department_name} is invalid</p>
	{/if}
{/if}
