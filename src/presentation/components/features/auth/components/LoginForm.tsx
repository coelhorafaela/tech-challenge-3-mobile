import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

interface LoginFormProps {
  email: string;
  password: string;
  rememberMe: boolean;
  showPassword: boolean;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onRememberMeChange: (remember: boolean) => void;
  onShowPasswordToggle: () => void;
  onSubmit: () => void;
}

export function LoginForm({
  email,
  password,
  rememberMe,
  showPassword,
  loading,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onShowPasswordToggle,
  onSubmit,
}: LoginFormProps) {
  return (
    <View style={styles.form}>
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

      <View style={styles.assistCard}>
        <View style={styles.assistRow}>
          <Switch
            value={rememberMe}
            onValueChange={onRememberMeChange}
            trackColor={{ false: "#D7DCE6", true: "#C3CEF9" }}
            thumbColor={rememberMe ? "#294FC1" : "#ffffff"}
          />
          <View style={styles.assistInfo}>
            <Text style={styles.assistTitle}>Lembrar deste dispositivo</Text>
            <Text style={styles.assistDescription}>
              Mantém sua sessão ativa neste aparelho.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.assistLink}>
          <Ionicons name="help-circle-outline" size={18} color="#294FC1" />
          <Text style={styles.assistLinkText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? "Entrando..." : "Entrar"}
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
  assistCard: {
    backgroundColor: "#EEF1FB",
    borderRadius: 18,
    padding: 16,
    gap: 14,
  },
  assistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  assistInfo: {
    flex: 1,
    gap: 4,
  },
  assistTitle: {
    color: "#101142",
    fontSize: 14,
    fontWeight: "600",
  },
  assistDescription: {
    color: "#6B6F80",
    fontSize: 12,
    lineHeight: 16,
  },
  assistLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  assistLinkText: {
    color: "#294FC1",
    fontSize: 14,
    fontWeight: "600",
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

