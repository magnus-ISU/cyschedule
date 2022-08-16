import type {Class, Term, Department, Section, SectionTime} from "../javascript/types";
import {dict_from_arr_based_on_key} from "./helper"

export async function read_department_classes(
	term: number, 
	department: string,
	classes_pulled_for_departments_for_terms: Record<string, Record<string, Record<string, Class> | undefined>>
) {
	await fetch(`http://127.0.0.1:8081/department/${term}/${department}`, {
		method: "GET",
	})
		.then((x) => x.json())
		.then((x) => {
			classes_pulled_for_departments_for_terms[term][department] = dict_from_arr_based_on_key(x.response, 'classNumber')
			console.log(x)
		})
		.catch((err) => {
			console.log(`error reading department: ${err}`)
			// TODO handle a network error
		})
}

export async function read_class_rich_info(class_name: string, class_number: string, class_info: Class) {
	await fetch(`http://127.0.0.1:8081/classinfo/${class_name}%20${class_number}/${class_info.edition}`, {
		method: "GET",
	})
		.then((x) => {console.log(x); return x.text()})
		.then((x) => {
			class_info.human_readable_description = x
			class_info.human_readable_name = x
		})
		.catch((err) => {
			console.log(`error reading department: ${err}`)
			// TODO handle a network error
		})
}

export async function read_form_defaults(
	classes_textboxes: Record<number, string>,
	terms: Term[] | undefined,
	valid_departments: Set<string>,
	department_titles_to_abbreviations: Record<string, string>,
): Promise<[Term|undefined, Record<string, Department>|undefined]> {
	let selected_term: Term | undefined = undefined
	let departments: Record<string, Department> | undefined = undefined
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
	return [selected_term, departments]
}
