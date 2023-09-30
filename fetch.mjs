#!/usr/bin/env node

import {readFile, writeFile} from 'node:fs/promises'
import {env} from 'node:process'

let auth = env.auth
if (!auth) throw new Error('auth')

let url = 'https://discord.com/api/v9/channels/1011731142975696896/messages?limit=100'
let referer = 'https://discord.com/channels/806986940024619039/1011731142975696896'

let fetch_before
try {
    fetch_before = await readFile('./before', {encoding: 'utf8'})
} catch (error) {}
console.info(`before ${fetch_before}`)

let fetch_results = []
while (true) {
    let fetch_url = fetch_before ? `${url}&before=${fetch_before}` : url
    let fetch_json
    try {
        let fetch_response = await fetch(fetch_url, {headers: {'authorization': auth, 'referer': referer,}})
        fetch_json = await fetch_response.json()
    } catch (error) {
        console.error(error.message)
        await new Promise(function (resolve) { setTimeout(resolve, 10000) })
        continue
    }
    console.info(`fetch ${fetch_url}`)

    if (!fetch_json.length) break

    for (let element of fetch_json) {
        fetch_results.push(element)
        fetch_before = element.id
    }
}
console.info(`fetched ${fetch_results.length}`)

try {
    writeFile('./before', fetch_before)
} catch (error) {}
console.info(`after ${fetch_before}`)

let data = []
try {
    let file = await readFile('./data.json', {encoding: 'utf8'})
    data = JSON.parse(file)
} catch (error) {}
console.info(`data ${data.length}`)

for (let fetch_result of fetch_results) {
    let matches = fetch_result.content.matchAll(/((?:for|by) (?<name>[^,$]+)|for \$(?<amount>(?:\d|,)+)|on (?<date>(?:\d|\/)+))/g)

    let name
    let date
    let amount
    for (let match of matches) {
        if (match.groups.name) name = match.groups.name.toLowerCase()
        if (match.groups.date) date = new Date(match.groups.date).getTime()
        if (match.groups.amount) amount = Number(match.groups.amount.replace(',', ''))
    }

    if (!name || !amount) continue
    if (!date) date = new Date(fetch_result.timestamp).getTime()

    data.push({name, date, amount})
}
console.info(`total ${data.length}`)

let data_text = JSON.stringify(data, undefined, 2)
await writeFile('./data.json', data_text)
