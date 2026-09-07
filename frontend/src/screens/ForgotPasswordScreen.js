import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import Message from '../components/Message'
import Loader from '../components/Loader'
import FormContainer from '../components/FormContainer'
import axios from 'axios'
import { useHistory } from 'react-router-dom'

const ForgotPasswordScreen = () => {
	const [email, setEmail] = useState('')
	const [message, setMessage] = useState(null)
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(false)
	const [pinSent, setPinSent] = useState(false) // Track if the PIN is sent
	const history = useHistory()

	const submitHandler = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			// Replace with your API endpoint for sending reset PIN email
			await axios.post('/api/users/forgot-password', { email })
			setSuccess(true)
			setMessage('A PIN has been sent to your email. Please verify it.')
			setPinSent(true)
		} catch (error) {
			setMessage(
				error.response && error.response.data.message
					? error.response.data.message
					: 'Something went wrong.'
			)
		}

		setLoading(false)
	}

	return (
		<FormContainer>
			<h1>Forgot Password</h1>
			{message && <Message variant={success ? 'success' : 'danger'}>{message}</Message>}
			{loading && <Loader />}
			<Form onSubmit={submitHandler}>
				<Form.Group controlId='email'>
					<Form.Label>Email Address</Form.Label>
					<Form.Control
						type='email'
						placeholder='Enter email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					></Form.Control>
				</Form.Group>
				<Button type='submit' variant='primary'>
					Send Reset PIN
				</Button>
			</Form>
			{/* If PIN is sent, redirect to the PIN verification page */}
			{pinSent && history.push('/verify-pin')}
		</FormContainer>
	)
}

export default ForgotPasswordScreen
