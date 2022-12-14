<script lang="ts">
	import Tab, { Label } from "@smui/tab"
	import TabBar from "@smui/tab-bar"
	import Textfield from "@smui/textfield"
	import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';

	import type {Class, Term, Department} from "../javascript/types";
	import {dict_from_arr_based_on_key, silly_loading_name, dept_name_from_class_title, class_number_from_class_title} from "../javascript/helper"
	import {read_department_classes, read_class_rich_info} from "../javascript/network"
	import ClassInfo from "../components/ClassInfo.svelte"

	const hardcoded_departments = {
		'cs': 'com s'
	}

	let terms: Term[] | undefined
	let selected_term: Term | undefined
	let departments: Record<string, Department>

	// TODO change class numbers to actual numbers
	let classes_textboxes: Record<number, string> = {}
	let classes_pulled_for_departments_for_terms: Record<number, Record<string, Record<string, Class> | undefined>> = {}

	let department_titles_to_abbreviations: Record<string, string> = hardcoded_departments
	let valid_departments: Set<string> = new Set(Object.keys(hardcoded_departments))

	let valid_classes_selected: Set<string> = new Set()
	let valid_classes_selected_deletewatcher: Set<string> = new Set()

	let courses_for_last_valid_department_invalid_number: Class[] = []
	let department_for_last_valid_department_invalid_number: Department | undefined = undefined


	function discover_valid_classes_selected(
		selected_term: Term | undefined,
		classes_textboxes: Record<number, string>,
		classes_pulled_for_departments_for_terms: Record<string, Record<string, Record<string, Class> | undefined>>
	): undefined | null | string {
		if (selected_term === undefined) {
			return undefined
		}
		if (!(selected_term.id in classes_pulled_for_departments_for_terms)) {
			classes_pulled_for_departments_for_terms[selected_term.id] = {}
		}
		let classes_pulled_for_departments = classes_pulled_for_departments_for_terms[selected_term.id]
		let classes: string[] = classes_textboxes[selected_term.id].split("\n")
		valid_classes_selected_deletewatcher.clear()
		let invalid_dept = null
		let invalid_course = null
		classes.forEach((c) => {
			if (c === "") return
			const dept_name = dept_name_from_class_title(c)
			if (valid_departments.has(dept_name)) {
				// Check if number is valid and if we have to pull some stuff
				let dept_name_abbr = dept_name
				if (dept_name in department_titles_to_abbreviations) dept_name_abbr = department_titles_to_abbreviations[dept_name]
				const class_number = class_number_from_class_title(c)
				const abbr_number = `${dept_name_abbr} ${class_number}`
				if (valid_classes_selected.has(abbr_number)) {
					// We already processed this, so do nothing except note it wasn't deleted
					valid_classes_selected_deletewatcher.add(abbr_number)
				} else if (dept_name_abbr in classes_pulled_for_departments) {
					// Check if number is valid
					const dept_classes = classes_pulled_for_departments[dept_name_abbr]
					if (dept_classes === undefined) {
						// Do nothing, it is not loaded yet
					} else if (class_number in dept_classes) {
						// It is a valid class, add the information to a set. If nothing changes, great. If something is added, update reactive elements
						valid_classes_selected.add(abbr_number)
						valid_classes_selected_deletewatcher.add(abbr_number)
						valid_classes_selected = valid_classes_selected
					} else {
						// TODO invalid number, valid department
						invalid_course = c
						department_for_last_valid_department_invalid_number = departments[dept_name_abbr]
						courses_for_last_valid_department_invalid_number = Object.values(dept_classes).filter((v) => v.classNumber.includes(class_number))
					}
				} else {
					// Pull the number and set it to undefined
					classes_pulled_for_departments[dept_name_abbr] = undefined
					read_department_classes(selected_term.id, dept_name_abbr, classes_pulled_for_departments_for_terms).then(() => {
						// Recursively call to find out the classes. This cannot repeat twice so this shouldn't matter that much
						invalid_department_name = discover_valid_classes_selected(selected_term, classes_textboxes, classes_pulled_for_departments_for_terms)
					})
				}
			} else {
				invalid_dept = dept_name
			}
		})
		if (valid_classes_selected.size !== valid_classes_selected_deletewatcher.size) {
			valid_classes_selected = new Set(valid_classes_selected_deletewatcher)
		}
		if (invalid_dept !== null) return `Invalid department: ${invalid_dept}`
		if (invalid_course !== null) return `Invalid course: ${invalid_course}`
		return null
	}

	function reset_search() {
		department_for_last_valid_department_invalid_number = undefined
	}

	$: invalid_department_name = discover_valid_classes_selected(selected_term, classes_textboxes, classes_pulled_for_departments_for_terms)
	$: console.log(valid_classes_selected)

	async function read_class_rich_info_wrapper(course: Class) {
		if (course.human_readable_description !== undefined) return
		// Set the description to null so we know to draw the sections (now rather than all at once when looping over classes for performance)
		course.human_readable_description = null
		course.human_readable_name = null
		// Redraw for sections
		courses_for_last_valid_department_invalid_number = courses_for_last_valid_department_invalid_number 
		await read_class_rich_info(department_for_last_valid_department_invalid_number!.abbreviation, course.classNumber, course)
		// Redraw for class description
		courses_for_last_valid_department_invalid_number = courses_for_last_valid_department_invalid_number 
	}

	async function read_form_defaults() {
		await fetch(`http://127.0.0.1:8081/info/`, {
			method: "GET",
		})
			.then((x) => x.json())
			.then((x) => {
				x.semesters.forEach((e: Term) => {
					classes_textboxes[e.id] = ""
				})
				selected_term = x.semesters[0]
				terms = x.semesters
				console.log('departments: ', x.departments)
				departments = dict_from_arr_based_on_key(x.departments, 'abbreviation')
				x.departments.forEach((d: Department) => {
					const abbr = d.abbreviation.toLowerCase()
					const titl = d.title.toLowerCase()
					valid_departments.add(abbr)
					valid_departments.add(titl)
					department_titles_to_abbreviations[titl] = abbr
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

{#if terms !== undefined && selected_term !== undefined}
	<TabBar tabs={terms} let:tab bind:active={selected_term}>
		<Tab {tab} on:click={reset_search}>
			<Label>{tab.semesterTitle}</Label>
		</Tab>
	</TabBar>
	<br />
	<Textfield textarea bind:value={classes_textboxes[selected_term.id]} label={"Classes for " + selected_term.semesterTitle} input$rows={10} input$cols={24} />
	{#if invalid_department_name !== null}
		<p>{invalid_department_name} is invalid</p>
	{/if}
	<Accordion multiple>
		{#if department_for_last_valid_department_invalid_number !== undefined}
		{#each courses_for_last_valid_department_invalid_number as course}
			<Panel on:click={()=>{read_class_rich_info_wrapper(course)}}>
				<ClassInfo {department_for_last_valid_department_invalid_number} {course}/>
			</Panel>
		{/each}
		{/if}
	</Accordion>
{/if}
<br/>
