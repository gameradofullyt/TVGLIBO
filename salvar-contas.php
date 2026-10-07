<?php
header('Content-Type: application/json');

// Arquivo que servirá como banco de dados
$arquivo_db = 'contas_db.json';

// Cria o arquivo na primeira execução se não existir
if (!file_exists($arquivo_db)) {
    file_put_contents($arquivo_db, json_encode([]));
}

$contas = json_decode(file_get_contents($arquivo_db), true);
$action = $_POST['action'] ?? '';

if ($action === 'register') {
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    // Criptografa a senha para segurança
    $senha = password_hash($_POST['senha'], PASSWORD_DEFAULT);

    if (isset($contas[$email])) {
        echo json_encode(['status' => 'error', 'msg' => 'E-mail já está em uso.']);
        exit;
    }

    // Estrutura padrão de uma nova conta
    $contas[$email] = [
        'email' => $email,
        'name' => $nome,
        'senha' => $senha,
        'handle' => strtolower(str_replace(' ', '_', $nome)) . rand(100,999),
        'pontos' => 0,
        'joinTimestamp' => time() * 1000,
        'avatar' => '',
        'banner' => '',
        'configuracoes' => [
            'notif' => true, 'autoplay' => false, 'lang' => 'pt-br', 'theme' => 'deep-dark',
            'fontSize' => 'medium', 'private' => false, 'showJoin' => true, 'comments' => true,
            'filter' => true, 'ranking' => true, 'quality' => 'auto'
        ]
    ];

    file_put_contents($arquivo_db, json_encode($contas, JSON_PRETTY_PRINT));
    echo json_encode(['status' => 'success', 'user' => $contas[$email]]);

} elseif ($action === 'login') {
    $email = $_POST['email'];
    $senha = $_POST['senha'];

    // Verifica se o email existe e se a senha descriptografada bate
    if (isset($contas[$email]) && password_verify($senha, $contas[$email]['senha'])) {
        echo json_encode(['status' => 'success', 'user' => $contas[$email]]);
    } else {
        echo json_encode(['status' => 'error', 'msg' => 'Login ou senha incorreto.']);
    }

} elseif ($action === 'update_settings') {
    $email = $_POST['email'];
    $novas_configs = json_decode($_POST['configuracoes'], true);
    
    if (isset($contas[$email])) {
        $contas[$email]['configuracoes'] = $novas_configs;
        file_put_contents($arquivo_db, json_encode($contas, JSON_PRETTY_PRINT));
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'msg' => 'Conta não encontrada.']);
    }
} else {
    echo json_encode(['status' => 'error', 'msg' => 'Ação inválida.']);
}
?>