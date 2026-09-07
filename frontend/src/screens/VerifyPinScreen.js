import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const VerifyPinScreen = () => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const history = useHistory();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!email || !pin) {
      setMessage('Veuillez remplir tous les champs.');
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post('/api/users/verify-pin', { email, pin });

      if (data.token) {
        localStorage.setItem("resetToken", data.token); // Stocke le token dans le localStorage
        setSuccess(true);
        setMessage('PIN validé avec succès ! Redirection en cours...');
        
        setTimeout(() => {
          history.push('/reset-password');
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data.message || 'Une erreur est survenue.');
    }

    setLoading(false);
  };

  return (
    <FormContainer>
      <h1>Vérification du Code PIN</h1>
      {message && <Message variant={success ? 'success' : 'danger'}>{message}</Message>}
      {loading && <Loader />}
      
      <Form onSubmit={submitHandler}>
        {/* Champ Email */}
        <Form.Group controlId='email'>
          <Form.Label>Adresse Email</Form.Label>
          <Form.Control
            type='email'
            placeholder='Entrez votre email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        {/* Champ PIN */}
        <Form.Group controlId='pin'>
          <Form.Label>Code PIN</Form.Label>
          <Form.Control
            type='text'
            placeholder='Entrez votre code PIN'
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </Form.Group>

        <Button type='submit' variant='primary' className='mt-3' disabled={loading}>
          Vérifier
        </Button>
      </Form>
    </FormContainer>
  );
};

export default VerifyPinScreen;
