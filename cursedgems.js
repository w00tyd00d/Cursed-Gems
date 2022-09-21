/**
 * @file Cursed Gems
 * @version 1.0
 *
 */

// GAME DATA

const max_color = 17
const box_color = 16
const gem_color = 16
const text_color = 12
const dark_color = 4

const state = {
	// Global
	menu: 0,
	game: 1,
	// Menu
	newgame: 2,
	rules: 3,
	saveclear: 4
}

const difficulty = {
	easy: 0,
	normal: 1,
	hard: 2,
	tricky: 3,
	master: 4
}

const log = {
	Player: {},
	Computer: {}
}

let menu_cursor = 0

let global_state
let menu_state

let game_start
let game_winner
let game_difficulty

let mode_unlocked

let selected_row = -1

let rows = []

function Row(count) {
	this.count = count
	this.total = count
}

const flourish_gems = [
		{x: 2, y: 2, on: false},
		{x: 9, y: 3, on: false},
		{x: 4, y: 5, on: false},
		{x: 10, y: 7, on: false},
		{x: 2, y: 8, on: false},
		{x: 6, y: 11, on: false},
		{x: 11, y: 13, on: false},
		{x: 7, y: 16, on: false},
		{x: 3, y: 14, on: false},
		{x: 14, y: 17, on: false},

		{x: 45, y: 2, on: false},
		{x: 41, y: 7, on: false},
		{x: 50, y: 5, on: false},
		{x: 47, y: 9, on: false},
		{x: 41, y: 11, on: false},
		{x: 39, y: 14, on: false},
		{x: 48, y: 13, on: false},
		{x: 52, y: 17, on: false},
		{x: 42, y: 18, on: false},
	]

// PERSISTENT DATA

let difficulty_unlocks = 2

// API

function getName() {
	return "Cursed Gems"
}

function onConnect() {
	// global_state = state.menu
	// menu_state = state.menu
	// drawMenu()
	load_data()
	goToMenu()
}

function onUpdate() {
	switch (global_state) {
		case state.menu:
			drawMenu()
			break
		case state.game:
			drawGame()
			break
	}
}

function onInput(key) {
	const controls = {
		up:    	key === 119 || key === 87 || key === 17,
		down:  	key === 115 || key === 83 || key === 18,
		left:  	key === 97  || key === 65 || key === 19,
		right: 	key === 100 || key === 68 || key === 20,
		select: key === 32  || key === 10,
		back:   key === 27  || key === 8
	}

	switch (global_state) {
		case state.menu: {
			switch (menu_state) {
				
				case state.menu: {
					const menu_count = 3
					if (controls.up) {
						menu_cursor -= 1
						if (menu_cursor === -1) {
							menu_cursor = menu_count - 1
						}
					} else if (controls.down) {
						menu_cursor = (menu_cursor + 1) % menu_count
					}

					if (controls.select) {
						switch (menu_cursor) {
							case 0: menu_state = state.newgame; break;
							case 1: menu_state = state.rules; break;
							case 2: menu_state = state.saveclear; break;
						}
						menu_cursor = 0
					}
					break
				}

				case state.newgame: {
					const menu_count = difficulty_unlocks + 1
					if (controls.up) {
						menu_cursor -= 1
						if (menu_cursor === -1) {
							menu_cursor = menu_count - 1
						}
						if (menu_cursor === 5) {
							menu_cursor--
						}
					} else if (controls.down) {
						menu_cursor = (menu_cursor + 1) % menu_count
						if (menu_cursor === 5) {
							menu_cursor++
						}
					}
					if (controls.select) {
						if (menu_cursor === difficulty_unlocks) {
							menu_state = state.menu
							menu_cursor = 0
							return
						}
						switch (menu_cursor) {
							case 0: setDifficulty(difficulty.easy); break;
							case 1: setDifficulty(difficulty.normal); break;
							case 2: setDifficulty(difficulty.hard); break;
							case 3: setDifficulty(difficulty.tricky); break;
							case 4: setDifficulty(difficulty.master); break;
						}
						goToGame()
					}

					if (controls.back) {
						goToMenu()
					}

					break
				}

				case state.rules: {
					if (controls.select || controls.back) {
						goToMenu()
					}
				}

				case state.saveclear: {
					const menu_count = 2
					if (controls.up) {
						menu_cursor -= 1
						if (menu_cursor === -1) {
							menu_cursor = menu_count - 1
						}
					} else if (controls.down) {
						menu_cursor = (menu_cursor + 1) % menu_count
					}
					if (controls.select) {
						if (menu_cursor === 1) {
							difficulty_unlocks = 2
							save_data()
						}
						goToMenu()
					}

					if (controls.back) {
						goToMenu()
					}

					break
				}
			}
		}

		case state.game: {
			if (key === 99 || key === 99 - 32) { // C
				// Cancel row
				selected_row = -1
			}
			if (key === 110 || key === 110-32) { // N
				// New Game
				resetGame()
			}
			if (key === 104 || key === 120-32) { // H
				// Main Menu
				goToMenu()
			}		
			checkInput(key)
			break
		}
	}
}

