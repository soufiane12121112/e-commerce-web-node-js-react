import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { FaEye, FaEyeSlash } from 'react-icons/fa' // Import eye icons
import Message from '../components/Message'
import Loader from '../components/Loader'
import FormContainer from '../components/FormContainer'
import { login } from '../actions/userActions'

const LoginScreen = ({ location, history }) => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [passwordVisible, setPasswordVisible] = useState(false) // State for password visibility

	const dispatch = useDispatch()

	const userLogin = useSelector((state) => state.userLogin)
	const { loading, error, userInfo } = userLogin

	const redirect = location.search ? location.search.split('=')[1] : '/'

	useEffect(() => {
		if (userInfo) {
			history.push(redirect)
		}
	}, [history, userInfo, redirect])

	const submitHandler = (e) => {
		e.preventDefault()
		dispatch(login(email, password))
	}

	// Toggle password visibility
	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible)
	}

	return (
		<FormContainer>
			<h1>Sign In</h1>
			{error && <Message variant='danger'>{error}</Message>}
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

				<Form.Group controlId="password">
  					<Form.Label>Password</Form.Label>
  					<div style={{ position: 'relative' }}>
    					<Form.Control
     					 	type={passwordVisible ? 'text' : 'password'}
      						placeholder="Enter password"
      						value={password}
      						onChange={(e) => setPassword(e.target.value)}
    					/>
    					<span
      						style={{
        					position: 'absolute',
        					top: '50%',
        					right: '10px',
        					transform: 'translateY(-50%)',
        					cursor: 'pointer',
      						}}
      						onClick={togglePasswordVisibility}
    					>
      					{passwordVisible ? <FaEyeSlash /> : <FaEye />}
    					</span>
  					</div>
				</Form.Group>

				<Button type='submit' variant='primary'>
					Sign In
				</Button>
			</Form>

			{/* Forgot Password Link */}
			<Row className='py-3'>
				<Col>
					<Link to='/forgot-password'>Forgot Password?</Link>
				</Col>
			</Row>

			{/* Register Link */}
			<Row className='py-3'>
				<Col>
					New Customer?{' '}
					<Link to={redirect ? `/register?redirect=${redirect}` : '/register'}>
						Register
					</Link>
				</Col>
			</Row>
		</FormContainer>
	)
}

export default LoginScreen
