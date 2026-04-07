<?php
/* ═══════════════════════════════════════════════════════
   CYNTIA SIEM — api/forgot-password.php
   Genera token de recuperación y envía email con enlace
   
   Endpoint: POST /api/forgot-password.php
   Body JSON: { email }
   Response JSON: { success, message }
═══════════════════════════════════════════════════════ */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// ─── Recibir datos ────────────────────────────────────
$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');

// ─── Validación ───────────────────────────────────────
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email no válido']);
    exit;
}

// ─── Generar token de recuperación ────────────────────
$token     = bin2hex(random_bytes(32)); // 64 caracteres hex
$expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

// ─── Verificar si el email existe en la BD ────────────
// TODO: Conectar a MySQL cuando esté disponible
/*
try {
    $pdo = new PDO('mysql:host=localhost;dbname=cyntia;charset=utf8mb4', 'cyntia_user', 'PASSWORD');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Verificar que el email existe
    $stmt = $pdo->prepare('SELECT id, name FROM users WHERE email = ? AND active = 1 LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        // Por seguridad, NO revelamos si el email existe o no
        // Siempre devolvemos éxito para evitar enumeración de usuarios
        echo json_encode(['success' => true, 'message' => 'Si el email está registrado, recibirás un enlace de recuperación.']);
        exit;
    }
    
    // Invalidar tokens anteriores del mismo usuario
    $stmt = $pdo->prepare('UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0');
    $stmt->execute([$user['id']]);
    
    // Guardar nuevo token
    $stmt = $pdo->prepare('INSERT INTO password_resets (user_id, token, expires_at, created_at) VALUES (?, ?, ?, NOW())');
    $stmt->execute([$user['id'], hash('sha256', $token), $expiresAt]);
    
    $userName = $user['name'];
} catch (PDOException $e) {
    error_log('[Cyntia Auth] DB Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
    exit;
}
*/

// Para prototipo: simular usuario encontrado
$userName = 'Usuario';

// ─── Enviar email con enlace de recuperación ──────────
$resetUrl = "https://app.cyntia.local/reset-password.php?token={$token}&email=" . urlencode($email);

$subject = 'Cyntia — Restablece tu contraseña';
$body = "
<html>
<head><meta charset='utf-8'></head>
<body style='font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;'>
    <div style='background: #0D0F18; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;'>
        <h1 style='color: #E8EAF5; font-size: 1.4rem; margin: 0;'>Cyntia SIEM</h1>
        <p style='color: #7EC8D8; font-size: 0.85rem; margin: 4px 0 0;'>Recuperación de contraseña</p>
    </div>
    <div style='background: #1A1E2E; padding: 28px; color: #E8EAF5;'>
        <h2 style='font-size: 1.1rem; margin-top: 0;'>Hola {$userName},</h2>
        <p style='font-size: 0.9rem; line-height: 1.6; color: #8A91B8;'>
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Cyntia. 
            Haz clic en el botón para crear una nueva contraseña:
        </p>
        <div style='text-align: center; margin: 28px 0;'>
            <a href='{$resetUrl}' style='display: inline-block; background: #C02255; color: #fff; padding: 12px 32px; border-radius: 8px; font-weight: 700; font-size: 0.9rem; text-decoration: none;'>
                Restablecer contraseña
            </a>
        </div>
        <p style='font-size: 0.8rem; color: #8A91B8; line-height: 1.5;'>
            Este enlace expirará en <strong style='color: #E8EAF5;'>1 hora</strong>. Si no has solicitado este cambio, puedes ignorar este email de forma segura.
        </p>
        <div style='background: #21263A; border: 1px solid rgba(126,200,216,0.15); border-radius: 8px; padding: 12px; margin-top: 20px;'>
            <p style='font-size: 0.7rem; color: #454D70; margin: 0;'>
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <span style='color: #7EC8D8; word-break: break-all;'>{$resetUrl}</span>
            </p>
        </div>
    </div>
    <div style='background: #111420; padding: 16px; border-radius: 0 0 12px 12px; text-align: center;'>
        <p style='font-size: 0.7rem; color: #454D70; margin: 0;'>© 2025 Cyntia · Este email fue enviado automáticamente, no respondas a este mensaje.</p>
    </div>
</body>
</html>";

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: Cyntia SIEM <noreply@cyntia.local>\r\n";

$emailSent = @mail($email, $subject, $body, $headers);

// ─── Log ──────────────────────────────────────────────
error_log("[Cyntia Auth] Password reset requested for: {$email}");

// ─── Respuesta (siempre éxito por seguridad) ──────────
// Nunca revelamos si el email existe o no para evitar enumeración
echo json_encode([
    'success' => true,
    'message' => 'Si la dirección está registrada, recibirás un enlace para restablecer tu contraseña.'
]);
