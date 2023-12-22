import { sql } from "drizzle-orm"
import { mysqlTable, int, varchar, datetime, serial, timestamp } from "drizzle-orm/mysql-core"
import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import mockdate from "mockdate"


// Set date to one minute before DST starts in Paris
// mockdate.set('2023-03-26T00:59:00.000Z');
// mockdate.set('2023-03-26');

// Run your tests...

// Set date to one minute after DST starts in Paris
// mockdate.set('2023-03-26T02:01:00.000Z')
// mockdate.set('2023-03-27');

// Run your tests...

// Set date to one minute before DST ends in Paris
// mockdate.set('2023-10-29T02:59:00.000Z');

// Run your tests...

// Set date to one minute after DST ends in Paris
// mockdate.set('2023-10-29T02:01:00.000Z');



// If you don't want to configure any timezone and rely on default driver behavior,
// just set connectionTimezone to an empty object
// const connectionTimezone = {timezone: getTimeZone()}
// const connectionTimezone = {timezone: 'Z'}
const connectionTimezone = {}
const connection = await mysql.createConnection({ uri: process.env.DATABASE_URL, ...connectionTimezone })
const db = drizzle(connection)


const table = mysqlTable("test_Dates", {
  id: serial("id").primaryKey(),
  description: varchar("description", { length: 255 }),
  date1: datetime("date1", { mode: "date", fsp: 3 }).default(sql`current_timestamp`),
  date2: datetime("date2", { mode: "string", fsp: 3 }).default(sql`current_timestamp`),
  date3: timestamp("date3", { mode: "date", fsp: 3 }).default(sql`current_timestamp`),
  date4: timestamp("date4", { mode: "string", fsp: 3 }).default(sql`current_timestamp`),
})

table.date3.mapFromDriverValue = (value: any) => new Date(value)
table.date3.mapToDriverValue = (value: any) =>  value


// drop the table at start so that we can check the table after each run
await db.execute(sql`drop table if exists ${table}`)

const created = await db.execute(sql`CREATE TABLE IF NOT EXISTS ${table} (
    id serial primary key,
    description varchar(255),
    date1 datetime(3) default current_timestamp(3),
    date2 datetime(3) default current_timestamp(3),
    date3 timestamp(3) default current_timestamp(3),
    date4 timestamp(3) default current_timestamp(3)
  )`)


// Current datetime
const myDate = new Date()
const myDateStr = toLocaleISOString(myDate)

// Insert a row using Drizzle
const inserted = await db
  .insert(table)
  .values({ description: "inserted with drizzle", date1: myDate, date2: myDateStr, date3: myDate, date4: myDateStr })

// Insert a row directly with mysql2
connection.execute(`insert into test_Dates (description, date1, date2, date3, date4) values (?, ?, ?, ?, ?)`, [ "inserted with mysql2", myDate, myDateStr, myDate, myDateStr])


console.log('Info')
console.log({ current_timezone: getTimeZone(), connectionTimezone, myDate, myDateStr })

console.log("Select with Drizzle")
console.log(await db.select().from(table))

console.log("select with raw sql")
const rows = await connection.query(`select * from test_Dates`) 
console.log(rows[0])


/**
 * Converts a Date object to a localized ISO string representation.
 * @param date - The Date object to convert.
 * @returns The localized ISO string representation of the Date object.
 */
function toLocaleISOString(date: Date) {
  const pad = (num: number) => num.toString().padStart(2, "0")

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1) // Months are 0-indexed in JavaScript
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

/**
 * Returns the current time zone offset in the format "+HH:MM" or "-HH:MM".
 * @returns {string} The current time zone offset.
 */
function getTimeZone() {
  const offset = new Date().getTimezoneOffset(),
    o = Math.abs(offset)
  return (
    (offset < 0 ? "+" : "-") +
    ("00" + Math.floor(o / 60)).slice(-2) +
    ":" +
    ("00" + (o % 60)).slice(-2)
  )
}
