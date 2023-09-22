#!/usr/bin/env node

import {readFile} from 'node:fs/promises'

let file = await readFile('./topstep-payouts.json', {encoding: 'utf8'})
let data = JSON.parse(file)

let count = data.length
let first = new Date().getTime()
let last = new Date(0).getTime()
let biggest = 0
let smallest = Number.MAX_SAFE_INTEGER
let months = {}
let names = {}

for (let record of data) {
    if (record.date < first)
        first = record.date

    if (record.date > last)
        last = record.date

    if (record.amount > biggest)
        biggest = record.amount

    if (record.amount < smallest)
        smallest = record.amount

    let year = new Date(record.date).getUTCFullYear()
    let month = new Date(record.date).getUTCMonth() + 1
    let month_key = `${year}-${month.toString().padStart(2, '0')}`
    if (months[month_key] === undefined) months[month_key] = 0
    months[month_key]++

    if (names[record.name] === undefined) names[record.name] = 0
    names[record.name] += record.amount
}

let names_entries = Object.entries(names)
let names_sort = names_entries.sort(function ([, a], [, b]) {return b - a})

let output = {
    count: count.toLocaleString(),
    first: new Date(first).toLocaleDateString(),
    last: new Date(last).toLocaleDateString(),
    biggest: biggest.toLocaleString(),
    smallest: smallest.toLocaleString(),
    months,
    names_highest: names_sort.slice(0, 100),
}

console.info(output)
