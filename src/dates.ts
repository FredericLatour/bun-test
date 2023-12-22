import SuperJSON from 'superjson'

const dateStr01 = '1970-01-01T12:00:00'
const date01 = new Date(dateStr01)
const allDates = { dateStr01, date01, local: date01.toLocaleString(), utc: date01.toUTCString() }
console.log(allDates)
const stringified = JSON.stringify(allDates)
const parsed = JSON.parse(stringified)
console.log(stringified)
console.log(parsed)
const sjstringified = SuperJSON.stringify(allDates)
const sjparsed = SuperJSON.parse(sjstringified)
console.log(sjstringified)
console.log(sjparsed)