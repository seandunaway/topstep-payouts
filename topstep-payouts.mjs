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
    console.info(`before ${fetch_before}`)
} catch (error) {}

let fetch_results = []
while (true) {
    let fetch_url = fetch_before ? `${url}&before=${fetch_before}` : url
    let fetch_json
    try {
        console.info(`fetch ${fetch_url}`)
        let fetch_response = await fetch(fetch_url, {headers: {'authorization': auth, 'referer': referer,}})
        fetch_json = await fetch_response.json()
    } catch (error) {
        console.error(error.message)
        await new Promise(function (resolve) { setTimeout(resolve, 10000) })
        continue
    }

    if (!fetch_json.length) break

    for (let element of fetch_json) {
        fetch_results.push(element)
        fetch_before = element.id
    }
}
try {
    writeFile('./before', fetch_before)
    console.info(`before ${fetch_before}`)
} catch (error) {}
console.info(`fetched ${fetch_results.length}`)

let data = []
try {
    let file = await readFile('./topstep-payouts.json', {encoding: 'utf8'})
    data = JSON.parse(file)
} catch (error) {}
console.info(`data ${data.length}`)

for (let fetch_result of fetch_results) {
    let match = fetch_result.content.match(/(by|for) (?<name>.+?), on (?<date>.+?) for \$(?<amount>.+?)\./)
    if (!match) continue

    let name = match.groups.name.toLowerCase()
    let date = new Date(match.groups.date).getTime()
    let amount = Number(match.groups.amount.replace(',', ''))

    data.push({name, date, amount})
}
console.info(`total ${data.length}`)

await writeFile('./topstep-payouts.json', JSON.stringify(data, undefined, 2))
