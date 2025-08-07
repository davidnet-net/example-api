export const START_TIME = Date.now();

export function uptime() {
	return Date.now() - START_TIME;
}

export default uptime;
