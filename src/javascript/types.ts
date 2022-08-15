export interface Term {
	semesterTitle: string
	id: number
}

export interface Department {
	id: number
	title: string
	abbreviation: string
}

export interface SectionTime {
	id: number
	sectionSequenceNumber: number
	instructionType: string
	instrName: string
	buildingName: string
	roomNum: string
	meetTimeDisplay: string
	startTime: string
	stopTime: string
	meetDaysDisplay: string
	meetDays: string
}

export interface Section {
	referenceNumber: string
	openseats: number
	creditLow: number
	creditHigh: number
	startDateVal: string
	stopDateVal: string
	sectionTimes: SectionTime[]
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

export interface Class {
	id: number
	classNumber: string
	classTitle: string
	classComments: string
	classPreReqs: string
	sections: Section[]
	edition: string
	human_readable_description: string | null | undefined
	human_readable_name: string | null | undefined
}
