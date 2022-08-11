import { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import Header from '../components/Header';
import Investment from "../components/Investment"
import Investments from "../components/Investments"


function InvestmentsPage() {
	const [investments, setInvestments] = useState([])
	const [reports, setReports] = useState([])

	useEffect(() => {
		const fetchAll = async () => {
			const investmentsFromServer = await getInvestments()
			const reportsFromServer = await getReports()

			const newReports = reorderReports(reportsFromServer)
			setReports(newReports)

			const newInvestments = mapInvestments(investmentsFromServer, reportsFromServer)
			setInvestments(newInvestments)
		}
		fetchAll()
	}, [])

	const getInvestments = async () => {
		const response = await fetch('http://localhost:3003/investments')
		const data = await response.json()
		return data
	}
	const getReports = async () => {
		const response = await fetch('http://localhost:3003/reports')
		const data = await response.json()
		return data
	}

	const isWhatPercentOf = (a, b) => ((a - b) / b) * 100
	const isYielded = (a, b) => a > b ? true : false
	const sortByMonth = (a, b) => a.month - b.month
	const sortByInvestmentId = (a, b) => a.investmentId.localeCompare(b.investmentId)

	const reorderReports = unorderedReports => {
		const newUnorderedReports = [...unorderedReports]
		const reorderedReports = newUnorderedReports.sort(sortByMonth).sort(sortByInvestmentId)

		return reorderedReports.map(report => {
			if (report.month !== 1) {
				const lastMonth = reorderedReports.find(
					findReport => findReport.investmentId === report.investmentId &&
						findReport.month === report.month - 1)
				const percentOfLastMonth = isWhatPercentOf(report.value, lastMonth.value).toFixed(2)
				const yielded = isYielded(report.value, lastMonth.value)

				return { ...report, lastValue: lastMonth.value, percent: percentOfLastMonth, yielded }
			}
			return report
		})
	}

	const mapInvestments = (investmentsData, reportsData) => {
		const newMappedInvestments = investmentsData.map(investment => {
			const filteredReports = reportsData.filter(report => investment.id === report.investmentId &&
				(report.month === 1 || report.month === 12));
			filteredReports.sort(sortByMonth)
			const total = filteredReports.reduce((acc, obj) => obj.value - acc, 0).toFixed(2)
			const percentOfYear = isWhatPercentOf(filteredReports[1].value, filteredReports[0].value).toFixed(2)
			const yielded = isYielded(filteredReports[1].value, filteredReports[0].value)

			return { ...investment, total, percent: percentOfYear, yielded }
		})
		return newMappedInvestments
	}

	return (
		<>
			<Header />

			<div className='container py-4'>
				{investments.map(investment => {
					return (
						<Investments key={investment.id}>
							<h3 className='text-center'>{investment.description}</h3>
							<div className='text-center my-3'>
								Rendimento total:{' '}
								<span className={`${investment.yielded ? 'text-success' : 'text-danger'}`}>
									<strong>R$ {investment.total} ({investment.percent}%)</strong>
								</span>
							</div>
							<Table hover>
								<thead>
									<tr>
										<th>Mês/Ano</th>
										<th>Valor</th>
										<th className='text-end'>Percentual</th>
									</tr>
								</thead>
								<tbody>
									{reports
										.filter(report => report.investmentId === investment.id)
										.map(report => {
											return <Investment key={report.id}>{report}</Investment>
										})}
								</tbody>
							</Table>
						</Investments>

					)
				})}

			</div>
		</>
	)
}

export default InvestmentsPage