<script lang="ts">
	import Tab, { Label } from "@smui/tab"
	import TabBar from "@smui/tab-bar"
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';

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

	interface Classes {
		id: number
		classNumber: string
		classTitle: string
		classComments: string
		classPreReqs: string
		sections: Section[]
	}

	let terms: Term[]
	let selected_term: Term
	let departments: Department[]
	let selected_department: Department
	let classes_textbox: Record<number, string> = {}
	let classes_pulled_for_departments: Record<string, Classes> = {}

	async function read_form_defaults() {
		fetch(`http://127.0.0.1:8081/info/`, {
			method: "GET",
		})
			.then((x) => x.json())
			.then((x) => {
				selected_term = x.semesters[0]
				x.semesters.forEach((e: Term) => {
					classes_textbox[e.id] = ""
				});
				terms = x.semesters
				departments = x.departments
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

{#if terms != undefined}
	<TabBar tabs={terms} let:tab bind:active={selected_term}>
		<Tab {tab}>
			<Label>{tab.semesterTitle}</Label>
		</Tab>
	</TabBar>
	<br/>
	<Textfield
		textarea
		bind:value={classes_textbox[selected_term.id]}
		label={"Classes for " + selected_term.semesterTitle}
		input$rows={10}
		input$cols={24}
	>
	</Textfield>
{/if}
