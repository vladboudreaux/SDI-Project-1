const randomSelect = document.getElementById('randomSelect')
const url = 'https://pokeapi.co/api/v2/pokemon/'

const battleLog = document.getElementById('battle-log')
const arena = document.getElementById('arena')
const logList = document.getElementById('log-list')
const clearButton = document.getElementById('clearButton')

let pokemon1 = null
let pokemon2 = null
let logEntries = []

function loadData() {
    pokemon1 = JSON.parse(localStorage.getItem('pokemon1'))
    pokemon2 = JSON.parse(localStorage.getItem('pokemon2'))
    logEntries = JSON.parse(localStorage.getItem('battleLog')) || []

    if (pokemon1 && pokemon2) {
        renderPokemon(pokemon1, 'pokemon1')
        renderPokemon(pokemon2, 'pokemon2')
        for (let entry of logEntries) {
            const li = document.createElement('li')
            li.textContent = entry
            logList.prepend(li)
        }
    }
}

loadData()

function handleResponse(res) {
    if (!res.ok) throw new Error(`Error: ${res.status}`)
    return res.json()
}

function saveData(pokemon1, pokemon2, logEntries) {
    localStorage.setItem('pokemon1', JSON.stringify(pokemon1))
    localStorage.setItem('pokemon2', JSON.stringify(pokemon2))
    localStorage.setItem('battleLog', JSON.stringify(logEntries))
}

async function parsePokemon(data) {
    const moveUrls = data.moves
        .sort(() => Math.random() - 0.5)
        .slice(0, 20)
        .map(m => m.move.url)

    const moveData = await Promise.all(
        moveUrls.map(url => fetch(url).then(handleResponse))
    )
    // console.log(moveData[0].flavor_text_entries)

    filteredMoves = moveData.filter(m => m.power !== null && m.power > 0).slice(0, 4)

    const moves = filteredMoves.map(m => ({
        name: m.name,
        power: m.power || 0,
        accuracy: m.accuracy || 100,
        type: m.type.name,
        description: m.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text || 'no description available'
    }))

    return {
        name: data.name,
        image: data.sprites.other['official-artwork'].front_default,
        hp: data.stats.find(s => s.stat.name === 'hp').base_stat,
        attack: data.stats.find(s => s.stat.name === 'attack').base_stat,
        defense: data.stats.find(s => s.stat.name === 'defense').base_stat,
        speed: data.stats.find(s => s.stat.name === 'speed').base_stat,
        types: data.types.map(t => t.type.name),
        moves
    }
}

function renderPokemon(pokemon, cardId) {
    const card = document.getElementById(cardId)

    const moveButtons = pokemon.moves.map(move => `
        <button class="move-btn"
        data-move-name="${move.name}"
        data-move-power="${move.power}"
        data-move-accuracy="${move.accuracy}"
        title="${move.description}">
        ${move.name} (PWR: ${move.power} | ACC: ${move.accuracy})
        </button>`).join('')

    card.innerHTML = `
    <h2>${pokemon.name}</h2>
    <img src="${pokemon.image}" alt="${pokemon.name}" width="200"/>
    <p> Type: ${pokemon.types.join(', ')}</p>
    <span class="pokemon-hp" id="hp-${cardId}"> HP: ${pokemon.hp}</span>
    <p> Attack: ${pokemon.attack}</p>
    <p> Defense: ${pokemon.defense}</p>
    <p> Speed: ${pokemon.speed}</p>
    <div class="move-buttons"> ${moveButtons}</div>
    `

    card.classList.remove('pokemon-enter')
    void card.offsetWidth
    card.classList.add('pokemon-enter')

    const cardBackgrounds = {
        water: `../images/water_background.jpg`,
        fire: `../images/fire_background_small.jpeg`,
        grass: `../images/grass_background.jpg`,
        dark: `../images/dark_background_small.jpeg`,
        ice: `../images/ice_background.jpg`,
    }

    const type = pokemon.types[0]
    const cBg = cardBackgrounds[type] || `../images/forest_background.jpg`

    card.querySelector('img').style.backgroundImage = `url(${cBg})`
}

randomSelect.addEventListener('click', async () => {
    const id1 = Math.floor(Math.random() * 1025) + 1
    const id2 = Math.floor(Math.random() * 1025) + 1

    const [data1, data2] = await Promise.all([
        fetch(`${url}${id1}`).then(handleResponse),
        fetch(`${url}${id2}`).then(handleResponse),
    ]);

    [pokemon1, pokemon2] = await Promise.all([
        parsePokemon(data1),
        parsePokemon(data2),
    ])

    renderPokemon(pokemon1, 'pokemon1')
    renderPokemon(pokemon2, 'pokemon2')
    saveData(pokemon1, pokemon2)
    logEntries = []
    logList.innerHTML = ''
    localStorage.removeItem('battleLog')

    //console.log(pokemon1, pokemon2)
})

function calculateDamage(attacker, defender, movePower) {
    if (movePower === 0) return 0
    const randomness = 0.7 + Math.random() * 0.05
    console.log(`randomness: ${randomness}`)
    const damage = Math.floor(((attacker.attack * movePower) / (5 * defender.defense)) * randomness)
    return Math.max(1, damage)
}

function doBattle(attacker, defender, move, defenderId) {
    const damage = calculateDamage(attacker, defender, move.power)
    const li = document.createElement('li')
    const defenderCard = document.getElementById(defenderId)
    li.textContent = `${attacker.name} uses ${move.name}. ${defender.name} takes ${damage} damage!`
    defender.hp = defender.hp - damage
    defenderCard.classList.add('damageShake')
    defenderCard.addEventListener('animationend', () => {
        defenderCard.classList.remove('damageShake')
    }, { once: true })
    document.getElementById(`hp-${defenderId}`).textContent = `HP: ${defender.hp}`
    logList.prepend(li)
    logEntries.push(li.textContent)
    if (defender.hp <= 0) {
        document.getElementById(`hp-${defenderId}`).textContent = `HP: 0`
        arena.removeEventListener('click', battleClick)
        alert(`${attacker.name} wins!`)
    }
    saveData(pokemon1, pokemon2, logEntries)
}

function battleClick(e) {
    const card = e.target.closest('.pokemon-card')
    const move = {
        name: e.target.dataset.moveName,
        power: parseInt(e.target.dataset.movePower)
    }
    if (e.target.classList.contains("move-btn") && card.id === 'pokemon1') {
        doBattle(pokemon1, pokemon2, move, 'pokemon2')
        const randomMove = pokemon2.moves[Math.floor(Math.random() * 4)]
        setTimeout(() => {
            if (pokemon2.hp > 0) {
                doBattle(pokemon2, pokemon1, randomMove, 'pokemon1')
            }
        }, 1000)
    }
}

arena.addEventListener('click', battleClick)

clearButton.addEventListener('click', () => {
    localStorage.clear()
    window.location.reload()
})