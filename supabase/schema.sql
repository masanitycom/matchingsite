-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    nickname VARCHAR(50) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18),
    prefecture VARCHAR(10),
    city VARCHAR(50),
    occupation VARCHAR(100),
    height INTEGER,
    weight INTEGER,
    body_type VARCHAR(20),
    bio TEXT,
    interests TEXT[],
    lifestyle JSONB DEFAULT '{}',
    relationship_status VARCHAR(50),
    looking_for VARCHAR(100),
    photos TEXT[] DEFAULT '{}',
    main_photo_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_vip BOOLEAN DEFAULT FALSE,
    privacy_settings JSONB DEFAULT '{"show_online": true, "show_distance": true, "show_last_active": true}',
    last_active TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Profiles view (for public data)
CREATE VIEW profiles AS
SELECT 
    id,
    nickname,
    age,
    prefecture,
    city,
    occupation,
    height,
    weight,
    body_type,
    bio,
    interests,
    lifestyle,
    relationship_status,
    looking_for,
    photos,
    main_photo_url,
    is_verified,
    is_premium,
    is_vip,
    last_active,
    created_at
FROM users;

-- Likes table
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    liker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    liked_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_super_like BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(liker_id, liked_id)
);

-- Matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    matched_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active', -- active, ended, blocked
    ended_by UUID REFERENCES users(id),
    ended_at TIMESTAMP,
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id < user2_id) -- Ensure consistent ordering
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, voice, video
    media_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Blocks table
CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

-- Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_id UUID REFERENCES users(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL, -- harassment, spam, fake_profile, inappropriate_content, other
    description TEXT,
    evidence_urls TEXT[],
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewing, resolved, dismissed
    resolved_by UUID,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Verification requests table
CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    verification_type VARCHAR(20) NOT NULL, -- photo, document, video
    document_url TEXT,
    selfie_url TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    reviewed_by UUID,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP
);

-- Profile views table (for tracking who viewed profiles)
CREATE TABLE profile_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    viewed_id UUID REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(viewer_id, viewed_id, viewed_at)
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL, -- free, premium, vip
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) DEFAULT 'JPY',
    payment_method VARCHAR(50),
    stripe_payment_intent_id VARCHAR(255),
    status VARCHAR(20), -- succeeded, pending, failed
    created_at TIMESTAMP DEFAULT NOW()
);

-- Daily swipe limits table
CREATE TABLE daily_swipe_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    swipes_used INTEGER DEFAULT 0,
    likes_used INTEGER DEFAULT 0,
    super_likes_used INTEGER DEFAULT 0,
    UNIQUE(user_id, date)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- match, message, like, view, system
    title VARCHAR(255) NOT NULL,
    body TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_location ON users(prefecture, city);
CREATE INDEX idx_users_age ON users(age);
CREATE INDEX idx_users_last_active ON users(last_active);
CREATE INDEX idx_users_is_premium ON users(is_premium);
CREATE INDEX idx_users_is_verified ON users(is_verified);

CREATE INDEX idx_likes_liked_id ON likes(liked_id);
CREATE INDEX idx_likes_created_at ON likes(created_at);

CREATE INDEX idx_matches_user1_id ON matches(user1_id);
CREATE INDEX idx_matches_user2_id ON matches(user2_id);
CREATE INDEX idx_matches_status ON matches(status);

CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_blocks_blocked_id ON blocks(blocked_id);

CREATE INDEX idx_reports_reported_id ON reports(reported_id);
CREATE INDEX idx_reports_status ON reports(status);

CREATE INDEX idx_profile_views_viewed_id ON profile_views(viewed_id);
CREATE INDEX idx_profile_views_viewed_at ON profile_views(viewed_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Create functions for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to get match between two users
CREATE OR REPLACE FUNCTION get_match(user1 UUID, user2 UUID)
RETURNS UUID AS $$
DECLARE
    match_id UUID;
BEGIN
    SELECT id INTO match_id
    FROM matches
    WHERE (user1_id = LEAST(user1, user2) AND user2_id = GREATEST(user1, user2))
    AND status = 'active';
    
    RETURN match_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if two users have matched
CREATE OR REPLACE FUNCTION are_matched(user1 UUID, user2 UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM matches
        WHERE (user1_id = LEAST(user1, user2) AND user2_id = GREATEST(user1, user2))
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has liked another user
CREATE OR REPLACE FUNCTION has_liked(liker UUID, liked UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM likes
        WHERE liker_id = liker AND liked_id = liked
    );
END;
$$ LANGUAGE plpgsql;

-- Function to create a match when mutual likes exist
CREATE OR REPLACE FUNCTION create_match_on_mutual_like()
RETURNS TRIGGER AS $$
DECLARE
    new_match_id UUID;
BEGIN
    -- Check if the other user has already liked this user
    IF EXISTS (
        SELECT 1 FROM likes
        WHERE liker_id = NEW.liked_id AND liked_id = NEW.liker_id
    ) THEN
        -- Create a match with consistent ordering
        INSERT INTO matches (user1_id, user2_id)
        VALUES (LEAST(NEW.liker_id, NEW.liked_id), GREATEST(NEW.liker_id, NEW.liked_id))
        ON CONFLICT (user1_id, user2_id) DO NOTHING
        RETURNING id INTO new_match_id;
        
        -- Create notifications for both users if match was created
        IF new_match_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, type, title, body, data)
            VALUES 
                (NEW.liker_id, 'match', 'New Match!', 'You have a new match!', jsonb_build_object('match_id', new_match_id)),
                (NEW.liked_id, 'match', 'New Match!', 'You have a new match!', jsonb_build_object('match_id', new_match_id));
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic match creation
CREATE TRIGGER create_match_trigger
AFTER INSERT ON likes
FOR EACH ROW EXECUTE FUNCTION create_match_on_mutual_like();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY users_view_own ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can view profiles they haven't blocked and who haven't blocked them
CREATE POLICY profiles_view_unblocked ON users
    FOR SELECT USING (
        auth.uid() != id AND
        NOT EXISTS (
            SELECT 1 FROM blocks
            WHERE (blocker_id = auth.uid() AND blocked_id = id)
            OR (blocker_id = id AND blocked_id = auth.uid())
        )
    );

-- Users can view their own likes
CREATE POLICY likes_view_own ON likes
    FOR SELECT USING (liker_id = auth.uid() OR liked_id = auth.uid());

-- Users can create likes
CREATE POLICY likes_create ON likes
    FOR INSERT WITH CHECK (liker_id = auth.uid());

-- Users can view their own matches
CREATE POLICY matches_view_own ON matches
    FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Users can view messages in their matches
CREATE POLICY messages_view_own ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = messages.match_id
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        )
    );

-- Users can send messages in their matches
CREATE POLICY messages_create ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = match_id
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        )
    );

-- Users can view their own notifications
CREATE POLICY notifications_view_own ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY notifications_update_own ON notifications
    FOR UPDATE USING (user_id = auth.uid());