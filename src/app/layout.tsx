import type { Metadata } from 'next'
import './globals.css'
import { PropsWithChildren } from 'react'

export const metadata: Metadata = {
	title: 'Church Cleaning',
	description: 'Church cleaning made easier',
}

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
	return (
		<html lang="en">
			<head>
				<title>Church Cleaning</title>
				<link rel="icon" href="/favicon.ico" />
			</head>
			<body>{children}</body>
		</html>
	)
}
