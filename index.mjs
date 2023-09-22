#!/usr/bin/env node

import {readFile} from 'node:fs/promises'

let file = await readFile('./data.json', {encoding: 'utf8'})
let data = JSON.parse(file)
let output = {}

let date_first = new Date().getTime()
let date_last = new Date(0).getTime()
let payout_biggest = 0
let payout_smallest = Number.MAX_SAFE_INTEGER
let payout_per_month = {}
let names = {}
let total_paid_out = 0

for (let record of data) {
    if (record.date < date_first) date_first = record.date
    if (record.date > date_last) date_last = record.date
    if (record.amount > payout_biggest) payout_biggest = record.amount
    if (record.amount < payout_smallest) payout_smallest = record.amount

    let year = new Date(record.date).getUTCFullYear()
    let month = new Date(record.date).getUTCMonth() + 1
    let month_key = `${year}-${month.toString().padStart(2, '0')}`

    if (payout_per_month[month_key] === undefined) payout_per_month[month_key] = {count: 0, amount: 0}
    payout_per_month[month_key].count++
    payout_per_month[month_key].amount += record.amount

    if (names[record.name] === undefined) names[record.name] = {count: 0, amount: 0}
    names[record.name].count++
    names[record.name].amount += record.amount

    total_paid_out += record.amount
}

let names_entries = Object.entries(names)
let names_sort = names_entries.sort(function ([, {amount: a}], [, {amount: b}]) {return b - a})

output.names = names_entries.length
output.payouts = data.length
output.date_first = new Date(date_first).toLocaleDateString()
output.date_last = new Date(date_last).toLocaleDateString()
output.date_days = Math.round((date_last - date_first) / (24 * 3600 * 1000))
output.payout_biggest = payout_biggest
output.payout_smallest = payout_smallest
output.payout_average = Math.round(total_paid_out / data.length)
output.payout_average_per_name = Math.round(output.payout_average / names_entries.length)
output.payout_per_month = payout_per_month
output.names_highest_payouts = names_sort.slice(0, 100)
output.total_paid_out = total_paid_out

console.dir(output, {depth: 3})
