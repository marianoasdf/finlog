import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Button, StyleSheet } from 'react-native';


type Props = {
  onLoginSuccess?: () => void;
};

export default function LoginRegisterScreen(props: Props) {
  // Guarda el JWT si viene en la URL (?jwt=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const jwt = params.get('jwt');
      if (jwt) {
        // Detecta si es web o mobile
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('token', jwt);
        } else {
          AsyncStorage.setItem('token', jwt);
        }
        // Limpia la query string
        window.history.replaceState({}, '', window.location.pathname);
        if (typeof props.onLoginSuccess === 'function') props.onLoginSuccess();
      }
    }
  }, [props.onLoginSuccess]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <Button
        title="Entrar con Google"
        onPress={() => {
          const apiUrl = process.env.EXPO_PUBLIC_API_URL
            ? process.env.EXPO_PUBLIC_API_URL + '/api/auth/google'
            : 'https://finlog-7cfz.onrender.com/api/auth/google';
          window.location.href = apiUrl;
        }}
        color="#4285F4"
      />
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
