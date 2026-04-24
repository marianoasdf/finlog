import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';

const API_URL = 'http://localhost:3001/auth'; // Cambia esto si usas IP LAN o producción

type Props = {
  onLoginSuccess?: () => void;
};

export default function LoginRegisterScreen({ onLoginSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
      <Text style={styles.title}>{mode === 'login' ? 'Iniciar sesión' : 'Registrarse'}</Text>
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
      <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')} style={styles.switch}>
        <Text style={styles.switchText}>
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </Text>
      </TouchableOpacity>
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
