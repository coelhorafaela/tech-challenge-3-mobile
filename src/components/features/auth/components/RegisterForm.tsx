import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface RegisterFormProps {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  loading: boolean;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  onShowPasswordToggle: () => void;
  onShowConfirmPasswordToggle: () => void;
  onSubmit: () => void;
}

export function RegisterForm({
  name,
  email,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  loading,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onShowPasswordToggle,
  onShowConfirmPasswordToggle,
  onSubmit,
}: RegisterFormProps) {
  return (
    <View style={styles.form}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nome completo</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#6B6F80" />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={onNameChange}
            placeholder="Digite seu nome"
            autoCapitalize="words"
            autoCorrect={false}
            placeholderTextColor="#9AA0B1"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>E-mail</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#6B6F80" />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={onEmailChange}
            placeholder="Digite seu email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#9AA0B1"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#6B6F80" />
          <TextInput
            style={[
              styles.input,
              {
                fontSize: password.length > 0 ? 22 : 16,
                letterSpacing: password.length > 0 ? 4 : 0,
              },
            ]}
            value={password}
            onChangeText={onPasswordChange}
            placeholder="Digite sua senha"
            secureTextEntry={!showPassword}
            placeholderTextColor="#9AA0B1"
          />
          <TouchableOpacity onPress={onShowPasswordToggle}>
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#6B6F80"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirmar senha</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#6B6F80" />
          <TextInput
            style={[
              styles.input,
              {
                fontSize: confirmPassword.length > 0 ? 22 : 16,
                letterSpacing: confirmPassword.length > 0 ? 4 : 0,
              },
            ]}
            value={confirmPassword}
            onChangeText={onConfirmPasswordChange}
            placeholder="Confirme sua senha"
            secureTextEntry={!showConfirmPassword}
            placeholderTextColor="#9AA0B1"
          />
          <TouchableOpacity onPress={onShowConfirmPasswordToggle}>
            <Ionicons
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#6B6F80"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? "Criando conta..." : "Cadastrar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: "#101142",
    fontSize: 14,
    fontWeight: "600",
  },
  inputContainer: {
    backgroundColor: "#F7F9FC",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E1E8F0",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#101142",
  },
  primaryButton: {
    backgroundColor: "#294FC1",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#7D8AE6",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

