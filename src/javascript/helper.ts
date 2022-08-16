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
