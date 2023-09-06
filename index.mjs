#!/usr/bin/env node

let auth = process.env.auth
if (!auth) throw new Error('auth')

let url = 'https://discord.com/api/v9/channels/1011731142975696896/messages?limit=100'
let referer = 'https://discord.com/channels/806986940024619039/1011731142975696896'

let results = []
let before

while (true) {
    let fetch_url = before ? `${url}&before=${before}` : url
    try {
        console.info('fetch', before)
        var response = await fetch(fetch_url, {headers: {'authorization': auth, 'referer': referer,}})
        var json = await response.json()
    } catch (error) {
        console.error(error.message)
        await new Promise(function (resolve) { setTimeout(resolve, 5000) })
        continue
    }

    if (!json.length) break

    for (let element of json) {
        results.push(element)
        before = element.id
    }
}

let results_clean = []

for (let result of results) {
    let match = result.content.match(/(by|for) (?<name>.+?), on (?<date>.+?) for \$(?<amount>.+?)\./)
    if (!match) continue

    let name = match.groups.name.toLowerCase()
    let date = new Date(match.groups.date)
    let amount = Number(match.groups.amount.replace(',', ''))

    results_clean.push({name, date, amount})
}

console.log(results_clean)
