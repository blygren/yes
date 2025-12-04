const container = document.getElementById('content-container');

// Inject CSS for animations
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes floatUp {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    100% { transform: translate(-50%, -150%) scale(1.5); opacity: 0; }
}
`;
document.head.appendChild(styleSheet);

// 50 Handcrafted Zones
const zones = [
    { title: "Ocean Zone", desc: "Welcome to the deep blue.", bg: "#006994", color: "#ffffff", emojis: ['🌊', '🐟', '🐠', '🐡', '🦈', '🐳'] },
    { title: "Forest Zone", desc: "Welcome to the whispering woods.", bg: "#228B22", color: "#f0e68c", emojis: ['🌲', '🌳', '🍃', '🍄', '🦌', '🐿️'] },
    { title: "Desert Zone", desc: "Welcome to the scorching sands.", bg: "#EDC9AF", color: "#8B4513", emojis: ['🌵', '🐪', '☀️', '🦂', '🏜️'] },
    { title: "Volcano Zone", desc: "Welcome to the molten core.", bg: "#800000", color: "#FF4500", emojis: ['🌋', '🔥', '☄️', '🧨'] },
    { title: "Arctic Zone", desc: "Welcome to the frozen tundra.", bg: "#E0FFFF", color: "#4682B4", emojis: ['❄️', '⛄', '🧊', '🐻‍❄️', '🐧'] },
    { title: "Space Zone", desc: "Welcome to the final frontier.", bg: "#000000", color: "#FFFFFF", emojis: ['🚀', '🛸', '🌌', '🪐', '⭐'] },
    { title: "Candy Zone", desc: "Welcome to the sugar rush.", bg: "#FF69B4", color: "#FFFFFF", emojis: ['🍬', '🍭', '🍫', '🍩', '🍪'] },
    { title: "Midnight Zone", desc: "Welcome to the witching hour.", bg: "#191970", color: "#C0C0C0", emojis: ['🌙', '🦉', '🦇', '✨'] },
    { title: "Sunlight Zone", desc: "Welcome to the golden hour.", bg: "#FFD700", color: "#8B0000", emojis: ['☀️', '🌻', '🌅', '🕶️'] },
    { title: "Lavender Zone", desc: "Welcome to the purple haze.", bg: "#E6E6FA", color: "#4B0082", emojis: ['💜', '🌸', '🌿', '🟣'] },
    { title: "Mint Zone", desc: "Welcome to the fresh breeze.", bg: "#98FF98", color: "#006400", emojis: ['🍃', '🌿', '🍦', '🟢'] },
    { title: "Berry Zone", desc: "Welcome to the sweet harvest.", bg: "#8A2BE2", color: "#FFC0CB", emojis: ['🍓', '🫐', '🍇', '🍒'] },
    { title: "Gold Zone", desc: "Welcome to the royal treasury.", bg: "#DAA520", color: "#000000", emojis: ['💰', '👑', '🏆', '🥇', '⚜️'] },
    { title: "Silver Zone", desc: "Welcome to the chrome reflection.", bg: "#C0C0C0", color: "#000000", emojis: ['🥈', '🥄', '💿', '⚙️'] },
    { title: "Bronze Zone", desc: "Welcome to the ancient alloy.", bg: "#CD7F32", color: "#FFFFFF", emojis: ['🥉', '🏺', '🍂'] },
    { title: "Neon Zone", desc: "Welcome to the electric city.", bg: "#111111", color: "#39FF14", emojis: ['💡', '⚡', '🌈', '🎆'] },
    { title: "Shadow Zone", desc: "Welcome to the dark corner.", bg: "#2F4F4F", color: "#000000", emojis: ['🌑', '👤', '🕶️', '🐈‍⬛'] },
    { title: "Crimson Zone", desc: "Welcome to the red alert.", bg: "#DC143C", color: "#FFFFFF", emojis: ['🔴', '🌹', '🩸', '🍎'] },
    { title: "Sky Zone", desc: "Welcome to the cloud nine.", bg: "#87CEEB", color: "#FFFFFF", emojis: ['☁️', '🕊️', '✈️', '🪁'] },
    { title: "Earth Zone", desc: "Welcome to the grounded roots.", bg: "#556B2F", color: "#F5DEB3", emojis: ['🌍', '🌱', '🪨', '🪵'] },
    { title: "Fire Zone", desc: "Welcome to the burning flame.", bg: "#FF4500", color: "#FFFF00", emojis: ['🔥', '🕯️', '🎇', '🚒'] },
    { title: "Water Zone", desc: "Welcome to the flowing river.", bg: "#1E90FF", color: "#E0FFFF", emojis: ['💧', '🚿', '🛁', '🌊'] },
    { title: "Wind Zone", desc: "Welcome to the gusty peak.", bg: "#F0FFFF", color: "#708090", emojis: ['💨', '🍃', '🌬️', '🌪️'] },
    { title: "Electric Zone", desc: "Welcome to the high voltage.", bg: "#FFFF00", color: "#000000", emojis: ['⚡', '🔋', '🔌', '💡'] },
    { title: "Toxic Zone", desc: "Welcome to the hazard area.", bg: "#7FFF00", color: "#000000", emojis: ['☠️', '☣️', '🤢', '🧪'] },
    { title: "Royal Zone", desc: "Welcome to the king's court.", bg: "#4B0082", color: "#FFD700", emojis: ['👑', '🏰', '🤴', '👸'] },
    { title: "Bubblegum Zone", desc: "Welcome to the pop culture.", bg: "#FFC0CB", color: "#FF1493", emojis: ['🍬', '🎈', '🎀', '🌸'] },
    { title: "Coffee Zone", desc: "Welcome to the morning brew.", bg: "#6F4E37", color: "#FFF8DC", emojis: ['☕', '🥐', '🍩', '🥯'] },
    { title: "Lime Zone", desc: "Welcome to the sour twist.", bg: "#32CD32", color: "#000000", emojis: ['🍋', '🟢', '🍹'] },
    { title: "Lemon Zone", desc: "Welcome to the zest life.", bg: "#FFFACD", color: "#808000", emojis: ['🍋', '📒', '🚕'] },
    { title: "Orange Zone", desc: "Welcome to the citrus grove.", bg: "#FFA500", color: "#FFFFFF", emojis: ['🍊', '🏀', '🦊'] },
    { title: "Grape Zone", desc: "Welcome to the vineyard.", bg: "#800080", color: "#FFFFFF", emojis: ['🍇', '🍷', '🟣'] },
    { title: "Cherry Zone", desc: "Welcome to the top.", bg: "#8B0000", color: "#FFB6C1", emojis: ['🍒', '🌸', '🥧'] },
    { title: "Steel Zone", desc: "Welcome to the industrial complex.", bg: "#778899", color: "#FFFFFF", emojis: ['🏗️', '🔩', '🔧', '⛓️'] },
    { title: "Concrete Zone", desc: "Welcome to the urban jungle.", bg: "#808080", color: "#D3D3D3", emojis: ['🏢', '🛣️', '🧱'] },
    { title: "Wood Zone", desc: "Welcome to the log cabin.", bg: "#DEB887", color: "#8B4513", emojis: ['🪵', '🪓', '🌲', '🛖'] },
    { title: "Paper Zone", desc: "Welcome to the blank page.", bg: "#F5F5DC", color: "#000000", emojis: ['📄', '📝', '✉️', '📚'] },
    { title: "Ink Zone", desc: "Welcome to the written word.", bg: "#000080", color: "#FFFFFF", emojis: ['🖋️', '✒️', '🦑', '🖤'] },
    { title: "Ghost Zone", desc: "Welcome to the spectral plane.", bg: "#F8F8FF", color: "#DCDCDC", emojis: ['👻', '🌫️', '🕸️', '🕯️'] },
    { title: "Vampire Zone", desc: "Welcome to the night.", bg: "#2b0000", color: "#ff0000", emojis: ['🧛', '🦇', '🩸', '⚰️'] },
    { title: "Alien Zone", desc: "Welcome to the mothership.", bg: "#00FF00", color: "#000000", emojis: ['👽', '🛸', '👾', '🪐'] },
    { title: "Robot Zone", desc: "Welcome to the assembly line.", bg: "#708090", color: "#00FFFF", emojis: ['🤖', '🦾', '🦿', '🔋'] },
    { title: "Ninja Zone", desc: "Welcome to the shadows.", bg: "#101010", color: "#333333", emojis: ['🥷', '🗡️', '💨', '🌑'] },
    { title: "Pirate Zone", desc: "Welcome to the seven seas.", bg: "#00008B", color: "#FFD700", emojis: ['🏴‍☠️', '🦜', '⚓', '🗺️'] },
    { title: "Cowboy Zone", desc: "Welcome to the wild west.", bg: "#A0522D", color: "#F0E68c", emojis: ['🤠', '🐎', '🌵', '🔫'] },
    { title: "Fairy Zone", desc: "Welcome to the enchanted glade.", bg: "#FFB7C5", color: "#FFFFFF", emojis: ['🧚', '✨', '🍄', '🌸'] },
    { title: "Dragon Zone", desc: "Welcome to the dragon's lair.", bg: "#556B2F", color: "#FF8C00", emojis: ['🐉', '🐲', '🔥', '🏰'] },
    { title: "Unicorn Zone", desc: "Welcome to the rainbow bridge.", bg: "#E6E6FA", color: "#FF69B4", emojis: ['🦄', '🌈', '✨', '💖'] },
    { title: "Wizard Zone", desc: "Welcome to the arcane tower.", bg: "#483D8B", color: "#E6E6FA", emojis: ['🧙', '🪄', '🔮', '📜'] },
    { title: "Void Zone", desc: "Welcome to the end of the line.", bg: "#000000", color: "#333333", emojis: ['🕳️', '⬛', '🕶️', '🌑'] },
    
    // --- 100 New Zones ---
    { title: "Hacker Zone", desc: "Welcome to the mainframe.", bg: "#000000", color: "#00FF00", emojis: ['💻', '⌨️', '💾', '🔓'] },
    { title: "Glitch Zone", desc: "Welcome to the sys$em err#r.", bg: "#202020", color: "#FF00FF", emojis: ['👾', '📶', '📺', '🐞'] },
    { title: "Matrix Zone", desc: "Welcome to the simulation.", bg: "#0D0D0D", color: "#32CD32", emojis: ['🕶️', '💊', '🐇', '📞'] },
    { title: "Cyber Zone", desc: "Welcome to the network.", bg: "#001f3f", color: "#00FFFF", emojis: ['🌐', '🤖', '🦾', '🏙️'] },
    { title: "Terminal Zone", desc: "Welcome to the command line.", bg: "#1a1a1a", color: "#cccccc", emojis: ['🖥️', '>_', '⌨️', '📟'] },
    { title: "Retro Zone", desc: "Welcome to the 80s.", bg: "#2c003e", color: "#fe349a", emojis: ['📼', '🕹️', '💾', '📻'] },
    { title: "Pixel Zone", desc: "Welcome to the low res.", bg: "#ffffff", color: "#000000", emojis: ['👾', '🎨', '🖌️', '🖼️'] },
    { title: "Arcade Zone", desc: "Welcome to the high score.", bg: "#111111", color: "#FFD700", emojis: ['🕹️', '👾', '🎰', '🪙'] },
    { title: "Synthwave Zone", desc: "Welcome to the neon sunset.", bg: "#2b003b", color: "#ff71ce", emojis: ['🌅', '🌴', '🕶️', '🚗'] },
    { title: "Vaporwave Zone", desc: "Welcome to the aesthetic.", bg: "#ff99cc", color: "#00ffff", emojis: ['🗿', '🌴', '💻', '🐬'] },
    { title: "Steampunk Zone", desc: "Welcome to the gear age.", bg: "#d2b48c", color: "#8b4513", emojis: ['⚙️', '🕰️', '🎩', '🚂'] },
    { title: "Dieselpunk Zone", desc: "Welcome to the oil slick.", bg: "#333333", color: "#cd853f", emojis: ['⛽', '🏭', '🔧', '🚛'] },
    { title: "Biopunk Zone", desc: "Welcome to the genetic mod.", bg: "#2f4f4f", color: "#7fff00", emojis: ['🧬', '🦠', '🧪', '👁️'] },
    { title: "Solarpunk Zone", desc: "Welcome to the green future.", bg: "#f0fff0", color: "#228b22", emojis: ['☀️', '🌱', '🏡', '🔋'] },
    { title: "Atomic Zone", desc: "Welcome to the nucleus.", bg: "#e6e6fa", color: "#ff4500", emojis: ['⚛️', '☢️', '🧪', '🔬'] },
    { title: "Nuclear Zone", desc: "Welcome to the fallout.", bg: "#333300", color: "#ffff00", emojis: ['☢️', '💣', '😷', '🏭'] },
    { title: "Quantum Zone", desc: "Welcome to the superposition.", bg: "#000033", color: "#00bfff", emojis: ['⚛️', '🌌', '🎲', '🐈'] },
    { title: "Gravity Zone", desc: "Welcome to the heavy pull.", bg: "#4b0082", color: "#dda0dd", emojis: ['🍎', '🪐', '⚓', '🏋️'] },
    { title: "Magnetic Zone", desc: "Welcome to the polar shift.", bg: "#708090", color: "#ff0000", emojis: ['🧲', '🧭', '🔩', '🔗'] },
    { title: "Sonic Zone", desc: "Welcome to the sound barrier.", bg: "#0000ff", color: "#ffff00", emojis: ['🔊', '🎵', '🎧', '💨'] },
    { title: "Prism Zone", desc: "Welcome to the refracted light.", bg: "#f0f8ff", color: "#ff69b4", emojis: ['🌈', '💎', '🔦', '📐'] },
    { title: "Mirror Zone", desc: "Welcome to the reflection.", bg: "#c0c0c0", color: "#f5f5f5", emojis: ['🪞', '👯', '🌫️', '💿'] },
    { title: "Glass Zone", desc: "Welcome to the transparent.", bg: "#e0ffff", color: "#00ced1", emojis: ['🥃', '👓', '🔍', '🥛'] },
    { title: "Crystal Zone", desc: "Welcome to the lattice.", bg: "#f0ffff", color: "#e6e6fa", emojis: ['🔮', '💎', '🧊', '✨'] },
    { title: "Diamond Zone", desc: "Welcome to the hardest rock.", bg: "#b0e0e6", color: "#ffffff", emojis: ['💎', '💍', '💠', '🔷'] },
    { title: "Emerald Zone", desc: "Welcome to the green gem.", bg: "#50c878", color: "#ffffff", emojis: ['💚', '🥬', '📗', '🟢'] },
    { title: "Ruby Zone", desc: "Welcome to the red gem.", bg: "#e0115f", color: "#ffffff", emojis: ['🔴', '👠', '🌹', '❤️'] },
    { title: "Sapphire Zone", desc: "Welcome to the blue gem.", bg: "#0f52ba", color: "#ffffff", emojis: ['💙', '📘', '🧿', '🔵'] },
    { title: "Amethyst Zone", desc: "Welcome to the purple gem.", bg: "#9966cc", color: "#ffffff", emojis: ['💜', '🍇', '🔮', '🟣'] },
    { title: "Topaz Zone", desc: "Welcome to the yellow gem.", bg: "#ffc87c", color: "#ffffff", emojis: ['🧡', '🔸', '🦁', '🍯'] },
    { title: "Opal Zone", desc: "Welcome to the iridescent.", bg: "#a8c3bc", color: "#ffffff", emojis: ['🌈', '🐚', '🦄', '💿'] },
    { title: "Pearl Zone", desc: "Welcome to the oyster.", bg: "#eae0c8", color: "#000000", emojis: ['🦪', '⚪', '🐚', '🌊'] },
    { title: "Obsidian Zone", desc: "Welcome to the volcanic glass.", bg: "#000000", color: "#4b0082", emojis: ['🌋', '🖤', '🔪', '🪨'] },
    { title: "Granite Zone", desc: "Welcome to the bedrock.", bg: "#696969", color: "#dcdcdc", emojis: ['🪨', '⛰️', '🏛️', '🗿'] },
    { title: "Marble Zone", desc: "Welcome to the statue.", bg: "#fffaf0", color: "#808080", emojis: ['🏛️', '🗿', '🛁', '⚪'] },
    { title: "Slate Zone", desc: "Welcome to the clean slate.", bg: "#708090", color: "#ffffff", emojis: ['⬛', '🏫', '🖍️', '🪨'] },
    { title: "Sandstone Zone", desc: "Welcome to the canyon wall.", bg: "#d2691e", color: "#ffdead", emojis: ['🏜️', '🧱', '🏛️', '🐪'] },
    { title: "Limestone Zone", desc: "Welcome to the sediment.", bg: "#fffacd", color: "#8b4513", emojis: ['🐚', '🦴', '🧱', '⚪'] },
    { title: "Clay Zone", desc: "Welcome to the pottery.", bg: "#b22222", color: "#ffdab9", emojis: ['🏺', '🧱', '🎨', '👐'] },
    { title: "Mud Zone", desc: "Welcome to the sticky mess.", bg: "#462e01", color: "#deb887", emojis: ['🐷', '👢', '🌧️', '🍫'] },
    { title: "Swamp Zone", desc: "Welcome to the murky water.", bg: "#2f4f4f", color: "#9acd32", emojis: ['🐊', '🌿', '🦟', '🐸'] },
    { title: "Marsh Zone", desc: "Welcome to the wetlands.", bg: "#556b2f", color: "#f0e68c", emojis: ['🌾', '🦆', '🛶', '🦟'] },
    { title: "Bog Zone", desc: "Welcome to the peat.", bg: "#3b2f2f", color: "#8fbc8f", emojis: ['🌫️', '🍄', '🐸', '🪵'] },
    { title: "Jungle Zone", desc: "Welcome to the dense canopy.", bg: "#006400", color: "#ff4500", emojis: ['🌴', '🐒', '🦜', '🐍'] },
    { title: "Rainforest Zone", desc: "Welcome to the biodiversity.", bg: "#2e8b57", color: "#00ff7f", emojis: ['🌧️', '🐸', '🌺', '🦋'] },
    { title: "Savanna Zone", desc: "Welcome to the grasslands.", bg: "#F0E68C", color: "#8b4513", emojis: ['🦁', '🦓', '🦒', '🐘'] },
    { title: "Prairie Zone", desc: "Welcome to the open range.", bg: "#daa520", color: "#8b0000", emojis: ['🌾', '🐃', '🌻', '🚜'] },
    { title: "Meadow Zone", desc: "Welcome to the wildflowers.", bg: "#98fb98", color: "#ff69b4", emojis: ['🌼', '🐝', '🦋', '🐇'] },
    { title: "Field Zone", desc: "Welcome to the harvest.", bg: "#ffd700", color: "#556b2f", emojis: ['🌽', '🌾', '🚜', '🌻'] },
    { title: "Garden Zone", desc: "Welcome to the bloom.", bg: "#ffb6c1", color: "#006400", emojis: ['🌷', '🌻', '🥕', '🏡'] },
    { title: "Orchard Zone", desc: "Welcome to the fruit trees.", bg: "#ff7f50", color: "#228b22", emojis: ['🍎', '🍐', '🍑', '🌳'] },
    { title: "Farm Zone", desc: "Welcome to the agriculture.", bg: "#f5deb3", color: "#8b4513", emojis: ['🚜', '🐮', '🐔', '🐷'] },
    { title: "Barn Zone", desc: "Welcome to the livestock.", bg: "#8b0000", color: "#ffffff", emojis: ['🏚️', '🐴', '🐄', '🐓'] },
    { title: "Silo Zone", desc: "Welcome to the grain storage.", bg: "#c0c0c0", color: "#808080", emojis: ['🌾', '🏭', '🚜', '🌽'] },
    { title: "Mill Zone", desc: "Welcome to the grinding stone.", bg: "#a0522d", color: "#f5f5dc", emojis: ['🌬️', '🍞', '🌾', '🪵'] },
    { title: "Bakery Zone", desc: "Welcome to the fresh bread.", bg: "#ffdead", color: "#8b4513", emojis: ['🍞', '🥐', '🥖', '🧁'] },
    { title: "Butcher Zone", desc: "Welcome to the meat market.", bg: "#ffc0cb", color: "#8b0000", emojis: ['🥩', '🍖', '🔪', '🥓'] },
    { title: "Candle Zone", desc: "Welcome to the wax light.", bg: "#fff8dc", color: "#ff8c00", emojis: ['🕯️', '🔥', '🕎', '🐝'] },
    { title: "Library Zone", desc: "Welcome to the silence.", bg: "#8b4513", color: "#f5deb3", emojis: ['📚', '📖', '🤫', '👓'] },
    { title: "Bookstore Zone", desc: "Welcome to the stories.", bg: "#deb887", color: "#000000", emojis: ['📚', '🏷️', '☕', '🛍️'] },
    { title: "School Zone", desc: "Welcome to the education.", bg: "#f08080", color: "#ffffff", emojis: ['🏫', '🎒', '✏️', '🍎'] },
    { title: "University Zone", desc: "Welcome to the academia.", bg: "#000080", color: "#ffd700", emojis: ['🎓', '📜', '🏛️', '📚'] },
    { title: "Lab Zone", desc: "Welcome to the experiment.", bg: "#ffffff", color: "#0000ff", emojis: ['🧪', '🔬', '🥼', '🧬'] },
    { title: "Hospital Zone", desc: "Welcome to the healing.", bg: "#e0ffff", color: "#ff0000", emojis: ['🏥', '🚑', '🩺', '💉'] },
    { title: "Clinic Zone", desc: "Welcome to the checkup.", bg: "#f0fff0", color: "#008000", emojis: ['🩺', '📋', '💊', '🩹'] },
    { title: "Pharmacy Zone", desc: "Welcome to the medicine.", bg: "#ffffff", color: "#32cd32", emojis: ['💊', '🧴', '🧾', '🏥'] },
    { title: "Bank Zone", desc: "Welcome to the finance.", bg: "#006400", color: "#ffd700", emojis: ['🏦', '💰', '💳', '💵'] },
    { title: "Vault Zone", desc: "Welcome to the security.", bg: "#708090", color: "#c0c0c0", emojis: ['🔐', '🚪', '💎', '💰'] },
    { title: "Treasury Zone", desc: "Welcome to the gold bars.", bg: "#ffd700", color: "#000000", emojis: ['💰', '🏛️', '📜', '⚖️'] },
    { title: "Market Zone", desc: "Welcome to the trade.", bg: "#d2691e", color: "#ffebcd", emojis: ['🏪', '🍎', '🥖', '🛍️'] },
    { title: "Bazaar Zone", desc: "Welcome to the exotic goods.", bg: "#cd853f", color: "#800000", emojis: ['⛺', '🏺', '🌶️', '🐪'] },
    { title: "Mall Zone", desc: "Welcome to the consumerism.", bg: "#ff00ff", color: "#ffffff", emojis: ['🛍️', '🏬', '👗', '👟'] },
    { title: "Shop Zone", desc: "Welcome to the retail.", bg: "#4169e1", color: "#ffffff", emojis: ['🛒', '🏷️', '🏪', '🛍️'] },
    { title: "Store Zone", desc: "Welcome to the supplies.", bg: "#32cd32", color: "#ffffff", emojis: ['🏪', '📦', '🛒', '🧾'] },
    { title: "Boutique Zone", desc: "Welcome to the fashion.", bg: "#ff1493", color: "#000000", emojis: ['👗', '👠', '👜', '👒'] },
    { title: "Salon Zone", desc: "Welcome to the style.", bg: "#ff69b4", color: "#ffffff", emojis: ['💇', '💅', '💄', '💈'] },
    { title: "Spa Zone", desc: "Welcome to the relaxation.", bg: "#e0ffff", color: "#008080", emojis: ['🧖', '🥒', '🕯️', '💆'] },
    { title: "Gym Zone", desc: "Welcome to the workout.", bg: "#808080", color: "#ffff00", emojis: ['🏋️', '🏃', '🧘', '🥊'] },
    { title: "Stadium Zone", desc: "Welcome to the big game.", bg: "#00008b", color: "#ffffff", emojis: ['🏟️', '📣', '🌭', '🎫'] },
    { title: "Arena Zone", desc: "Welcome to the combat.", bg: "#8b0000", color: "#ffd700", emojis: ['🏟️', '⚔️', '🛡️', '🦁'] },
    { title: "Court Zone", desc: "Welcome to the judgment.", bg: "#8b4513", color: "#ffffff", emojis: ['⚖️', '🔨', '📜', '🏛️'] },
    { title: "Pitch Zone", desc: "Welcome to the kickoff.", bg: "#006400", color: "#ffffff", emojis: ['⚽', '🥅', '👟', '🏟️'] },
    { title: "Track Zone", desc: "Welcome to the race.", bg: "#b22222", color: "#ffffff", emojis: ['🏃', '👟', '⏱️', '🏁'] },
    { title: "Pool Zone", desc: "Welcome to the deep end.", bg: "#00bfff", color: "#ffffff", emojis: ['🏊', '🩳', '👙', '🌊'] },
    { title: "Beach Zone", desc: "Welcome to the sandcastle.", bg: "#f4a460", color: "#00ced1", emojis: ['🏖️', '🐚', '🦀', '🌴'] },
    { title: "Island Zone", desc: "Welcome to the isolation.", bg: "#20b2aa", color: "#ffffe0", emojis: ['🏝️', '🥥', '🚤', '🌋'] },
    { title: "Peninsula Zone", desc: "Welcome to the almost island.", bg: "#48d1cc", color: "#000000", emojis: ['🗺️', '🌊', '🏖️', '⛵'] },
    { title: "Cape Zone", desc: "Welcome to the point.", bg: "#5f9ea0", color: "#ffffff", emojis: ['🦸', '🌊', '🗺️', '🌬️'] },
    { title: "Bay Zone", desc: "Welcome to the harbor.", bg: "#4682b4", color: "#ffdead", emojis: ['⛵', '🌉', '🌊', '⚓'] },
    { title: "Gulf Zone", desc: "Welcome to the oil rig.", bg: "#191970", color: "#ffa500", emojis: ['🛢️', '🦐', '🌊', '🚢'] },
    { title: "Abyss Zone", desc: "Welcome to the bottom.", bg: "#000000", color: "#000080", emojis: ['🦑', '🌑', '🌊', '🔦'] },
    { title: "Reef Zone", desc: "Welcome to the coral.", bg: "#ff7f50", color: "#00ffff", emojis: ['🐠', '🪸', '🐢', '🐡'] },
    { title: "Trench Zone", desc: "Welcome to the pressure.", bg: "#000033", color: "#ffffff", emojis: ['🔦', '🦑', '🌊', '🌑'] },
    { title: "Cave Zone", desc: "Welcome to the stalactite.", bg: "#2f4f4f", color: "#d3d3d3", emojis: ['🦇', '🔦', '🪨', '🐻'] },
    { title: "Cavern Zone", desc: "Welcome to the echo.", bg: "#696969", color: "#000000", emojis: ['🧗', '🪨', '🦇', '💧'] },
    { title: "Grotto Zone", desc: "Welcome to the hidden pool.", bg: "#008080", color: "#afeeee", emojis: ['🧜', '🌊', '🪨', '✨'] },
    { title: "Mine Zone", desc: "Welcome to the pickaxe.", bg: "#8b4513", color: "#ffd700", emojis: ['⛏️', '💎', '🧨', '👷'] },
    { title: "Tunnel Zone", desc: "Welcome to the underground.", bg: "#333333", color: "#ffff00", emojis: ['🚇', '🔦', '🚇', '🧱'] },
    { title: "Subway Zone", desc: "Welcome to the metro.", bg: "#ffffff", color: "#000000", emojis: ['🚇', '🚉', '🎫', '🐀'] },
    { title: "Train Zone", desc: "Welcome to the locomotive.", bg: "#708090", color: "#000000", emojis: ['🚂', '🚃', '🛤️', '🎫'] },
    { title: "Plane Zone", desc: "Welcome to the altitude.", bg: "#87ceeb", color: "#ffffff", emojis: ['✈️', '☁️', '🧳', '🎫'] },
    { title: "Car Zone", desc: "Welcome to the highway.", bg: "#ff0000", color: "#c0c0c0", emojis: ['🚗', '🛣️', '⛽', '🚦'] },
    { title: "Bike Zone", desc: "Welcome to the pedal power.", bg: "#32cd32", color: "#000000", emojis: ['🚲', '🚴', '🚵', '🔔'] },
    { title: "Walk Zone", desc: "Welcome to the pedestrian.", bg: "#f5f5dc", color: "#000000", emojis: ['🚶', '👟', '👣', '🚦'] },
    { title: "Run Zone", desc: "Welcome to the sprint.", bg: "#ff4500", color: "#ffffff", emojis: ['🏃', '👟', '💨', '⏱️'] },
    { title: "Jump Zone", desc: "Welcome to the leap.", bg: "#ffa500", color: "#000000", emojis: ['🦘', '🐸', '🏀', '⬆️'] },
    { title: "Swim Zone", desc: "Welcome to the stroke.", bg: "#1e90ff", color: "#ffffff", emojis: ['🏊', '🥽', '🌊', '🐟'] },
    { title: "Fly Zone", desc: "Welcome to the wings.", bg: "#b0e0e6", color: "#000000", emojis: ['🕊️', '🦅', '✈️', '🧚'] },
    { title: "Dream Zone", desc: "Welcome to the REM cycle.", bg: "#e6e6fa", color: "#4b0082", emojis: ['💤', '☁️', '🦄', '✨'] },
    { title: "Nightmare Zone", desc: "Welcome to the terror.", bg: "#000000", color: "#ff0000", emojis: ['👹', '😱', '🕷️', '🌑'] },
    { title: "Illusion Zone", desc: "Welcome to the trick.", bg: "#ff00ff", color: "#00ff00", emojis: ['🎩', '🐇', '🌀', '🎭'] },
    { title: "Reality Zone", desc: "Welcome to the truth.", bg: "#ffffff", color: "#000000", emojis: ['👁️', '🌍', '🕰️', '🧠'] },
    { title: "Secret Zone", desc: "Welcome to the hush.", bg: "#2f2f2f", color: "#696969", emojis: ['🤫', '🗝️', '🕵️', '🤐'] },
    { title: "Mystery Zone", desc: "Welcome to the clue.", bg: "#483d8b", color: "#ffd700", emojis: ['🕵️', '🔍', '❓', '👣'] },
    { title: "Puzzle Zone", desc: "Welcome to the piece.", bg: "#00ced1", color: "#ff4500", emojis: ['🧩', '🧠', '🧊', '🔑'] },
    { title: "Riddle Zone", desc: "Welcome to the question.", bg: "#9400d3", color: "#00ff00", emojis: ['❓', '📜', 'sphinx', '🧠'] },
    { title: "Chaos Zone", desc: "Welcome to the disorder.", bg: "#ff0000", color: "#0000ff", emojis: ['🌀', '💥', '🤪', '🌪️'] },
    { title: "Order Zone", desc: "Welcome to the structure.", bg: "#ffffff", color: "#000080", emojis: ['⚖️', '📐', '🧱', '🏛️'] },

    // --- More New Zones ---
    { title: "Pizza Zone", desc: "Welcome to the slice.", bg: "#ff9933", color: "#ff0000", emojis: ['🍕', '🧀', '🍅', '🌶️'] },
    { title: "Burger Zone", desc: "Welcome to the grill.", bg: "#8b4513", color: "#ffd700", emojis: ['🍔', '🍟', '🥤', '🥓'] },
    { title: "Soda Zone", desc: "Welcome to the fizz.", bg: "#ff4500", color: "#ffffff", emojis: ['🥤', '🫧', '🧊', '🍹'] },
    { title: "Tea Zone", desc: "Welcome to the steep.", bg: "#90ee90", color: "#006400", emojis: ['🍵', '🫖', '🍪', '🌿'] },
    { title: "Storm Zone", desc: "Welcome to the thunder.", bg: "#4a4a4a", color: "#ffff00", emojis: ['⛈️', '⚡', '🌪️', '☔'] },
    { title: "Fog Zone", desc: "Welcome to the mist.", bg: "#d3d3d3", color: "#696969", emojis: ['🌫️', '☁️', '👻', '🔦'] },
    { title: "Rainbow Zone", desc: "Welcome to the spectrum.", bg: "#ff00ff", color: "#00ffff", emojis: ['🌈', '🦄', '🎨', '🍭'] },
    { title: "Past Zone", desc: "Welcome to the history.", bg: "#8b4513", color: "#f5deb3", emojis: ['🕰️', '📜', '🦕', '🏛️'] },
    { title: "Future Zone", desc: "Welcome to the unknown.", bg: "#c0c0c0", color: "#0000ff", emojis: ['🤖', '🚀', '🔮', '🛸'] },
    { title: "Clock Zone", desc: "Welcome to the tick tock.", bg: "#ffffff", color: "#000000", emojis: ['🕰️', '⌚', '⏳', '⏰'] },
    { title: "Happy Zone", desc: "Welcome to the smile.", bg: "#ffff00", color: "#000000", emojis: ['😄', '🌞', '🎈', '🎉'] },
    { title: "Sad Zone", desc: "Welcome to the tears.", bg: "#00008b", color: "#add8e6", emojis: ['😢', '🌧️', '💔', '🥀'] },
    { title: "Angry Zone", desc: "Welcome to the rage.", bg: "#ff0000", color: "#000000", emojis: ['😡', '🤬', '🔥', '💢'] },
    { title: "Plastic Zone", desc: "Welcome to the synthetic.", bg: "#ff69b4", color: "#00ffff", emojis: ['🥤', '🛍️', '💳', '🧸'] },
    { title: "Rubber Zone", desc: "Welcome to the bounce.", bg: "#2f4f4f", color: "#ffffff", emojis: ['🦆', '🎈', '👢', '🚗'] },
    { title: "Leather Zone", desc: "Welcome to the hide.", bg: "#8b4513", color: "#000000", emojis: ['🧥', '👢', '👜', '🐄'] },
    { title: "Blur Zone", desc: "Welcome to the out of focus.", bg: "#dcdcdc", color: "#808080", emojis: ['🌫️', '👓', '📷', '💨'] },
    { title: "Sharp Zone", desc: "Welcome to the edge.", bg: "#000000", color: "#ffffff", emojis: ['🔪', '🗡️', '✂️', '📌'] },
    { title: "Soft Zone", desc: "Welcome to the cushion.", bg: "#ffb6c1", color: "#ffffff", emojis: ['🧸', '☁️', '🧶', '🐇'] },
    { title: "AI Zone", desc: "Welcome to the intelligence.", bg: "#00ced1", color: "#ffffff", emojis: ['🤖', '🧠', '💻', '🌐'] },
    { title: "VR Zone", desc: "Welcome to the headset.", bg: "#800080", color: "#00ff00", emojis: ['🥽', '🎮', '🌐', '🕹️'] },
    { title: "Cloud Zone", desc: "Welcome to the data.", bg: "#f0f8ff", color: "#4682b4", emojis: ['☁️', '💾', '📡', '🌧️'] },
    { title: "Music Zone", desc: "Welcome to the rhythm.", bg: "#000000", color: "#ff00ff", emojis: ['🎵', '🎸', '🎹', '🎤'] },
    { title: "Art Zone", desc: "Welcome to the canvas.", bg: "#ffffff", color: "#ff0000", emojis: ['🎨', '🖌️', '🖼️', '🎭'] },
    { title: "Dance Zone", desc: "Welcome to the move.", bg: "#ff1493", color: "#ffff00", emojis: ['💃', '🕺', '🩰', '🎶'] },
    { title: "Movie Zone", desc: "Welcome to the cinema.", bg: "#000000", color: "#ffffff", emojis: ['🎬', '🍿', '🎥', '🎟️'] },
    { title: "Game Zone", desc: "Welcome to the player.", bg: "#00ff00", color: "#000000", emojis: ['🎮', '🕹️', '🎲', '👾'] },
    { title: "Sport Zone", desc: "Welcome to the athlete.", bg: "#ffa500", color: "#000000", emojis: ['⚽', '🏀', '🏈', '🎾'] },
    { title: "Travel Zone", desc: "Welcome to the journey.", bg: "#87ceeb", color: "#000080", emojis: ['✈️', '🧳', '🗺️', '🌍'] },
    { title: "Home Zone", desc: "Welcome to the comfort.", bg: "#deb887", color: "#8b4513", emojis: ['🏠', '🛋️', '🛌', '🔑'] },
    { title: "Work Zone", desc: "Welcome to the grind.", bg: "#808080", color: "#ffffff", emojis: ['💼', '👔', '💻', '☕'] },
    { title: "Party Zone", desc: "Welcome to the celebration.", bg: "#ff00ff", color: "#ffff00", emojis: ['🎉', '🎈', '🎂', '🥳'] },
    { title: "Sleep Zone", desc: "Welcome to the rest.", bg: "#191970", color: "#e6e6fa", emojis: ['💤', '🛌', '🌙', '🐑'] },
    { title: "Wake Zone", desc: "Welcome to the rise.", bg: "#ffffe0", color: "#ff4500", emojis: ['⏰', '☀️', '☕', '🍳'] },
    { title: "Life Zone", desc: "Welcome to the living.", bg: "#32cd32", color: "#ffffff", emojis: ['🌱', '👶', '❤️', '🌍'] },
    { title: "Death Zone", desc: "Welcome to the reaper.", bg: "#000000", color: "#808080", emojis: ['💀', '⚰️', '🥀', '👻'] },
    { title: "Spirit Zone", desc: "Welcome to the ghost.", bg: "#f8f8ff", color: "#d3d3d3", emojis: ['👻', '✨', '🕯️', '🌫️'] },
    { title: "Soul Zone", desc: "Welcome to the essence.", bg: "#e0ffff", color: "#00bfff", emojis: ['👻', '💙', '✨', '🕊️'] },
    { title: "Mind Zone", desc: "Welcome to the thought.", bg: "#dda0dd", color: "#4b0082", emojis: ['🧠', '💡', '🧩', '💭'] },
    { title: "Body Zone", desc: "Welcome to the vessel.", bg: "#ffdab9", color: "#8b4513", emojis: ['💪', '🦵', '🦶', '🧘'] },
    { title: "Heart Zone", desc: "Welcome to the beat.", bg: "#ff0000", color: "#ffffff", emojis: ['❤️', '💓', '🩺', '🩸'] },
    { title: "Lung Zone", desc: "Welcome to the breath.", bg: "#ffc0cb", color: "#8b0000", emojis: ['🫁', '💨', '🌬️', '👃'] },
    { title: "Brain Zone", desc: "Welcome to the neuron.", bg: "#ff69b4", color: "#ffffff", emojis: ['🧠', '💡', '⚡', '💭'] },
    { title: "Bone Zone", desc: "Welcome to the skeleton.", bg: "#f5f5dc", color: "#000000", emojis: ['🦴', '💀', '🐕', '🥛'] },
    { title: "Blood Zone", desc: "Welcome to the vein.", bg: "#8b0000", color: "#ff0000", emojis: ['🩸', '💉', '❤️', '🩹'] },
    { title: "Skin Zone", desc: "Welcome to the touch.", bg: "#ffe4c4", color: "#8b4513", emojis: ['🖐️', '🧴', '🧖', '🩹'] },
    { title: "Hair Zone", desc: "Welcome to the strand.", bg: "#a0522d", color: "#f0e68c", emojis: ['💇', '💈', '🎀', '🧴'] },
    { title: "Eye Zone", desc: "Welcome to the sight.", bg: "#ffffff", color: "#0000ff", emojis: ['👁️', '👓', '🔍', '🧿'] },
    { title: "Ear Zone", desc: "Welcome to the sound.", bg: "#f0e68c", color: "#8b4513", emojis: ['👂', '🎧', '🔊', '🎶'] },
    { title: "Nose Zone", desc: "Welcome to the scent.", bg: "#ffdead", color: "#a0522d", emojis: ['👃', '🌸', '🦨', '🤧'] },

    // --- Pop Culture Zones ---
    { title: "Block Zone", desc: "Welcome to the craft.", bg: "#588130", color: "#5c3c1e", emojis: ['🟩', '🟫', '⛏️', '💎'] },
    { title: "Nether Zone", desc: "Welcome to the underworld.", bg: "#4d0a0a", color: "#ffcc00", emojis: ['🔥', '🐷', '👻', '🏰'] },
    { title: "End Zone", desc: "Welcome to the dragon's home.", bg: "#1a0b2e", color: "#d6b6e0", emojis: ['🐉', '👁️', '🟣', '🏰'] },
    { title: "Plumber Zone", desc: "Welcome to the mushroom kingdom.", bg: "#ff0000", color: "#0000ff", emojis: ['🍄', '🐢', '⭐', '🔧'] },
    { title: "Speed Zone", desc: "Welcome to the blue blur.", bg: "#0000ff", color: "#ff0000", emojis: ['🦔', '💍', '👟', '💨'] },
    { title: "Pocket Zone", desc: "Welcome to the monster ball.", bg: "#ff0000", color: "#ffffff", emojis: ['🔴', '⚡', '🐢', '🔥'] },
    { title: "Force Zone", desc: "Welcome to the galaxy far away.", bg: "#000000", color: "#ffff00", emojis: ['⚔️', '🌌', '🤖', '🚀'] },
    { title: "Ring Zone", desc: "Welcome to the precious.", bg: "#2b1d0e", color: "#ffcc00", emojis: ['💍', '🌋', '🧙', '👁️'] },
    { title: "Bat Zone", desc: "Welcome to the dark knight.", bg: "#1a1a1a", color: "#ffff00", emojis: ['🦇', '🤡', '🌃', '🚔'] },
    { title: "Spider Zone", desc: "Welcome to the web slinger.", bg: "#ff0000", color: "#00008b", emojis: ['🕷️', '🕸️', '🏙️', '📸'] },
    { title: "Wizarding Zone", desc: "Welcome to the school of magic.", bg: "#740001", color: "#d3a625", emojis: ['⚡', '🪄', '🦉', '🧹'] },
    { title: "Throne Zone", desc: "Welcome to the winter.", bg: "#2f4f4f", color: "#c0c0c0", emojis: ['🐺', '🐉', '🦁', '❄️'] },
    { title: "Strange Zone", desc: "Welcome to the upside down.", bg: "#0a0a0a", color: "#ff0000", emojis: ['🚲', '🧇', '👹', '🔦'] },
    { title: "Yellow Zone", desc: "Welcome to the springfield.", bg: "#ffd90f", color: "#009ddc", emojis: ['🍩', '🍺', '🛹', '🎷'] },
    { title: "Sponge Zone", desc: "Welcome to the pineapple.", bg: "#ffff00", color: "#8b4513", emojis: ['🧽', '🍍', '🦀', '🦑'] },
    { title: "Portal Zone", desc: "Welcome to the test chamber.", bg: "#ffffff", color: "#ffa500", emojis: ['🟠', '🔵', '🍰', '🤖'] },
    { title: "Aperture Zone", desc: "Welcome to the cake is a lie.", bg: "#222222", color: "#00aaff", emojis: ['🍰', '🤖', '📦', '🔬'] },
    { title: "Fallout Zone", desc: "Welcome to the vault.", bg: "#0000ff", color: "#ffff00", emojis: ['☢️', '🔫', '🐕', '🥤'] },
    { title: "Hyrule Zone", desc: "Welcome to the triforce.", bg: "#006400", color: "#ffd700", emojis: ['🗡️', '🛡️', '🧚', '🔺'] },
    { title: "Doom Zone", desc: "Welcome to the slayer.", bg: "#5a0000", color: "#ff8c00", emojis: ['👹', '🔫', '🔥', '💀'] },
    { title: "Halo Zone", desc: "Welcome to the ring world.", bg: "#3a5f0b", color: "#87ceeb", emojis: ['💍', '🔫', '👽', '🚀'] },
    { title: "Among Zone", desc: "Welcome to the sus.", bg: "#ff0000", color: "#87ceeb", emojis: ['ඞ', '🔪', '🚀', '🤫'] },
    { title: "Fort Zone", desc: "Welcome to the battle bus.", bg: "#9370db", color: "#ffff00", emojis: ['🚌', '⛏️', '🔫', '🏗️'] },
    { title: "Roblox Zone", desc: "Welcome to the oof.", bg: "#ff0000", color: "#ffffff", emojis: ['🟥', '🧱', '👷', '🎮'] },
    { title: "Meme Zone", desc: "Welcome to the internet.", bg: "#ffffff", color: "#000000", emojis: ['🐸', '🐕', '😹', '🗿'] },

    // --- Famous People Zones ---
    { title: "Einstein Zone", desc: "Welcome to relativity.", bg: "#4b0082", color: "#ffffff", emojis: ['🧠', '⚛️', '👅', '🎻'] },
    { title: "Shakespeare Zone", desc: "Welcome to the stage.", bg: "#2c1b0e", color: "#f5deb3", emojis: ['🎭', '💀', '🖋️', '📜'] },
    { title: "Da Vinci Zone", desc: "Welcome to the renaissance.", bg: "#d2b48c", color: "#5c4033", emojis: ['🎨', '🚁', '📐', '🖼️'] },
    { title: "Mozart Zone", desc: "Welcome to the symphony.", bg: "#800000", color: "#ffd700", emojis: ['🎹', '🎻', '🎼', '🎶'] },
    { title: "Curie Zone", desc: "Welcome to the radiation.", bg: "#ccff00", color: "#000000", emojis: ['☢️', '🧪', '🔬', '🏆'] },
    { title: "Lincoln Zone", desc: "Welcome to the address.", bg: "#000000", color: "#ffffff", emojis: ['🎩', '📜', '🏛️', '🪵'] },
    { title: "Cleopatra Zone", desc: "Welcome to the nile.", bg: "#ffd700", color: "#000080", emojis: ['🐍', '👑', '👁️', '🏺'] },
    { title: "Gandhi Zone", desc: "Welcome to the peace.", bg: "#ffffff", color: "#ff9933", emojis: ['👓', '☮️', '🧶', '🇮🇳'] },
    { title: "Elvis Zone", desc: "Welcome to the heart attack.", bg: "#ff69b4", color: "#000000", emojis: ['🎸', '🕺', '🎤', '🕶️'] },
    { title: "Trump Zone", desc: "Welcome to the orange.", bg: "#ff0000", color: "#ffffff", emojis: ['👔', '🧱', '🧢', '🦅'] },

    // --- Famous Quote Zones ---
    { title: "Kansas Zone", desc: "Welcome to somewhere else.", bg: "#808080", color: "#ffffff", emojis: ['👠', '🌪️', '🐶', '🌈'] },
    { title: "Bond Zone", desc: "Welcome to the shaken.", bg: "#000000", color: "#ffffff", emojis: ['🍸', '🔫', '🕶️', '🤵'] },
    { title: "Houston Zone", desc: "Welcome to the problem.", bg: "#000080", color: "#ffffff", emojis: ['🚀', '🌑', '📻', '🇺🇸'] },
    { title: "Mafia Zone", desc: "Welcome to the offer.", bg: "#222222", color: "#ff0000", emojis: ['🐴', '🔫', '🌹', '🍝'] },
    { title: "Cyborg Zone", desc: "Welcome to the back.", bg: "#444444", color: "#ff0000", emojis: ['🕶️', '🏍️', '🔫', '🤖'] },
    { title: "Shark Zone", desc: "Welcome to the bigger boat.", bg: "#006994", color: "#ff0000", emojis: ['🦈', '🚤', '🌊', '🩸'] },
    { title: "Club Zone", desc: "Welcome to the first rule.", bg: "#c71585", color: "#000000", emojis: ['👊', '🧼', '🤫', '🏢'] },
    { title: "Box Zone", desc: "Welcome to life's chocolates.", bg: "#8b4513", color: "#ffc0cb", emojis: ['🍫', '🏃', '🍤', '🚌'] },
    { title: "Phone Zone", desc: "Welcome to the call home.", bg: "#000080", color: "#ff0000", emojis: ['👽', '🚲', '🌕', '📞'] },
    { title: "Truth Zone", desc: "Welcome to the handle.", bg: "#000000", color: "#00ff00", emojis: ['⚖️', '🎖️', '🏛️', '🗣️'] },

    // --- Funny Zones ---
    { title: "Banana Zone", desc: "Knock knock.", bg: "#FFE135", color: "#000000", emojis: ['🍌', '🚪', '✊'] },
    { title: "Orange You Glad Zone", desc: "I didn't say banana.", bg: "#FFA500", color: "#FFFFFF", emojis: ['🍊', '🍌', '😁'] },
    { title: "Rick Zone", desc: "Never gonna give you up.", bg: "#000000", color: "#FFFFFF", emojis: ['🎤', '🕺', '🧥', '👞'] },
    { title: "Chicken Zone", desc: "To get to the other side.", bg: "#FFFFFF", color: "#D2691E", emojis: ['🐔', '🛣️', '🥚'] },
    { title: "Dad Joke Zone", desc: "Hi hungry, I'm dad.", bg: "#87CEEB", color: "#000000", emojis: ['👨', '👓', '👔', '🤣'] },
    { title: "Sarcasm Zone", desc: "Oh, wow. A zone. How original.", bg: "#808080", color: "#000000", emojis: ['🙄', '😒', '😑'] },
    { title: "Pun Zone", desc: "This zone is tear-able.", bg: "#FFC0CB", color: "#000000", emojis: ['📄', '✂️', '😂'] },
    { title: "Loading Zone", desc: "Please wait...", bg: "#000000", color: "#FFFFFF", emojis: ['⏳', '🔄', '💿'] },
    { title: "Teapot Zone", desc: "Error 418: I'm a teapot.", bg: "#C0C0C0", color: "#000000", emojis: ['🫖', '☕', '🚫'] },
    { title: "Flat Earth Zone", desc: "Watch your step.", bg: "#000080", color: "#FFFFFF", emojis: ['🗺️', '🐢', '🐘', '📉'] },

    // --- Pattern Zones ---
    { title: "Striped Zone", desc: "Welcome to the lines.", bg: "#FFFFFF", color: "#000000", emojis: ['➖', '〰️', '🦓', '🎹'] },
    { title: "Polka Dot Zone", desc: "Welcome to the spots.", bg: "#FF0000", color: "#FFFFFF", emojis: ['🔴', '⚪', '🐞', '🍄'] },
    { title: "Plaid Zone", desc: "Welcome to the tartan.", bg: "#006400", color: "#FF0000", emojis: ['🏴', '🧣', '🧺', '🌲'] },
    { title: "Checkered Zone", desc: "Welcome to the grid.", bg: "#000000", color: "#FFFFFF", emojis: ['🏁', '♟️', '🏁', '🔳'] },
    { title: "Paisley Zone", desc: "Welcome to the swirl.", bg: "#800080", color: "#FFD700", emojis: ['🧬', '🦠', '🌀', '⚜️'] },
    { title: "Floral Zone", desc: "Welcome to the bouquet.", bg: "#FFC0CB", color: "#006400", emojis: ['🌺', '🌻', '🌹', '🌷'] },
    { title: "Camo Zone", desc: "Welcome to the hidden.", bg: "#556B2F", color: "#8B4513", emojis: ['🌲', '🦎', '🦗', '🍃'] },
    { title: "Tie-Dye Zone", desc: "Welcome to the groovy.", bg: "#FF00FF", color: "#FFFF00", emojis: ['☮️', '🌈', '👕', '🎨'] },
    { title: "Zigzag Zone", desc: "Welcome to the jagged.", bg: "#FFA500", color: "#000000", emojis: ['⚡', '📉', '🐊', '〰️'] },
    { title: "Spiral Zone", desc: "Welcome to the vortex.", bg: "#4B0082", color: "#FFFFFF", emojis: ['🌀', '🍥', '🍭', '🐚'] },

    // --- Hobby Zones ---
    { title: "Fishing Zone", desc: "Welcome to the reel.", bg: "#87CEEB", color: "#000080", emojis: ['🎣', '🐟', '🚣', '🪝'] },
    { title: "Hiking Zone", desc: "Welcome to the trail.", bg: "#228B22", color: "#F5DEB3", emojis: ['🥾', '🎒', '⛰️', '🧭'] },
    { title: "Camping Zone", desc: "Welcome to the tent.", bg: "#2F4F4F", color: "#FF4500", emojis: ['⛺', '🔥', '🍢', '🔦'] },
    { title: "Knitting Zone", desc: "Welcome to the yarn.", bg: "#FF69B4", color: "#FFFFFF", emojis: ['🧶', '🧣', '🧤', '👵'] },
    { title: "Sewing Zone", desc: "Welcome to the stitch.", bg: "#D8BFD8", color: "#800080", emojis: ['🧵', '🪡', '👗', '✂️'] },
    { title: "Pottery Zone", desc: "Welcome to the wheel.", bg: "#8B4513", color: "#DEB887", emojis: ['🏺', '🧱', '👐', '🎨'] },
    { title: "Origami Zone", desc: "Welcome to the fold.", bg: "#FFFFFF", color: "#FF0000", emojis: ['🦢', '📄', '✈️', '🐸'] },
    { title: "Stamp Zone", desc: "Welcome to the collection.", bg: "#F5F5DC", color: "#000000", emojis: ['✉️', '📮', '📬', '🏷️'] },
    { title: "Coin Zone", desc: "Welcome to the mint.", bg: "#C0C0C0", color: "#DAA520", emojis: ['🪙', '💰', '🏦', '🤑'] },
    { title: "Model Zone", desc: "Welcome to the miniature.", bg: "#708090", color: "#FFFFFF", emojis: ['✈️', '🚗', '🚂', '🏗️'] },

    // --- Music Genre Zones ---
    { title: "Rock Zone", desc: "Welcome to the heavy.", bg: "#000000", color: "#FF0000", emojis: ['🎸', '🤘', '🥁', '🔊'] },
    { title: "Jazz Zone", desc: "Welcome to the smooth.", bg: "#191970", color: "#DAA520", emojis: ['🎷', '🎺', '🎹', '🕶️'] },
    { title: "Pop Zone", desc: "Welcome to the charts.", bg: "#FF69B4", color: "#00FFFF", emojis: ['🎤', '💃', '🕺', '🌟'] },
    { title: "Classical Zone", desc: "Welcome to the orchestra.", bg: "#8B4513", color: "#F5DEB3", emojis: ['🎻', '🎹', '🎼', '🤵'] },
    { title: "Hip Hop Zone", desc: "Welcome to the beat.", bg: "#4B0082", color: "#FFD700", emojis: ['🎤', '🎧', '🧢', '👟'] },
    { title: "Country Zone", desc: "Welcome to the rodeo.", bg: "#A0522D", color: "#F0E68C", emojis: ['🤠', '🎸', '🐎', '🚜'] },
    { title: "Blues Zone", desc: "Welcome to the soul.", bg: "#000080", color: "#87CEEB", emojis: ['🎸', '🕶️', '🎷', '😢'] },
    { title: "Reggae Zone", desc: "Welcome to the rhythm.", bg: "#008000", color: "#FFFF00", emojis: ['🦁', '🇯🇲', '🥁', '🌴'] },
    { title: "Metal Zone", desc: "Welcome to the mosh.", bg: "#202020", color: "#C0C0C0", emojis: ['🎸', '💀', '⛓️', '🤘'] },
    { title: "Techno Zone", desc: "Welcome to the rave.", bg: "#000000", color: "#39FF14", emojis: ['🎛️', '🎧', '💊', '🎆'] },

    // --- Board Game Zones ---
    { title: "Chess Zone", desc: "Welcome to the checkmate.", bg: "#000000", color: "#FFFFFF", emojis: ['♟️', '♞', '♝', '♛'] },
    { title: "Checkers Zone", desc: "Welcome to the king me.", bg: "#FF0000", color: "#000000", emojis: ['🔴', '⚫', '🏁', '👑'] },
    { title: "Monopoly Zone", desc: "Welcome to the boardwalk.", bg: "#CEFA05", color: "#000000", emojis: ['🎩', '🏠', '🏨', '💸'] },
    { title: "Scrabble Zone", desc: "Welcome to the triple word.", bg: "#8B0000", color: "#F5DEB3", emojis: ['🅰️', '🅱️', '📝', '🔠'] },
    { title: "Clue Zone", desc: "Welcome to the conservatory.", bg: "#4B0082", color: "#FFFF00", emojis: ['🕯️', '🔧', '🔫', '🕵️'] },
    { title: "Risk Zone", desc: "Welcome to the world domination.", bg: "#000080", color: "#FF0000", emojis: ['🗺️', '🎲', '💂', '🏳️'] },
    { title: "Battleship Zone", desc: "Welcome to the hit.", bg: "#00008B", color: "#808080", emojis: ['🚢', '💥', '📍', '🌊'] },
    { title: "Jenga Zone", desc: "Welcome to the collapse.", bg: "#DEB887", color: "#8B4513", emojis: ['🧱', '🏗️', '💥', '🪵'] },
    { title: "Domino Zone", desc: "Welcome to the chain reaction.", bg: "#000000", color: "#FFFFFF", emojis: ['🁂', '🁓', '🁫', '⛓️'] },
    { title: "Card Zone", desc: "Welcome to the deck.", bg: "#006400", color: "#FFFFFF", emojis: ['♠️', '♥️', '♦️', '♣️'] },

    // --- Abstract Property Zones ---
    { title: "Echo Zone", desc: "Welcome to the repeat.", bg: "#708090", color: "#D3D3D3", emojis: ['🔊', '🔉', '🔈', '👂'] },
    { title: "Silence Zone", desc: "Welcome to the quiet.", bg: "#F5F5F5", color: "#DCDCDC", emojis: ['🤫', '🔇', '😶', '☁️'] },
    { title: "Invisible Zone", desc: "Welcome to the unseen.", bg: "#F0F8FF", color: "#E6E6FA", emojis: ['👻', '🌫️', '👓', '🕵️'] },
    { title: "Sticky Zone", desc: "Welcome to the glue.", bg: "#FFD700", color: "#FFFFFF", emojis: ['🍯', '🍬', '🕸️', '🐌'] },
    { title: "Slippery Zone", desc: "Welcome to the slide.", bg: "#E0FFFF", color: "#00CED1", emojis: ['🍌', '🧊', '🧼', '⛸️'] },
    { title: "Bumpy Zone", desc: "Welcome to the texture.", bg: "#8B4513", color: "#D2691E", emojis: ['🪨', '🐢', '🐊', '🧱'] },
    { title: "Smooth Zone", desc: "Welcome to the surface.", bg: "#F0FFF0", color: "#98FB98", emojis: ['🎱', '🥚', '🔮', '⛸️'] },
    { title: "Shiny Zone", desc: "Welcome to the gloss.", bg: "#FFFFE0", color: "#DAA520", emojis: ['✨', '💍', '💿', '🌟'] },
    { title: "Dull Zone", desc: "Welcome to the matte.", bg: "#696969", color: "#A9A9A9", emojis: ['🌫️', '🪨', '📦', '🐘'] },
    { title: "Fuzzy Zone", desc: "Welcome to the static.", bg: "#FFB6C1", color: "#800080", emojis: ['🍑', '🧸', '🧶', '🥝'] },

    // --- Mythology Zones ---
    { title: "Olympus Zone", desc: "Welcome to the gods.", bg: "#F0FFFF", color: "#DAA520", emojis: ['⚡', '🏛️', '🍇', '🦅'] },
    { title: "Underworld Zone", desc: "Welcome to the river styx.", bg: "#2F4F4F", color: "#800080", emojis: ['🔥', '💀', '🐕', '🚣'] },
    { title: "Asgard Zone", desc: "Welcome to the bifrost.", bg: "#FFD700", color: "#C0C0C0", emojis: ['🌈', '🔨', '⚡', '🏰'] },
    { title: "Valhalla Zone", desc: "Welcome to the feast.", bg: "#8B4513", color: "#FFD700", emojis: ['⚔️', '🛡️', '🍖', '🍺'] },
    { title: "Nile Zone", desc: "Welcome to the pharaoh.", bg: "#000080", color: "#DAA520", emojis: ['🐊', '👁️', '🐈', '🏺'] },
    { title: "Atlantis Zone", desc: "Welcome to the lost city.", bg: "#00CED1", color: "#FFD700", emojis: ['🏛️', '🌊', '🔱', '🐟'] },
    { title: "Titan Zone", desc: "Welcome to the giants.", bg: "#556B2F", color: "#000000", emojis: ['🌋', '⛰️', '⚡', '🌪️'] },
    { title: "Phoenix Zone", desc: "Welcome to the rebirth.", bg: "#FF4500", color: "#FFFF00", emojis: ['🔥', '🐦', '🥚', '✨'] },
    { title: "Griffin Zone", desc: "Welcome to the guardian.", bg: "#DAA520", color: "#8B4513", emojis: ['🦁', '🦅', '🏰', '⛰️'] },
    { title: "Hydra Zone", desc: "Welcome to the many heads.", bg: "#006400", color: "#32CD32", emojis: ['🐍', '🐉', '🌊', '☠️'] },

    // --- RPG Class Zones ---
    { title: "Warrior Zone", desc: "Welcome to the front line.", bg: "#8B0000", color: "#C0C0C0", emojis: ['⚔️', '🛡️', '🩸', '🏋️'] },
    { title: "Mage Zone", desc: "Welcome to the spellbook.", bg: "#00008B", color: "#00FFFF", emojis: ['🪄', '🔮', '⚡', '🔥'] },
    { title: "Rogue Zone", desc: "Welcome to the stealth.", bg: "#000000", color: "#32CD32", emojis: ['🗡️', '💰', '🕶️', '🗝️'] },
    { title: "Paladin Zone", desc: "Welcome to the holy light.", bg: "#FFD700", color: "#FFFFFF", emojis: ['🛡️', '✨', '🔨', '☀️'] },
    { title: "Hunter Zone", desc: "Welcome to the wild.", bg: "#228B22", color: "#8B4513", emojis: ['🏹', '🐻', '🐾', '🎯'] },
    { title: "Druid Zone", desc: "Welcome to the nature.", bg: "#006400", color: "#90EE90", emojis: ['🌿', '🐻', '🌙', '🦌'] },
    { title: "Warlock Zone", desc: "Welcome to the pact.", bg: "#4B0082", color: "#00FF00", emojis: ['💀', '🔥', '😈', '👁️'] },
    { title: "Monk Zone", desc: "Welcome to the inner peace.", bg: "#FFA500", color: "#FFFFE0", emojis: ['👊', '🧘', '☯️', '🎋'] },
    { title: "Bard Zone", desc: "Welcome to the performance.", bg: "#FF69B4", color: "#FFFF00", emojis: ['🎵', '🎸', '🎭', '🍷'] },
    { title: "Necromancer Zone", desc: "Welcome to the undead.", bg: "#2F4F4F", color: "#7FFF00", emojis: ['💀', '🦴', '⚰️', '👻'] },

    // --- Vegetable Zones ---
    { title: "Carrot Zone", desc: "Welcome to the crunch.", bg: "#FFA500", color: "#008000", emojis: ['🥕', '🐇', '🥗', '🧡'] },
    { title: "Potato Zone", desc: "Welcome to the spud.", bg: "#D2B48C", color: "#8B4513", emojis: ['🥔', '🍟', '🍠', '🚜'] },
    { title: "Broccoli Zone", desc: "Welcome to the tiny tree.", bg: "#006400", color: "#90EE90", emojis: ['🥦', '🌳', '🥗', '🥬'] },
    { title: "Corn Zone", desc: "Welcome to the cob.", bg: "#FFD700", color: "#008000", emojis: ['🌽', '🍿', '🌾', '🚜'] },
    { title: "Onion Zone", desc: "Welcome to the layers.", bg: "#E6E6FA", color: "#800080", emojis: ['🧅', '😢', '🍲', '🔪'] },
    { title: "Pepper Zone", desc: "Welcome to the spice.", bg: "#FF0000", color: "#008000", emojis: ['🌶️', '🫑', '🔥', '🌮'] },
    { title: "Tomato Zone", desc: "Welcome to the vine.", bg: "#FF6347", color: "#008000", emojis: ['🍅', '🍝', '🍕', '🥗'] },
    { title: "Cucumber Zone", desc: "Welcome to the pickle.", bg: "#90EE90", color: "#006400", emojis: ['🥒', '🥗', '🧖', '🥒'] },
    { title: "Lettuce Zone", desc: "Welcome to the salad.", bg: "#32CD32", color: "#FFFFFF", emojis: ['🥬', '🥗', '🍔', '🥪'] },
    { title: "Pumpkin Zone", desc: "Welcome to the patch.", bg: "#FF8C00", color: "#000000", emojis: ['🎃', '🥧', '🍂', '🕯️'] },

    // --- Architecture Zones ---
    { title: "Skyscraper Zone", desc: "Welcome to the skyline.", bg: "#708090", color: "#87CEEB", emojis: ['🏙️', '🏢', '☁️', '✈️'] },
    { title: "Cottage Zone", desc: "Welcome to the cozy.", bg: "#DEB887", color: "#8B4513", emojis: ['🏡', '🌸', '🪵', '🪟'] },
    { title: "Igloo Zone", desc: "Welcome to the ice house.", bg: "#F0FFFF", color: "#00BFFF", emojis: ['🧊', '❄️', '🐧', '🔥'] },
    { title: "Pyramid Zone", desc: "Welcome to the tomb.", bg: "#DAA520", color: "#F4A460", emojis: ['🔺', '🐪', '☀️', '🏺'] },
    { title: "Temple Zone", desc: "Welcome to the shrine.", bg: "#8B0000", color: "#FFD700", emojis: ['⛩️', '🏯', '🎋', '🧘'] },
    { title: "Bridge Zone", desc: "Welcome to the crossing.", bg: "#A9A9A9", color: "#000080", emojis: ['🌉', '🌊', '🚗', '🏗️'] },
    { title: "Tower Zone", desc: "Welcome to the lookout.", bg: "#696969", color: "#C0C0C0", emojis: ['🗼', '🏰', '👸', '🐉'] },
    { title: "Bunker Zone", desc: "Welcome to the shelter.", bg: "#556B2F", color: "#000000", emojis: ['🚪', '🥫', '☢️', '🔦'] },
    { title: "Lighthouse Zone", desc: "Welcome to the beacon.", bg: "#FFFFFF", color: "#FF0000", emojis: ['🚨', '🌊', '🚢', '🔦'] },
    { title: "Colosseum Zone", desc: "Welcome to the gladiator.", bg: "#D2B48C", color: "#8B4513", emojis: ['🏟️', '⚔️', '🦁', '🛡️'] },

    // --- Literature Genre Zones ---
    { title: "Fiction Zone", desc: "Welcome to the imagination.", bg: "#4B0082", color: "#FFFFFF", emojis: ['📚', '🦄', '🐉', '🧚'] },
    { title: "Non-Fiction Zone", desc: "Welcome to the facts.", bg: "#8B4513", color: "#F5DEB3", emojis: ['📖', '🧠', '🌍', '🕰️'] },
    { title: "Biography Zone", desc: "Welcome to the life story.", bg: "#000080", color: "#FFD700", emojis: ['👤', '🖋️', '📜', '🏆'] },
    { title: "Thriller Zone", desc: "Welcome to the suspense.", bg: "#000000", color: "#FF0000", emojis: ['🔪', '🕵️', '😱', '🩸'] },
    { title: "Romance Zone", desc: "Welcome to the love story.", bg: "#FF1493", color: "#FFC0CB", emojis: ['❤️', '🌹', '💌', '💍'] },
    { title: "Comedy Zone", desc: "Welcome to the laughs.", bg: "#FFFF00", color: "#000000", emojis: ['😂', '🎭', '🍌', '🤡'] },
    { title: "Tragedy Zone", desc: "Welcome to the drama.", bg: "#2F4F4F", color: "#000000", emojis: ['🎭', '😢', '🥀', '☠️'] },
    { title: "Satire Zone", desc: "Welcome to the irony.", bg: "#808080", color: "#00FF00", emojis: ['📰', '🤡', '🤥', '🃏'] },
    { title: "Fable Zone", desc: "Welcome to the moral.", bg: "#228B22", color: "#FFD700", emojis: ['🐢', '🐇', '🦊', '🍇'] },
    { title: "Epic Zone", desc: "Welcome to the hero's journey.", bg: "#B8860B", color: "#FFFFFF", emojis: ['⚔️', '🛡️', '🗺️', '👑'] },

    // --- Internet Slang Zones ---
    { title: "Cringe Zone", desc: "Welcome to the awkward.", bg: "#FFD700", color: "#000000", emojis: ['😬', '🤦', '🫣', '📉'] },
    { title: "Based Zone", desc: "Welcome to the truth.", bg: "#000000", color: "#FFFFFF", emojis: ['🗿', '💪', '😎', '🔥'] },
    { title: "Ratio Zone", desc: "Welcome to the L.", bg: "#FF0000", color: "#FFFFFF", emojis: ['📉', '👎', '🤡', '💀'] },
    { title: "Cap Zone", desc: "Welcome to the lie.", bg: "#0000FF", color: "#FFFFFF", emojis: ['🧢', '🤥', '🚫', '🙅'] },
    { title: "Yeet Zone", desc: "Welcome to the throw.", bg: "#FFA500", color: "#FFFFFF", emojis: ['👋', '💨', '🗑️', '🚀'] },
    { title: "Simp Zone", desc: "Welcome to the devotion.", bg: "#FF69B4", color: "#FFFFFF", emojis: ['🥺', '💐', '💸', '💔'] },
    { title: "Troll Zone", desc: "Welcome to the bridge.", bg: "#808080", color: "#000000", emojis: ['👹', '⌨️', '🎣', '🤪'] },
    { title: "Clickbait Zone", desc: "You won't believe this zone!", bg: "#FF0000", color: "#FFFF00", emojis: ['😱', '➡️', '⭕', '❗'] },
    { title: "Viral Zone", desc: "Welcome to the trending.", bg: "#00FF00", color: "#000000", emojis: ['📈', '🦠', '📱', '🔥'] },
    { title: "Hashtag Zone", desc: "Welcome to the tag.", bg: "#1DA1F2", color: "#FFFFFF", emojis: ['#️⃣', '🏷️', '📱', '🐦'] },

    // --- Vehicle Zones ---
    { title: "Truck Zone", desc: "Welcome to the haul.", bg: "#B22222", color: "#FFFFFF", emojis: ['🚛', '🚚', '🛣️', '⛽'] },
    { title: "Bus Zone", desc: "Welcome to the stop.", bg: "#FFD700", color: "#000000", emojis: ['🚌', '🚏', '🎫', '🏫'] },
    { title: "Taxi Zone", desc: "Welcome to the fare.", bg: "#FFFF00", color: "#000000", emojis: ['🚕', '🚖', '💵', '🏙️'] },
    { title: "Ambulance Zone", desc: "Welcome to the emergency.", bg: "#FFFFFF", color: "#FF0000", emojis: ['🚑', '🏥', '🚨', '🩺'] },
    { title: "Fire Truck Zone", desc: "Welcome to the rescue.", bg: "#FF0000", color: "#FFFF00", emojis: ['🚒', '🔥', '💦', '🧯'] },
    { title: "Police Car Zone", desc: "Welcome to the pursuit.", bg: "#000080", color: "#FFFFFF", emojis: ['🚓', '🚨', '👮', '🚔'] },
    { title: "Tractor Zone", desc: "Welcome to the field.", bg: "#008000", color: "#FFFF00", emojis: ['🚜', '🌾', '🌽', '🐮'] },
    { title: "Scooter Zone", desc: "Welcome to the ankle pain.", bg: "#C0C0C0", color: "#000000", emojis: ['🛴', '🦶', '🤕', '💨'] },
    { title: "Skateboard Zone", desc: "Welcome to the grind.", bg: "#000000", color: "#FFFFFF", emojis: ['🛹', '🤘', '🩹', '📹'] },
    { title: "Blimp Zone", desc: "Welcome to the float.", bg: "#87CEEB", color: "#FFFFFF", emojis: ['🎈', '☁️', '👀', '📢'] },

    // --- Job Zones ---
    { title: "Chef Zone", desc: "Welcome to the kitchen.", bg: "#FFFFFF", color: "#000000", emojis: ['👨‍🍳', '🍳', '🔪', '🥘'] },
    { title: "Doctor Zone", desc: "Welcome to the practice.", bg: "#E0FFFF", color: "#0000FF", emojis: ['👨‍⚕️', '🩺', '💊', '🏥'] },
    { title: "Teacher Zone", desc: "Welcome to the class.", bg: "#90EE90", color: "#000000", emojis: ['👩‍🏫', '🍎', '📚', '✏️'] },
    { title: "Pilot Zone", desc: "Welcome to the cockpit.", bg: "#000080", color: "#FFD700", emojis: ['👨‍✈️', '✈️', '☁️', '🌍'] },
    { title: "Artist Zone", desc: "Welcome to the studio.", bg: "#FF69B4", color: "#FFFFFF", emojis: ['🎨', '🖌️', '🖼️', '👩‍🎨'] },
    { title: "Coder Zone", desc: "Welcome to the bug.", bg: "#000000", color: "#00FF00", emojis: ['👨‍💻', '💻', '🐛', '☕'] },
    { title: "Gamer Zone", desc: "Welcome to the lobby.", bg: "#4B0082", color: "#00FF00", emojis: ['🎮', '🎧', '🕹️', '👾'] },
    { title: "Streamer Zone", desc: "Welcome to the live.", bg: "#6441A5", color: "#FFFFFF", emojis: ['📹', '🔴', '💬', '💸'] },
    { title: "Influencer Zone", desc: "Welcome to the sponsorship.", bg: "#FF00FF", color: "#FFFFFF", emojis: ['🤳', '💄', '📸', '👍'] },
    { title: "Detective Zone", desc: "Welcome to the mystery.", bg: "#2F4F4F", color: "#FFFFFF", emojis: ['🕵️', '🔍', '👣', '🔦'] },

    // --- Household Zones ---
    { title: "Spoon Zone", desc: "Welcome to the scoop.", bg: "#C0C0C0", color: "#000000", emojis: ['🥄', '🥣', '🍦', '🍲'] },
    { title: "Fork Zone", desc: "Welcome to the stab.", bg: "#C0C0C0", color: "#000000", emojis: ['🍴', '🍝', '🥗', '🥩'] },
    { title: "Knife Zone", desc: "Welcome to the slice.", bg: "#708090", color: "#FFFFFF", emojis: ['🔪', '🥩', '🍞', '🩸'] },
    { title: "Plate Zone", desc: "Welcome to the dish.", bg: "#FFFFFF", color: "#000000", emojis: ['🍽️', '🍕', '🥞', '🧼'] },
    { title: "Chair Zone", desc: "Welcome to the seat.", bg: "#8B4513", color: "#F5DEB3", emojis: ['🪑', '🛋️', '🧘', '😴'] },
    { title: "Table Zone", desc: "Welcome to the surface.", bg: "#DEB887", color: "#8B4513", emojis: ['🪵', '🍽️', '💻', '📚'] },
    { title: "Lamp Zone", desc: "Welcome to the illumination.", bg: "#FFFFE0", color: "#DAA520", emojis: ['🛋️', '💡', '📖', '🌙'] },
    { title: "Rug Zone", desc: "Welcome to the floor.", bg: "#800000", color: "#FFD700", emojis: ['🧶', '👣', '🧹', '🏠'] },
    { title: "Toilet Zone", desc: "Welcome to the throne.", bg: "#FFFFFF", color: "#4169E1", emojis: ['🚽', '🧻', '💩', '🚿'] },
    { title: "Trash Can Zone", desc: "Welcome to the dump.", bg: "#808080", color: "#000000", emojis: ['🗑️', '🚮', '🪰', '🤢'] },

    // --- Mildly Inconvenient Zones ---
    { title: "Wet Sock Zone", desc: "Welcome to the squish.", bg: "#87CEEB", color: "#000080", emojis: ['🧦', '💦', '🦶', '😖'] },
    { title: "Bad Haircut Zone", desc: "Welcome to the hat.", bg: "#F5DEB3", color: "#000000", emojis: ['💇', '✂️', '🧢', '😭'] },
    { title: "Awkward Silence Zone", desc: "Welcome to the...", bg: "#F5F5F5", color: "#D3D3D3", emojis: ['😶', '🦗', '👀', '🤐'] },
    { title: "Monday Zone", desc: "Welcome to the grind.", bg: "#708090", color: "#FFFFFF", emojis: ['📅', '☕', '😴', '😭'] },
    { title: "Traffic Jam Zone", desc: "Welcome to the brake lights.", bg: "#FF0000", color: "#000000", emojis: ['🚗', '🚙', '🛑', '🤬'] },
    { title: "Wifi Disconnected Zone", desc: "Welcome to the offline.", bg: "#808080", color: "#FFFFFF", emojis: ['📶', '🦖', '🚫', '💻'] },
    { title: "Low Battery Zone", desc: "Welcome to the 1%.", bg: "#FF0000", color: "#000000", emojis: ['🔋', '🔌', '📱', '😱'] },
    { title: "Spilled Milk Zone", desc: "Welcome to the cry.", bg: "#FFFFFF", color: "#87CEEB", emojis: ['🥛', '💦', '😭', '🧻'] },
    { title: "Stubbed Toe Zone", desc: "Welcome to the pain.", bg: "#FF0000", color: "#FFFFFF", emojis: ['🦶', '🧱', '🤬', '💥'] },
    { title: "Brain Freeze Zone", desc: "Welcome to the ice cream headache.", bg: "#00FFFF", color: "#0000FF", emojis: ['🍦', '🥶', '🧠', '❄️'] },

    // --- Brainrot & Beyond Zones (New Batch) ---
    { title: "Brainrot Zone", desc: "Welcome to the skibidi toilet.", bg: "#FF00FF", color: "#00FF00", emojis: ['🚽', '🤪', '🧠', '📉'] },
    { title: "Skibidi Zone", desc: "Welcome to the dop dop yes yes.", bg: "#8B4513", color: "#FFFF00", emojis: ['🚽', '👨', '🎶', '🕺'] },
    { title: "Rizz Zone", desc: "Welcome to the charisma.", bg: "#000000", color: "#FFFFFF", emojis: ['😏', '⚡', '❤️', '🔥'] },
    { title: "Sigma Zone", desc: "Welcome to the grindset.", bg: "#808080", color: "#000000", emojis: ['🗿', '🐺', '💼', '🍷'] },
    { title: "Ohio Zone", desc: "Welcome to the anomaly.", bg: "#B22222", color: "#FFFFFF", emojis: ['💀', '👽', '🌽', '👹'] },
    { title: "Fanum Tax Zone", desc: "Welcome to the food theft.", bg: "#008000", color: "#FFD700", emojis: ['🍔', '🍟', '🤑', '😋'] },
    { title: "Grimace Zone", desc: "Welcome to the shake.", bg: "#800080", color: "#FFFFFF", emojis: ['🥤', '🟣', '🤢', '🎂'] },
    { title: "Backrooms Zone", desc: "Welcome to the yellow wallpaper.", bg: "#F5F5DC", color: "#8B4513", emojis: ['🚪', '💡', '🏃', '👾'] },
    { title: "NPC Zone", desc: "Welcome to the idle animation.", bg: "#D3D3D3", color: "#000000", emojis: ['😐', '🚶', '🗨️', '🤖'] },
    { title: "Main Character Zone", desc: "Welcome to the plot armor.", bg: "#FFD700", color: "#FFFFFF", emojis: ['✨', '🦸', '🎬', '🌟'] },
    { title: "Sushi Zone", desc: "Welcome to the roll.", bg: "#FFFFFF", color: "#FF4500", emojis: ['🍣', '🍱', '🍤', '🥢'] },
    { title: "Taco Zone", desc: "Welcome to the crunch.", bg: "#FFD700", color: "#008000", emojis: ['🌮', '🌯', '🥑', '🌶️'] },
    { title: "Noodle Zone", desc: "Welcome to the slurp.", bg: "#F5DEB3", color: "#8B4513", emojis: ['🍜', '🍝', '🥢', '🍥'] },
    { title: "Curry Zone", desc: "Welcome to the spice.", bg: "#DAA520", color: "#8B0000", emojis: ['🍛', '🍚', '🌶️', '🥘'] },
    { title: "BBQ Zone", desc: "Welcome to the grill.", bg: "#8B0000", color: "#FFA500", emojis: ['🍖', '🔥', '🌭', '🥩'] },
    { title: "Donut Zone", desc: "Welcome to the glaze.", bg: "#FF69B4", color: "#FFFFFF", emojis: ['🍩', '☕', '🥯', '🧁'] },
    { title: "Cookie Zone", desc: "Welcome to the jar.", bg: "#D2691E", color: "#000000", emojis: ['🍪', '🥛', '🍫', '👵'] },
    { title: "Pie Zone", desc: "Welcome to the crust.", bg: "#CD853F", color: "#8B0000", emojis: ['🥧', '🍏', '🍒', '🎃'] },
    { title: "Cake Zone", desc: "Welcome to the frosting.", bg: "#FFC0CB", color: "#FFFFFF", emojis: ['🎂', '🍰', '🕯️', '🎉'] },
    { title: "Ice Cream Zone", desc: "Welcome to the scoop.", bg: "#FFFACD", color: "#FF69B4", emojis: ['🍦', '🍨', '🍧', '🥄'] },
    { title: "Waterfall Zone", desc: "Welcome to the cascade.", bg: "#00CED1", color: "#FFFFFF", emojis: ['🌊', '💧', '🌈', '🏞️'] },
    { title: "Geyser Zone", desc: "Welcome to the eruption.", bg: "#708090", color: "#FFFFFF", emojis: ['⛲', '💨', '🔥', '🪨'] },
    { title: "Canyon Zone", desc: "Welcome to the gorge.", bg: "#A0522D", color: "#FFD700", emojis: ['🏜️', '🦅', '🧗', '🌵'] },
    { title: "Dune Zone", desc: "Welcome to the spice.", bg: "#F4A460", color: "#8B4513", emojis: ['🏜️', '🐪', '🌬️', '🐛'] },
    { title: "Oasis Zone", desc: "Welcome to the mirage.", bg: "#20B2AA", color: "#FFFFE0", emojis: ['🌴', '💧', '🐪', '🥥'] },
    { title: "Glacier Zone", desc: "Welcome to the slow move.", bg: "#E0FFFF", color: "#00008B", emojis: ['🧊', '❄️', '🏔️', '🥶'] },
    { title: "Fjord Zone", desc: "Welcome to the inlet.", bg: "#4682B4", color: "#006400", emojis: ['🏞️', '🚢', '🏔️', '🌊'] },
    { title: "Lagoon Zone", desc: "Welcome to the blue.", bg: "#00FFFF", color: "#000080", emojis: ['🏝️', '🐠', '🧜', '🐚'] },
    { title: "Atoll Zone", desc: "Welcome to the ring.", bg: "#40E0D0", color: "#FFFFFF", emojis: ['🏝️', '🌊', '🦀', '🥥'] },
    { title: "Delta Zone", desc: "Welcome to the mouth.", bg: "#2E8B57", color: "#8B4513", emojis: ['🌊', '🐊', '🌾', '🚣'] },
    { title: "Nostalgia Zone", desc: "Welcome to the good old days.", bg: "#FFB6C1", color: "#800080", emojis: ['📼', '🕹️', '🧸', '📺'] },
    { title: "Deja Vu Zone", desc: "Welcome to the... wait.", bg: "#D8BFD8", color: "#4B0082", emojis: ['🌀', '😵', '🔁', '🐈‍⬛'] },
    { title: "Liminal Zone", desc: "Welcome to the transition.", bg: "#F5F5F5", color: "#696969", emojis: ['🚪', '🏢', '🌫️', '👀'] },
    { title: "Zen Zone", desc: "Welcome to the balance.", bg: "#F0FFF0", color: "#000000", emojis: ['☯️', '🎋', '🧘', '🍵'] },
    { title: "Hype Zone", desc: "Welcome to the drop.", bg: "#FF4500", color: "#FFFF00", emojis: ['🔥', '👟', '💯', '📢'] },
    { title: "Chill Zone", desc: "Welcome to the lo-fi.", bg: "#E6E6FA", color: "#483D8B", emojis: ['🎧', '☕', '🌧️', '📚'] },
    { title: "Vibe Zone", desc: "Welcome to the check.", bg: "#9370DB", color: "#00FFFF", emojis: ['✨', '🎶', '🕶️', '🍹'] },
    { title: "Focus Zone", desc: "Welcome to the lock in.", bg: "#000080", color: "#FFFFFF", emojis: ['🎯', '🧠', '🔇', '📝'] },
    { title: "Panic Zone", desc: "Welcome to the deadline.", bg: "#FF0000", color: "#FFFF00", emojis: ['😱', '⏰', '💥', '❗'] },
    { title: "Relief Zone", desc: "Welcome to the exhale.", bg: "#ADD8E6", color: "#FFFFFF", emojis: ['😌', '💨', '🛌', '🛁'] },
    { title: "Sepia Zone", desc: "Welcome to the photograph.", bg: "#704214", color: "#D2B48C", emojis: ['📷', '🕰️', '📜', '🎞️'] },
    { title: "Grayscale Zone", desc: "Welcome to the noir.", bg: "#808080", color: "#000000", emojis: ['🕵️', '📰', '🚬', '🎬'] },
    { title: "Inverted Zone", desc: "Welcome to the negative.", bg: "#FFFFFF", color: "#000000", emojis: ['🔄', '🔳', '🔲', '🙃'] },
    { title: "Glitch Art Zone", desc: "Welcome to the datamosh.", bg: "#FF00FF", color: "#00FFFF", emojis: ['👾', '📺', '📶', '🐞'] },
    { title: "ASCII Zone", desc: "Welcome to the text.", bg: "#000000", color: "#00FF00", emojis: ['#', '@', '&', '%'] },
    { title: "Blueprint Zone", desc: "Welcome to the plan.", bg: "#0000CD", color: "#FFFFFF", emojis: ['📐', '📏', '🏗️', '📝'] },
    { title: "Sketch Zone", desc: "Welcome to the draft.", bg: "#FFF8DC", color: "#696969", emojis: ['✏️', '📓', '🗑️', '🎨'] },
    { title: "Watercolor Zone", desc: "Welcome to the wash.", bg: "#E0FFFF", color: "#FF69B4", emojis: ['🎨', '🖌️', '💧', '🖼️'] },
    { title: "Oil Paint Zone", desc: "Welcome to the texture.", bg: "#8B4513", color: "#FFD700", emojis: ['🎨', '🖼️', '🖌️', '👨‍🎨'] },
    { title: "Graffiti Zone", desc: "Welcome to the street.", bg: "#2F4F4F", color: "#FF00FF", emojis: ['🥫', '🧱', '🎨', '🧢'] },
    { title: "Balloon Zone", desc: "Welcome to the float.", bg: "#87CEEB", color: "#FF4500", emojis: ['🎈', '🤡', '📌', '☁️'] },
    { title: "Kite Zone", desc: "Welcome to the string.", bg: "#B0E0E6", color: "#FF0000", emojis: ['🪁', '🌬️', '🧵', '🏖️'] },
    { title: "Umbrella Zone", desc: "Welcome to the shelter.", bg: "#708090", color: "#FFFF00", emojis: ['☂️', '🌧️', '👢', '🧥'] },
    { title: "Anchor Zone", desc: "Welcome to the hold.", bg: "#000080", color: "#C0C0C0", emojis: ['⚓', '🚢', '🌊', '⛓️'] },
    { title: "Compass Zone", desc: "Welcome to the north.", bg: "#DEB887", color: "#8B0000", emojis: ['🧭', '🗺️', '🚶', '⛰️'] },
    { title: "Map Zone", desc: "Welcome to the legend.", bg: "#F5DEB3", color: "#000000", emojis: ['🗺️', '📍', '❌', '🏴‍☠️'] },
    { title: "Telescope Zone", desc: "Welcome to the stars.", bg: "#191970", color: "#FFD700", emojis: ['🔭', '🌌', '🪐', '👀'] },
    { title: "Microscope Zone", desc: "Welcome to the tiny.", bg: "#FFFFFF", color: "#008000", emojis: ['🔬', '🦠', '🧬', '🧫'] },
    { title: "Magnet Zone", desc: "Welcome to the attraction.", bg: "#A9A9A9", color: "#FF0000", emojis: ['🧲', '🔩', '📎', '⚡'] },
    { title: "Battery Zone", desc: "Welcome to the charge.", bg: "#000000", color: "#00FF00", emojis: ['🔋', '⚡', '🔌', '📱'] },
    { title: "Wormhole Zone", desc: "Welcome to the shortcut.", bg: "#4B0082", color: "#00FFFF", emojis: ['🌀', '🌌', '⏳', '🚀'] },
    { title: "Black Hole Zone", desc: "Welcome to the event horizon.", bg: "#000000", color: "#4B0082", emojis: ['🕳️', '🌌', '🚫', '🕰️'] },
    { title: "Supernova Zone", desc: "Welcome to the explosion.", bg: "#FF4500", color: "#FFFF00", emojis: ['💥', '🌟', '🌌', '☢️'] },
    { title: "Nebula Zone", desc: "Welcome to the dust.", bg: "#800080", color: "#FF69B4", emojis: ['🌌', '✨', '☁️', '🎨'] },
    { title: "Asteroid Zone", desc: "Welcome to the belt.", bg: "#2F4F4F", color: "#D3D3D3", emojis: ['☄️', '🪨', '🚀', '🌑'] },
    { title: "Comet Zone", desc: "Welcome to the tail.", bg: "#000080", color: "#00FFFF", emojis: ['☄️', '❄️', '🌌', '🔭'] },
    { title: "Meteor Zone", desc: "Welcome to the impact.", bg: "#8B0000", color: "#FFA500", emojis: ['☄️', '🔥', '💥', '🦖'] },

    // --- The Top Deck ---
    { title: "Cryptocurrency Zone", desc: "Welcome to the moon.", bg: "#F7931A", color: "#FFFFFF", emojis: ['₿', '🚀', '🌕', '📉', '📈'] },
    { title: "NFT Zone", desc: "Welcome to the ownership.", bg: "#5865F2", color: "#FFFFFF", emojis: ['🖼️', '🦍', '💎', '🙌'] },
    { title: "Metaverse Zone", desc: "Welcome to the virtual.", bg: "#000000", color: "#00FFFF", emojis: ['🥽', '🌐', '👾', '👤'] },
    { title: "Singularity Zone", desc: "Welcome to the point of no return.", bg: "#000000", color: "#FF00FF", emojis: ['🤖', '🧠', '💥', '♾️'] },
    { title: "Illuminati Zone", desc: "Welcome to the new world order.", bg: "#333333", color: "#00FF00", emojis: ['👁️', '🔺', '📜', '🦉'] },
    { title: "Ownership Zone", desc: "You own this game .", bg: "#000000", color: "#39FF14", emojis: ['hi', 'hi', 'hi', 'hi'] },
    { title: "Time Travel Zone", desc: "Welcome to the paradox.", bg: "#4B0082", color: "#00FFFF", emojis: ['⏳', '🕰️', '🌀', '⚡'] },
    { title: "Multiverse Zone", desc: "Welcome to the infinite.", bg: "#191970", color: "#FFD700", emojis: ['🌌', '🌀', '👯', '🌍'] },
    { title: "Omniverse Zone", desc: "Welcome to everything.", bg: "#FFFFFF", color: "#000000", emojis: ['♾️', '🌌', '⚛️', '👁️'] },
    { title: "Infinity Zone", desc: "Welcome to forever.", bg: "#000000", color: "#FFFFFF", emojis: ['♾️', '🔁', '🌌', '✨'] }
];

// --- Rarity System ---
// Initialize all as Common
zones.forEach(z => z.weight = 100); 

// Define Rarity Groups
const legendaryZones = ["Hacker Zone", "Glitch Zone", "Matrix Zone", "Void Zone", "God Zone", "Force Zone", "Ring Zone", "Hyrule Zone", "Cryptocurrency Zone", "NFT Zone", "Metaverse Zone", "Singularity Zone", "Illuminati Zone", "Area 51 Zone", "Time Travel Zone", "Multiverse Zone", "Omniverse Zone", "Infinity Zone"];
const rareZones = ["Gold Zone", "Diamond Zone", "Royal Zone", "Cyber Zone", "Ninja Zone", "Dragon Zone", "Wizard Zone", "Block Zone", "Nether Zone", "End Zone", "Plumber Zone", "Pocket Zone", "Brainrot Zone", "Skibidi Zone", "Rizz Zone", "Sigma Zone", "Ohio Zone", "Fanum Tax Zone", "Grimace Zone", "Backrooms Zone", "Nostalgia Zone", "Deja Vu Zone", "Liminal Zone", "Inverted Zone", "ASCII Zone", "Wormhole Zone", "Black Hole Zone"];

// Apply Weights
zones.forEach(z => {
    if (legendaryZones.includes(z.title)) z.weight = 2;   // 2% chance relative to common
    else if (rareZones.includes(z.title)) z.weight = 15;  // 15% chance relative to common
});

// --- Decorations ---
const decorationSymbols = ['★', '☆', '✦', '✧', '✨', '❄️', '🔥', '⚡', '🌙', '☀️', '☁️', '🌊', '🌸', '🍀', '💎', '🔮', '🎵', '💀', '👽', '🤖', '👻', '👑', '🚀', '🛸', '⚔️', '🛡️', '💡', '🎈', '🎉', '🍕', '🍔', '🍦', '🍩', '🍪', '🍬', '🍭', '🎮', '🎲', '🧩', '♠️', '♥️', '♦️', '♣️', '🪐', '🌌', '🧬', '🦠', '🧿', '🧸', '🗝️', '🧱', '⚙️', '⚓', '🚦', '🚧', '🗿'];

function addRandomDecorations(section, zoneData) {
    const symbols = zoneData.emojis || decorationSymbols;
    const color = zoneData.color;
    const count = Math.floor(Math.random() * 15) + 5; // 5 to 20 decorations
    
    section.style.position = 'relative';
    section.style.overflow = 'hidden';

    for (let i = 0; i < count; i++) {
        const deco = document.createElement('div');
        deco.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        
        const size = Math.floor(Math.random() * 100) + 20; // 20px to 120px
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const rotation = Math.random() * 360;
        
        deco.style.cssText = `
            position: absolute;
            left: ${left}%;
            top: ${top}%;
            font-size: ${size}px;
            transform: translate(-50%, -50%) rotate(${rotation}deg);
            opacity: 0.15;
            color: ${color};
            pointer-events: auto; /* Changed for interaction */
            cursor: pointer;
            z-index: 0;
            user-select: none;
            transition: transform 0.2s, opacity 0.2s;
        `;

        // Feature: Pop decoration on click
        deco.onclick = (e) => {
            e.stopPropagation();
            deco.style.transform += " scale(1.5)";
            deco.style.opacity = "0";
            setTimeout(() => deco.remove(), 200);
        };

        section.appendChild(deco);
    }
}

function getRandomZoneIndex() {
    const totalWeight = zones.reduce((sum, z) => sum + z.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < zones.length; i++) {
        random -= zones[i].weight;
        if (random <= 0) return i;
    }
    return 0;
}

// --- Checklist UI & Logic ---
let zoneVisitCounts = {};

// Load from Local Storage
const savedZones = localStorage.getItem('visitedZones');
if (savedZones) {
    try {
        const parsed = JSON.parse(savedZones);
        if (Array.isArray(parsed)) {
            // Migration from old format (array of indices)
            parsed.forEach(id => {
                zoneVisitCounts[id] = 1;
            });
        } else {
            // New format (object)
            zoneVisitCounts = parsed;
        }
    } catch (e) {
        console.error("Failed to load saved zones", e);
    }
}

// Button
const checklistBtn = document.createElement('button');
checklistBtn.textContent = "Checklist";
checklistBtn.style.cssText = "position: fixed; top: 20px; left: 20px; z-index: 1000; padding: 10px 20px; font-size: 16px; cursor: pointer; background: white; border: 2px solid black; border-radius: 5px; font-family: sans-serif;";
document.body.appendChild(checklistBtn);

// Modal
const checklistModal = document.createElement('div');
checklistModal.style.cssText = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; max-width: 900px; max-height: 85vh; background: white; color: black; z-index: 1001; padding: 20px; overflow-y: auto; display: none; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.5); font-family: sans-serif;";
document.body.appendChild(checklistModal);

// Close Button
const closeBtn = document.createElement('button');
closeBtn.textContent = "Close";
closeBtn.style.cssText = "float: right; margin-bottom: 10px; cursor: pointer; padding: 5px 10px;";
closeBtn.onclick = () => checklistModal.style.display = 'none';
checklistModal.appendChild(closeBtn);

// Wipe Button
const wipeBtn = document.createElement('button');
wipeBtn.textContent = "Wipe Progress";
wipeBtn.style.cssText = "float: right; margin-bottom: 10px; margin-right: 10px; cursor: pointer; padding: 5px 10px; background-color: #ff4444; color: white; border: none; border-radius: 3px;";
wipeBtn.onclick = () => {
    if (confirm("Are you sure you want to wipe all progress? This cannot be undone.")) {
        zoneVisitCounts = {};
        localStorage.removeItem('visitedZones');
        renderChecklist();
    }
};
checklistModal.appendChild(wipeBtn);

// Title
const checklistTitle = document.createElement('h2');
checklistTitle.style.marginTop = "0";
checklistModal.appendChild(checklistTitle);

// Content Container
const checklistContent = document.createElement('div');
checklistModal.appendChild(checklistContent);

checklistBtn.onclick = () => {
    renderChecklist();
    checklistModal.style.display = 'block';
};

function markZoneAsVisited(sectionIndex) {
    // Retrieve the specific zone index stored on the section DOM element
    if (sections[sectionIndex]) {
        const zoneIndex = parseInt(sections[sectionIndex].dataset.zoneIndex);
        if (!isNaN(zoneIndex)) {
            // Increment count
            zoneVisitCounts[zoneIndex] = (zoneVisitCounts[zoneIndex] || 0) + 1;
            // Save to Local Storage
            localStorage.setItem('visitedZones', JSON.stringify(zoneVisitCounts));
        }
    }
}

function getZoneCategory(index) {
    if (index < 50) return "Classic Zones";
    if (index < 168) return "Expansion Zones";
    if (index < 207) return "Everyday Life Zones";
    if (index < 218) return "Body Parts Zones";
    if (index < 243) return "Pop Culture Zones";
    if (index < 253) return "Famous People Zones";
    if (index < 263) return "Famous Quote Zones";
    if (index < 273) return "Funny Zones";
    if (index < 283) return "Pattern Zones";
    if (index < 293) return "Hobby Zones";
    if (index < 303) return "Music Genre Zones";
    if (index < 313) return "Board Game Zones";
    if (index < 323) return "Abstract Property Zones";
    if (index < 333) return "Mythology Zones";
    if (index < 343) return "RPG Class Zones";
    if (index < 353) return "Vegetable Zones";
    if (index < 363) return "Architecture Zones";
    if (index < 373) return "Literature Genre Zones";
    if (index < 383) return "Internet Slang Zones";
    if (index < 393) return "Vehicle Zones";
    if (index < 403) return "Job Zones";
    if (index < 413) return "Household Zones";
    if (index < 423) return "Mildly Inconvenient Zones";
    if (index < 490) return "Brainrot & Beyond Zones";
    return "The Top Deck";
}

function renderChecklist() {
    checklistContent.innerHTML = '';
    const totalUnlocked = Object.keys(zoneVisitCounts).length;
    checklistTitle.textContent = `Exploration Stats: ${totalUnlocked} / ${zones.length}`;
    
    // Group zones by category
    const categories = {};

    zones.forEach((zone, index) => {
        const cat = getZoneCategory(index);
        if (!categories[cat]) {
            categories[cat] = [];
        }
        categories[cat].push({ ...zone, index });
    });

    Object.keys(categories).forEach(catName => {
        const catHeader = document.createElement('h3');
        catHeader.textContent = catName;
        catHeader.style.borderBottom = "2px solid #ddd";
        catHeader.style.paddingBottom = "5px";
        catHeader.style.marginTop = "20px";
        checklistContent.appendChild(catHeader);

        const grid = document.createElement('div');
        grid.style.cssText = "display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px;";
        
        categories[catName].forEach(zoneItem => {
            const index = zoneItem.index;
            const count = zoneVisitCounts[index] || 0;
            const isVisited = count > 0;
            
            // Rarity
            let rarityIcon = "";
            if (zoneItem.weight <= 5) rarityIcon = "★"; 
            else if (zoneItem.weight <= 20) rarityIcon = "☆"; 

            const item = document.createElement('div');
            item.style.cssText = `
                padding: 10px; 
                border: 1px solid #ccc; 
                background-color: ${isVisited ? zoneItem.bg : '#f0f0f0'};
                color: ${isVisited ? zoneItem.color : '#888'};
                opacity: ${isVisited ? '1' : '0.6'};
                font-size: 14px;
                border-radius: 8px;
                cursor: ${isVisited ? 'pointer' : 'default'};
                text-align: center;
                position: relative;
                box-shadow: ${isVisited ? '0 2px 5px rgba(0,0,0,0.2)' : 'none'};
                transition: transform 0.2s;
                display: flex;
                flex-direction: column;
                justify-content: center;
                min-height: 80px;
            `;
            
            if (isVisited) {
                item.onmouseover = () => item.style.transform = "scale(1.05)";
                item.onmouseout = () => item.style.transform = "scale(1)";
                item.onclick = () => showZoneDetails(zoneItem, count);
            }

            item.innerHTML = `
                <div style="font-weight:bold; margin-bottom:5px;">${isVisited ? zoneItem.title : '???'}</div>
                <div style="font-size:12px;">${isVisited ? rarityIcon : ''}</div>
                ${isVisited ? `<div style="font-size:10px; margin-top:auto; background:rgba(255,255,255,0.3); padding:2px; border-radius:4px;">Seen: ${count}</div>` : ''}

                <div style="font-size:10px; margin-top:auto; background:rgba(255,255,255,0.3); padding:2px; border-radius:4px;">${getZoneCategory(zoneItem.index)}</div>
            `;
            
            grid.appendChild(item);
        });
        checklistContent.appendChild(grid);
    });
}

function showZoneDetails(zoneItem, count) {
    const detailOverlay = document.createElement('div');
    detailOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 1002;
        display: flex; justify-content: center; align-items: center;
    `;
    
    const card = document.createElement('div');
    card.style.cssText = `
        background: ${zoneItem.bg}; color: ${zoneItem.color};
        padding: 40px; border-radius: 15px; max-width: 500px; width: 90%;
        text-align: center; position: relative;
        box-shadow: 0 0 30px rgba(255,255,255,0.2);
        font-family: sans-serif;
        border: 4px solid white;
    `;

    let rarityText = "Common";
    if (zoneItem.weight <= 5) rarityText = "LEGENDARY";
    else if (zoneItem.weight <= 20) rarityText = "Rare";

    card.innerHTML = `
        <h2 style="margin-top:0; font-size: 2em; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${zoneItem.title}</h2>
        <div style="font-size: 1.2em; margin-bottom: 20px; font-style: italic; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">"${zoneItem.desc}"</div>
        <div style="margin: 20px 0; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 10px; text-align: left;">
            <p><strong>Category:</strong> ${getZoneCategory(zoneItem.index)}</p>
            <p><strong>Rarity:</strong> ${rarityText}</p>
            <p><strong>Total Visits:</strong> ${count}</p>
        </div>
        <button id="teleportBtn" style="padding: 12px 24px; font-size: 1.1em; cursor: pointer; border: none; border-radius: 5px; background: white; color: black; font-weight: bold; margin-right:  10px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">Teleport Here</button>
        <button id="closeDetailBtn" style="padding: 12px 24px; font-size: 1.1em; cursor: pointer; border: none; border-radius: 5px; background: rgba(0,0,0,0.6); color: white; border: 1px solid white;">Close</button>
    `;

    detailOverlay.appendChild(card);
    document.body.appendChild(detailOverlay);

    document.getElementById('teleportBtn').onclick = () => {
        teleportToZone(zoneItem.index);
        document.body.removeChild(detailOverlay);
        checklistModal.style.display = 'none';
    };

    document.getElementById('closeDetailBtn').onclick = () => {
        document.body.removeChild(detailOverlay);
    };
    
    detailOverlay.onclick = (e) => {
        if (e.target === detailOverlay) document.body.removeChild(detailOverlay);
    };
}

