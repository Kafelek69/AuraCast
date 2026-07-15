-- Tworzenie bazy danych
CREATE DATABASE IF NOT EXISTS auracast;
USE auracast;

-- Tabela Użytkowników (Konta globalne)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'streamer', 'admin', 'moderator') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela Kanałów (Profile streamerskie powiązane z użytkownikiem)
CREATE TABLE channels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    display_name VARCHAR(50) NOT NULL UNIQUE,
    bio TEXT,
    avatar_url VARCHAR(255),
    stream_key VARCHAR(255) UNIQUE NOT NULL,
    is_live BOOLEAN DEFAULT FALSE,
    current_category VARCHAR(100) DEFAULT 'Just Chatting',
    total_views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela Obserwacji (Relacja Wiele-do-Wielu: kto kogo obserwuje)
CREATE TABLE followers (
    follower_id INT NOT NULL,
    channel_id INT NOT NULL,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, channel_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
);

-- Tabela Poziomów (System Grywalizacji)
CREATE TABLE user_levels (
    user_id INT PRIMARY KEY,
    current_exp INT DEFAULT 0,
    level INT DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);