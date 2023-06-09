import { useCallback, useEffect, useState } from 'react'

import style from './App.module.scss'

/* Default */
let boardSizeList = [10, 15, 20]

let ROWS = boardSizeList[0]
let COLS = boardSizeList[0]

let bestResultsLength = 3

let minSpeed = 500

let maxSpeed = minSpeed * 0.1

let navigate = ['up', 'down', 'left', 'right']

let defaultPosition = [{ row: Math.floor(Math.random() * ROWS), col: Math.floor(Math.random() * COLS) }]

const fruits = ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝']

export default function App() {
	/* Board */
	const [boardSize, setBoardSize] = useState({
		rows: ROWS,
		cols: COLS
	})
	const [board, setBoard] = useState()

	/* Styles */
	const rowsStyle = {
		gridTemplateRows: `repeat(${boardSize.rows}, 30px)`
	}

	const colsStyle = {
		gridTemplateColumns: `repeat(${boardSize.cols}, 30px)`
	}

	// Config
	const [speed, setSpeed] = useState(minSpeed)
	const [gameOver, setGameOver] = useState(false)
	const [results, setResults] = useState([])
	const [currentResult, setCurrentResult] = useState(1)

	// Cordinate
	const [snake, setSnake] = useState([])
	const [food, setFood] = useState({})
	// Direction
	const [direction, setDirection] = useState('')
	// Fruit
	const [fruit, setFruit] = useState('')

	/* Random logic */
	function randomCordinate() {
		return { row: Math.floor(Math.random() * ROWS), col: Math.floor(Math.random() * COLS) }
	}

	function setRandomFromLength(array, length) {
		return array[Math.floor(Math.random() * length)]
	}

	const randomFruit = useCallback(() => {
		return setRandomFromLength(fruits, fruits.length)
	}, [])

	const randomDirection = useCallback(() => {
		return setRandomFromLength(navigate, navigate.length)
	}, [])

	// Reset to default
	const setDefault = useCallback(() => {
		setSpeed(minSpeed)
		setGameOver(false)
		setSnake(defaultPosition)
		setFood(randomCordinate())
		// Random head direction after start
		setDirection(randomDirection())
		// Set random fruit from set
		setFruit(randomFruit())
		setCurrentResult(1)
	}, [randomDirection, randomFruit])

	// Moved logic
	//FIXME
	const moveSnake = useCallback(() => {
		const head = { ...snake[0] }

		let navigate = direction

		// Switch head direction after turn
		switch (navigate) {
			case 'up':
				head.row = head.row - 1
				break
			case 'down':
				head.row = head.row + 1
				break
			case 'left':
				head.col = head.col - 1
				break
			case 'right':
				head.col = head.col + 1
				break
			default:
				break
		}

		// New body snake
		const newSnake = [head, ...snake.slice(0, -1)]

		/* Checker logic */
		const isClashWall = (head) => {
			return head.row < 0 || head.col < 0 || head.row >= ROWS || head.col >= COLS
		}

		const isClashFood = (head) => {
			return head.row === food.row && head.col === food.col
		}

		const isClashBody = (snake) => {
			const [head, ...body] = snake
			return body.some((segment) => segment.row === head.row && segment.col === head.col)
		}

		// Check food position dont spawn on snake body
		function setNewFood() {
			let newFood = randomCordinate()
			while (snake.some((segment) => segment.row === newFood.row && segment.col === newFood.col)) {
				newFood = randomCordinate()
			}
			setFood(newFood)
		}

		/* Checker */

		if (isClashWall(head) || isClashBody(newSnake)) {
			setGameOver(true)
			return
		}

		if (isClashFood(head)) {
			const newSpeed = speed !== maxSpeed ? speed - maxSpeed : maxSpeed
			setSpeed(newSpeed)
			setFruit(randomFruit())
			setNewFood()
			newSnake.push({})
		}

		// Set new body
		setSnake(newSnake)
		setCurrentResult(newSnake.length)
	}, [direction, food, snake, speed, randomFruit])

	//FIXME
	// Switch diretion after click key
	const switchDiretion = useCallback(
		(keyDown) => {
			if (keyDown === 'w' || keyDown === 'ArrowUp') {
				direction !== 'down' && setDirection('up')
			}
			if (keyDown === 's' || keyDown === 'ArrowDown') {
				direction !== 'up' && setDirection('down')
			}
			if (keyDown === 'a' || keyDown === 'ArrowLeft') {
				direction !== 'right' && setDirection('left')
			}
			if (keyDown === 'd' || keyDown === 'ArrowRight') {
				direction !== 'left' && setDirection('right')
			}
			return
		},
		[direction]
	)

	// Update results, check with current, if max replace
	const updateResults = useCallback(() => {
		let updatedResults = results
		updatedResults = [...results, currentResult]
			.filter((value, index, self) => self.indexOf(value) === index) // Remove duplicate results
			.sort((a, b) => b - a)
			.slice(0, bestResultsLength)
		setResults(updatedResults)
	}, [results, currentResult])

	// Auto move
	useEffect(() => {
		const interval = setInterval(() => {
			moveSnake()
		}, speed)

		return () => {
			clearInterval(interval)
		}
	}, [speed, moveSnake])

	// Watcher keydown
	useEffect(() => {
		function handleKeyPress(e) {
			switchDiretion(e.key)
		}

		document.addEventListener('keydown', handleKeyPress)

		return () => {
			document.removeEventListener('keydown', handleKeyPress)
		}
	}, [snake, switchDiretion])

	// Watcher if game end
	useEffect(() => {
		if (gameOver) {
			updateResults()
			setDefault()
		}
	}, [gameOver, setDefault, updateResults])

	// Set board size after changes
	useEffect(() => {
		let { cols, rows } = boardSize
		let newBoard = new Array(rows).fill(0).map(() => new Array(cols).fill(0))
		setBoard(newBoard)
		setDefault()
	}, [boardSize, setDefault])

	// Set new board size after click button
	const handleChangeBoardSize = (value) => {
		setBoardSize({ cols: value, rows: value })
		setGameOver(true)
	}

	return (
		<>
			{speed}
			{boardSizeList.map((size) => {
				return (
					<button onClick={() => handleChangeBoardSize(size)} key={size}>
						{size}
					</button>
				)
			})}
			<h2>Current length: {currentResult}</h2>
			<h4>Results:</h4>
			<ul>
				{results.map((result, index) => {
					return <li key={index}>{result}</li>
				})}
			</ul>

			<div className={style.board} style={rowsStyle}>
				{board?.map((row, rowIndex) => {
					return (
						<div className={style.row} key={rowIndex} style={colsStyle}>
							{row.map((col, colIndex) => {
								const isSnakeCell = snake.some((segment) => segment.row === rowIndex && segment.col === colIndex)

								const isFoodCell = food.row === rowIndex && food.col === colIndex
								return (
									<div key={colIndex} className={`${style.col} ${isSnakeCell ? style.snake : ''}`}>
										{isFoodCell ? fruit : ''}
									</div>
								)
							})}
						</div>
					)
				})}
			</div>
		</>
	)
}

