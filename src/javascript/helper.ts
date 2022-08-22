import type {SectionTime} from "../javascript/types";

export function dict_from_arr_based_on_key(arr: any[], key: string): Record<string, any> {
	let retval: Record<string, any> = {}
	arr.forEach((e: any) => {
		retval[e[key].toLowerCase()] = e
	})
	return retval
}

export function silly_loading_name() {
	let silly = ['Searching for squirrels...', 'Looking for APIs']
	return silly[~~(Math.random() * silly.length)];
}

const dept_name_regex = /[a-zA-Z ]+/
const class_number_regex = /[0-9]+/

export function dept_name_from_class_title(s: string) {
	return (s.match(dept_name_regex) || [""])[0].trim()
}
export function class_number_from_class_title(s: string) {
	return (s.match(class_number_regex) || [""])[0].trim()
}

function timestamp_to_military(ts: string): string {
	let s = ts.split(':',3)
	return `${s[0]}:${s[1]}`
}

export function formatted_section_time(sectionTime: SectionTime): string {
	if (sectionTime.meetTimeDisplay.startsWith('Arrang')) {
		return `${sectionTime.meetTimeDisplay} ${sectionTime.meetDaysDisplay}`
	}
	return `Meets ${timestamp_to_military(sectionTime.startTime)}-${timestamp_to_military(sectionTime.stopTime)} ${sectionTime.meetDays.replaceAll(' ', '')}`
}

export function formatted_section_instructor(sectionTime: SectionTime): string {
	let class_instructor = sectionTime.instrName
	if (class_instructor === "") {
		return "No instructor information available"
	}
	return class_instructor
}

export function formatted_section_location(sectionTime: SectionTime): string {
	let class_location = `${sectionTime.buildingName} ${sectionTime.roomNum.trim()}`.trim()
	if (class_location === "") {
		return "No location information available"
	}
	return class_location
}
