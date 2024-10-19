import { useState } from "react";

function Square({ value, onSquareClick, highlight, row, col, isMarked }) {
	return (
		<button
			className={`${isMarked ? "bg-zinc-200" : ""} ${row == 2 ? "border-b" : ""} ${col == 2 ? "border-r" : ""} border-zinc-500 border-t border-l w-24 h-24 ${highlight ? "!bg-yellow-400" : ""}`}
			onClick={onSquareClick}
		>
			{value}
		</button>
	);
}

function Board({ xIsNext, squares, onPlay, markedSquare }) {
	function handleClick(i, row, col) {
		if (calculateWinner(squares) || squares[i]) {
			return;
		}
		const nextSquares = squares.slice();
		if (xIsNext) {
			nextSquares[i] = "X";
		} else {
			nextSquares[i] = "O";
		}
		onPlay(nextSquares, row, col);
	}

	const winnerData = calculateWinner(squares);
	const winner = winnerData ? winnerData.winner : null;
	const winningSquares = winnerData ? winnerData.line : [];

	let status;
	if (winner) {
		status = "Winner: " + winner;
	} else if (!squares.includes(null)) {
		status = "Result: Draw";
	} else {
		status = "Next player: " + (xIsNext ? "X" : "O");
	}

	const renderSquare = (i, row, col, isMarked) => {
		return <Square value={squares[i]} onSquareClick={() => handleClick(i, row, col)} highlight={winningSquares.includes(i)} row={row} col={col} isMarked={isMarked} />;
	};

	const boardSize = 3;
	let rows = [];
	for (let row = 0; row < boardSize; row++) {
		let squares = [];
		for (let col = 0; col < boardSize; col++) {
			let isMarked = markedSquare === row * boardSize + col;
			squares.push(renderSquare(row * boardSize + col, row, col, isMarked));
		}
		rows.push(
			<div key={row} className="flex">
				{squares}
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center gap-4">
			<div className="m-w-24 border p-2 rounded text-center bg-yellow-400">{status}</div>
			<div>{rows}</div>
		</div>
	);
}

export default function Game() {
	const [history, setHistory] = useState([{ squares: Array(9).fill(null), location: null }]);
	const [currentMove, setCurrentMove] = useState(0);
	const [isAscending, setIsAscending] = useState(true);
	const xIsNext = currentMove % 2 === 0;
	const currentSquares = history[currentMove].squares;
	const [markedSquare, setMarkedSquare] = useState([-1, -1]);

	function handlePlay(nextSquares, row, col) {
		const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, location: [row, col] }];
		setHistory(nextHistory);
		setCurrentMove(nextHistory.length - 1);
		setMarkedSquare(row * 3 + col);
	}

	function jumpTo(nextMove, stepLocation) {
		setCurrentMove(nextMove);
		setMarkedSquare(stepLocation ? stepLocation[0] * 3 + stepLocation[1] : -1);
	}

	const moves = history.map((step, move) => {
		const location = step.location ? `(${step.location[0]}, ${step.location[1]})` : "";
		const description = move ? `Go to move #${move} ${location}` : "Go to game start";
		const currentClassAttr = move === currentMove ? "" : "border rounded bg-zinc-100";
		const currentDescription = move === currentMove ? `You are at move #${move} ${location}` : null;
		return (
			<li className={`${currentClassAttr}`} key={move}>
				<button onClick={() => jumpTo(move, step.location)} className="w-full h-full p-2 text-left">
					{currentDescription || description}
				</button>
			</li>
		);
	});

	const sortedMoves = isAscending ? moves : moves.slice().reverse();

	return (
		<div className="flex justify-center gap-8 py-48">
			<div className="">
				<Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} markedSquare={markedSquare} />
			</div>
			<div className="flex flex-col gap-4 items-center">
				<button className={`min-w-40 border p-2 rounded ${!isAscending ? "bg-green-400" : "bg-red-400"}`} onClick={() => setIsAscending(!isAscending)}>
					{isAscending ? "Sort Descending" : "Sort Ascending"}
				</button>
				<ol className="flex flex-col gap-1">{sortedMoves}</ol>
			</div>
		</div>
	);
}

function calculateWinner(squares) {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			return { winner: squares[a], line: lines[i] };
		}
	}
	return null;
}