// CLASSIC BBS

function save_data() {
	if (typeof _bbs_save !== "undefined") {
		_bbs_save_type("cursedgems", "unlocks", difficulty_unlocks)
	} else {
		const data = JSON.stringify({unlocks: difficulty_unlocks})
		saveData(data)
	}
}

function load_data() {
	if (typeof _bbs_load !== "undefined") {
		if (!_bbs_load()) return;
		difficulty_unlocks = _bbs_load_type("cursedgems", 2, "unlocks")
	} else {
		const data = loadData()
		if (data !== "") {
			const parse = JSON.parse(data)
			difficulty_unlocks = parse.unlocks
		}
	}
}

// DRAW FUNCTIONS

function drawFlourish() {
	for (let i=0; i < flourish_gems.length; i++) {
		if (Math.random() < 0.05) {
			flourish_gems[i].on = !flourish_gems[i].on
		}
		if (flourish_gems[i].on) {
			drawText("♦", max_color, flourish_gems[i].x, flourish_gems[i].y)
		}
	}
}

function drawTitle() {
	const h1_x = 13
	const h1_y = 2

	const h2_x = h1_x + 4
	const h2_y = h1_y + 4

	drawText("▟▀▀▜ ▟  ▟ █▀▙ ▟▀▀▜ ▟▀▀▜ █▀▀▙", max_color, h1_x, h1_y)
	drawText("█    █  █ █▀▙ ▀▀▜  █▀▀  █  █ ", max_color, h1_x, h1_y+1)
	drawText("▜▄▄▟ ▜▄▄▛ █ ▜▖▙▄▄▙ ▜▄▄▟ █▄▄▛", max_color, h1_x, h1_y+2)

	drawText("▟▀▀▜ ▟▀▀▜ ▟▙▟▙ ▟▀▀▜", max_color, h2_x, h2_y)
	drawText("█ ▄▄ █▀▀  █▜▛█ ▀▀▜ ", max_color, h2_x, h2_y+1)
	drawText("▜▄▄▜ ▜▄▄▟ █  █ ▙▄▄▙", max_color, h2_x, h2_y+2)

	drawFlourish()

	// Version
	drawText("v1.0", max_color, 0, 19)

}

function drawMainMenu() {
	const menu_x = 23
	const menu_y = 11
	const cursor_x = 19

	// Menu
	drawText("New Game", text_color, menu_x, menu_y)
	drawText("Rules", text_color, menu_x+1, menu_y + 2)
	drawText("Clear Data", text_color, menu_x-1, menu_y + 4)

	// Cursor
	drawText(">", max_color, cursor_x, menu_cursor * 2 + menu_y )
}

function getMenuColor(lvl) {
	if (difficulty_unlocks >= lvl) {
		return text_color
	}
	return dark_color
}

function drawNewGameMenu() {
	const menu_x = 24
	const menu_y = 11
	const back_y = menu_y + 6
	const cursor_x = 19
	let cursor_y = menu_cursor === difficulty_unlocks ? back_y : menu_cursor + menu_y
	
	// Menu
	drawText("Easy",   getMenuColor(1), menu_x + 1, menu_y)
	drawText("Normal", getMenuColor(2), menu_x,   	menu_y + 1)
	drawText("Hard",   getMenuColor(3), menu_x + 1, menu_y + 2)
	drawText("Tricky", getMenuColor(4), menu_x,   	menu_y + 3)
	drawText("Master", getMenuColor(5), menu_x,   	menu_y + 4)

	drawText("Back", text_color, menu_x+1, back_y)
	
	// Cursor
	drawText(">", max_color, cursor_x, cursor_y )
}

function drawBigRules() {
	const rules1 = "Cursed Gems is a game about wits. When you start the game there are several rows of gems on the field. Every turn you must first pick a row that still has gems in it, then you must decide how many gems you would like to take from that row. You can take as many gems you want, but you must always take at least one." 
	const rules2 = "The object of the game is to make your opponent become cursed by taking the last gem. Good luck!"

	drawBox(max_color, 1, 1, 54, 15)
	
	drawText("Rules", text_color, 25, 2)
	drawText("--------------------------------------------------", text_color, 3, 3)
	drawTextWrapped(rules1, text_color, 3, 4, 49)
	drawTextWrapped(rules2, text_color, 3, 12, 49)

	drawText("Back", text_color, 25, 17)
	
	// Cursor
	drawText(">", max_color, 22, 17)
}

