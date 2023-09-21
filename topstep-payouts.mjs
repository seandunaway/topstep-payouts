#!/usr/bin/env node

import {env} from 'node:process'

let auth = env.auth
if (!auth) throw new Error('auth')

let url = 'https://discord.com/api/v9/channels/1011731142975696896/messages?limit=100'
let referer = 'https://discord.com/channels/806986940024619039/1011731142975696896'

let fetch_results = []
let fetch_before
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

    if (!fetch_json.length) break

    for (let element of fetch_json) {
        fetch_results.push(element)
        fetch_before = element.id
    }
}

let data = []
for (let fetch_result of fetch_results) {
    let match = fetch_result.content.match(/(by|for) (?<name>.+?), on (?<date>.+?) for \$(?<amount>.+?)\./)
    if (!match) continue

    let name = match.groups.name.toLowerCase()
    let date = new Date(match.groups.date).getTime()
    let amount = Number(match.groups.amount.replace(',', ''))

    data.push({name, date, amount})
}

console.info(data)