function teleportToZone(index) {
    let targetSectionIdx = sections.findIndex(sec => parseInt(sec.dataset.zoneIndex) === index);

    if (targetSectionIdx === -1) {
        addNewSection(index);
        targetSectionIdx = sections.length - 1;
    }

    currentSectionIndex = targetSectionIdx;
    scrollToSection(currentSectionIndex);
}

let isScrolling = false;
let currentSectionIndex = 0;
let sections = []; 

function createSection(index, forcedZoneIndex = null) {
    const section = document.createElement('div');
    
    // Randomly select a zone based on rarity, or use forced
    const zoneIndex = forcedZoneIndex !== null ? forcedZoneIndex : getRandomZoneIndex();
    const zoneData = zones[zoneIndex];
    
    // Store the zone index on the element so we know which one it is later
    section.dataset.zoneIndex = zoneIndex;
    
    section.classList.add('page-section');
    section.style.backgroundColor = zoneData.bg;
    section.style.color = zoneData.color;
    
    const title = document.createElement('h1');
    title.textContent = zoneData.title;
    title.style.position = 'relative';
    title.style.zIndex = '1';
    title.style.cursor = 'help'; // Hint at interactivity

    // Feature: Secret Title Click
    let titleClicks = 0;
    title.onclick = (e) => {
        e.stopPropagation();
        titleClicks++;
        if (titleClicks === 5) {
            alert(`You found a secret in ${zoneData.title}! Here is a rainbow title.`);
            setInterval(() => {
                title.style.color = `hsl(${Date.now() / 10 % 360}, 100%, 50%)`;
            }, 50);
            titleClicks = 0;
        }
    };
    
    const text = document.createElement('p');
    text.textContent = zoneData.desc;
    text.style.position = 'relative';
    text.style.zIndex = '1';
    
    section.appendChild(title);
    section.appendChild(text);
    
    addRandomDecorations(section, zoneData);

    // Feature: Double click to like
    section.ondblclick = (e) => {
        const heart = document.createElement('div');
        heart.textContent = '❤️';
        heart.style.cssText = `
            position: absolute; 
            left: ${e.clientX}px; 
            top: ${e.clientY}px; 
            font-size: 50px; 
            transform: translate(-50%, -50%); 
            pointer-events: none; 
            animation: floatUp 1s ease-out forwards;
            z-index: 100;
        `;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1000);
    };
    
    return section;
}