function drawSaveClear() {
	const prompt_x = 18
	const prompt_y = 11

	drawText(" Are you sure you", text_color, prompt_x, prompt_y)
	drawText("want to clear your", text_color, prompt_x, prompt_y+1)
	drawText("    save data?", text_color, prompt_x, prompt_y+2)

	const menu_x = 25
	const menu_y = 15
	const cursor_x = 19

	// Menu
	drawText("No", text_color, menu_x, menu_y)
	drawText("Yes", text_color, menu_x, menu_y + 1)

	drawText(">", max_color, cursor_x, menu_cursor + menu_y )
}

function drawMenu() {
	clearScreen()
	
	switch (menu_state) {
		case state.menu:
			drawTitle()
			drawMainMenu()
			if (difficulty_unlocks === 6) {
				drawText("▙▟▙▟", max_color, 25, 17)
			}
			break
		case state.newgame:
			drawTitle()
			drawNewGameMenu()
			break
		case state.rules:
			drawBigRules()
			break
		case state.saveclear:
			drawTitle()
			drawSaveClear()
			break
	}
}

function drawRules() {
	const rule_text = "  On Your Turn ---------------- Pick a row that still has gems. You can take as many gems as you want from the row, but you must take at least one.                       The person to take the last gem loses.                         C : Cancel Row   N : New Game     H : Main Menu "
	drawBox(box_color, 38, 0, 18, 20)
	drawTextWrapped(rule_text, text_color, 39, 1, 16)
}

function drawField() {
	// Difficulty header
	const diff_data = getDifficultyString()
	const dstr = diff_data[0]
	const rind = diff_data[1]
	const rx = 36
	drawText(dstr, text_color, rx - rind, 0)

	// Gem Rows
	const x = 17
	const y = 5
	const r = x - 8 // row indent
	const d = game_difficulty
	for (let i=0; i < rows.length; i++) {
		const rowstr = composeRowString(rows[i].count, rows[i].total)
		drawText("Row " + (i+1) + " ", text_color, r-d, y-d+i)
		drawText(rowstr, gem_color, x-d, y-d+i)
	}
}

function drawLog() {
	drawBox(box_color, 0, 9, 38, 4)
	drawText(" Log ", text_color, 2, 9)
	let y = 10
	for (turn in log) {
		if (Object.keys(log[turn]).length > 0) {
			const logstr = turn + " took " + log[turn].count + " gems from row " + log[turn].row
			drawText(logstr, text_color, 2, y)
			y++
		}
	}
}

function drawInputTask() {
	if (!game_start) {
		drawText("Would you like to go first?", text_color, 5, 15)
		drawText("1 - Yes  2 - No", text_color, 11, 17)
		return
	}

	if (!game_winner) {
		if (selected_row < 0) {
			drawText("What row would you", text_color, 10, 15)
			drawText("like to take from?", text_color, 10, 16)
		} else {
			drawTextWrapped("How many gems would you like to take from row " + (selected_row + 1) + "?", text_color, 7, 15, 25)
		}
	} else {
		if (mode_unlocked) {
			const unlockstr = "* " + mode_unlocked + " mode has been unlocked *"
			const unlock_x  = game_difficulty === 1 ? 4 : 3
			drawText(unlockstr, text_color, unlock_x, 13)
		}

		if (game_difficulty === 4 && game_winner === "Player") {
			const victorystr = "You are a true Cursed Gem Master :)"
			drawText(victorystr, text_color, 2, 14)
		} else {
			const winstr = game_winner + " has won the game!"
			const win_x  = game_winner === "Computer" ? 6 : 7
			drawText(winstr, text_color, win_x, 14)
		}

		const playstr = "Would you like to play again? 1 - Yes  2 - No"
		drawTextWrapped(playstr, text_color, 8, 16, 25)
	}
}

function drawGame() {
	clearScreen()
	drawRules()
	drawField()
	drawLog()
	drawInputTask()
}

// STATE FUNCTIONS

function goToMenu() {
	menu_cursor = 0
	menu_state = state.menu
	global_state = state.menu
}

function goToGame() {
	resetGame()
	global_state = state.game
}

// GENERAL FUNCTIONS

function createRows(num) {
	// Rows start at 3 gems and increment by 1
	let arr = []
	for (let i=0; i < num; i++) {
		let row = new Row(i+3)
		arr.push(row)
	}
	rows = arr
}

