document.addEventListener("DOMContentLoaded", () => {
	const USERS_KEY = "scoutpro_users_v1";
	const SESSION_KEY = "scoutpro_session_v1";

	function getUsers() {
		try {
			const raw = localStorage.getItem(USERS_KEY);
			const parsed = raw ? JSON.parse(raw) : [];
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}

	function saveUsers(users) {
		localStorage.setItem(USERS_KEY, JSON.stringify(users));
	}

	function getSession() {
		const raw = localStorage.getItem(SESSION_KEY);
		return raw ? raw : "";
	}

	function setSession(email) {
		localStorage.setItem(SESSION_KEY, email);
	}

	function clearSession() {
		localStorage.removeItem(SESSION_KEY);
	}

	function isValidEmail(email) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	const isLoginPage = document.body.classList.contains("page-portada");
	const isHomePage = document.body.classList.contains("page-portada-home");
	const currentPage = (window.location.pathname.split("/").pop() || "").toLowerCase();
	const protectedPages = ["portada.html", "dashboard.html", "scatterplot.html", "ficha_individual.html"];
	const isProtectedPage = protectedPages.includes(currentPage);

	const btnCerrarSesion = document.getElementById("btnCerrarSesion");
	btnCerrarSesion?.addEventListener("click", event => {
		event.preventDefault();
		clearSession();
		window.location.href = "index.html";
	});

	if (isProtectedPage && !getSession()) {
		window.location.href = "index.html";
		return;
	}

	if (isLoginPage) {
		const authForm = document.getElementById("authForm");
		const emailInput = document.getElementById("email");
		const passwordInput = document.getElementById("password");
		const authTitulo = document.getElementById("authTitulo");
		const authSubtitulo = document.getElementById("authSubtitulo");
		const authMensaje = document.getElementById("authMensaje");
		const btnAuth = document.getElementById("btnAuth");
		const linkAlternarModo = document.getElementById("linkAlternarModo");
		const textoAlternarModo = document.getElementById("textoAlternarModo");
		const bloqueOlvidePassword = document.getElementById("bloqueOlvidePassword");
		const linkOlvidePassword = document.getElementById("linkOlvidePassword");

		if (!authForm || !emailInput || !passwordInput) {
			return;
		}

		let modo = "login";

		const existingSession = getSession();
		if (existingSession) {
			window.location.href = "portada.html";
			return;
		}

		function mostrarMensaje(texto, esError = true) {
			if (!authMensaje) return;
			authMensaje.textContent = texto;
			authMensaje.classList.toggle("is-error", esError);
			authMensaje.classList.toggle("is-success", !esError);
			authMensaje.hidden = false;
		}

		function actualizarModo() {
			if (modo === "login") {
				if (authTitulo) authTitulo.textContent = "Iniciar Sesión";
				if (authSubtitulo) authSubtitulo.textContent = "Por favor ingresa tus credenciales";
				if (btnAuth) btnAuth.textContent = "Entrar";
				if (textoAlternarModo && linkAlternarModo) {
					textoAlternarModo.firstChild.textContent = "¿No tienes cuenta? ";
					linkAlternarModo.textContent = "Créate una";
				}
				if (bloqueOlvidePassword) bloqueOlvidePassword.hidden = false;
			} else {
				if (authTitulo) authTitulo.textContent = "Crear Cuenta";
				if (authSubtitulo) authSubtitulo.textContent = "Regístrate con tu correo y contraseña";
				if (btnAuth) btnAuth.textContent = "Registrarme";
				if (textoAlternarModo && linkAlternarModo) {
					textoAlternarModo.firstChild.textContent = "¿Ya tienes cuenta? ";
					linkAlternarModo.textContent = "Inicia sesión";
				}
				if (bloqueOlvidePassword) bloqueOlvidePassword.hidden = true;
			}

			if (authMensaje) {
				authMensaje.hidden = true;
			}
		}

		linkAlternarModo?.addEventListener("click", event => {
			event.preventDefault();
			modo = modo === "login" ? "registro" : "login";
			actualizarModo();
		});

		linkOlvidePassword?.addEventListener("click", event => {
			event.preventDefault();
			mostrarMensaje("Contacta al administrador para recuperar tu contraseña.", false);
		});

		authForm.addEventListener("submit", event => {
			event.preventDefault();

			const email = String(emailInput.value || "").trim().toLowerCase();
			const password = String(passwordInput.value || "").trim();

			if (!email || !password) {
				mostrarMensaje("Debes completar email y contraseña.");
				return;
			}

			if (!isValidEmail(email)) {
				mostrarMensaje("Ingresa un correo válido.");
				return;
			}

			if (password.length < 6) {
				mostrarMensaje("La contraseña debe tener al menos 6 caracteres.");
				return;
			}

			const users = getUsers();
			const userIndex = users.findIndex(user => user.email === email);

			if (modo === "registro") {
				if (userIndex !== -1) {
					mostrarMensaje("Ese correo ya está registrado.");
					return;
				}

				users.push({ email, password });
				saveUsers(users);
				setSession(email);
				window.location.href = "portada.html";
				return;
			}

			if (userIndex === -1) {
				mostrarMensaje("No existe una cuenta con ese correo.");
				return;
			}

			if (users[userIndex].password !== password) {
				mostrarMensaje("Contraseña incorrecta.");
				return;
			}

			setSession(email);
			window.location.href = "portada.html";
		});

		actualizarModo();
		return;
	}

	if (isHomePage) {
		const sessionEmail = getSession();
		if (!sessionEmail) {
			window.location.href = "index.html";
			return;
		}

		const usuarioActivo = document.getElementById("usuarioActivo");

		if (usuarioActivo) {
			usuarioActivo.textContent = sessionEmail;
		}
	}
});
