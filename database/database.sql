-- =============================================
-- Base de Datos - TallerMotosW
-- Fase 1 + Fase 2
-- =============================================

-- =============================================
-- CLIENTES
-- =============================================

CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL
);

-- =============================================
-- MOTOS
-- =============================================

CREATE TABLE IF NOT EXISTS bikes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plate VARCHAR(255) NOT NULL UNIQUE,
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    cylinder INT NULL,
    clientId INT NOT NULL,

    CONSTRAINT fk_bikes_client
        FOREIGN KEY (clientId)
        REFERENCES clients(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =============================================
-- ÓRDENES DE TRABAJO
-- =============================================

CREATE TABLE IF NOT EXISTS work_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    motoId INT NOT NULL,
    entryDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    faultDescription TEXT NOT NULL,

    status ENUM(
        'RECIBIDA',
        'DIAGNOSTICO',
        'EN_PROCESO',
        'LISTA',
        'ENTREGADA',
        'CANCELADA'
    ) NOT NULL DEFAULT 'RECIBIDA',

    total DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_work_orders_bike
        FOREIGN KEY (motoId)
        REFERENCES bikes(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- =============================================
-- ITEMS DE LAS ÓRDENES
-- =============================================

CREATE TABLE IF NOT EXISTS work_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,

    work_order_id INT NOT NULL,

    type ENUM(
        'MANO_OBRA',
        'REPUESTO'
    ) NOT NULL,

    description VARCHAR(255) NOT NULL,

    `count` INT NOT NULL,

    unitValue DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_work_order_items_order
        FOREIGN KEY (work_order_id)
        REFERENCES work_orders(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =============================================
-- USUARIOS
-- =============================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(100) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM(
        'ADMIN',
        'MECANICO'
    ) NOT NULL DEFAULT 'MECANICO',

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- HISTORIAL DE ESTADOS
-- =============================================

CREATE TABLE IF NOT EXISTS work_order_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,

    work_order_id INT NOT NULL,

    from_status ENUM(
        'RECIBIDA',
        'DIAGNOSTICO',
        'EN_PROCESO',
        'LISTA',
        'ENTREGADA',
        'CANCELADA'
    ) NULL,

    to_status ENUM(
        'RECIBIDA',
        'DIAGNOSTICO',
        'EN_PROCESO',
        'LISTA',
        'ENTREGADA',
        'CANCELADA'
    ) NOT NULL,

    note VARCHAR(500) NULL,

    changed_by_user_id INT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_history_work_order
        FOREIGN KEY (work_order_id)
        REFERENCES work_orders(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_history_user
        FOREIGN KEY (changed_by_user_id)
        REFERENCES users(id),

    INDEX idx_work_order_status_history_wo_created
        (work_order_id, created_at DESC)
);