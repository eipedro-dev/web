-- Usuários (autônomos). A autenticação entra num passo seguinte.
CREATE TABLE users (
  id            CHAR(36)     NOT NULL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Catálogo de serviços de cada usuário.
-- id vem do cliente (UUID), para criar registros sem internet.
-- version: sobe +1 a cada alteração aceita (concorrência otimista).
-- deleted_at: exclusão lógica, para a exclusão chegar aos outros aparelhos.
CREATE TABLE services (
  id               CHAR(36)     NOT NULL PRIMARY KEY,
  user_id          CHAR(36)     NOT NULL,
  name             VARCHAR(120) NOT NULL,
  unit_price_cents INT          NOT NULL,
  unit             VARCHAR(8)   NOT NULL,
  version          INT          NOT NULL DEFAULT 1,
  deleted_at       DATETIME(3)  NULL,
  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  KEY idx_services_user_updated (user_id, updated_at),
  CONSTRAINT fk_services_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orçamentos. Os itens são um snapshot (nome e preço da época), guardados em JSON.
-- public_token: segredo do link público, gerado pelo servidor.
CREATE TABLE quotes (
  id             CHAR(36)     NOT NULL PRIMARY KEY,
  user_id        CHAR(36)     NOT NULL,
  client_name    VARCHAR(120) NOT NULL,
  client_phone   VARCHAR(30)  NULL,
  items          JSON         NOT NULL,
  discount_cents INT          NOT NULL DEFAULT 0,
  notes          TEXT         NULL,
  public_token   VARCHAR(16)  NOT NULL UNIQUE,
  version        INT          NOT NULL DEFAULT 1,
  deleted_at     DATETIME(3)  NULL,
  created_at     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  KEY idx_quotes_user_updated (user_id, updated_at),
  CONSTRAINT fk_quotes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
