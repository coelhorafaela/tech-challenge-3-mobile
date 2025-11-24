import { ROUTE_PROTECTED_HOME } from "@/src/constants/routes";
import { useAuth } from "@/src/hooks";
import { LoadingScreen, Toast } from "@/src/presentation";
import { validateLoginForm, validateRegisterForm } from "@/src/presentation/utils/validation";
import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";

export function LoginScreen() {
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

  useEffect(() => {
    if (!loading) {
      setAuthResolved(true);
    }
  }, [loading]);

  const shouldShowInitialLoader = useMemo(
    () => !authResolved && loading,
    [authResolved, loading]
  );

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
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      showToast(validation.message!, "error");
      return;
    }

    try {
      const result = await login(email, password, rememberMe);

      if (result.success) {
        showToast("Login realizado com sucesso!", "success");
      } else {
        showToast(result.error || "Erro ao fazer login", "error");
      }
    } catch {
      showToast("Erro inesperado. Tente novamente.", "error");
    }
  };

  const handleRegister = async () => {
    const validation = validateRegisterForm(name, email, password, confirmPassword);
    if (!validation.isValid) {
      showToast(validation.message!, "error");
      return;
    }

    try {
      const result = await register(email, password, name);

      if (result.success) {
        showToast("Conta criada com sucesso!", "success");
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
      <>
        <StatusBar style="light" />
        <LoadingScreen backgroundColor="#294FC1" color="#ffffff" />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
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
                  style={[
                    styles.tabText,
                    activeTab === "login" && styles.activeTabText,
                  ]}
                >
                  Entrar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === "register" && styles.activeTab]}
                onPress={() => handleTabChange("register")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "register" && styles.activeTabText,
                  ]}
                >
                  Cadastre-se
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === "login" ? (
              <LoginForm
                email={email}
                password={password}
                rememberMe={rememberMe}
                showPassword={showPassword}
                loading={loading}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onRememberMeChange={setRememberMe}
                onShowPasswordToggle={() => setShowPassword(!showPassword)}
                onSubmit={handleLogin}
              />
            ) : (
              <RegisterForm
                name={name}
                email={email}
                password={password}
                confirmPassword={confirmPassword}
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                loading={loading}
                onNameChange={setName}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onShowPasswordToggle={() => setShowPassword(!showPassword)}
                onShowConfirmPasswordToggle={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                onSubmit={handleRegister}
              />
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
});

