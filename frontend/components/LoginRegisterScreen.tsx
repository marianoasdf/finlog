import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as AuthSession from 'expo-auth-session';

const API_URL = 'http://localhost:3001/auth'; // Cambia esto si usas IP LAN o producción
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

type Props = {
  onLoginSuccess?: () => void;
};

export default function LoginRegisterScreen({ onLoginSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- LOGIN CON GOOGLE (usando AuthSession.useAuthRequest) ---
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri: AuthSession.makeRedirectUri(),
      responseType: 'id_token',
      scopes: ['openid', 'email', 'profile'],
      extraParams: { nonce: 'randomnonce' },
    },
    { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' }
  );

  React.useEffect(() => {
    const doGoogleLogin = async () => {
      if (response?.type === 'success' && response.params?.id_token) {
        try {
          const res = await fetch(`${API_URL}/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: response.params.id_token })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Error');
          Alert.alert('Login Google exitoso', `Bienvenido ${data.user.username}`);
          if (onLoginSuccess) onLoginSuccess();
        } catch (err: any) {
          Alert.alert('Error', err.message);
        }
      }
    };
    doGoogleLogin();
  }, [response]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let res;
      if (mode === 'register') {
        res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password })
        });
      } else {
        res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      if (mode === 'login') {
        Alert.alert('Login exitoso', `Bienvenido ${data.user.username}`);
        if (onLoginSuccess) onLoginSuccess();
        // Aquí puedes guardar el token y navegar a la app principal
      } else {
        Alert.alert('Registro exitoso', 'Ya puedes iniciar sesión');
        setMode('login');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>
      {/*
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {mode === 'register' && (
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={loading ? 'Cargando...' : (mode === 'login' ? 'Entrar' : 'Registrarse')} onPress={handleSubmit} disabled={loading} />
      <View style={{ marginVertical: 12 }} />
      <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')} style={styles.switch}>
        <Text style={styles.switchText}>
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </Text>
      </TouchableOpacity>
      */}
      <Button title="Entrar con Google" onPress={() => promptAsync()} color="#4285F4" disabled={!request} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  switch: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchText: {
    color: '#007bff',
    fontSize: 16,
  },
});
