import Toast from "@/src/components/ui/Toast";
import { ROUTE_PROTECTED_HOME } from "@/src/constants/routes";
import { useAuth } from "@/src/hooks/useAuth";
import { validateLoginForm, validateRegisterForm } from "@/src/utils/validation";
import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { login, register, loading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);

  // Estados para o Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  // Detect when the initial auth check completes so we can show the splash only once
  useEffect(() => {
    if (!loading) {
      setAuthResolved(true);
    }
  }, [loading]);

  // Memoize the loading state that should display the splash indicator (initial auth check only)
  const shouldShowInitialLoader = useMemo(() => !authResolved && loading, [authResolved, loading]);

  // Limpar campos ao trocar de aba
  const handleTabChange = (tab: "login" | "register") => {
    setActiveTab(tab);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleLogin = async () => {
    // Validar formulário
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      showToast(validation.message!, "error");
      return;
    }

    try {
      const result = await login(email, password, rememberMe);
      
      if (result.success) {
        showToast("Login realizado com sucesso!", "success");
        // A navegação ocorrerá automaticamente quando isAuthenticated mudar
      } else {
        showToast(result.error || "Erro ao fazer login", "error");
      }
    } catch {
      showToast("Erro inesperado. Tente novamente.", "error");
    }
  };

  const handleRegister = async () => {
    // Validar formulário
    const validation = validateRegisterForm(name, email, password, confirmPassword);
    if (!validation.isValid) {
      showToast(validation.message!, "error");
      return;
    }

    try {
      const result = await register(email, password, name);
      
      if (result.success) {
        showToast("Conta criada com sucesso!", "success");
        // A navegação ocorrerá automaticamente quando isAuthenticated mudar
      } else {
        showToast(result.error || "Erro ao criar conta", "error");
      }
    } catch {
      showToast("Erro inesperado. Tente novamente.", "error");
    }
  };

  if (isAuthenticated) {
    return <Redirect href={ROUTE_PROTECTED_HOME} />;
  }

  if (shouldShowInitialLoader) {
    return (
      <View style={styles.loaderContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onHide={hideToast}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <Ionicons name="wallet-outline" size={18} color="#294FC1" />
              <Text style={styles.heroBadgeText}>ByteBank</Text>
            </View>
            <Text style={styles.heroSubtitle}>
              Acompanhe saldos, organize cartões e faça novas transações em poucos toques.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === "login" && styles.activeTab]}
                onPress={() => handleTabChange("login")}
              >
                <Text
                  style={[styles.tabText, activeTab === "login" && styles.activeTabText]}
                >
                  Entrar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === "register" && styles.activeTab]}
                onPress={() => handleTabChange("register")}
              >
                <Text
                  style={[styles.tabText, activeTab === "register" && styles.activeTabText]}
                >
                  Cadastre-se
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === "login" ? (
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>E-mail</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#6B6F80" />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
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
                      onChangeText={setPassword}
                      placeholder="Digite sua senha"
                      secureTextEntry={!showPassword}
                      placeholderTextColor="#9AA0B1"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
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
                      onValueChange={setRememberMe}
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
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome completo</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#6B6F80" />
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
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
                      onChangeText={setEmail}
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
                      onChangeText={setPassword}
                      placeholder="Digite sua senha"
                      secureTextEntry={!showPassword}
                      placeholderTextColor="#9AA0B1"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
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
                      onChangeText={setConfirmPassword}
                      placeholder="Confirme sua senha"
                      secureTextEntry={!showConfirmPassword}
                      placeholderTextColor="#9AA0B1"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
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
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? "Criando conta..." : "Cadastrar"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 24,
    gap: 24,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 12,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#E8ECFF",
  },
  heroBadgeText: {
    color: "#294FC1",
    fontSize: 14,
    fontWeight: "600",
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B6F80",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 24,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#EEF1FB",
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#294FC1",
    shadowColor: "#294FC1",
    elevation: 3,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B6F80",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
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
  loaderContainer: {
    flex: 1,
    backgroundColor: "#294FC1",
    justifyContent: "center",
    alignItems: "center",
  },
});
