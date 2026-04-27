# Problemas e Soluções

## 🔴 Erro: Conexão com MySQL

Se você ver erros como `ECONNREFUSED` ou `ER_ACCESS_DENIED_FOR_USER`, significa que:

1. **MySQL não está rodando**
   - Inicie o MySQL com: `mysql --user=root`
   - Ou use: `mysqld` (se instalado como serviço)

2. **Credenciais incorretas**
   - Verifique o `.env` file:
     - `DB_USER`: geralmente é `root`
     - `DB_PASSWORD`: deixe vazio ou ajuste para sua senha
     - `DB_HOST`: localhost
     - `DB_PORT`: 3306 (padrão)
     - `DB_NAME`: corridas_db

3. **Banco de dados não existe**
   - Execute o DDL antes:
     ```bash
     mysql -u root < sql/DDL.sql
     ```

## ✅ Testando a conexão

```bash
# No terminal do projeto
node teste_db.js
```

## 🚀 Iniciando o servidor

```bash
npm start
```

O servidor deve estar rodando em `http://localhost:3000`

## 📝 Testando o front-end

Abra `c:\Temp\julia\Cowabunga_landingPage\login.html` no navegador.
O front-end agora conecta automaticamente com a API em `http://localhost:3000`
