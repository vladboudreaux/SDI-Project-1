const randomSelect = document.getElementById('randomSelect')
const url = 'https://pokeapi.co/api/v2/pokemon/'

function loadData() {
    const pokemon1 = JSON.parse(localStorage.getItem('pokemon1'))
    const pokemon2 = JSON.parse(localStorage.getItem('pokemon2'))

    if (pokemon1 && pokemon2) {
        renderPokemon(pokemon1, 'pokemon1')
        renderPokemon(pokemon2, 'pokemon2')
    }
}

loadData()


function saveData(pokemon1, pokemon2) {
    localStorage.setItem('pokemon1', JSON.stringify(pokemon1))
    localStorage.setItem('pokemon2', JSON.stringify(pokemon2))
}

async function parsePokemon(data) {
    const moveUrls = data.moves
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
        .map(m => m.move.url)

    const moveData = await Promise.all(
        moveUrls.map(url => fetch(url).then(res => res.json()))
    )
    console.log(moveData[0].flavor_text_entries)

    const moves = moveData.map(m => ({
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
    <p> HP: ${pokemon.hp}</p>
    <p> Attack: ${pokemon.attack}</p>
    <p> Defense: ${pokemon.defense}</p>
    <p> Speed: ${pokemon.speed}</p>
    <div class="move-buttons"> ${moveButtons}</div>
    `
}

randomSelect.addEventListener('click', async () => {
    const id1 = Math.floor(Math.random() * 1025) + 1
    const id2 = Math.floor(Math.random() * 1025) + 1

    const [data1, data2] = await Promise.all([
        fetch(`${url}${id1}`).then(res => res.json()),
        fetch(`${url}${id2}`).then(res => res.json()),
    ])

    const [pokemon1, pokemon2] = await Promise.all([
        parsePokemon(data1),
        parsePokemon(data2),
    ])

    renderPokemon(pokemon1, 'pokemon1')
    renderPokemon(pokemon2, 'pokemon2')
    saveData(pokemon1, pokemon2)

    //console.log(pokemon1, pokemon2)
})