function composeRowString(count, total) {
	// Indents each row into a pyramid formation	
	const biggest = game_difficulty + 5
	let rowstr = ""
	for (let i=0; i < biggest-total; i++)	{
		rowstr += " "
	}
	for (let i=0; i < count; i++) {
		rowstr += "♦"
		if (i < count-1) {
			rowstr += " "
		}
	}
	return rowstr
}

function setDifficulty(num) {
	// Easy starts at 3 rows
	// Each difficulty increases rows by 1
	createRows(num + 3)
	game_difficulty = num
}

function getDifficultyString() {
	switch (game_difficulty) {
		case difficulty.easy:
			return ["Easy", 4]
		case difficulty.normal:
			return ["Normal", 6]
		case difficulty.hard:
			return ["Hard", 4]
		case difficulty.tricky:
			return ["Tricky", 6]
		case difficulty.master:
			return ["Master", 6]
	}
}

function resetLog() {
	log.Player = {}
	log.Computer = {}
}

function resetRows() {
	for (let i=0; i < rows.length; i++) {
		rows[i].count = rows[i].total
	}
}

function resetGame() {
	selected_row = -1
	mode_unlocked = undefined
	game_winner = undefined
	game_start = false
	resetLog()
	resetRows()
}

function checkInput(key) {
	// Key must be 1-9
	if (key < 49 || key > 57) {
		return
	}

	if (!game_start) {
		if (key === 49) {
			game_start = true
		} else if (key === 50) {
			game_start = true
			compTurn(true)
		}
	} else if (game_winner) {
		if (key === 49) {
			resetGame()
		} else if (key === 50) {
			goToMenu()
		}
	} else if (selected_row < 0) {
		// Key can't be greater than amount of rows
		const d = game_difficulty
		if (key - 48 > d + 3) {
			return
		}

		const row = key - 49
		if (rows[row].count < 1) {
			return
		}
		
		selected_row = row
	
	} else {
		resetLog()
		const row = selected_row
		const amt = Math.min(key - 48, rows[row].count)
		rows[row].count -= amt
		log["Player"] = {count: amt, row: row+1}
		selected_row = -1

		const win_check = checkWin()
		const game_over = win_check[0]
		const remaining = win_check[1]

		if (game_over) {
			if (remaining === 0) {
				// You took the last gem, dummy lol
				game_winner = "Computer"
			} else {
				game_winner = "Player"
				if (game_difficulty === difficulty_unlocks - 1) {
					if (game_difficulty < 4) {
						const tbl = ["Hard", "Tricky", "Master"]					
						mode_unlocked = tbl[game_difficulty-1]
					}
					difficulty_unlocks += 1
					save_data()
				}
			}
			return
		}
		compTurn()
	}

}

function checkWin() {
	let acc = 0
	for (let i=0; i < rows.length; i++) {
		acc += rows[i].count
		if (acc > 1) {
			return [false, acc]
		}
	}
	return [true, acc]
}

function getEndGameAdjustment(row) {
	// Scans other rows and tallies 1's and 0's
	// if all other rows are 1's or 0's, change
	// the end game moves by +1/-1 accordingly
	let one  = 0
	let zero = 0
	for (let i=0; i < rows.length; i++) {
		if (i !== row) {
			if (rows[i].count === 1) {
				one++
			} else if (rows[i].count === 0) {
				zero++
			}
		}
	}
	if (one + zero === rows.length - 1) {
		if (one % 2 === 1) {
			return 1
		}
		return -1
	}
	return 0
}

function compTurn(initial) {
	const answers = []
	const notempty = []
	let nimsum = 0

	for (let i=0; i < rows.length; i++) {
		nimsum ^= rows[i].count
	}
	
	for (let i=0; i < rows.length; i++) {
		const res = rows[i].count ^ nimsum
		if (rows[i].count > 0) {
			notempty.push(i)
			if (res < rows[i].count) {
				answers.push([i, res])
			}
		}
	}

	let row, amt

	if (!initial && answers.length > 0) {
		const ridx = Math.floor(Math.random() * answers.length)
		const ans  = answers[ridx]
		row = ans[0]
		amt = rows[row].count - ans[1] + getEndGameAdjustment(row)
	} else {
		const ridx = Math.floor(Math.random() * notempty.length)
		row = notempty[ridx]
		amt = Math.min(rows[row].count, Math.floor(Math.random() * 4) + 1)
	}

	amt = Math.max(1, amt)
	rows[row].count -= amt
	log["Computer"] = {count: amt, row: row+1}
	
	const win_check = checkWin()
	if (win_check[0]) {
		game_winner = "Computer"
	}
}
