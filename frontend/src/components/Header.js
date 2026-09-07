import React from 'react'
import { Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap'
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap'
import SearchBox from './SearchBox'
import { logout } from '../actions/userActions'

const Header = () => {
	const dispatch = useDispatch()

	// useSelector is to grab what we want from the state
	const userLogin = useSelector((state) => state.userLogin)
	const { userInfo } = userLogin

	const logoutHandler = () => {
		dispatch(logout())
	}
	const location = useLocation();
	const noSearchRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-pin'];
	const isNoSearchRoute = noSearchRoutes.includes(location.pathname);
	return (
		<header>
			<Navbar
				className='text-uppercase'
				bg='primary'
				variant='dark'
				expand='lg'
				collapseOnSelect
			>
				<Container>
					{/* Home */}
					<LinkContainer to='/'>
						<Navbar.Brand>E-Commerce</Navbar.Brand>
					</LinkContainer>
					<Navbar.Toggle aria-controls='basic-navbar-nav' />
            		<Navbar.Collapse id='basic-navbar-nav'>
                		{/* Vérifiez si l'utilisateur n'est pas sur une des pages exclues */}
                		{!noSearchRoutes.includes(location.pathname) && (
                    	<Route render={({ history }) => <SearchBox history={history} />} />
                		)}
                		<Nav className='ml-auto'>
							{/* Cart */}
							{!isNoSearchRoute && (
                        		<LinkContainer to='/cart'>
                            		<Nav.Link>
                                		<i className='fas fa-shopping-cart'></i> Cart
                            		</Nav.Link>
                        		</LinkContainer>
                    		)}
							{userInfo ? (
								<NavDropdown title={userInfo.name} id='username'>
									<LinkContainer to='/profile'>
										<NavDropdown.Item>Profile</NavDropdown.Item>
									</LinkContainer>
									{/* Logout */}
									<NavDropdown.Item onClick={logoutHandler}>
										Logout
									</NavDropdown.Item>
								</NavDropdown>
							) : (
								// Login
								<LinkContainer to='/login'>
									<Nav.Link>
										<i className='fas fa-user'></i> Sign In
									</Nav.Link>
								</LinkContainer>
							)}
							{userInfo && userInfo.isAdmin && (
								<NavDropdown title='Admin' id='adminmenu'>
									<LinkContainer to='/admin/userlist'>
										<NavDropdown.Item>Users</NavDropdown.Item>
									</LinkContainer>
									<LinkContainer to='/admin/productlist'>
										<NavDropdown.Item>Products</NavDropdown.Item>
									</LinkContainer>
									<LinkContainer to='/admin/orderlist'>
										<NavDropdown.Item>Orders</NavDropdown.Item>
									</LinkContainer>
								</NavDropdown>
							)}
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>
		</header>
	)
}

export default Header
