<?php
/* ═══════════════════════════════════════════════════════
   CYNTIA SIEM — api/faq-question.php
   Recibe preguntas del formulario FAQ y envía confirmación
   
   Endpoint: POST /api/faq-question.php
   Body JSON: { name, email, question }
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

$name     = trim($input['name'] ?? '');
$email    = trim($input['email'] ?? '');
$question = trim($input['question'] ?? '');

// ─── Validación ───────────────────────────────────────
if (empty($name) || empty($email) || empty($question)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
    exit;
}

if (strlen($name) > 40) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El nombre es demasiado largo (máx. 40 caracteres)']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email no válido']);
    exit;
}

if (strlen($question) > 2000) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La pregunta es demasiado larga (máx. 2000 caracteres)']);
    exit;
}

// ─── Sanitización ─────────────────────────────────────
$name     = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$email    = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$question = htmlspecialchars($question, ENT_QUOTES, 'UTF-8');

// ─── Guardar en base de datos (MySQL) ─────────────────
// TODO: Conectar a MySQL cuando esté disponible
/*
try {
    $pdo = new PDO('mysql:host=localhost;dbname=cyntia;charset=utf8mb4', 'cyntia_user', 'PASSWORD');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $pdo->prepare('INSERT INTO faq_questions (name, email, question, created_at) VALUES (?, ?, ?, NOW())');
    $stmt->execute([$name, $email, $question]);
} catch (PDOException $e) {
    error_log('[Cyntia FAQ] DB Error: ' . $e->getMessage());
}
*/

// ─── Enviar email de confirmación al usuario ──────────
$userSubject = 'Cyntia — Hemos recibido tu pregunta';
$userBody = "
<html>
<head><meta charset='utf-8'></head>
<body style='font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;'>
    <div style='background: #0D0F18; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;'>
        <h1 style='color: #E8EAF5; font-size: 1.4rem; margin: 0;'>Cyntia SIEM</h1>
        <p style='color: #7EC8D8; font-size: 0.85rem; margin: 4px 0 0;'>Plataforma SOC/SIEM para PYMEs</p>
    </div>
    <div style='background: #1A1E2E; padding: 28px; color: #E8EAF5;'>
        <h2 style='font-size: 1.1rem; margin-top: 0;'>Hola {$name},</h2>
        <p style='font-size: 0.9rem; line-height: 1.6; color: #8A91B8;'>
            Hemos recibido tu pregunta correctamente. Nuestro equipo la revisará y te responderemos lo antes posible.
        </p>
        <div style='background: #21263A; border: 1px solid rgba(126,200,216,0.15); border-radius: 8px; padding: 16px; margin: 20px 0;'>
            <p style='font-size: 0.8rem; color: #8A91B8; margin: 0 0 4px;'>Tu pregunta:</p>
            <p style='font-size: 0.9rem; color: #E8EAF5; margin: 0; line-height: 1.5;'>{$question}</p>
        </div>
        <p style='font-size: 0.85rem; color: #8A91B8; line-height: 1.6;'>
            Si necesitas algo urgente, también puedes solicitar una demo desde nuestro portal.
        </p>
    </div>
    <div style='background: #111420; padding: 16px; border-radius: 0 0 12px 12px; text-align: center;'>
        <p style='font-size: 0.7rem; color: #454D70; margin: 0;'>© 2025 Cyntia · Trabajo de Final de Grado</p>
    </div>
</body>
</html>";

$userHeaders  = "MIME-Version: 1.0\r\n";
$userHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";
$userHeaders .= "From: Cyntia SIEM <noreply@cyntia.local>\r\n";

// Enviar al usuario
$emailSent = @mail($email, $userSubject, $userBody, $userHeaders);

// ─── Notificar al equipo Cyntia ───────────────────────
$teamEmail   = 'soporte@cyntia.local'; // Cambiar por email real del equipo
$teamSubject = "[FAQ] Nueva pregunta de {$name}";
$teamBody    = "Nombre: {$name}\nEmail: {$email}\n\nPregunta:\n{$question}\n\nFecha: " . date('Y-m-d H:i:s');
$teamHeaders = "From: Cyntia Portal <noreply@cyntia.local>\r\n";

@mail($teamEmail, $teamSubject, $teamBody, $teamHeaders);

// ─── Log ──────────────────────────────────────────────
error_log("[Cyntia FAQ] Question from {$name} ({$email}): " . substr($question, 0, 100));

// ─── Respuesta ────────────────────────────────────────
echo json_encode([
    'success'    => true,
    'message'    => 'Pregunta recibida. Hemos enviado un email de confirmación.',
    'email_sent' => $emailSent
]);
