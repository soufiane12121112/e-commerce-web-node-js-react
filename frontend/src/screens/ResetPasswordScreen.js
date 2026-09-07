import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import FormContainer from '../components/FormContainer';
import Message from '../components/Message';
import Loader from '../components/Loader';

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const history = useHistory();

  const token = localStorage.getItem("resetToken"); // Récupérer le token stocké

  useEffect(() => {
    if (!token) {
      history.push('/forgot-password'); // Rediriger si pas de token
    }
  }, [token, history]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!password || !confirmPassword) {
      setMessage("Veuillez remplir tous les champs.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`/api/users/reset-password/${token}`, { password });
      setSuccess(true);
      setMessage('Mot de passe réinitialisé avec succès.');
      localStorage.removeItem("resetToken"); // Supprimer le token après utilisation
      setTimeout(() => {
        history.push('/login');
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data.message || 'Erreur lors de la réinitialisation.');
    }

    setLoading(false);
  };

  return (
    <FormContainer>
      <h1>Réinitialisation du Mot de Passe</h1>
      {message && <Message variant={success ? 'success' : 'danger'}>{message}</Message>}
      {loading && <Loader />}

      <Form onSubmit={submitHandler}>
        {/* Champ du nouveau mot de passe */}
        <Form.Group controlId='password'>
          <Form.Label>Nouveau mot de passe</Form.Label>
          <Form.Control
            type='password'
            placeholder='Nouveau mot de passe'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        {/* Champ de confirmation du mot de passe */}
        <Form.Group controlId='confirmPassword'>
          <Form.Label>Confirmez le mot de passe</Form.Label>
          <Form.Control
            type='password'
            placeholder='Confirmez le mot de passe'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>

        {/* Boutons */}
        <Button type='submit' variant='primary' className='mt-3' disabled={loading}>
          Réinitialiser le mot de passe
        </Button>
      </Form>
    </FormContainer>
  );
};

export default ResetPasswordScreen;