// Initial load
let pageCount = 1;

function addNewSection(forcedZoneIndex = null) {
    const newSection = createSection(pageCount, forcedZoneIndex);
    container.appendChild(newSection);
    sections.push(newSection);
    pageCount++;
}

// Add first section
addNewSection();
markZoneAsVisited(0);

// Wheel Jacking Logic
window.addEventListener('wheel', (e) => {
    e.preventDefault();

    if (isScrolling) return;

    if (e.deltaY > 0) {
        // Scroll Down
        isScrolling = true;
        currentSectionIndex++;
        
        if (currentSectionIndex >= sections.length) {
            addNewSection();
        }
        
        scrollToSection(currentSectionIndex);
        markZoneAsVisited(currentSectionIndex);

    } else if (e.deltaY < 0) {
        // Scroll Up
        if (currentSectionIndex > 0) {
            isScrolling = true;
            currentSectionIndex--;
            scrollToSection(currentSectionIndex);
            markZoneAsVisited(currentSectionIndex);
        }
    }
}, { passive: false });

function scrollToSection(index) {
    sections[index].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });

    // Feature: Dynamic Title
    const zoneIndex = parseInt(sections[index].dataset.zoneIndex);
    if (zones[zoneIndex]) {
        document.title = `Exploring: ${zones[zoneIndex].title}`;
    }

    setTimeout(() => {
        isScrolling = false;
    }, 800);
}

// --- Cheat Code ---
let cheatInput = "";
const cheatCode = "billyisgood";

window.addEventListener('keydown', (e) => {
    // Add key to input buffer
    cheatInput += e.key.toLowerCase();
    
    // Keep buffer same length as cheat code
    if (cheatInput.length > cheatCode.length) {
        cheatInput = cheatInput.slice(-cheatCode.length);
    }

    // Check for match
    if (cheatInput === cheatCode) {
        // Unlock all zones
        zones.forEach((_, index) => {
            if (!zoneVisitCounts[index]) {
                zoneVisitCounts[index] = 1;
            }
        });
        
        // Save
        localStorage.setItem('visitedZones', JSON.stringify(zoneVisitCounts));
        
        // Notify
        alert("Cheat Activated: All Zones Unlocked!");
        
        // Refresh UI if open
        if (checklistModal.style.display === 'block') {
            renderChecklist();
        }
        
        // Reset buffer
        cheatInput = "";
    }
});

// --- Konami Code Easter Egg ---
const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let konamiIndex = 0;

window.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            // Toggle Invert Filter
            document.body.style.filter = document.body.style.filter === 'invert(1)' ? 'none' : 'invert(1)';
            alert("Konami Code Activated: World Inverted!");
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});
