<?php
/* ═══════════════════════════════════════════════════════
   CYNTIA SIEM — reset-password.php
   Página donde el usuario establece su nueva contraseña
   
   URL: /reset-password.php?token=xxx&email=xxx
   POST: { token, email, password, password_confirm }
═══════════════════════════════════════════════════════ */

$token = $_GET['token'] ?? '';
$email = $_GET['email'] ?? '';
$error   = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token            = $_POST['token'] ?? '';
    $email            = $_POST['email'] ?? '';
    $password         = $_POST['password'] ?? '';
    $passwordConfirm  = $_POST['password_confirm'] ?? '';

    // Validaciones
    if (empty($token) || empty($email)) {
        $error = 'Enlace de recuperación inválido o expirado.';
    } elseif (empty($password) || strlen($password) < 8) {
        $error = 'La contraseña debe tener al menos 8 caracteres.';
    } elseif ($password !== $passwordConfirm) {
        $error = 'Las contraseñas no coinciden.';
    } else {
        // TODO: Conectar a MySQL cuando esté disponible
        /*
        try {
            $pdo = new PDO('mysql:host=localhost;dbname=cyntia;charset=utf8mb4', 'cyntia_user', 'PASSWORD');
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Verificar token válido y no expirado
            $stmt = $pdo->prepare('
                SELECT pr.user_id 
                FROM password_resets pr 
                JOIN users u ON u.id = pr.user_id 
                WHERE u.email = ? 
                AND pr.token = ? 
                AND pr.used = 0 
                AND pr.expires_at > NOW()
                LIMIT 1
            ');
            $stmt->execute([$email, hash('sha256', $token)]);
            $reset = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$reset) {
                $error = 'Enlace de recuperación inválido o expirado. Solicita uno nuevo.';
            } else {
                // Actualizar contraseña
                $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
                $stmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
                $stmt->execute([$hashedPassword, $reset['user_id']]);
                
                // Marcar token como usado
                $stmt = $pdo->prepare('UPDATE password_resets SET used = 1 WHERE user_id = ? AND token = ?');
                $stmt->execute([$reset['user_id'], hash('sha256', $token)]);
                
                $success = true;
            }
        } catch (PDOException $e) {
            error_log('[Cyntia Auth] Reset error: ' . $e->getMessage());
            $error = 'Error interno. Inténtalo de nuevo más tarde.';
        }
        */
        
        // Para prototipo: siempre éxito
        $success = true;
        error_log("[Cyntia Auth] Password reset completed for: {$email}");
    }
}
?>
<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer contraseña — Cyntia SIEM</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        .reset-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 5%; position: relative; z-index: 1; }
        .reset-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 40px 36px; width: 100%; max-width: 420px; box-shadow: var(--shadow-lg); }
        .reset-card .auth-logo { display: flex; align-items: center; gap: 10px; font-size: 1.2rem; font-weight: 800; margin-bottom: 24px; }
        .reset-card h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 6px; }
        .reset-card .sub { font-size: 0.85rem; color: var(--text-dim); margin-bottom: 24px; }
        .reset-success { text-align: center; padding: 20px 0; }
        .reset-success-icon { width: 56px; height: 56px; background: rgba(115,191,105,0.12); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .reset-success h3 { font-size: 1.1rem; font-weight: 700; color: #73BF69; margin-bottom: 8px; }
        .reset-success p { font-size: 0.85rem; color: var(--text-dim); line-height: 1.6; margin-bottom: 20px; }
        .reset-error { background: rgba(242,73,92,0.1); border: 1px solid rgba(242,73,92,0.3); border-radius: var(--radius); padding: 10px 14px; font-size: 0.8rem; color: #F2495C; margin-bottom: 16px; }
    </style>
</head>
<body>
<main class="reset-page">
    <div class="reset-card">
        <div class="auth-logo">
            <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
                <path d="M75 50 A30 30 0 1 1 50 20" stroke="var(--crimson-light)" stroke-width="12" stroke-linecap="round" fill="none"/>
                <path d="M75 50 A25 25 0 1 1 50 25" stroke="var(--blue)" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.7"/>
                <circle cx="50" cy="50" r="6" fill="var(--gold)"/>
            </svg>
            <span>Cynt<span class="logo-ia">ia</span></span>
        </div>

        <?php if ($success): ?>
            <div class="reset-success">
                <div class="reset-success-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#73BF69" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3>Contraseña restablecida</h3>
                <p>Tu contraseña se ha actualizado correctamente. Ya puedes iniciar sesión con tu nueva contraseña.</p>
                <a href="index.html" class="btn btn-primary btn-full">Ir al inicio de sesión</a>
            </div>

        <?php else: ?>
            <h2>Nueva contraseña</h2>
            <p class="sub">Introduce tu nueva contraseña para la cuenta <?= htmlspecialchars($email) ?></p>

            <?php if ($error): ?>
                <div class="reset-error"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>

            <?php if (empty($token) || empty($email)): ?>
                <div class="reset-error">Enlace de recuperación inválido. Solicita uno nuevo desde el inicio de sesión.</div>
                <a href="index.html" class="btn btn-ghost btn-full" style="margin-top: 16px;">Volver al inicio</a>
            <?php else: ?>
                <form method="POST" novalidate>
                    <input type="hidden" name="token" value="<?= htmlspecialchars($token) ?>">
                    <input type="hidden" name="email" value="<?= htmlspecialchars($email) ?>">
                    <div class="form-group">
                        <label for="password">Nueva contraseña</label>
                        <input type="password" id="password" name="password" placeholder="Mín. 8 caracteres" required>
                    </div>
                    <div class="form-group">
                        <label for="password_confirm">Confirmar contraseña</label>
                        <input type="password" id="password_confirm" name="password_confirm" placeholder="Repite la contraseña" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-full">Restablecer contraseña</button>
                </form>
            <?php endif; ?>
        <?php endif; ?>
    </div>
</main>

<script>
(function() {
    const root = document.documentElement;
    const saved = localStorage.getItem('cyntia-theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', saved || (systemDark ? 'dark' : 'light'));
})();
</script>
</body>
</html>
