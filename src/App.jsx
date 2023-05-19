import { useCallback, useEffect, useState } from 'react'

import style from './App.module.scss'

/* Default */
let ROWS = 10
let COLS = 10

let defaultPosition = [{ row: Math.floor(Math.random() * ROWS), col: Math.floor(Math.random() * COLS) }]

let navigate = ['w', 's', 'a', 'd']

const fruits = ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝']

export default function App() {
	const [board, setBoard] = useState(new Array(ROWS).fill(0).map(() => new Array(COLS).fill(0)))

	const [speed, setSpeed] = useState(500)
	const [gameOver, setGameOver] = useState(false)

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

	// Cordinate
	const [snake, setSnake] = useState(defaultPosition)
	const [food, setFood] = useState(randomCordinate())

	// Random head direction after start
	const [direction, setDirection] = useState(randomDirection())

	// Set random fruit from set
	const [fruit, setFruit] = useState(randomFruit())

	// Reset to default
	const setDefault = useCallback(() => {
		setSnake(defaultPosition)
		setFood(randomCordinate())
		setGameOver(false)
		setDirection(randomDirection())
		setSpeed(500)
	}, [randomDirection])

	//Moved logic
	const moveSnake = useCallback(() => {
		const head = { ...snake[0] }

		let navigate = direction

		// Switch head direction after turn
		switch (navigate) {
			case 'w':
				head.row = head.row - 1
				setDirection('w')
				break
			case 's':
				head.row = head.row + 1
				setDirection('s')
				break
			case 'a':
				head.col = head.col - 1
				setDirection('a')
				break
			case 'd':
				head.col = head.col + 1
				setDirection('d')
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
			const newSpeed = speed !== 50 ? speed - 50 : 50
			setSpeed(newSpeed)
			setFruit(randomFruit())
			setNewFood()
			newSnake.push({})
		}

		// Set new body
		setSnake(newSnake)
	}, [direction, food, snake, speed, randomFruit])

	// Switch Diretion after click key
	const switchDiretion = useCallback((keyDown) => {
		let navigate = keyDown
		switch (navigate) {
			case 'w':
				setDirection('w')
				break
			case 's':
				setDirection('s')
				break
			case 'a':
				setDirection('a')
				break
			case 'd':
				setDirection('d')
				break
			default:
				break
		}
	}, [])

	// Auto move
	useEffect(() => {
		const interval = setInterval(() => {
			moveSnake()
		}, speed)

		return () => {
			clearInterval(interval)
		}
	}, [speed, moveSnake])

	// Wathcer keydown
	useEffect(() => {
		function handleKeyPress(e) {
			switchDiretion(e.key)
		}

		document.addEventListener('keydown', handleKeyPress)

		return () => {
			document.removeEventListener('keydown', handleKeyPress)
		}
	}, [snake, switchDiretion])

	// Watcher game end
	useEffect(() => {
		if (gameOver) {
			setDefault()
		}
	}, [gameOver, setDefault])

	return (
		<div className={style.board}>
			{board.map((row, rowIndex) => {
				return (
					<div className={style.row} key={rowIndex}>
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
	)
}

