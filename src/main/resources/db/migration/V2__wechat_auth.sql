-- WeChat Miniprogram Authentication Migration
-- Clear existing users table and add WeChat fields

-- 1. Drop and recreate users table with new schema
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    openid VARCHAR(255) UNIQUE NOT NULL,
    session_key VARCHAR(255),
    union_id VARCHAR(255),
    nickname VARCHAR(100),
    avatar_url VARCHAR(500),
    username VARCHAR(255),
    password VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create indexes for performance
CREATE INDEX idx_users_openid ON users(openid);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- 3. Insert a test user (optional, for development)
-- INSERT INTO users (openid, nickname, email, username)
-- VALUES ('test_openid_123', '测试用户', 'test@example.com', 'testuser');
