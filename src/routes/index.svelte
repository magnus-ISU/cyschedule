<script lang="ts">
	import Tab, { Label } from "@smui/tab"
	import TabBar from "@smui/tab-bar"
	import Textfield from "@smui/textfield"
	import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';

	import type {Class, Term, Department, Section, SectionTime} from "../javascript/types";
	import {silly_loading_name} from "../javascript/helper"
	import {read_form_defaults, read_department_classes, read_class_rich_info} from "../javascript/network"

	const hardcoded_departments = {
		'cs': 'com s'
	}

	const dept_name_regex = /[a-zA-Z ]+/
	const class_number_regex = /[0-9]+/

	let terms: Term[] | undefined
	let selected_term: Term | undefined
	let departments: Record<string, Department> | undefined = undefined

	// TODO change class numbers to actual numbers
	let classes_textboxes: Record<number, string> = {}
	let classes_pulled_for_departments_for_terms: Record<number, Record<string, Record<string, Class> | undefined>> = {}

	let department_titles_to_abbreviations: Record<string, string> = hardcoded_departments
	let valid_departments: Set<string> = new Set(Object.keys(hardcoded_departments))

	let valid_classes_selected: Set<string> = new Set()
	let valid_classes_selected_deletewatcher: Set<string> = new Set()

	let courses_for_last_valid_department_invalid_number: Class[] = []
	let department_for_last_valid_department_invalid_number: Department | undefined = undefined

	function dept_name_from_class_title(s: string) {
		return (s.match(dept_name_regex) || [""])[0].trim()
	}
	function class_number_from_class_title(s: string) {
		return (s.match(class_number_regex) || [""])[0].trim()
	}

	function timestamp_to_military(ts: string): string {
		let s = ts.split(':',3)
		return `${s[0]}:${s[1]}`
	}

	function formatted_section_time(sectionTime: SectionTime): string {
		if (sectionTime.meetTimeDisplay.startsWith('Arrang')) {
			return `${sectionTime.meetTimeDisplay} ${sectionTime.meetDaysDisplay}`
		}
		return `meets ${timestamp_to_military(sectionTime.startTime)}-${timestamp_to_military(sectionTime.stopTime)} ${sectionTime.meetDays.replaceAll(' ', '')}`
	}

	function formatted_section_instructor_location(sectionTime: SectionTime): string {
		return `${sectionTime.instrName} @ ${sectionTime.buildingName} ${sectionTime.roomNum.trim()}`
	}

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
						department_for_last_valid_department_invalid_number = departments![dept_name_abbr]
						courses_for_last_valid_department_invalid_number = Object.values(dept_classes).filter((v) => v.classNumber.includes(class_number))
					}
				} else {
					// Pull the number and set it to undefined
					classes_pulled_for_departments[dept_name_abbr] = undefined
					read_department_classes(selected_term.id, dept_name_abbr, classes_pulled_for_departments_for_terms)
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

	async function read_form_defaults_wrapper() {
		const form_defaults = await read_form_defaults(classes_textboxes, terms, valid_departments, department_titles_to_abbreviations)
		classes_textboxes = classes_textboxes
		valid_departments = valid_departments
		department_titles_to_abbreviations = department_titles_to_abbreviations
		selected_term = form_defaults[0]
		terms = terms
		departments = form_defaults[1]
		console.log('selected_term',selected_term)
		console.log('departments',departments)
	}
	// Get the terms and departments as soon as possible
	read_form_defaults_wrapper()
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
				<Header>
					{course.classTitle}
					<span slot="description">{department_for_last_valid_department_invalid_number.abbreviation} {course.classNumber}</span>
				</Header>
				<Content>
					{#if course.human_readable_description !== undefined && course.human_readable_description !== null}
						{@html course.human_readable_description}
					{:else}
						{silly_loading_name()} <br/>
					{/if}
					{#if course.human_readable_description !== undefined}
					<Accordion>
						{#each course.sections as section}
							<Panel color="secondary">
								<Header>
									{section.sectionString}
									<span slot="description">{`${section.openseats} open seats`}</span>
								</Header>
								<Content>
									{#each section.sectionTimes as t}
										<p> {`${formatted_section_instructor_location(t)} ${formatted_section_time(t)}`} </p>
									{/each}
								</Content>
							</Panel>
						{/each}
					</Accordion>
					{/if}
					{#if course.classComments !== ''}{course.classComments.toLowerCase().replaceAll('<br>', '')}<br/>{/if}
				</Content>
			</Panel>
		{/each}
		{/if}
	</Accordion>
{/if}
<br/>
