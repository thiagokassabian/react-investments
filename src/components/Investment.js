function Investment({ children }) {
	const { id, month, value, year, lastValue, yielded, percent } = children

	const yieldClass = month != 1 ? yielded ? 'text-success' : 'text-danger' : ''

	const months = {
		jan: 1,
		fev: 2,
		mar: 3,
		abr: 4,
		mai: 5,
		jun: 6,
		jul: 7,
		ago: 8,
		set: 9,
		out: 10,
		nov: 11,
		dez: 12,
	}

	function getKeyByValue(object, value) {
		return Object.keys(object).find(key => object[key] === value);
	}

	return (
		<tr className={`${yieldClass}`}>
			<td>{getKeyByValue(months, month)}/{year}</td>
			<td>R$ {value.toFixed(2)}</td>
			<td className="text-end">{percent ? percent : 0}%</td>
		</tr>
	)
}

export default Investment